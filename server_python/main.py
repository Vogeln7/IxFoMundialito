"""
Mundialito IXFO 2026 — Backend API (Python / FastAPI)
SQLite built-in — sin instalacion adicional
Tiempo real via Server-Sent Events (SSE)
Email via smtplib — built-in en Python
"""

import asyncio
import json
import os
import smtplib
import sqlite3
import time
from contextlib import asynccontextmanager
import base64
from email.mime.base import MIMEBase
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email import encoders
from pathlib import Path
from typing import Any

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from fastapi.staticfiles import StaticFiles

# Colores IXFO
NAVY   = "#003b71"
BLUE   = "#009ade"
ORANGE = "#ff6700"

DB_PATH  = os.getenv("DB_PATH", str(Path(__file__).parent / "mundialito.db"))
PORT     = int(os.getenv("PORT", 3001))
DIST_DIR = Path(__file__).parent.parent / "dist"

# ══════════════════════════════════════════════════
#  BASE DE DATOS
# ══════════════════════════════════════════════════

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")
    return conn

def init_db():
    with get_db() as conn:
        conn.executescript("""
            CREATE TABLE IF NOT EXISTS participants (
                id TEXT PRIMARY KEY, data TEXT NOT NULL,
                created_at TEXT DEFAULT (datetime('now')));
            CREATE TABLE IF NOT EXISTS torneos (
                id INTEGER PRIMARY KEY, data TEXT NOT NULL,
                updated_at TEXT DEFAULT (datetime('now')));
            CREATE TABLE IF NOT EXISTS config (
                id INTEGER PRIMARY KEY DEFAULT 1, data TEXT NOT NULL,
                updated_at TEXT DEFAULT (datetime('now')));
        """)
    print(f"Base de datos: {DB_PATH}")

def db_participants():
    with get_db() as conn:
        rows = conn.execute("SELECT id, data FROM participants ORDER BY created_at ASC").fetchall()
    return [{"id": r["id"], **json.loads(r["data"])} for r in rows]

def db_torneos():
    with get_db() as conn:
        rows = conn.execute("SELECT data FROM torneos ORDER BY id ASC").fetchall()
    return [json.loads(r["data"]) for r in rows]

def db_config():
    with get_db() as conn:
        row = conn.execute("SELECT data FROM config WHERE id = 1").fetchone()
    return json.loads(row["data"]) if row else {}

# ══════════════════════════════════════════════════
#  SSE
# ══════════════════════════════════════════════════

_clients: set[asyncio.Queue] = set()

async def broadcast(event: str, data: Any):
    msg = f"event: {event}\ndata: {json.dumps(data, ensure_ascii=False)}\n\n"
    dead = set()
    for q in _clients:
        try: await q.put(msg)
        except: dead.add(q)
    _clients.difference_update(dead)

async def sse_gen(queue: asyncio.Queue, request: Request):
    _clients.add(queue)
    try:
        while True:
            if await request.is_disconnected(): break
            try:
                yield await asyncio.wait_for(queue.get(), timeout=25)
            except asyncio.TimeoutError:
                yield ":heartbeat\n\n"
    finally:
        _clients.discard(queue)

# ══════════════════════════════════════════════════
#  PLANTILLAS EMAIL
# ══════════════════════════════════════════════════

def _wrap(body_html: str, preview: str, from_email: str = "mundialito_ixfo@ixfo.com.ar") -> str:
    return f"""<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<title>Mundialito IXFO 2026</title></head>
<body style="margin:0;padding:0;background:#f0f4f8;font-family:Arial,Helvetica,sans-serif;">
<div style="display:none;max-height:0;overflow:hidden;">{preview}</div>
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f4f8;padding:24px 0;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0"
  style="background:#fff;border-radius:12px;overflow:hidden;
         box-shadow:0 4px 24px rgba(0,0,0,.10);max-width:600px;width:100%;">
<tr><td style="background:linear-gradient(135deg,{NAVY} 0%,{BLUE} 100%);
               padding:32px 40px 24px;text-align:center;">
  <div style="font-family:Arial Black,Arial,sans-serif;font-size:11px;font-weight:900;
              letter-spacing:3px;color:{BLUE};text-transform:uppercase;margin-bottom:8px;">
    IXFO Internet por Fibra Optica</div>
  <div style="font-family:Arial Black,Arial,sans-serif;font-size:32px;font-weight:900;
              color:#fff;text-transform:uppercase;letter-spacing:2px;line-height:1.1;">
    MUNDIALITO<br/><span style="color:{ORANGE};">IXFO</span> 2026</div>
  <div style="font-size:13px;color:rgba(255,255,255,.7);margin-top:8px;letter-spacing:1px;">
    FC 26 · Misiones, Argentina</div>
</td></tr>
<tr><td style="padding:36px 40px;">{body_html}</td></tr>
<tr><td style="background:{NAVY};padding:20px 40px;text-align:center;">
  <div style="font-size:12px;color:rgba(255,255,255,.6);line-height:1.6;">
    IXFO Internet por Fibra Optica · Posadas y Garupa, Misiones<br/>
    <span style="color:{BLUE};">{from_email}</span></div>
  <div style="font-size:11px;color:rgba(255,255,255,.3);margin-top:8px;">
    Este email fue enviado porque estas inscripto en el Mundialito IXFO 2026.</div>
</td></tr>
</table></td></tr></table></body></html>"""


def tpl_seleccionado(nombre, apellido, es_titular, torneo_nombre,
                     fecha, sede, direccion_sede, whatsapp, from_email="mundialito_ixfo@ixfo.com.ar"):
    rol   = "TITULAR" if es_titular else "SUPLENTE"
    color = BLUE if es_titular else ORANGE
    dir_h = f"<br/><span style='font-size:13px;color:#666;'>{direccion_sede}</span>" if direccion_sede else ""
    wa    = whatsapp.replace(" ","").replace("+","").replace("-","")

    body = f"""
<h2 style="margin:0 0 4px;font-family:Arial Black,Arial,sans-serif;font-size:26px;
            font-weight:900;color:{NAVY};text-transform:uppercase;">Fuiste seleccionado!</h2>
<p style="margin:0 0 24px;font-size:15px;color:#555;">
  Hola <strong style="color:{NAVY};">{nombre} {apellido}</strong>,
  tu nombre resulto sorteado para participar en el torneo.</p>
<div style="text-align:center;margin-bottom:28px;">
  <span style="display:inline-block;background:{color};color:#fff;
               font-family:Arial Black,Arial,sans-serif;font-size:14px;font-weight:900;
               letter-spacing:2px;text-transform:uppercase;padding:10px 28px;border-radius:50px;">
    PARTICIPANTE {rol}</span></div>
<table width="100%" cellpadding="0" cellspacing="0"
  style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;
         overflow:hidden;margin-bottom:24px;">
<tr><td style="background:{NAVY};padding:12px 20px;">
  <div style="font-family:Arial Black,Arial,sans-serif;font-size:12px;font-weight:900;
              color:{BLUE};text-transform:uppercase;letter-spacing:1px;">Informacion del torneo</div>
</td></tr>
<tr><td style="padding:16px 20px;">
  <table width="100%" cellpadding="6" cellspacing="0">
    <tr>
      <td style="font-size:12px;color:#888;font-weight:700;text-transform:uppercase;
                 letter-spacing:1px;width:100px;">Torneo</td>
      <td style="font-size:14px;color:{NAVY};font-weight:700;">{torneo_nombre}</td></tr>
    <tr>
      <td style="font-size:12px;color:#888;font-weight:700;text-transform:uppercase;letter-spacing:1px;">Fecha</td>
      <td style="font-size:14px;color:{NAVY};font-weight:700;">&#128197; {fecha}</td></tr>
    <tr>
      <td style="font-size:12px;color:#888;font-weight:700;text-transform:uppercase;letter-spacing:1px;">Sede</td>
      <td style="font-size:14px;color:{NAVY};font-weight:700;">&#128205; {sede}{dir_h}</td></tr>
    <tr>
      <td style="font-size:12px;color:#888;font-weight:700;text-transform:uppercase;letter-spacing:1px;">Check-in</td>
      <td style="font-size:14px;color:{NAVY};font-weight:700;">&#9200; 14:45 hs</td></tr>
  </table></td></tr></table>
<div style="text-align:center;margin-bottom:24px;">
  <a href="https://wa.me/{wa}"
     style="display:inline-block;background:{ORANGE};color:#fff;
            font-family:Arial Black,Arial,sans-serif;font-size:15px;font-weight:900;
            text-transform:uppercase;letter-spacing:1px;padding:14px 36px;
            border-radius:8px;text-decoration:none;">
    Confirmar asistencia por WhatsApp</a></div>
<div style="background:#fff8f0;border:1px solid #ffd7b5;border-radius:8px;
            padding:14px 18px;margin-bottom:16px;">
  <div style="font-size:13px;color:#b45309;line-height:1.6;">
    <strong>Recordá traer:</strong><br/>
    · DNI o documento de identidad<br/>
    · Autorizacion de uso de imagen firmada (Anexo II)<br/>
    · Si sos menor de 18: Anexo I firmado por tu tutor y su presencia en el evento</div></div>
<p style="font-size:13px;color:#888;margin:0;line-height:1.6;">
  Buena suerte en el torneo!</p>"""
    return _wrap(body, f"Fuiste seleccionado para el {torneo_nombre}!", from_email)


BANDERAS = {
    "Argentina":"🇦🇷","Brasil":"🇧🇷","Francia":"🇫🇷","Espana":"🇪🇸","España":"🇪🇸",
    "Alemania":"🇩🇪","Inglaterra":"🏴󠁧󠁢󠁥󠁮󠁧󠁿","Portugal":"🇵🇹","Italia":"🇮🇹",
    "Paises Bajos":"🇳🇱","Países Bajos":"🇳🇱","Croacia":"🇭🇷","Marruecos":"🇲🇦",
    "Uruguay":"🇺🇾","Colombia":"🇨🇴","Mexico":"🇲🇽","México":"🇲🇽",
    "Estados Unidos":"🇺🇸","Canada":"🇨🇦","Canadá":"🇨🇦","Japon":"🇯🇵","Japón":"🇯🇵",
    "Corea del Sur":"🇰🇷","Senegal":"🇸🇳","Ecuador":"🇪🇨","Chile":"🇨🇱",
    "Polonia":"🇵🇱","Suiza":"🇨🇭","Serbia":"🇷🇸","Dinamarca":"🇩🇰","Belgica":"🇧🇪",
    "Bélgica":"🇧🇪","Ghana":"🇬🇭","Camerun":"🇨🇲","Camerún":"🇨🇲","Australia":"🇦🇺",
    "Qatar":"🇶🇦","Arabia Saudita":"🇸🇦","Iran":"🇮🇷","Irán":"🇮🇷","Turquia":"🇹🇷",
    "Turquía":"🇹🇷","Austria":"🇦🇹","Venezuela":"🇻🇪","Paraguay":"🇵🇾",
    "Bolivia":"🇧🇴","Peru":"🇵🇪","Perú":"🇵🇪","Costa Rica":"🇨🇷","Panama":"🇵🇦",
    "Panamá":"🇵🇦","Honduras":"🇭🇳","Guatemala":"🇬🇹","Jamaica":"🇯🇲","Egipto":"🇪🇬",
    "Nigeria":"🇳🇬",
}


def tpl_equipo(nombre, apellido, equipo, torneo_nombre, fecha, sede, direccion_sede, from_email="mundialito_ixfo@ixfo.com.ar"):
    bandera = BANDERAS.get(equipo, "⚽")
    dir_h   = f"<br/><span style='font-size:13px;color:#666;'>{direccion_sede}</span>" if direccion_sede else ""

    body = f"""
<h2 style="margin:0 0 4px;font-family:Arial Black,Arial,sans-serif;font-size:26px;
            font-weight:900;color:{NAVY};text-transform:uppercase;">Tu seleccion para el torneo</h2>
<p style="margin:0 0 28px;font-size:15px;color:#555;">
  Hola <strong style="color:{NAVY};">{nombre} {apellido}</strong>,
  ya fue asignado tu equipo. A practicar!</p>
<div style="text-align:center;background:linear-gradient(135deg,{NAVY} 0%,{BLUE} 100%);
            border-radius:12px;padding:32px 20px;margin-bottom:28px;">
  <div style="font-size:72px;margin-bottom:12px;line-height:1;">{bandera}</div>
  <div style="font-family:Arial Black,Arial,sans-serif;font-size:28px;font-weight:900;
              color:#fff;text-transform:uppercase;letter-spacing:2px;">{equipo}</div>
  <div style="font-size:12px;color:rgba(255,255,255,.65);margin-top:8px;
              letter-spacing:1px;text-transform:uppercase;">
    Tu seleccion · {torneo_nombre}</div></div>
<table width="100%" cellpadding="0" cellspacing="0"
  style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;
         overflow:hidden;margin-bottom:24px;">
<tr><td style="background:{NAVY};padding:12px 20px;">
  <div style="font-family:Arial Black,Arial,sans-serif;font-size:12px;font-weight:900;
              color:{BLUE};text-transform:uppercase;letter-spacing:1px;">Datos del evento</div>
</td></tr>
<tr><td style="padding:16px 20px;">
  <table width="100%" cellpadding="6" cellspacing="0">
    <tr>
      <td style="font-size:12px;color:#888;font-weight:700;text-transform:uppercase;
                 letter-spacing:1px;width:100px;">Fecha</td>
      <td style="font-size:14px;color:{NAVY};font-weight:700;">&#128197; {fecha}</td></tr>
    <tr>
      <td style="font-size:12px;color:#888;font-weight:700;text-transform:uppercase;letter-spacing:1px;">Sede</td>
      <td style="font-size:14px;color:{NAVY};font-weight:700;">&#128205; {sede}{dir_h}</td></tr>
    <tr>
      <td style="font-size:12px;color:#888;font-weight:700;text-transform:uppercase;letter-spacing:1px;">Check-in</td>
      <td style="font-size:14px;color:{NAVY};font-weight:700;">&#9200; 14:45 hs</td></tr>
  </table></td></tr></table>
<p style="font-size:13px;color:#888;margin:0;line-height:1.6;text-align:center;">
  Buena suerte! Representa tu seleccion con todo.</p>"""
    return _wrap(body, f"Tu equipo para el {torneo_nombre}: {equipo}", from_email)


# ══════════════════════════════════════════════════
#  SMTP
# ══════════════════════════════════════════════════


def tpl_gran_final(nombre, apellido, equipo, fecha, sede, direccion_sede,
                   whatsapp, from_email="mundialito_ixfo@ixfo.com.ar"):
    """Plantilla: recordatorio Gran Final con equipo ya asignado."""
    bandera  = BANDERAS.get(equipo, "⚽")
    dir_h    = f"<br/><span style=\'font-size:13px;color:#666;\'>{direccion_sede}</span>" if direccion_sede else ""
    wa       = whatsapp.replace(" ","").replace("+","").replace("-","")

    body = f"""
<h2 style="margin:0 0 4px;font-family:Arial Black,Arial,sans-serif;font-size:26px;
            font-weight:900;color:{NAVY};text-transform:uppercase;">Gran Final - Te esperamos!</h2>
<p style="margin:0 0 20px;font-size:15px;color:#555;">
  Hola <strong style="color:{NAVY};">{nombre} {apellido}</strong>,
  sos uno de los 8 campeones clasificados para la <strong>Gran Final del Mundialito IXFO 2026</strong>.
  Te recordamos los datos del evento.</p>

<!-- Destacado Gran Final -->
<div style="text-align:center;background:linear-gradient(135deg,{NAVY} 0%,{ORANGE} 100%);
            border-radius:12px;padding:24px 20px;margin-bottom:24px;">
  <div style="font-size:48px;margin-bottom:8px;line-height:1;">🏆</div>
  <div style="font-family:Arial Black,Arial,sans-serif;font-size:28px;font-weight:900;
              color:#fff;text-transform:uppercase;letter-spacing:2px;">GRAN FINAL</div>
  <div style="font-size:13px;color:rgba(255,255,255,.75);margin-top:6px;letter-spacing:1px;">
    Mundialito IXFO 2026</div>
</div>

<!-- Equipo asignado -->
<div style="text-align:center;background:#f8fafc;border:2px solid {BLUE};
            border-radius:10px;padding:20px;margin-bottom:20px;">
  <div style="font-family:Arial Black,Arial,sans-serif;font-size:12px;font-weight:900;
              color:{BLUE};text-transform:uppercase;letter-spacing:1px;margin-bottom:10px;">
    Tu seleccion para la Gran Final</div>
  <div style="font-size:52px;line-height:1;margin-bottom:8px;">{bandera}</div>
  <div style="font-family:Arial Black,Arial,sans-serif;font-size:22px;font-weight:900;
              color:{NAVY};text-transform:uppercase;letter-spacing:1px;">{equipo}</div>
</div>

<!-- Datos del evento -->
<table width="100%" cellpadding="0" cellspacing="0"
  style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;
         overflow:hidden;margin-bottom:24px;">
<tr><td style="background:{NAVY};padding:12px 20px;">
  <div style="font-family:Arial Black,Arial,sans-serif;font-size:12px;font-weight:900;
              color:{ORANGE};text-transform:uppercase;letter-spacing:1px;">Datos del evento</div>
</td></tr>
<tr><td style="padding:16px 20px;">
  <table width="100%" cellpadding="6" cellspacing="0">
    <tr>
      <td style="font-size:12px;color:#888;font-weight:700;text-transform:uppercase;
                 letter-spacing:1px;width:100px;">Evento</td>
      <td style="font-size:14px;color:{NAVY};font-weight:700;">Gran Final Mundialito IXFO 2026</td></tr>
    <tr>
      <td style="font-size:12px;color:#888;font-weight:700;text-transform:uppercase;letter-spacing:1px;">Fecha</td>
      <td style="font-size:14px;color:{NAVY};font-weight:700;">&#128197; {fecha}</td></tr>
    <tr>
      <td style="font-size:12px;color:#888;font-weight:700;text-transform:uppercase;letter-spacing:1px;">Sede</td>
      <td style="font-size:14px;color:{NAVY};font-weight:700;">&#128205; {sede}{dir_h}</td></tr>
    <tr>
      <td style="font-size:12px;color:#888;font-weight:700;text-transform:uppercase;letter-spacing:1px;">Check-in</td>
      <td style="font-size:14px;color:{NAVY};font-weight:700;">&#9200; 14:45 hs</td></tr>
  </table></td></tr></table>

<!-- CTA -->
<div style="text-align:center;margin-bottom:24px;">
  <a href="https://wa.me/{wa}"
     style="display:inline-block;background:{ORANGE};color:#fff;
            font-family:Arial Black,Arial,sans-serif;font-size:15px;font-weight:900;
            text-transform:uppercase;letter-spacing:1px;padding:14px 36px;
            border-radius:8px;text-decoration:none;">
    Confirmar asistencia por WhatsApp</a></div>

<!-- Recordatorio documentacion -->
<div style="background:#fff8f0;border:1px solid #ffd7b5;border-radius:8px;
            padding:14px 18px;margin-bottom:16px;">
  <div style="font-size:13px;color:#b45309;line-height:1.6;">
    <strong>Recordá traer:</strong><br/>
    · DNI o documento de identidad<br/>
    · Autorizacion de uso de imagen firmada (Anexo II)<br/>
    · Si sos menor de 18: Anexo I firmado y presencia del tutor</div></div>

<p style="font-size:13px;color:#888;margin:0;line-height:1.6;text-align:center;">
  Los 8 campeones se enfrentan en eliminacion directa. Buena suerte!</p>"""

    return _wrap(body, f"Gran Final Mundialito IXFO 2026 — Te esperamos el {fecha}!", from_email)

def send_email(smtp_cfg: dict, to_email: str, to_name: str,
               subject: str, html: str,
               attachments: list[dict] | None = None) -> tuple[bool, str]:
    """
    attachments: lista de {filename, data_b64, mimetype}
    """
    """
    Envia un email HTML.
    Compatible con Gmail (usa App Password), Outlook, y hostings propios.

    Gmail: host=smtp.gmail.com  port=587  password=contraseña-de-aplicacion-16-chars
    """
    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"]  = subject
        msg["From"]     = f"{smtp_cfg['from_name']} <{smtp_cfg['from_email']}>"
        msg["To"]       = f"{to_name} <{to_email}>"
        msg["Reply-To"] = smtp_cfg["from_email"]
        msg["X-Mailer"] = "Mundialito IXFO 2026"
        msg.attach(MIMEText(html, "html", "utf-8"))

        # Adjuntos opcionales
        if attachments:
            for att in attachments:
                try:
                    pdf_data = base64.b64decode(att["data_b64"].split(",")[-1])
                    part = MIMEBase("application", "octet-stream")
                    part.set_payload(pdf_data)
                    encoders.encode_base64(part)
                    part.add_header("Content-Disposition",
                                    f'attachment; filename="{att["filename"]}"')
                    msg.attach(part)
                except Exception as e:
                    print(f"Error adjuntando {att.get('filename','?')}: {e}")

        port = int(smtp_cfg.get("port", 587))
        host = smtp_cfg["host"].strip()
        user = smtp_cfg["user"].strip()
        pwd  = smtp_cfg["password"]

        if port == 465:
            # SSL directo — algunos hostings y Gmail con puerto 465
            with smtplib.SMTP_SSL(host, port, timeout=20) as s:
                s.ehlo()
                s.login(user, pwd)
                s.send_message(msg)
        else:
            # STARTTLS — Gmail (587), Outlook (587), hosting propio (587/25)
            with smtplib.SMTP(host, port, timeout=20) as s:
                s.ehlo()
                s.starttls()
                s.ehlo()
                s.login(user, pwd)
                s.send_message(msg)

        return True, f"OK: {to_email}"

    except smtplib.SMTPAuthenticationError:
        return (False,
                f"Error de autenticacion ({to_email}) — "
                "Para Gmail usa una Contrasena de Aplicacion de 16 caracteres, "
                "no tu contrasena normal de Google.")
    except smtplib.SMTPRecipientsRefused:
        return False, f"Email rechazado por el servidor: {to_email}"
    except smtplib.SMTPConnectError as e:
        return False, f"No se pudo conectar a {host}:{port} — {str(e)[:60]}"
    except smtplib.SMTPException as e:
        return False, f"Error SMTP ({to_email}): {str(e)[:80]}"
    except Exception as e:
        return False, f"Error inesperado ({to_email}): {str(e)[:80]}"


def extract_smtp(body: dict) -> dict:
    smtp = body.get("smtp", {})
    if not smtp.get("host") or not smtp.get("user") or not smtp.get("password"):
        raise HTTPException(400, "Faltan datos SMTP (host, user, password)")
    return smtp


# ══════════════════════════════════════════════════
#  APP
# ══════════════════════════════════════════════════

@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    print(f"\nMundialito IXFO API en http://localhost:{PORT}\n")
    yield

app = FastAPI(title="Mundialito IXFO 2026", lifespan=lifespan)
app.add_middleware(CORSMiddleware, allow_origins=["*"],
                   allow_methods=["*"], allow_headers=["*"])

@app.get("/api/events")
async def events(request: Request):
    q: asyncio.Queue = asyncio.Queue()
    return StreamingResponse(sse_gen(q, request), media_type="text/event-stream",
        headers={"Cache-Control":"no-cache","X-Accel-Buffering":"no","Connection":"keep-alive"})

@app.get("/api/participants")
async def get_p(): return db_participants()

@app.post("/api/participants", status_code=201)
async def add_p(body: dict):
    pid = body.get("id")
    if not pid: raise HTTPException(400, "id requerido")
    with get_db() as conn:
        if conn.execute("SELECT id FROM participants WHERE json_extract(data,'$.dni')=?",
                        (body.get("dni",""),)).fetchone():
            raise HTTPException(409, "DNI ya registrado")
        data = {k:v for k,v in body.items() if k!="id"}
        conn.execute("INSERT INTO participants (id,data) VALUES (?,?)",
                     (pid, json.dumps(data, ensure_ascii=False)))
    await broadcast("participants", db_participants())
    return body

@app.put("/api/participants/bulk")
async def bulk_p(request: Request):
    body = await request.json()
    body = body if isinstance(body, list) else []
    with get_db() as conn:
        conn.execute("DELETE FROM participants")
        for p in body:
            pid  = p.get("id")
            data = {k:v for k,v in p.items() if k!="id"}
            conn.execute("INSERT INTO participants (id,data) VALUES (?,?)",
                         (pid, json.dumps(data, ensure_ascii=False)))
    await broadcast("participants", body)
    return {"ok": True}

@app.delete("/api/participants/{pid}")
async def del_p(pid: str):
    with get_db() as conn: conn.execute("DELETE FROM participants WHERE id=?", (pid,))
    await broadcast("participants", db_participants())
    return {"ok": True}

@app.delete("/api/participants")
async def del_all_p():
    with get_db() as conn: conn.execute("DELETE FROM participants")
    await broadcast("participants", [])
    return {"ok": True}

@app.get("/api/torneos")
async def get_t(): return db_torneos()

@app.put("/api/torneos")
async def upd_t(request: Request):
    # Usamos Request directo para aceptar tanto list como {torneos: list}
    body = await request.json()
    torneos = body if isinstance(body, list) else body.get("torneos", body)
    with get_db() as conn:
        conn.execute("DELETE FROM torneos")
        for t in torneos:
            conn.execute("INSERT INTO torneos (id,data) VALUES (?,?)",
                         (t["id"], json.dumps(t, ensure_ascii=False)))
    await broadcast("torneos", torneos)
    return {"ok": True}

@app.get("/api/config")
async def get_cfg(): return db_config()

@app.put("/api/config")
async def upd_cfg(body: dict):
    with get_db() as conn:
        conn.execute("DELETE FROM config WHERE id=1")
        conn.execute("INSERT INTO config (id,data) VALUES (1,?)",
                     (json.dumps(body, ensure_ascii=False),))
    await broadcast("config", body)
    return {"ok": True}

# ── EMAIL ──

@app.post("/api/email/test")
async def email_test(body: dict):
    """Envia un email de prueba para verificar la configuracion SMTP."""
    if not body.get("smtpHost") or not body.get("smtpUser") or not body.get("smtpPass"):
        raise HTTPException(400, "Faltan: smtpHost, smtpUser, smtpPass")

    smtp_cfg = {
        "host": body["smtpHost"], "port": int(body.get("smtpPort", 587)),
        "user": body["smtpUser"], "password": body["smtpPass"],
        "from_email": body.get("smtpFrom", body["smtpUser"]),
        "from_name":  body.get("smtpFromName", "Mundialito IXFO 2026"),
    }
    html = _wrap(f"""
<h2 style="color:{NAVY};font-family:Arial Black,Arial,sans-serif;
            text-transform:uppercase;margin:0 0 16px;">Configuracion correcta</h2>
<p style="color:#555;font-size:15px;line-height:1.6;margin:0 0 16px;">
  Este es un email de prueba del <strong>Mundialito IXFO 2026</strong>.</p>
<p style="color:#555;font-size:14px;margin:0;">
  La configuracion SMTP funciona correctamente.</p>
""", "Prueba de configuracion SMTP", smtp_cfg["from_email"])

    ok, msg = send_email(smtp_cfg, smtp_cfg["from_email"],
                         "Administrador", "Mundialito IXFO 2026 - Prueba SMTP", html)
    if ok: return {"ok": True, "detail": f"Email enviado a {smtp_cfg['from_email']}"}
    raise HTTPException(500, msg)


@app.post("/api/email/sorteo")
async def email_sorteo(body: dict):
    """
    Notifica a titulares y suplentes que fueron seleccionados.
    1 email por segundo — anti-spam.
    """
    smtp_cfg      = extract_smtp(body)
    torneo        = body.get("torneo", {})
    destinatarios = body.get("destinatarios", [])
    whatsapp      = body.get("whatsapp", "")
    anexo1_b64    = body.get("anexo1_b64", "")   # PDF Anexo I en base64
    anexo2_b64    = body.get("anexo2_b64", "")   # PDF Anexo II en base64

    if not destinatarios: raise HTTPException(400, "Sin destinatarios")

    log, enviados = [], 0
    for dest in destinatarios:
        if not dest.get("email"):
            log.append(f"Sin email: {dest.get('nombre','')} {dest.get('apellido','')}"); continue

        html = tpl_seleccionado(
            dest["nombre"], dest["apellido"], dest.get("esTitular", True),
            torneo.get("nombre",""), torneo.get("fecha",""),
            torneo.get("sede",""), torneo.get("direccionSede",""), whatsapp,
            smtp_cfg.get("from_email", ""))

        # Adjuntos: Anexo I solo para menores, Anexo II siempre
        attachments = []
        es_menor = int(dest.get("edad", 99)) < 18
        if es_menor and anexo1_b64:
            attachments.append({
                "filename": "Anexo_I_Autorizacion_Menores_MundialitoIXFO.pdf",
                "data_b64": anexo1_b64,
            })
        if anexo2_b64:
            attachments.append({
                "filename": "Anexo_II_Uso_de_Imagen_MundialitoIXFO.pdf",
                "data_b64": anexo2_b64,
            })

        ok, msg = send_email(
            smtp_cfg, dest["email"],
            f"{dest['nombre']} {dest['apellido']}",
            f"Mundialito IXFO 2026 - Fuiste seleccionado para el {torneo.get('nombre','')}!",
            html, attachments if attachments else None)
        log.append(msg)
        if ok: enviados += 1
        await asyncio.sleep(1)   # anti-spam: 1 por segundo (async — no bloquea)

    return {"ok": True, "enviados": enviados, "total": len(destinatarios), "log": log}


@app.post("/api/email/equipo")
async def email_equipo(body: dict):
    """
    Notifica a cada titular su equipo FIFA asignado.
    1 email por segundo — anti-spam.
    """
    smtp_cfg      = extract_smtp(body)
    torneo        = body.get("torneo", {})
    destinatarios = body.get("destinatarios", [])

    if not destinatarios: raise HTTPException(400, "Sin destinatarios")

    log, enviados = [], 0
    for dest in destinatarios:
        if not dest.get("email"):
            log.append(f"Sin email: {dest.get('nombre','')}"); continue
        if not dest.get("equipo"):
            log.append(f"Sin equipo: {dest.get('nombre','')}"); continue

        html = tpl_equipo(
            dest["nombre"], dest["apellido"], dest["equipo"],
            torneo.get("nombre",""), torneo.get("fecha",""),
            torneo.get("sede",""), torneo.get("direccionSede",""),
            smtp_cfg.get("from_email", ""))

        ok, msg = send_email(
            smtp_cfg, dest["email"],
            f"{dest['nombre']} {dest['apellido']}",
            f"Mundialito IXFO 2026 - Tu seleccion: {dest['equipo']}",
            html)
        log.append(msg)
        if ok: enviados += 1
        await asyncio.sleep(1)   # anti-spam: 1 por segundo (async — no bloquea)

    return {"ok": True, "enviados": enviados, "total": len(destinatarios), "log": log}


# ── FRONTEND ──
if DIST_DIR.exists():
    app.mount("/", StaticFiles(directory=str(DIST_DIR), html=True), name="static")


@app.post("/api/email/granfinal")
async def email_gran_final(body: dict):
    """
    Recordatorio a los 8 finalistas con fecha, sede y equipo asignado.
    1 email por segundo — anti-spam.
    """
    smtp_cfg      = extract_smtp(body)
    torneo        = body.get("torneo", {})
    destinatarios = body.get("destinatarios", [])
    whatsapp      = body.get("whatsapp", "")
    anexo2_b64    = body.get("anexo2_b64", "")

    if not destinatarios: raise HTTPException(400, "Sin destinatarios")

    log, enviados = [], 0
    for dest in destinatarios:
        if not dest.get("email"):
            log.append(f"Sin email: {dest.get('nombre','')}"); continue
        if not dest.get("equipo"):
            log.append(f"Sin equipo: {dest.get('nombre','')}"); continue

        html = tpl_gran_final(
            dest["nombre"], dest["apellido"], dest["equipo"],
            torneo.get("fecha",""), torneo.get("sede",""),
            torneo.get("direccionSede",""), whatsapp,
            smtp_cfg.get("from_email",""))

        attachments = []
        if anexo2_b64:
            attachments.append({
                "filename": "Anexo_II_Uso_de_Imagen_MundialitoIXFO.pdf",
                "data_b64": anexo2_b64,
            })
        if int(dest.get("edad", 99)) < 18 and body.get("anexo1_b64"):
            attachments.append({
                "filename": "Anexo_I_Autorizacion_Menores_MundialitoIXFO.pdf",
                "data_b64": body["anexo1_b64"],
            })

        ok, msg = send_email(
            smtp_cfg, dest["email"],
            f"{dest['nombre']} {dest['apellido']}",
            f"Mundialito IXFO 2026 — Gran Final: te esperamos el {torneo.get('fecha','')}",
            html, attachments if attachments else None)

        log.append(msg)
        if ok: enviados += 1
        await asyncio.sleep(1)

    return {"ok": True, "enviados": enviados, "total": len(destinatarios), "log": log}
