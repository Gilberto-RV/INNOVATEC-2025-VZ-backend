# main.py
"""
Punto de entrada principal del ML Service
"""
import uvicorn
from config import ML_PORT, ML_HOST

if __name__ == "__main__":
    print("🚀 Iniciando ML Service...")
    print(f"📍 Servidor en http://{ML_HOST}:{ML_PORT}")
    print("📖 Documentación API: http://localhost:8000/docs")
    print("⏳ Iniciando servidor...")
    # Usar cadena de importación para habilitar reload
    uvicorn.run(
        "api:app",
        host=ML_HOST,
        port=ML_PORT,
        reload=True,
        log_level="info"
    )

