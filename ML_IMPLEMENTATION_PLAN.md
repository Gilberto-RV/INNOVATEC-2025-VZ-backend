# 🤖 Plan de Implementación de Machine Learning - INNOVATEC-2025-VZ

## 🎯 Objetivo
Implementar Machine Learning de forma rápida y accesible aprovechando los datos de Big Data ya recopilados.

---

## 📊 Análisis de Datos Disponibles

Con los datos actuales de Big Data podemos implementar:

### ✅ Datos Disponibles:
1. **EventAnalytics**: viewCount, uniqueVisitors, category, status, date, popularityScore
2. **BuildingAnalytics**: viewCount, uniqueVisitors, peakHours, averageViewDuration
3. **UserActivityLog**: action, resourceType, userId, userRole, timestamp
4. **Event**: date_time, category, building_assigned, organizer

---

## 🚀 Plan Rápido: 3 Casos de Uso Prioritarios

### **FASE 1: Predicción de Asistencia a Eventos** ⭐ (MÁS RÁPIDO - RECOMENDADO PARA EMPEZAR)
**Dificultad**: ⭐☆☆☆☆ (Muy fácil)  
**Tiempo estimado**: 2-3 horas  
**Valor**: ⭐⭐⭐⭐⭐ (Alto)

**¿Qué hace?**
- Predice cuántas personas asistirán a un evento basándose en:
  - Número de visualizaciones del evento
  - Popularidad de eventos similares
  - Día de la semana y hora
  - Categoría del evento
  - Historial de eventos del organizador

**Tecnología Recomendada**: **Regresión Lineal Simple** (scikit-learn)
- Fácil de implementar
- Funciona con pocos datos
- Fácil de interpretar

---

### **FASE 2: Sistema de Recomendaciones de Edificios** ⭐⭐
**Dificultad**: ⭐⭐☆☆☆ (Fácil)  
**Tiempo estimado**: 3-4 horas  
**Valor**: ⭐⭐⭐⭐☆ (Alto)

**¿Qué hace?**
- Recomienda edificios a usuarios basándose en:
  - Historial de visualizaciones del usuario
  - Edificios visitados por usuarios similares
  - Popularidad y características del edificio

**Tecnología Recomendada**: **Filtrado Colaborativo Simple** (scikit-learn) o **Sistema Basado en Contenido**
- Puede empezar con reglas simples (si no hay suficientes datos)
- Evoluciona a ML cuando hay más datos

---

### **FASE 3: Clasificación de Popularidad de Eventos** ⭐⭐
**Dificultad**: ⭐⭐☆☆☆ (Fácil)  
**Tiempo estimado**: 2-3 horas  
**Valor**: ⭐⭐⭐☆☆ (Medio)

**¿Qué hace?**
- Clasifica eventos en categorías: "Muy Popular", "Popular", "Normal", "Bajo interés"
- Usa características como vistas, categoría, fecha, hora

**Tecnología Recomendada**: **Clasificación** (Random Forest o Naive Bayes - scikit-learn)

---

## 🛠️ Arquitectura Recomendada (MÁS RÁPIDA)

### Opción 1: Microservicio Python + FastAPI ⭐⭐⭐⭐⭐ (RECOMENDADA)

**Ventajas:**
- ✅ Muy rápido de implementar
- ✅ Python tiene excelentes librerías ML (scikit-learn, pandas)
- ✅ Fácil integración con Node.js
- ✅ Puede entrenarse en background y servir predicciones via API

**Estructura:**
```
ml-service/
├── app/
│   ├── models/          # Modelos entrenados (.pkl)
│   ├── train.py         # Script para entrenar modelos
│   ├── predict.py       # Script para hacer predicciones
│   └── api.py           # FastAPI para servir predicciones
├── data/                # Datos de entrenamiento
├── requirements.txt
└── main.py              # Punto de entrada
```

**Comunicación:**
```
Backend Node.js → HTTP Request → ML Service (FastAPI) → Predicción → Response JSON
```

---

### Opción 2: TensorFlow.js en Node.js ⭐⭐⭐☆☆

**Ventajas:**
- ✅ Todo en JavaScript/Node.js
- ✅ No requiere servicio separado

**Desventajas:**
- ⚠️ Menos librerías ML disponibles
- ⚠️ Modelos más limitados
- ⚠️ Menos comunidad y recursos

---

## 📋 Implementación Paso a Paso (FASE 1: Predicción de Asistencia)

### **Paso 1: Preparar Datos de Entrenamiento** (30 min)
1. Crear script que extrae datos de MongoDB
2. Transformar a formato CSV/JSON
3. Features: viewCount, uniqueVisitors, dayOfWeek, hour, category, popularityScore

### **Paso 2: Entrenar Modelo Simple** (30 min)
```python
# Ejemplo con scikit-learn
from sklearn.linear_model import LinearRegression
from sklearn.model_selection import train_test_split

# Cargar datos
X = df[['viewCount', 'uniqueVisitors', 'dayOfWeek', 'hour', 'category']]
y = df['actualAttendance']  # o usar viewCount como proxy

# Entrenar
model = LinearRegression()
model.fit(X_train, y_train)

# Guardar modelo
import joblib
joblib.dump(model, 'models/attendance_predictor.pkl')
```

### **Paso 3: Crear API FastAPI** (1 hora)
```python
from fastapi import FastAPI
import joblib

app = FastAPI()
model = joblib.load('models/attendance_predictor.pkl')

@app.post('/predict/attendance')
async def predict_attendance(event_data: dict):
    # Preparar features
    features = prepare_features(event_data)
    # Predecir
    prediction = model.predict([features])[0]
    return {'prediction': int(prediction)}
```

### **Paso 4: Integrar con Backend Node.js** (30 min)
```javascript
// En tu servicio de eventos
const axios = require('axios');

async function predictEventAttendance(eventData) {
  try {
    const response = await axios.post('http://localhost:8000/predict/attendance', {
      viewCount: eventData.viewCount,
      uniqueVisitors: eventData.uniqueVisitors,
      dayOfWeek: getDayOfWeek(eventData.date_time),
      hour: getHour(eventData.date_time),
      category: eventData.category
    });
    return response.data.prediction;
  } catch (error) {
    console.error('Error en predicción ML:', error);
    return null; // Fallback a cálculo manual
  }
}
```

### **Paso 5: Mostrar en Dashboard** (30 min)
- Agregar campo "Asistencia Predicha" en el dashboard de Big Data
- Visualizar predicciones vs realidad cuando haya datos

---

## 🎓 Modelos Sugeridos por Caso de Uso

### 1. Predicción de Asistencia (Regresión)
**Modelo**: **Regresión Lineal** o **Random Forest Regressor**
- Simple, rápido, funciona con pocos datos
- Si tienes más datos (100+ eventos), Random Forest es mejor

### 2. Recomendaciones (Recomendación)
**Modelo**: **Sistema Basado en Contenido** (inicialmente)
- Comparar edificios por características
- Sin necesidad de muchos usuarios
- Evoluciona a Collaborative Filtering con más datos

### 3. Clasificación de Popularidad (Clasificación)
**Modelo**: **Random Forest Classifier** o **Naive Bayes**
- Random Forest: Mejor precisión, más lento
- Naive Bayes: Más rápido, funciona bien con pocos datos

---

## 📦 Dependencias Necesarias

### Microservicio Python:
```txt
fastapi==0.104.1
uvicorn==0.24.0
scikit-learn==1.3.2
pandas==2.1.3
numpy==1.24.3
pymongo==4.6.0
joblib==1.3.2
python-multipart==0.0.6
```

---

## 🔄 Flujo de Trabajo

1. **Entrenamiento** (cada noche o semanalmente):
   - Extraer datos de MongoDB
   - Entrenar modelo
   - Guardar modelo actualizado

2. **Predicción** (tiempo real):
   - Backend hace request a ML Service
   - ML Service devuelve predicción
   - Backend almacena y muestra predicción

3. **Retroalimentación**:
   - Cuando haya datos reales (actualAttendance), se usan para mejorar el modelo
   - Re-entrenamiento automático periódico

---

## 🚦 Roadmap de Implementación

### Semana 1: Setup y Fase 1
- [ ] Instalar Python y crear entorno virtual
- [ ] Crear microservicio FastAPI básico
- [ ] Implementar script de extracción de datos
- [ ] Entrenar primer modelo de predicción de asistencia
- [ ] Integrar con backend Node.js

### Semana 2: Mejoras y Fase 2
- [ ] Mejorar modelo con más features
- [ ] Implementar sistema de recomendaciones básico
- [ ] Agregar visualizaciones en dashboard
- [ ] Sistema de re-entrenamiento automático

### Semana 3: Optimización y Fase 3
- [ ] Implementar clasificación de popularidad
- [ ] Optimizar modelos
- [ ] Agregar métricas de evaluación
- [ ] Documentación completa

---

## 💡 Tips para Implementación Rápida

1. **Empieza Simple**: Regresión lineal funciona bien para empezar
2. **Datos Sintéticos**: Si no hay suficientes datos, genera datos de prueba
3. **Fallbacks**: Siempre tener un cálculo manual como fallback si ML falla
4. **No Perfeccionismo**: Mejor tener algo funcionando que algo perfecto que nunca se usa
5. **Iteración**: Empieza con un modelo simple y mejóralo gradualmente

---

## 📊 Métricas de Éxito

- **Precisión de Predicción**: Diferencia entre predicción y realidad < 20%
- **Tiempo de Respuesta**: Predicciones en < 200ms
- **Disponibilidad**: ML Service disponible > 99%
- **Uso**: Predicciones utilizadas en > 80% de eventos nuevos

---

## 🔧 Herramientas Alternativas (Si No Quieres Python)

### Opción A: MLflow (Gestión de Modelos)
- Facilita el despliegue y versionado de modelos
- Compatible con scikit-learn

### Opción B: Google AutoML (Si prefieres SaaS)
- Más fácil pero requiere cuenta Google Cloud
- Menos control, más costo potencial

### Opción C: H2O AutoML
- AutoML que encuentra el mejor modelo automáticamente
- Más complejo pero muy potente

---

## ✅ Checklist de Inicio Rápido

1. ✅ Tienes datos en MongoDB ✓
2. ⬜ Crear microservicio Python
3. ⬜ Conectar con MongoDB
4. ⬜ Entrenar primer modelo
5. ⬜ Crear API de predicción
6. ⬜ Integrar con backend
7. ⬜ Mostrar en dashboard

---

## 🎯 Siguiente Paso Inmediato

**Recomendación**: Empezar con **Predicción de Asistencia a Eventos** porque:
- ✅ Usa datos que ya tienes
- ✅ Modelo simple (Regresión Lineal)
- ✅ Alto valor de negocio
- ✅ Fácil de medir éxito
- ✅ Se puede implementar en 2-3 horas

---

## 📝 Resumen Ejecutivo

**Mejor Opción para Empezar**: 
- **Microservicio Python + FastAPI** con **Regresión Lineal** para predicción de asistencia
- **Tiempo**: 2-3 horas
- **Complejidad**: Baja
- **Valor**: Alto

**Ventajas de esta aproximación**:
- ✅ No requiere infraestructura compleja
- ✅ Fácil de mantener y actualizar
- ✅ Escalable: puede evolucionar a modelos más complejos
- ✅ Independiente del backend: si falla ML, el sistema sigue funcionando

---

**¿Listo para empezar?** El siguiente paso sería crear el microservicio Python básico. 🚀

