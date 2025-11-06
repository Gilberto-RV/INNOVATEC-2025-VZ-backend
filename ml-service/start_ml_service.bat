@echo off
echo ========================================
echo    ML Service - INNOVATEC-2025-VZ
echo ========================================
echo.

REM Verificar si el entorno virtual existe
if not exist "venv\Scripts\activate.bat" (
    echo [ERROR] Entorno virtual no encontrado.
    echo.
    echo Ejecuta primero:
    echo   python -m venv venv
    echo   venv\Scripts\activate
    echo   pip install -r requirements.txt
    echo.
    pause
    exit /b 1
)

REM Activar entorno virtual
call venv\Scripts\activate.bat

REM Verificar si .env existe
if not exist ".env" (
    echo [ADVERTENCIA] Archivo .env no encontrado.
    echo Copiando .env.example a .env...
    copy .env.example .env >nul
    echo Por favor, edita .env y configura MONGO_URI
    echo.
    pause
)

REM Verificar si el modelo existe
if not exist "models\attendance_predictor.pkl" (
    echo [ADVERTENCIA] Modelo no encontrado.
    echo Entrenando modelo inicial...
    python train_model.py
    echo.
)

REM Iniciar servicio
echo Iniciando ML Service...
echo.
python main.py

