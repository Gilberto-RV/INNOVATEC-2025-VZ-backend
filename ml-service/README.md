# 🤖 ML Service - Microservicio de Machine Learning

Microservicio para predicciones de asistencia a eventos usando Machine Learning.

## 🚀 Inicio Rápido

### 1. Instalar dependencias
```bash
cd backend/ml-service
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r requirements.txt
```

### 2. Configurar .env
Copia `.env.example` a `.env` y configura tu MongoDB URI:
```bash
copy .env.example .env
# Edita .env con tu MONGO_URI
```

### 3. Entrenar modelo inicial
```bash
python train_model.py
```

### 4. Iniciar servicio
```bash
python main.py
```

El servicio estará disponible en: `http://localhost:8000`

## 📚 Documentación de API

- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## 🔄 Uso

### Endpoint de Predicción
```bash
POST http://localhost:8000/predict/attendance
Content-Type: application/json

{
  "viewCount": 150,
  "uniqueVisitors": 80,
  "dayOfWeek": 2,
  "hour": 14,
  "category_count": 2,
  "popularityScore": 75.5
}
```

### Respuesta
```json
{
  "prediction": 125,
  "confidence": 0.7,
  "model_type": "LinearRegression",
  "features_used": ["viewCount", "uniqueVisitors", "dayOfWeek", "hour", "category_count", "popularityScore"]
}
```

## 📝 Scripts Disponibles

- `data_extractor.py` - Extraer datos de MongoDB
- `train_model.py` - Entrenar modelo de predicción
- `api.py` - API FastAPI
- `main.py` - Iniciar servidor

## 🔄 Re-entrenamiento

Para re-entrenar el modelo con datos actualizados:
```bash
python train_model.py
# Luego recargar en la API:
curl -X POST http://localhost:8000/model/reload
```

## 🐛 Troubleshooting

- **Error: Modelo no encontrado**: Ejecuta `python train_model.py` primero
- **Error de conexión MongoDB**: Verifica `MONGO_URI` en `.env`
- **Puerto ocupado**: Cambia `ML_PORT` en `.env`

