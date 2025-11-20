# Script para iniciar el ML Service
# Uso: .\iniciar-ml-service.ps1

Write-Host "🚀 Iniciando ML Service..." -ForegroundColor Green
Write-Host ""

# Verificar que estamos en el directorio correcto
if (-not (Test-Path "main.py")) {
    Write-Host "❌ Error: Este script debe ejecutarse desde backend\ml-service" -ForegroundColor Red
    Write-Host "   Directorio actual: $(Get-Location)" -ForegroundColor Yellow
    exit 1
}

# Verificar entorno virtual
if (-not (Test-Path "venv\Scripts\Activate.ps1")) {
    Write-Host "❌ Error: Entorno virtual no encontrado" -ForegroundColor Red
    Write-Host "   Ejecuta primero:" -ForegroundColor Yellow
    Write-Host "   python -m venv venv" -ForegroundColor Yellow
    Write-Host "   .\venv\Scripts\Activate.ps1" -ForegroundColor Yellow
    Write-Host "   pip install -r requirements.txt" -ForegroundColor Yellow
    exit 1
}

# Verificar archivo .env
if (-not (Test-Path ".env")) {
    Write-Host "⚠️  Advertencia: Archivo .env no encontrado" -ForegroundColor Yellow
    Write-Host "   El servicio usará valores por defecto" -ForegroundColor Yellow
    Write-Host ""
}

# Verificar modelos
if (-not (Test-Path "models\attendance_predictor.pkl")) {
    Write-Host "⚠️  Modelos no encontrados. Entrenando modelos..." -ForegroundColor Yellow
    & ".\venv\Scripts\python.exe" train_all_models.py
    Write-Host ""
}

# Activar entorno virtual e iniciar servicio
Write-Host "📍 Servidor iniciándose en http://localhost:8000" -ForegroundColor Cyan
Write-Host "📖 Documentación API: http://localhost:8000/docs" -ForegroundColor Cyan
Write-Host ""

& ".\venv\Scripts\Activate.ps1"
python main.py

