# Script PowerShell para iniciar el ML Service
Write-Host "🚀 Iniciando ML Service..." -ForegroundColor Green

# Activar entorno virtual
& ".\venv\Scripts\Activate.ps1"

# Verificar que Python esté disponible
python --version

# Iniciar el servicio
Write-Host "📍 Servidor iniciándose en http://localhost:8000" -ForegroundColor Cyan
Write-Host "📖 Documentación API: http://localhost:8000/docs" -ForegroundColor Cyan
Write-Host ""

python main.py

