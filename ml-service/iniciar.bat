@echo off
echo 🚀 Iniciando ML Service...
echo.

cd /d "%~dp0"

if not exist "venv\Scripts\activate.bat" (
    echo ❌ Error: Entorno virtual no encontrado
    echo    Ejecuta primero: python -m venv venv
    pause
    exit /b 1
)

call venv\Scripts\activate.bat

echo ✅ Entorno virtual activado
echo.
echo 📍 Servidor iniciándose en http://localhost:8000
echo 📖 Documentación API: http://localhost:8000/docs
echo.
echo Presiona Ctrl+C para detener el servicio
echo.

python main.py

pause

