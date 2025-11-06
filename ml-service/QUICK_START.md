# 🚀 Inicio Rápido - ML Service

## ✅ Lo que YA está hecho (automático)

- ✅ Estructura completa del proyecto
- ✅ Scripts de extracción de datos
- ✅ Script de entrenamiento de modelo
- ✅ API FastAPI lista
- ✅ Integración con backend Node.js
- ✅ Servicios y controladores creados
- ✅ Rutas API configuradas

---

## 🔧 Lo que TÚ debes hacer (manual)

### **PASO 1: Instalar Python** (5 min)
Si no tienes Python instalado:

1. **Windows**:
   - Descargar de: https://www.python.org/downloads/
   - Versión: Python 3.9 o superior
   - ⚠️ **IMPORTANTE**: Marcar "Add Python to PATH" durante instalación

2. **Verificar instalación**:
   ```powershell
   python --version
   # Debe mostrar: Python 3.9.x o superior
   ```

---

### **PASO 2: Crear Entorno Virtual** (2 min)
```powershell
cd backend/ml-service
python -m venv venv
```

---

### **PASO 3: Activar Entorno Virtual** (1 min)
```powershell
# Windows PowerShell
venv\Scripts\Activate.ps1

# O si da error de política:
venv\Scripts\activate.bat

# Deberías ver (venv) al inicio de la línea de comandos
```

---

### **PASO 4: Instalar Dependencias** (5 min)
```powershell
pip install -r requirements.txt
```

**O ejecutar el script de setup:**
```powershell
python setup.py
```

---

### **PASO 5: Configurar .env** (2 min)

1. Copiar archivo de ejemplo:
   ```powershell
   copy .env.example .env
   ```

2. Editar `.env` y agregar tu MONGO_URI:
   ```env
   MONGO_URI=mongodb+srv://innovatec_user:admin123@cluster0.nctkhhn.mongodb.net/innovatec?retryWrites=true&w=majority
   ML_PORT=8000
   ML_HOST=0.0.0.0
   ```

---

### **PASO 6: Entrenar Primer Modelo** (5 min)
```powershell
python train_model.py
```

**Si no hay suficientes datos**, el script generará datos sintéticos automáticamente.

---

### **PASO 7: Iniciar ML Service** (1 min)
```powershell
python main.py
```

Deberías ver:
```
🚀 Iniciando ML Service...
📍 Servidor en http://0.0.0.0:8000
📖 Documentación API: http://localhost:8000/docs
```

---

### **PASO 8: Probar la API** (opcional)
Abrir en navegador: `http://localhost:8000/docs`

O probar con curl:
```powershell
curl http://localhost:8000/health
```

---

## 🎯 Resumen de Comandos

```powershell
# 1. Ir al directorio
cd backend/ml-service

# 2. Crear entorno virtual
python -m venv venv

# 3. Activar entorno
venv\Scripts\activate

# 4. Instalar dependencias
pip install -r requirements.txt

# 5. Configurar .env (editar manualmente)

# 6. Entrenar modelo
python train_model.py

# 7. Iniciar servicio
python main.py
```

---

## ✅ Verificación

Una vez completado, deberías tener:
- ✅ ML Service corriendo en `http://localhost:8000`
- ✅ Modelo entrenado en `models/attendance_predictor.pkl`
- ✅ API documentada en `http://localhost:8000/docs`

---

## 🔗 Integración con Backend

El backend Node.js ya está configurado para llamar al ML Service. Solo necesitas:

1. Agregar en `backend/.env`:
   ```env
   ML_SERVICE_URL=http://localhost:8000
   ```

2. El backend ya tiene los endpoints:
   - `GET /api/bigdata/predict/attendance/:eventId`
   - `POST /api/bigdata/predict/batch`
   - `GET /api/bigdata/ml/status`

---

## 🆘 Problemas Comunes

### "python no se reconoce como comando"
- Instalar Python desde python.org
- Marcar "Add Python to PATH" durante instalación
- Reiniciar terminal

### "Error conectando a MongoDB"
- Verificar MONGO_URI en .env
- Verificar que MongoDB Atlas tenga tu IP en whitelist

### "ModuleNotFoundError"
- Asegúrate de haber activado el entorno virtual
- Ejecuta: `pip install -r requirements.txt`

### "Modelo no encontrado"
- Ejecuta: `python train_model.py` primero

---

## 📞 Siguiente Paso

Una vez que el ML Service esté corriendo, puedes:
1. Probar predicciones desde el dashboard de Big Data
2. Ver predicciones en tiempo real para eventos
3. Re-entrenar el modelo cuando tengas más datos

¡Listo para empezar! 🚀

