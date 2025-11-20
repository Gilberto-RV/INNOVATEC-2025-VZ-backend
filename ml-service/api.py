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

# Cargar modelos al iniciar
attendance_model = None
attendance_metadata = None
mobility_model = None
mobility_metadata = None
saturation_model = None
saturation_metadata = None

def load_attendance_model():
    """Cargar el modelo de predicción de asistencia"""
    global attendance_model, attendance_metadata
    
    model_path = f'{MODELS_DIR}/attendance_predictor.pkl'
    metadata_path = f'{MODELS_DIR}/attendance_predictor_metadata.json'
    
    if os.path.exists(model_path):
        attendance_model = joblib.load(model_path)
        if os.path.exists(metadata_path):
            with open(metadata_path, 'r') as f:
                attendance_metadata = json.load(f)
        print(f'✅ Modelo de asistencia cargado: {model_path}')
    else:
        print(f'⚠️  Modelo de asistencia no encontrado en {model_path}')

def load_mobility_model():
    """Cargar el modelo de predicción de movilidad"""
    global mobility_model, mobility_metadata
    
    model_path = f'{MODELS_DIR}/mobility_demand_predictor.pkl'
    metadata_path = f'{MODELS_DIR}/mobility_demand_predictor_metadata.json'
    
    if os.path.exists(model_path):
        mobility_model = joblib.load(model_path)
        if os.path.exists(metadata_path):
            with open(metadata_path, 'r') as f:
                mobility_metadata = json.load(f)
        print(f'✅ Modelo de movilidad cargado: {model_path}')
    else:
        print(f'⚠️  Modelo de movilidad no encontrado en {model_path}')

def load_saturation_model():
    """Cargar el modelo de predicción de saturación"""
    global saturation_model, saturation_metadata
    
    model_path = f'{MODELS_DIR}/saturation_predictor.pkl'
    metadata_path = f'{MODELS_DIR}/saturation_predictor_metadata.json'
    
    if os.path.exists(model_path):
        saturation_model = joblib.load(model_path)
        if os.path.exists(metadata_path):
            with open(metadata_path, 'r') as f:
                saturation_metadata = json.load(f)
        print(f'✅ Modelo de saturación cargado: {model_path}')
    else:
        print(f'⚠️  Modelo de saturación no encontrado en {model_path}')

# Cargar modelos al iniciar
try:
    load_attendance_model()
    load_mobility_model()
    load_saturation_model()
except Exception as e:
    print(f'⚠️  Error cargando modelos: {e}')
    print('⚠️  Algunas predicciones pueden no estar disponibles hasta entrenar los modelos.')

# Schemas
class AttendancePredictionRequest(BaseModel):
    viewCount: int = 0
    uniqueVisitors: int = 0
    dayOfWeek: int = None  # 0=Lunes, 6=Domingo
    hour: int = None
    category_count: int = 1
    popularityScore: float = 0.0
    date_time: str = None  # ISO format, opcional para calcular dayOfWeek y hour

class MobilityPredictionRequest(BaseModel):
    viewCount: int = 0
    uniqueVisitors: int = 0
    dayOfWeek: int = None
    hour: int = None
    peakHour: int = None
    eventsCount: int = 0
    averageViewDuration: float = 0.0
    date_time: str = None

class SaturationPredictionRequest(BaseModel):
    viewCount: int = 0
    uniqueVisitors: int = 0
    dayOfWeek: int = None
    hour: int = None
    peakVisits: int = 0
    averageViewDuration: float = 0.0
    popularityScore: float = 0.0
    type: int = 0  # 0 = Edificio, 1 = Evento
    date_time: str = None

class PredictionResponse(BaseModel):
    prediction: int
    confidence: float = 0.0
    model_type: str = "unknown"
    features_used: list = []

class SaturationPredictionResponse(BaseModel):
    saturationLevel: int  # 0=Normal, 1=Baja, 2=Media, 3=Alta
    saturationLabel: str
    confidence: float = 0.0
    model_type: str = "unknown"
    features_used: list = []

@app.get("/")
async def root():
    """Endpoint raíz"""
    return {
        "service": "ML Service - INNOVATEC",
        "status": "ok",
        "models_loaded": {
            "attendance": attendance_model is not None,
            "mobility": mobility_model is not None,
            "saturation": saturation_model is not None
        },
        "version": "2.0.0"
    }

@app.get("/health")
async def health():
    """Health check"""
    return {
        "status": "ok",
        "models_loaded": {
            "attendance": attendance_model is not None,
            "mobility": mobility_model is not None,
            "saturation": saturation_model is not None
        },
        "timestamp": datetime.now().isoformat()
    }

@app.post("/predict/attendance", response_model=PredictionResponse)
async def predict_attendance(request: AttendancePredictionRequest):
    """
    Predecir asistencia a un evento
    """
    if attendance_model is None:
        raise HTTPException(
            status_code=503,
            detail="Modelo de asistencia no disponible. Por favor, entrena el modelo primero ejecutando train_model.py"
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
        features_order = attendance_metadata.get('features', [
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
        prediction = attendance_model.predict(features)[0]
        
        # Asegurar que la predicción no sea negativa
        prediction = max(0, int(prediction))
        
        # Calcular confianza
        confidence = min(1.0, max(0.0, 0.7))
        
        return PredictionResponse(
            prediction=prediction,
            confidence=confidence,
            model_type=attendance_metadata.get('model_type', 'unknown'),
            features_used=features_order
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error en predicción: {str(e)}")

@app.post("/predict/mobility", response_model=PredictionResponse)
async def predict_mobility(request: MobilityPredictionRequest):
    """
    Predecir demanda de movilidad en un edificio/área
    """
    if mobility_model is None:
        raise HTTPException(
            status_code=503,
            detail="Modelo de movilidad no disponible. Por favor, entrena el modelo primero ejecutando train_mobility_model.py"
        )
    
    try:
        day_of_week = request.dayOfWeek
        hour = request.hour
        peak_hour = request.peakHour
        
        if request.date_time:
            try:
                event_date = datetime.fromisoformat(request.date_time.replace('Z', '+00:00'))
                if day_of_week is None:
                    day_of_week = event_date.weekday()
                if hour is None:
                    hour = event_date.hour
            except:
                pass
        
        if day_of_week is None:
            day_of_week = datetime.now().weekday()
        if hour is None:
            hour = 12
        if peak_hour is None:
            peak_hour = hour
        
        features_order = mobility_metadata.get('features', [
            'viewCount', 'uniqueVisitors', 'dayOfWeek', 'hour', 'peakHour', 'eventsCount', 'averageViewDuration'
        ])
        
        features_dict = {
            'viewCount': request.viewCount,
            'uniqueVisitors': request.uniqueVisitors,
            'dayOfWeek': day_of_week,
            'hour': hour,
            'peakHour': peak_hour,
            'eventsCount': request.eventsCount,
            'averageViewDuration': request.averageViewDuration
        }
        
        features = np.array([[features_dict[f] for f in features_order]])
        prediction = mobility_model.predict(features)[0]
        prediction = max(0, int(prediction))
        confidence = min(1.0, max(0.0, 0.7))
        
        return PredictionResponse(
            prediction=prediction,
            confidence=confidence,
            model_type=mobility_metadata.get('model_type', 'unknown'),
            features_used=features_order
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error en predicción de movilidad: {str(e)}")

@app.post("/predict/saturation", response_model=SaturationPredictionResponse)
async def predict_saturation(request: SaturationPredictionRequest):
    """
    Predecir nivel de saturación (Normal, Baja, Media, Alta)
    """
    if saturation_model is None:
        raise HTTPException(
            status_code=503,
            detail="Modelo de saturación no disponible. Por favor, entrena el modelo primero ejecutando train_saturation_model.py"
        )
    
    try:
        day_of_week = request.dayOfWeek
        hour = request.hour
        
        if request.date_time:
            try:
                event_date = datetime.fromisoformat(request.date_time.replace('Z', '+00:00'))
                if day_of_week is None:
                    day_of_week = event_date.weekday()
                if hour is None:
                    hour = event_date.hour
            except:
                pass
        
        if day_of_week is None:
            day_of_week = datetime.now().weekday()
        if hour is None:
            hour = 12
        
        features_order = saturation_metadata.get('features', [
            'viewCount', 'uniqueVisitors', 'dayOfWeek', 'hour', 'peakVisits', 'averageViewDuration', 'type', 'popularityScore'
        ])
        
        features_dict = {
            'viewCount': request.viewCount,
            'uniqueVisitors': request.uniqueVisitors,
            'dayOfWeek': day_of_week,
            'hour': hour,
            'peakVisits': request.peakVisits,
            'averageViewDuration': request.averageViewDuration,
            'type': request.type,
            'popularityScore': request.popularityScore
        }
        
        features = np.array([[features_dict[f] for f in features_order]])
        saturation_level = int(saturation_model.predict(features)[0])
        
        # Etiquetas de saturación
        labels = {0: 'Normal', 1: 'Baja', 2: 'Media', 3: 'Alta'}
        saturation_label = labels.get(saturation_level, 'Normal')
        
        # Calcular probabilidades para confianza
        if hasattr(saturation_model, 'predict_proba'):
            probas = saturation_model.predict_proba(features)[0]
            confidence = float(max(probas))
        else:
            confidence = 0.7
        
        return SaturationPredictionResponse(
            saturationLevel=saturation_level,
            saturationLabel=saturation_label,
            confidence=confidence,
            model_type=saturation_metadata.get('model_type', 'unknown'),
            features_used=features_order
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error en predicción de saturación: {str(e)}")

@app.get("/model/info")
async def model_info():
    """Información de todos los modelos"""
    return {
        "attendance": attendance_metadata if attendance_metadata else None,
        "mobility": mobility_metadata if mobility_metadata else None,
        "saturation": saturation_metadata if saturation_metadata else None
    }

@app.post("/model/reload")
async def reload_model():
    """Recargar todos los modelos (útil después de re-entrenamiento)"""
    try:
        load_attendance_model()
        load_mobility_model()
        load_saturation_model()
        return {
            "status": "success",
            "message": "Modelos recargados correctamente",
            "models_loaded": {
                "attendance": attendance_model is not None,
                "mobility": mobility_model is not None,
                "saturation": saturation_model is not None
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error recargando modelos: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    from config import ML_PORT, ML_HOST
    uvicorn.run(app, host=ML_HOST, port=ML_PORT)

