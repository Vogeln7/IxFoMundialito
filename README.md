# 🏆 Mundialito IXFO 2026

**IXFO Internet por Fibra Óptica** — Posadas y Garupá, Misiones.

Disponible en dos versiones de backend — elegí la que más te convenga:

---

## 🐍 Versión Python (FastAPI) — RECOMENDADA

### Requisitos
- Python 3.10 o superior → [python.org](https://python.org)
- Node.js 18+ → solo para compilar el frontend (una sola vez)

### Instalación

```bash
# 1. Instalar dependencias Python
pip install -r server_python/requirements.txt

# 2. Compilar el frontend React (una sola vez)
npm install
npm run build
```

### Correr en desarrollo local

**Terminal 1 — Backend Python:**
```bash
python start.py
# API en http://localhost:3001
```

**Terminal 2 — Frontend React (con hot reload):**
```bash
npm run dev:front
# App en http://localhost:5173
```

### Producción (todo junto)

```bash
npm run build          # compila React → dist/
python start.py        # sirve API + frontend en http://localhost:3001
```

Un solo proceso sirve todo. Apuntás Nginx/Apache a `localhost:3001`.

---

## 🟢 Versión Node.js (Express)

```bash
npm install
npm run dev:api    # Terminal 1 — backend
npm run dev:front  # Terminal 2 — frontend
# Producción: npm run build && npm start
```

---

## 🗄️ Base de datos

**SQLite** — se crea automáticamente en `server_python/mundialito.db` (Python) o `server/mundialito.db` (Node).
No requiere instalación. Para usar PostgreSQL, ver `.env.example`.

---

## 🌐 Nginx (producción)

```nginx
server {
    listen 80;
    server_name tudominio.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        # SSE — tiempo real:
        proxy_buffering off;
        proxy_read_timeout 86400s;
    }
}
```

---

## 🔐 Acceso al Panel Admin
- **Administrador:** contraseña por defecto `IXFO2026`
- **Operador:** contraseña por defecto `OPERADOR2026`
- Cambiarlas en: **Admin → Config**

---

**Elaborado para IXFO Internet por Fibra Óptica · Mayo 2026**
