"""
Mundialito IXFO 2026 — Lanzador
Ejecutar con: python start.py
"""
import os
import uvicorn

PORT = int(os.getenv("PORT", 3001))

if __name__ == "__main__":
    uvicorn.run(
        "server_python.main:app",
        host="0.0.0.0",
        port=PORT,
        reload=False,         # True para desarrollo con auto-reload
        log_level="info",
    )
