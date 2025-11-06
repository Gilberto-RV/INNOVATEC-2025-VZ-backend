# api.py
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import joblib
import numpy as np
from datetime import datetime
import json
import os
from config import MODELS_DIR

app = FastAPI(title="ML Service - INNOVATEC", version="1.0.0")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # En producción, especifica los orígenes permitidos
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Cargar modelo al iniciar
model = None
model_metadata = None

def load_model():
    """Cargar el modelo entrenado"""
    global model, model_metadata
    
    model_path = f'{MODELS_DIR}/attendance_predictor.pkl'
    metadata_path = f'{MODELS_DIR}/attendance_predictor_metadata.json'
    
    if not os.path.exists(model_path):
        raise FileNotFoundError(f'Modelo no encontrado en {model_path}. Ejecuta train_model.py primero.')
    
    model = joblib.load(model_path)
    
    if os.path.exists(metadata_path):
        with open(metadata_path, 'r') as f:
            model_metadata = json.load(f)
    
    print(f'✅ Modelo cargado: {model_path}')

# Cargar modelo al iniciar
try:
    load_model()
except FileNotFoundError as e:
    print(f'⚠️  {e}')
    print('⚠️  El servicio funcionará pero las predicciones no estarán disponibles hasta entrenar el modelo.')

# Schemas
class AttendancePredictionRequest(BaseModel):
    viewCount: int = 0
    uniqueVisitors: int = 0
    dayOfWeek: int = None  # 0=Lunes, 6=Domingo
    hour: int = None
    category_count: int = 1
    popularityScore: float = 0.0
    date_time: str = None  # ISO format, opcional para calcular dayOfWeek y hour

class PredictionResponse(BaseModel):
    prediction: int
    confidence: float = 0.0
    model_type: str = "unknown"
    features_used: list = []

@app.get("/")
async def root():
    """Endpoint raíz"""
    return {
        "service": "ML Service - INNOVATEC",
        "status": "running",
        "model_loaded": model is not None,
        "version": "1.0.0"
    }

@app.get("/health")
async def health():
    """Health check"""
    return {
        "status": "healthy",
        "model_loaded": model is not None,
        "timestamp": datetime.now().isoformat()
    }

@app.post("/predict/attendance", response_model=PredictionResponse)
async def predict_attendance(request: AttendancePredictionRequest):
    """
    Predecir asistencia a un evento
    """
    if model is None:
        raise HTTPException(
            status_code=503,
            detail="Modelo no disponible. Por favor, entrena el modelo primero ejecutando train_model.py"
        )
    
    try:
        # Calcular dayOfWeek y hour si no están proporcionados pero hay date_time
        day_of_week = request.dayOfWeek
        hour = request.hour
        
        if request.date_time and (day_of_week is None or hour is None):
            try:
                event_date = datetime.fromisoformat(request.date_time.replace('Z', '+00:00'))
                if day_of_week is None:
                    day_of_week = event_date.weekday()
                if hour is None:
                    hour = event_date.hour
            except:
                pass
        
        # Valores por defecto si aún faltan
        if day_of_week is None:
            day_of_week = datetime.now().weekday()
        if hour is None:
            hour = 12  # Medio día por defecto
        
        # Preparar features en el mismo orden que se entrenó
        features_order = model_metadata.get('features', [
            'viewCount', 'uniqueVisitors', 'dayOfWeek', 'hour', 'category_count', 'popularityScore'
        ])
        
        features_dict = {
            'viewCount': request.viewCount,
            'uniqueVisitors': request.uniqueVisitors,
            'dayOfWeek': day_of_week,
            'hour': hour,
            'category_count': request.category_count,
            'popularityScore': request.popularityScore
        }
        
        # Crear array de features en el orden correcto
        features = np.array([[features_dict[f] for f in features_order]])
        
        # Predecir
        prediction = model.predict(features)[0]
        
        # Asegurar que la predicción no sea negativa
        prediction = max(0, int(prediction))
        
        # Calcular confianza (simplificado: basado en qué tan cerca están los valores de entrenamiento)
        # En un modelo real, podrías usar la varianza o intervalos de confianza
        confidence = min(1.0, max(0.0, 0.7))  # Placeholder
        
        return PredictionResponse(
            prediction=prediction,
            confidence=confidence,
            model_type=model_metadata.get('model_type', 'unknown'),
            features_used=features_order
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error en predicción: {str(e)}")

@app.get("/model/info")
async def model_info():
    """Información del modelo"""
    if model_metadata is None:
        raise HTTPException(status_code=404, detail="Modelo no encontrado")
    
    return model_metadata

@app.post("/model/reload")
async def reload_model():
    """Recargar modelo (útil después de re-entrenamiento)"""
    try:
        load_model()
        return {"status": "success", "message": "Modelo recargado correctamente"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error recargando modelo: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    from config import ML_PORT, ML_HOST
    uvicorn.run(app, host=ML_HOST, port=ML_PORT)

