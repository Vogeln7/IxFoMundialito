/**
 * Mundialito IXFO 2026 — Backend API
 * Express + sql.js (SQLite puro JavaScript, sin compilación)
 * Tiempo real vía Server-Sent Events (SSE)
 */

"use strict";
const express   = require("express");
const cors      = require("cors");
const path      = require("path");
const fs        = require("fs");
const initSqlJs = require("sql.js");

const app = express();
app.use(express.json({ limit: "10mb" }));
app.use(cors());

// ══════════════════════════════════════════════════
//  BASE DE DATOS — sql.js (SQLite en JavaScript puro)
// ══════════════════════════════════════════════════

const DB_FILE = process.env.DB_PATH || path.join(__dirname, "mundialito.db");

let SQL;   // sql.js library
let db;    // instancia de la base de datos

// Guarda la DB en disco (sql.js trabaja en memoria, persiste manualmente)
function persistDB() {
  try {
    const data = db.export();
    fs.writeFileSync(DB_FILE, Buffer.from(data));
  } catch(e) {
    console.error("Error guardando DB:", e);
  }
}

// Helpers síncronos con la misma firma que antes (async por compatibilidad)
const dbObj = {
  async run(sql, params = []) {
    db.run(sql, params);
    persistDB();
  },
  async get(sql, params = []) {
    const stmt = db.prepare(sql);
    stmt.bind(params);
    const row = stmt.step() ? stmt.getAsObject() : null;
    stmt.free();
    return row;
  },
  async all(sql, params = []) {
    const stmt = db.prepare(sql);
    stmt.bind(params);
    const rows = [];
    while (stmt.step()) rows.push(stmt.getAsObject());
    stmt.free();
    return rows;
  },
};

// ── Inicializar sql.js y base de datos ──
async function initDB() {
  SQL = await initSqlJs();

  // Cargar DB existente del disco, o crear nueva
  if (fs.existsSync(DB_FILE)) {
    const fileBuffer = fs.readFileSync(DB_FILE);
    db = new SQL.Database(fileBuffer);
    console.log("📂 Base de datos cargada desde:", DB_FILE);
  } else {
    db = new SQL.Database();
    console.log("🆕 Base de datos nueva creada en:", DB_FILE);
  }

  // Crear tablas si no existen
  db.run(`
    CREATE TABLE IF NOT EXISTS participants (
      id TEXT PRIMARY KEY,
      data TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);
  db.run(`
    CREATE TABLE IF NOT EXISTS torneos (
      id INTEGER PRIMARY KEY,
      data TEXT NOT NULL,
      updated_at TEXT DEFAULT (datetime('now'))
    )
  `);
  db.run(`
    CREATE TABLE IF NOT EXISTS config (
      id INTEGER PRIMARY KEY DEFAULT 1,
      data TEXT NOT NULL,
      updated_at TEXT DEFAULT (datetime('now'))
    )
  `);
  persistDB();
  console.log("✅ Tablas inicializadas");
}

// Parseo seguro de JSON
const parse = (v) => { try { return typeof v === "string" ? JSON.parse(v) : v; } catch { return v; } };
const str   = (v) => typeof v === "string" ? v : JSON.stringify(v);

// ══════════════════════════════════════════════════
//  SERVER-SENT EVENTS — tiempo real
// ══════════════════════════════════════════════════

const clients = new Set();

function broadcast(event, data) {
  const msg = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  clients.forEach(res => { try { res.write(msg); } catch {} });
}

app.get("/api/events", (req, res) => {
  res.setHeader("Content-Type",  "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection",    "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
  res.flushHeaders();

  // Heartbeat para mantener la conexión viva
  const heartbeat = setInterval(() => {
    try { res.write(":heartbeat\n\n"); } catch { clearInterval(heartbeat); }
  }, 25000);

  clients.add(res);
  console.log(`SSE conectado (total: ${clients.size})`);

  req.on("close", () => {
    clearInterval(heartbeat);
    clients.delete(res);
    console.log(`SSE desconectado (total: ${clients.size})`);
  });
});

// ══════════════════════════════════════════════════
//  API — PARTICIPANTS
// ══════════════════════════════════════════════════

app.get("/api/participants", async (req, res) => {
  try {
    const rows = await dbObj.all("SELECT id, data FROM participants ORDER BY created_at ASC");
    res.json(rows.map(r => ({ id: r.id, ...parse(r.data) })));
  } catch(e) { res.status(500).json({ error: e.message }); }
});

app.post("/api/participants", async (req, res) => {
  try {
    const p = req.body;
    if (!p.id) return res.status(400).json({ error: "id requerido" });
    // Verificar DNI duplicado
    const existing = await dbObj.get("SELECT id FROM participants WHERE json_extract(data,'$.dni') = ?", [p.dni]);
    if (existing) return res.status(409).json({ error: "DNI ya registrado" });
    const { id, ...data } = p;
    await dbObj.run("INSERT INTO participants (id, data) VALUES (?, ?)", [id, str(data)]);
    const all = await dbObj.all("SELECT id, data FROM participants ORDER BY created_at ASC");
    const list = all.map(r => ({ id: r.id, ...parse(r.data) }));
    broadcast("participants", list);
    res.status(201).json(p);
  } catch(e) { res.status(500).json({ error: e.message }); }
});

app.put("/api/participants/bulk", async (req, res) => {
  try {
    const list = req.body;
    if (!Array.isArray(list)) return res.status(400).json({ error: "Array esperado" });
    db.run("DELETE FROM participants");
    for (const p of list) {
      const { id, ...data } = p;
      db.run("INSERT INTO participants (id, data) VALUES (?, ?)", [id, str(data)]);
    }
    persistDB();
    broadcast("participants", list);
    res.json({ ok: true });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

app.delete("/api/participants/:id", async (req, res) => {
  try {
    await dbObj.run("DELETE FROM participants WHERE id = ?", [req.params.id]);
    const all = await dbObj.all("SELECT id, data FROM participants ORDER BY created_at ASC");
    const list = all.map(r => ({ id: r.id, ...parse(r.data) }));
    broadcast("participants", list);
    res.json({ ok: true });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

app.delete("/api/participants", async (req, res) => {
  try {
    await dbObj.run("DELETE FROM participants");
    broadcast("participants", []);
    res.json({ ok: true });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// ══════════════════════════════════════════════════
//  API — TORNEOS
// ══════════════════════════════════════════════════

app.get("/api/torneos", async (req, res) => {
  try {
    const rows = await dbObj.all("SELECT data FROM torneos ORDER BY id ASC");
    res.json(rows.map(r => parse(r.data)));
  } catch(e) { res.status(500).json({ error: e.message }); }
});

app.put("/api/torneos", async (req, res) => {
  try {
    const torneos = req.body;
    if (!Array.isArray(torneos)) return res.status(400).json({ error: "Array esperado" });
    db.run("DELETE FROM torneos");
    for (const t of torneos) {
      db.run("INSERT INTO torneos (id, data) VALUES (?, ?)", [t.id, str(t)]);
    }
    persistDB();
    broadcast("torneos", torneos);
    res.json({ ok: true });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// ══════════════════════════════════════════════════
//  API — CONFIG
// ══════════════════════════════════════════════════

app.get("/api/config", async (req, res) => {
  try {
    const row = await dbObj.get("SELECT data FROM config WHERE id = 1");
    res.json(row ? parse(row.data) : {});
  } catch(e) { res.status(500).json({ error: e.message }); }
});

app.put("/api/config", async (req, res) => {
  try {
    const cfg = req.body;
    db.run("DELETE FROM config WHERE id = 1");
    db.run("INSERT INTO config (id, data) VALUES (1, ?)", [str(cfg)]);
    persistDB();
    broadcast("config", cfg);
    res.json({ ok: true });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// ══════════════════════════════════════════════════
//  FRONTEND (producción)
// ══════════════════════════════════════════════════

const DIST = path.join(__dirname, "../dist");
if (fs.existsSync(DIST)) {
  app.use(express.static(DIST));
  app.get("*", (req, res) => res.sendFile(path.join(DIST, "index.html")));
}

// ══════════════════════════════════════════════════
//  ARRANCAR
// ══════════════════════════════════════════════════

const PORT = process.env.PORT || 3001;

initDB().then(() => {
  app.listen(PORT, () => {
    console.log(`\n🚀 Mundialito IXFO corriendo en http://localhost:${PORT}`);
    console.log(`   Base de datos: SQLite (sql.js) → ${DB_FILE}\n`);
  });
}).catch(e => {
  console.error("❌ Error iniciando:", e);
  process.exit(1);
});
