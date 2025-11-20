# 🤖 Machine Learning Service - Guía Completa

Microservicio de Machine Learning para predicciones inteligentes en el sistema INNOVATEC.

## 📋 Funcionalidades Implementadas

### ✅ 1. Predicción de Asistencias a Eventos
Predice cuántas personas asistirán a un evento basándose en:
- Visualizaciones del evento
- Visitantes únicos
- Día de la semana y hora
- Categoría del evento
- Score de popularidad

### ✅ 2. Predicción de Demandas de Movilidad
Predice la demanda de movilidad en edificios/áreas basándose en:
- Vistas de edificios
- Visitantes únicos
- Horas pico
- Cantidad de eventos
- Duración promedio de visualización

### ✅ 3. Anticipación de Saturaciones
Predice el nivel de saturación (Normal, Baja, Media, Alta) para:
- Edificios
- Eventos

Basándose en patrones históricos de uso.

---

## 🚀 Instalación y Configuración

### Requisitos Previos
- **Python 3.8+**
- **MongoDB** (debe estar corriendo y accesible)
- **Node.js** (para el backend principal)

### Paso 1: Instalar Python y crear entorno virtual

**Windows:**
```bash
# Instalar Python desde python.org si no lo tienes
python --version  # Verificar versión (debe ser 3.8+)

# Crear entorno virtual
cd backend/ml-service
python -m venv venv

# Activar entorno virtual
venv\Scripts\activate
```

**Linux/Mac:**
```bash
python3 --version  # Verificar versión
cd backend/ml-service
python3 -m venv venv
source venv/bin/activate
```

### Paso 2: Instalar dependencias

```bash
# Asegúrate de estar en el directorio ml-service con el venv activado
pip install -r requirements.txt
```

Si tienes problemas con alguna dependencia:
```bash
pip install --upgrade pip
pip install -r requirements.txt --no-cache-dir
```

### Paso 3: Configurar variables de entorno

Crea un archivo `.env` en `backend/ml-service/`:

```env
MONGO_URI=mongodb://localhost:27017/innovatec
# O si usas MongoDB Atlas:
# MONGO_URI=mongodb+srv://usuario:password@cluster.mongodb.net/innovatec

ML_PORT=8000
ML_HOST=0.0.0.0
MODELS_DIR=./models
DATA_DIR=./data
```

**⚠️ Importante:** Asegúrate de que `MONGO_URI` sea la misma que usa tu backend principal.

### Paso 4: Crear directorios necesarios

Los directorios se crean automáticamente, pero si quieres crearlos manualmente:

```bash
mkdir models
mkdir data
```

---

## 🎯 Entrenamiento de Modelos

### Entrenar Todos los Modelos (Recomendado)

```bash
python train_all_models.py
```

Este script entrena los 3 modelos:
1. Modelo de asistencia a eventos
2. Modelo de demanda de movilidad
3. Modelo de saturación

### Entrenar Modelos Individualmente

```bash
# Modelo de asistencia
python train_model.py

# Modelo de movilidad
python train_mobility_model.py

# Modelo de saturación
python train_saturation_model.py
```

### ¿Qué hace el entrenamiento?

1. **Extrae datos** de MongoDB (últimos 180 días por defecto)
2. **Prepara features** para cada modelo
3. **Entrena el modelo** usando scikit-learn:
   - Si hay >= 50 registros: usa Random Forest (más preciso)
   - Si hay < 50 registros: usa Linear/Logistic Regression (más rápido)
4. **Evalúa el modelo** y muestra métricas
5. **Guarda el modelo** en `models/` como archivo `.pkl`
6. **Guarda metadata** del modelo en `models/` como archivo `.json`

### Generación de Datos Sintéticos

Si no tienes suficientes datos reales, los scripts generan datos sintéticos automáticamente para permitir el entrenamiento. Estos datos son útiles para desarrollo y pruebas iniciales.

---

## 🏃 Iniciar el Servicio ML

### Opción 1: Iniciar manualmente

```bash
# Asegúrate de estar en el directorio ml-service con venv activado
python main.py
```

### Opción 2: Usar el script de Windows

```bash
# Windows
start_ml_service.bat
```

El servicio estará disponible en: `http://localhost:8000`

### Verificar que el servicio esté corriendo

```bash
# En tu navegador o con curl
curl http://localhost:8000/health

# O abre en el navegador:
# http://localhost:8000/docs (Documentación interactiva)
```

---

## 📚 Uso de la API

### Endpoints Disponibles

#### 1. **Predicción de Asistencia**
```
POST /predict/attendance
Content-Type: application/json

{
  "viewCount": 150,
  "uniqueVisitors": 80,
  "dayOfWeek": 2,
  "hour": 14,
  "category_count": 2,
  "popularityScore": 75.5,
  "date_time": "2025-01-20T14:00:00Z"
}
```

**Respuesta:**
```json
{
  "prediction": 125,
  "confidence": 0.7,
  "model_type": "RandomForest",
  "features_used": ["viewCount", "uniqueVisitors", "dayOfWeek", "hour", "category_count", "popularityScore"]
}
```

#### 2. **Predicción de Movilidad**
```
POST /predict/mobility
Content-Type: application/json

{
  "viewCount": 200,
  "uniqueVisitors": 120,
  "dayOfWeek": 2,
  "hour": 10,
  "peakHour": 14,
  "eventsCount": 3,
  "averageViewDuration": 45.5,
  "date_time": "2025-01-20T10:00:00Z"
}
```

#### 3. **Predicción de Saturación**
```
POST /predict/saturation
Content-Type: application/json

{
  "viewCount": 250,
  "uniqueVisitors": 150,
  "dayOfWeek": 2,
  "hour": 14,
  "peakVisits": 50,
  "averageViewDuration": 60.0,
  "popularityScore": 400,
  "type": 0,
  "date_time": "2025-01-20T14:00:00Z"
}
```

**Respuesta:**
```json
{
  "saturationLevel": 3,
  "saturationLabel": "Alta",
  "confidence": 0.85,
  "model_type": "RandomForestClassifier",
  "features_used": [...]
}
```

#### 4. **Verificar Estado del Servicio**
```
GET /health
```

#### 5. **Recargar Modelos** (después de re-entrenamiento)
```
POST /model/reload
```

---

## 🎨 Uso en el Panel Administrador

El panel administrador ya tiene integración completa con el ML Service:

1. **Accede al Dashboard ML:** `/admin/ml`
2. **Verifica el estado** del ML Service (verde = disponible)
3. **Usa las acciones rápidas:**
   - Click en edificios para predecir movilidad
   - Click en eventos para predecir asistencia
4. **Visualiza predicciones** en las tablas y gráficos

---

## 🔧 Configuración del Backend Node.js

El backend ya está configurado para conectarse al ML Service. Solo asegúrate de:

1. **Variable de entorno** en `.env` del backend:
```env
ML_SERVICE_URL=http://localhost:8000
```

2. **Verificar que el ML Service esté corriendo** antes de usar predicciones

---

## 🐛 Solución de Problemas

### Error: "Modelo no encontrado"
**Solución:** Entrena los modelos primero:
```bash
python train_all_models.py
```

### Error: "Error conectando a MongoDB"
**Solución:** 
1. Verifica que MongoDB esté corriendo
2. Verifica `MONGO_URI` en `.env`
3. Prueba la conexión:
```bash
python data_extractor.py
```

### Error: "Puerto 8000 ya está en uso"
**Solución:** Cambia el puerto en `.env`:
```env
ML_PORT=8001
```

Y actualiza `ML_SERVICE_URL` en el backend:
```env
ML_SERVICE_URL=http://localhost:8001
```

### El ML Service no responde
**Solución:**
1. Verifica que esté corriendo: `curl http://localhost:8000/health`
2. Revisa los logs en la terminal donde ejecutaste `python main.py`
3. Recarga los modelos: `curl -X POST http://localhost:8000/model/reload`

### Las predicciones no son precisas
**Solución:**
1. Entrena con más datos (ajusta `days_back` en los scripts)
2. Re-entrena los modelos periódicamente:
```bash
python train_all_models.py
curl -X POST http://localhost:8000/model/reload
```

---

## 📊 Re-entrenamiento Automático

Para mantener los modelos actualizados, puedes:

1. **Configurar un cron job** (Linux/Mac):
```bash
# Editar crontab
crontab -e

# Entrenar modelos todos los domingos a las 3 AM
0 3 * * 0 cd /path/to/ml-service && venv/bin/python train_all_models.py
```

2. **Usar Windows Task Scheduler** (Windows):
   - Crear tarea programada que ejecute `train_all_models.py`

3. **Integrar en el backend Node.js:**
   - Agregar en `backend/jobs/batchProcessor.js` una tarea semanal

---

## 📈 Mejoras Futuras

- [ ] Re-entrenamiento automático periódico
- [ ] Métricas de evaluación en tiempo real
- [ ] Comparación de predicciones vs realidad
- [ ] A/B testing de modelos
- [ ] Exportación de reportes ML
- [ ] Visualización de importancia de features

---

## 📝 Notas Importantes

1. **Los modelos se guardan en `models/`** - No los elimines sin re-entrenar
2. **Los datos de entrenamiento se guardan en `data/`** - Útiles para análisis
3. **El ML Service funciona independiente** - Si falla, el sistema principal sigue funcionando (usa cálculos de fallback)
4. **Los modelos mejoran con más datos** - Re-entrena periódicamente

---

## ✅ Checklist de Inicio Rápido

- [ ] Python 3.8+ instalado
- [ ] Entorno virtual creado y activado
- [ ] Dependencias instaladas (`pip install -r requirements.txt`)
- [ ] Archivo `.env` configurado con `MONGO_URI`
- [ ] MongoDB accesible
- [ ] Modelos entrenados (`python train_all_models.py`)
- [ ] ML Service corriendo (`python main.py`)
- [ ] Backend configurado con `ML_SERVICE_URL`
- [ ] Panel administrador accesible en `/admin/ml`

---

## 🎯 Próximos Pasos

1. Entrenar modelos con tus datos reales
2. Verificar predicciones en el panel administrador
3. Ajustar umbrales de saturación si es necesario (en scripts de entrenamiento)
4. Configurar re-entrenamiento automático semanal

---

**¿Problemas?** Revisa los logs del ML Service y verifica que todos los servicios estén corriendo.

