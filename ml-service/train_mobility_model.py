# train_mobility_model.py
"""
Entrenar modelo para predecir demanda de movilidad entre edificios
"""
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from sklearn.linear_model import LinearRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
import joblib
import os
import json
from datetime import datetime, timedelta
from config import MODELS_DIR
import pymongo
from config import MONGO_URI

def connect_to_mongodb():
    """Conectar a MongoDB"""
    try:
        client = pymongo.MongoClient(MONGO_URI)
        db = client.get_database()
        client.admin.command('ping')
        return db
    except Exception as e:
        print(f'❌ Error conectando a MongoDB: {e}')
        raise

def extract_mobility_data(days_back=90):
    """
    Extraer datos de movilidad entre edificios
    """
    db = connect_to_mongodb()
    cutoff_date = datetime.now() - timedelta(days=days_back)
    
    # Obtener analíticas de edificios
    building_analytics = list(db.building_analytics.find({
        'date': {'$gte': cutoff_date}
    }))
    
    # Obtener eventos para ver qué edificios tienen eventos
    events = list(db.events.find({
        'createdAt': {'$gte': cutoff_date}
    }))
    
    # Preparar datos de movilidad
    data = []
    
    # Crear diccionario de eventos por edificio y fecha
    events_by_building = {}
    for event in events:
        building_id = event.get('building_assigned')
        event_date = event.get('date_time')
        if building_id and event_date:
            if isinstance(event_date, str):
                try:
                    event_date = datetime.fromisoformat(event_date.replace('Z', '+00:00'))
                except:
                    continue
            elif isinstance(event_date, datetime):
                pass
            else:
                continue
            date_key = event_date.date()
            if building_id not in events_by_building:
                events_by_building[building_id] = {}
            if date_key not in events_by_building[building_id]:
                events_by_building[building_id][date_key] = 0
            events_by_building[building_id][date_key] += 1
    
    for analytics in building_analytics:
        building_id = analytics.get('buildingId')
        analytics_date = analytics.get('date')
        
        if isinstance(analytics_date, str):
            analytics_date = datetime.fromisoformat(analytics_date.replace('Z', '+00:00'))
        elif isinstance(analytics_date, datetime):
            pass
        else:
            continue
        
        date_key = analytics_date.date()
        day_of_week = analytics_date.weekday()
        hour = analytics_date.hour if hasattr(analytics_date, 'hour') else 12
        
        # Obtener peak hours
        peak_hours = analytics.get('peakHours', [])
        max_peak_hour = 0
        if peak_hours and len(peak_hours) > 0:
            max_peak = max(peak_hours, key=lambda x: x.get('count', 0))
            max_peak_hour = max_peak.get('hour', 12)
        
        # Número de eventos en ese edificio ese día
        events_count = events_by_building.get(building_id, {}).get(date_key, 0)
        
        row = {
            'viewCount': analytics.get('viewCount', 0),
            'uniqueVisitors': analytics.get('uniqueVisitors', 0),
            'dayOfWeek': day_of_week,
            'hour': hour,
            'peakHour': max_peak_hour,
            'eventsCount': events_count,
            'averageViewDuration': analytics.get('averageViewDuration', 0),
            # Target: demanda de movilidad = visitantes únicos * factor de eventos
            'mobilityDemand': analytics.get('uniqueVisitors', 0) * (1 + events_count * 0.5)
        }
        
        data.append(row)
    
    df = pd.DataFrame(data)
    
    if len(df) == 0:
        print('⚠️  No hay datos de movilidad. Generando datos sintéticos...')
        return generate_synthetic_mobility_data()
    
    return df

def generate_synthetic_mobility_data(n_samples=200):
    """Generar datos sintéticos para desarrollo"""
    np.random.seed(42)
    
    data = {
        'viewCount': np.random.randint(20, 500, n_samples),
        'uniqueVisitors': np.random.randint(10, 200, n_samples),
        'dayOfWeek': np.random.randint(0, 7, n_samples),
        'hour': np.random.randint(8, 20, n_samples),
        'peakHour': np.random.randint(8, 18, n_samples),
        'eventsCount': np.random.randint(0, 5, n_samples),
        'averageViewDuration': np.random.uniform(10, 300, n_samples),
    }
    
    # Calcular demanda de movilidad
    data['mobilityDemand'] = (
        data['uniqueVisitors'] * (1 + data['eventsCount'] * 0.5) +
        np.random.normal(0, 15, n_samples)
    ).astype(int)
    data['mobilityDemand'] = np.maximum(data['mobilityDemand'], 0)
    
    return pd.DataFrame(data)

def train_mobility_model():
    """
    Entrenar modelo de predicción de demanda de movilidad
    """
    print('🔄 Extrayendo datos de movilidad para entrenamiento...')
    df = extract_mobility_data(days_back=180)
    
    if len(df) < 10:
        print('⚠️  Pocos datos para entrenar. Generando datos de ejemplo...')
        df = generate_synthetic_mobility_data()
    
    print(f'📊 Datos cargados: {len(df)} registros')
    
    # Features
    features = ['viewCount', 'uniqueVisitors', 'dayOfWeek', 'hour', 'peakHour', 'eventsCount', 'averageViewDuration']
    X = df[features].copy()
    y = df['mobilityDemand'].copy()
    
    # Limpiar datos
    X = X.replace([np.inf, -np.inf], np.nan)
    X = X.fillna(X.mean())
    y = y.fillna(y.mean())
    
    # Dividir en train/test
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )
    
    print(f'📈 Entrenando con {len(X_train)} muestras...')
    
    # Usar Random Forest si hay suficientes datos, sino Linear Regression
    if len(df) >= 50:
        model = RandomForestRegressor(n_estimators=100, random_state=42, max_depth=10)
        model_name = 'RandomForest'
    else:
        model = LinearRegression()
        model_name = 'LinearRegression'
    
    # Entrenar
    model.fit(X_train, y_train)
    
    # Evaluar
    y_pred = model.predict(X_test)
    mae = mean_absolute_error(y_test, y_pred)
    mse = mean_squared_error(y_test, y_pred)
    r2 = r2_score(y_test, y_pred)
    
    print(f'\n📊 Resultados del modelo ({model_name}):')
    print(f'   MAE (Error Absoluto Medio): {mae:.2f}')
    print(f'   RMSE (Raíz del Error Cuadrático Medio): {np.sqrt(mse):.2f}')
    print(f'   R² Score: {r2:.4f}')
    
    # Guardar modelo
    model_path = f'{MODELS_DIR}/mobility_demand_predictor.pkl'
    joblib.dump(model, model_path)
    print(f'\n✅ Modelo guardado en: {model_path}')
    
    # Guardar metadata
    metadata = {
        'model_type': model_name,
        'trained_at': datetime.now().isoformat(),
        'features': list(X.columns),
        'samples_trained': len(X_train),
        'metrics': {
            'mae': float(mae),
            'rmse': float(np.sqrt(mse)),
            'r2': float(r2)
        }
    }
    
    metadata_path = f'{MODELS_DIR}/mobility_demand_predictor_metadata.json'
    with open(metadata_path, 'w') as f:
        json.dump(metadata, f, indent=2)
    
    print(f'✅ Metadata guardada en: {metadata_path}')
    
    return model, metadata

if __name__ == '__main__':
    print('🚀 Iniciando entrenamiento del modelo de movilidad...')
    print('=' * 50)
    
    model, metadata = train_mobility_model()
    
    print('\n✅ Entrenamiento completado!')
    print('=' * 50)

