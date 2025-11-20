# Script simple para iniciar el ML Service
# Uso: .\start-ml.ps1

$ErrorActionPreference = "Stop"

Write-Host "🚀 Iniciando ML Service..." -ForegroundColor Green
Write-Host ""

# Activar entorno virtual
if (Test-Path "venv\Scripts\Activate.ps1") {
    Write-Host "✅ Activando entorno virtual..." -ForegroundColor Cyan
    & ".\venv\Scripts\Activate.ps1"
} else {
    Write-Host "❌ Error: Entorno virtual no encontrado" -ForegroundColor Red
    exit 1
}

# Verificar modelos
if (-not (Test-Path "models\attendance_predictor.pkl")) {
    Write-Host "⚠️  Modelos no encontrados. Entrenando..." -ForegroundColor Yellow
    python train_all_models.py
    Write-Host ""
}

Write-Host "📍 Servidor iniciándose en http://localhost:8000" -ForegroundColor Cyan
Write-Host "📖 Documentación API: http://localhost:8000/docs" -ForegroundColor Cyan
Write-Host ""
Write-Host "Presiona Ctrl+C para detener el servicio" -ForegroundColor Yellow
Write-Host ""

# Iniciar servicio
python main.py

