# main.py
"""
Punto de entrada principal del ML Service
"""
import uvicorn
from config import ML_PORT, ML_HOST
from api import app

if __name__ == "__main__":
    print("🚀 Iniciando ML Service...")
    print(f"📍 Servidor en http://{ML_HOST}:{ML_PORT}")
    print("📖 Documentación API: http://localhost:8000/docs")
    uvicorn.run(app, host=ML_HOST, port=ML_PORT, reload=True)

