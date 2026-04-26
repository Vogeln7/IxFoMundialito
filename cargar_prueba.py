"""
Mundialito IXFO 2026 — Generador de base de datos de prueba
300 participantes ficticios repartidos entre Posadas, Garupá y Otra localidad

Uso:
  python cargar_prueba.py              # inserta en la DB del proyecto
  python cargar_prueba.py --via-api    # carga via API REST (servidor debe estar corriendo)
"""

import json
import random
import sqlite3
import sys
import time
import uuid
from datetime import date, timedelta
from pathlib import Path

# ── Datos ficticios ──────────────────────────────────────────────

NOMBRES_M = [
    "Rodrigo","Matías","Lucas","Agustín","Nicolás","Sebastián","Diego","Javier",
    "Gonzalo","Fernando","Pablo","Carlos","Martín","Ezequiel","Leandro","Facundo",
    "Damián","Cristian","Gustavo","Ariel","Marcos","Alejandro","Ramiro","Walter",
    "Claudio","Andrés","Eduardo","Sergio","Mario","Daniel","Felipe","Santiago",
    "Tomás","Ignacio","Julián","Maximiliano","Hernán","Roberto","Miguel","Oscar",
]
NOMBRES_F = [
    "Valentina","Sofía","Lucía","Camila","Florencia","Romina","Natalia","Carolina",
    "Gabriela","Silvina","Mariela","Paula","Verónica","Claudia","Sandra","Vanesa",
    "Lorena","Viviana","Daniela","Paola","Micaela","Jimena","Soledad","Analía",
    "Beatriz","Cecilia","Elena","Graciela","Laura","Marina","Noelia","Patricia",
    "Rosa","Sabrina","Tamara","Victoria","Ximena","Yanina","Zulma","Aldana",
]
APELLIDOS = [
    "González","Rodríguez","García","Fernández","López","Martínez","Sánchez",
    "Pérez","Gómez","Díaz","Torres","Ramírez","Flores","Acosta","Medina","Rojas",
    "Herrera","Ruiz","Morales","Ortiz","Gutiérrez","Chávez","Ramos","Reyes",
    "Cruz","Vega","Romero","Castro","Suárez","Mendoza","Silva","Núñez","Ibáñez",
    "Pereyra","Molina","Álvarez","Guerrero","Ríos","Benítez","Espínola","Britez",
    "Cardozo","Leiva","Bogado","Insaurralde","Aquino","Barreto","Chaparro","Dure",
    "Figueredo","Giménez","Hassler","Krebber","Leguizamón","Mamani","Nardelli",
]
DOMINIOS = ["gmail.com","hotmail.com","yahoo.com","outlook.com","ixfo.com.ar"]

CIUDADES = {
    "Posadas":        0.45,   # 45% → ~135
    "Garupá":         0.40,   # 40% → ~120
    "Otra localidad": 0.15,   # 15% → ~45
}

def gen_dni(usados):
    while True:
        d = str(random.randint(8_000_000, 45_000_000))
        if d not in usados:
            usados.add(d)
            return d

def gen_fecha_nac():
    """Edad entre 12 y 65 años."""
    hoy = date.today()
    min_nac = hoy - timedelta(days=65*365)
    max_nac = hoy - timedelta(days=12*365)
    rango = (max_nac - min_nac).days
    return (min_nac + timedelta(days=random.randint(0, rango))).isoformat()

def calcular_edad(fecha_nac: str) -> int:
    nac = date.fromisoformat(fecha_nac)
    hoy = date.today()
    edad = hoy.year - nac.year
    if (hoy.month, hoy.day) < (nac.month, nac.day):
        edad -= 1
    return edad

def gen_whatsapp(ciudad):
    codigos = {"Posadas": "3764", "Garupá": "3764", "Otra localidad": random.choice(["3751","3743","3755","3756"])}
    cod = codigos.get(ciudad, "3764")
    return f"+54 9 {cod} {random.randint(100,999)}-{random.randint(1000,9999)}"

def generar_participantes(n=300):
    random.seed(42)  # reproducible
    participantes = []
    dnis_usados = set()

    # Distribución de ciudades
    ciudades_lista = random.choices(
        list(CIUDADES.keys()),
        weights=list(CIUDADES.values()),
        k=n
    )

    for i in range(n):
        genero = random.choice(["M","F"])
        nombres = NOMBRES_M if genero == "M" else NOMBRES_F
        nombre   = random.choice(nombres)
        apellido = random.choice(APELLIDOS)
        dni      = gen_dni(dnis_usados)
        fecha_nac= gen_fecha_nac()
        edad     = calcular_edad(fecha_nac)
        ciudad   = ciudades_lista[i]
        email    = f"{nombre.lower()}.{apellido.lower()}{random.randint(1,999)}@{random.choice(DOMINIOS)}"
        email    = email.replace(" ","").replace("á","a").replace("é","e").replace("í","i").replace("ó","o").replace("ú","u").replace("ñ","n")
        whatsapp = gen_whatsapp(ciudad)
        cliente  = random.choice(["si","si","si","no"])  # 75% clientes IXFO
        novedades= random.random() < 0.6

        # Fecha de inscripción escalonada entre Marzo y Abril 2026
        dias_offset = random.randint(0, 45)
        ts = f"2026-03-{random.randint(1,28):02d}T{random.randint(8,22):02d}:{random.randint(0,59):02d}:00.000Z"

        participantes.append({
            "id":              str(uuid.uuid4()),
            "nombre":          nombre,
            "apellido":        apellido,
            "dni":             dni,
            "fechaNac":        fecha_nac,
            "edad":            str(edad),
            "email":           email,
            "whatsapp":        whatsapp,
            "ciudad":          ciudad,
            "clienteIxfo":     cliente,
            "novedades":       novedades,
            "fechaInscripcion":ts,
        })

    return participantes

# ── Opción A: Insertar directo en SQLite ──────────────────────────

def cargar_en_db(participantes, db_path):
    print(f"\n📁 Cargando en SQLite: {db_path}")
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")

    # Verificar que la tabla existe
    conn.execute("""
        CREATE TABLE IF NOT EXISTS participants (
            id TEXT PRIMARY KEY,
            data TEXT NOT NULL,
            created_at TEXT DEFAULT (datetime('now'))
        )
    """)

    # Limpiar datos anteriores si se confirma
    existing = conn.execute("SELECT COUNT(*) as c FROM participants").fetchone()["c"]
    if existing > 0:
        resp = input(f"⚠️  Ya hay {existing} participantes. ¿Borrarlos y reemplazar? (s/N): ").strip().lower()
        if resp != "s":
            print("Cancelado.")
            conn.close()
            return

    conn.execute("DELETE FROM participants")

    for p in participantes:
        pid  = p["id"]
        data = {k: v for k, v in p.items() if k != "id"}
        conn.execute(
            "INSERT INTO participants (id, data, created_at) VALUES (?, ?, ?)",
            (pid, json.dumps(data, ensure_ascii=False), p["fechaInscripcion"])
        )

    conn.commit()
    conn.close()

    # Stats
    por_ciudad = {}
    for p in participantes:
        por_ciudad[p["ciudad"]] = por_ciudad.get(p["ciudad"], 0) + 1
    menores = sum(1 for p in participantes if int(p["edad"]) < 18)
    clientes = sum(1 for p in participantes if p["clienteIxfo"] == "si")

    print(f"\n✅ {len(participantes)} participantes cargados:")
    for ciudad, count in sorted(por_ciudad.items()):
        print(f"   📍 {ciudad}: {count}")
    print(f"   👶 Menores de 18: {menores}")
    print(f"   ⚡ Clientes IXFO: {clientes}")
    print(f"\n🚀 Reiniciá el servidor Python para que tome los cambios en la DB.")

# ── Opción B: Cargar vía API REST ─────────────────────────────────

def cargar_via_api(participantes, base_url="http://localhost:3001"):
    import urllib.request
    import urllib.error

    print(f"\n🌐 Cargando vía API: {base_url}")

    # Primero borrar todos
    try:
        req = urllib.request.Request(f"{base_url}/api/participants", method="DELETE")
        urllib.request.urlopen(req, timeout=10)
        print("✅ Participantes anteriores eliminados")
    except Exception as e:
        print(f"⚠️  No se pudo limpiar: {e}")

    # Insertar de a uno
    ok = 0
    errores = []
    for i, p in enumerate(participantes):
        try:
            data = json.dumps(p, ensure_ascii=False).encode("utf-8")
            req  = urllib.request.Request(
                f"{base_url}/api/participants",
                data=data,
                headers={"Content-Type": "application/json"},
                method="POST",
            )
            urllib.request.urlopen(req, timeout=10)
            ok += 1
            if (i+1) % 50 == 0:
                print(f"   {i+1}/{len(participantes)}...")
            time.sleep(0.05)  # pequeña pausa para no saturar
        except urllib.error.HTTPError as e:
            errores.append(f"L{i+1}: HTTP {e.code}")
        except Exception as e:
            errores.append(f"L{i+1}: {e}")

    print(f"\n✅ {ok}/{len(participantes)} participantes insertados vía API")
    if errores:
        print(f"❌ {len(errores)} errores: {errores[:5]}")

# ── MAIN ──────────────────────────────────────────────────────────

if __name__ == "__main__":
    print("=" * 55)
    print("  MUNDIALITO IXFO 2026 — Carga de datos de prueba")
    print("=" * 55)

    participantes = generar_participantes(300)

    modo_api = "--via-api" in sys.argv

    if modo_api:
        url = next((a for a in sys.argv if a.startswith("http")), "http://localhost:3001")
        cargar_via_api(participantes, url)
    else:
        # Buscar la DB en las ubicaciones posibles
        posibles = [
            Path("server_python/mundialito.db"),
            Path("server/mundialito.db"),
            Path("mundialito.db"),
        ]
        db_path = next((p for p in posibles if p.exists()), posibles[0])
        cargar_en_db(participantes, db_path)
