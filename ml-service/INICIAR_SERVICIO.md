# 🚀 Cómo Iniciar el ML Service

## ⚠️ Importante: Debes estar en el directorio correcto

El servicio ML debe iniciarse desde: `backend/ml-service`

## 📋 Pasos para Iniciar

### Opción 1: Usando PowerShell (Recomendado)

1. **Abre PowerShell** y navega al directorio:
```powershell
cd C:\INNOVATEC\project-bolt-sb1-tgs5h47h\backend\ml-service
```

2. **Activa el entorno virtual:**
```powershell
.\venv\Scripts\Activate.ps1
```

3. **Inicia el servicio:**
```powershell
python main.py
```

### Opción 2: Usando el script .bat

1. **Navega al directorio:**
```powershell
cd C:\INNOVATEC\project-bolt-sb1-tgs5h47h\backend\ml-service
```

2. **Ejecuta el script:**
```powershell
.\start_ml_service.bat
```

### Opción 3: Todo en un comando

```powershell
cd C:\INNOVATEC\project-bolt-sb1-tgs5h47h\backend\ml-service; .\venv\Scripts\Activate.ps1; python main.py
```

## ✅ Verificar que funciona

Una vez iniciado, deberías ver:
```
🚀 Iniciando ML Service...
📍 Servidor en http://0.0.0.0:8000
📖 Documentación API: http://localhost:8000/docs
```

Abre en tu navegador: `http://localhost:8000/docs`

## 🔍 Solución de Problemas

### Error: "venv\Scripts\activate : El módulo 'venv' no pudo cargarse"

**Solución:** Usa la ruta completa con `.\`:
```powershell
.\venv\Scripts\Activate.ps1
```

### Error: "can't open file 'main.py'"

**Solución:** Asegúrate de estar en el directorio correcto:
```powershell
cd backend\ml-service
```

### Error: "python: command not found"

**Solución:** Verifica que Python esté en el PATH o usa la ruta completa:
```powershell
python --version
# O
py --version
```

