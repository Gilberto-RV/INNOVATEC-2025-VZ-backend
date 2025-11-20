# 🚀 Instrucciones para Iniciar el ML Service

## Opción 1: Usar el script PowerShell (Recomendado)

```powershell
cd backend\ml-service
.\start-ml.ps1
```

## Opción 2: Inicio manual

```powershell
cd backend\ml-service
.\venv\Scripts\Activate.ps1
python main.py
```

## Opción 3: Usar el script de inicio de todos los servicios

Desde la raíz del proyecto:

```powershell
.\start-all-services.ps1
```

Este script iniciará automáticamente:
- Backend (puerto 5000)
- Panel Admin (puerto 5173)
- App Móvil (Expo)
- **ML Service (puerto 8000)** ← Se iniciará automáticamente

---

## ✅ Verificación

Una vez iniciado, verifica que el servicio esté corriendo:

```powershell
# Verificar salud del servicio
Invoke-WebRequest -Uri "http://localhost:8000/health" -UseBasicParsing

# O abrir en el navegador:
# http://localhost:8000/docs
```

---

## 🔧 Solución de Problemas

### El servicio no inicia

1. **Verifica que el entorno virtual esté activado:**
   ```powershell
   .\venv\Scripts\Activate.ps1
   ```

2. **Verifica que las dependencias estén instaladas:**
   ```powershell
   pip list | Select-String -Pattern "fastapi|scikit-learn|uvicorn"
   ```

3. **Verifica que los modelos estén entrenados:**
   ```powershell
   Test-Path "models\attendance_predictor.pkl"
   Test-Path "models\mobility_demand_predictor.pkl"
   Test-Path "models\saturation_predictor.pkl"
   ```

4. **Si faltan modelos, entrénalos:**
   ```powershell
   python train_all_models.py
   ```

### El servicio inicia pero el panel muestra "No Disponible"

1. **Verifica que el backend tenga la variable ML_SERVICE_URL:**
   ```powershell
   cd ..\..
   Get-Content .env | Select-String -Pattern "ML_SERVICE"
   ```

2. **Si no existe, agrégalo al .env del backend:**
   ```
   ML_SERVICE_URL=http://localhost:8000
   ```

3. **Reinicia el backend** después de agregar la variable.

---

## 📝 Notas

- El ML Service debe estar corriendo **antes** de usar las funciones de ML en el panel de administración.
- El servicio se ejecuta en el puerto **8000** por defecto.
- La documentación de la API está disponible en: **http://localhost:8000/docs**

