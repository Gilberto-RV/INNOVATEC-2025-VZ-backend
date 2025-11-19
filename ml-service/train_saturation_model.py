# train_saturation_model.py
"""
Entrenar modelo para predecir saturaciones de edificios y eventos
"""
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, accuracy_score, confusion_matrix
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

def extract_saturation_data(days_back=90):
    """
    Extraer datos de saturaciones (edificios y eventos)
    """
    db = connect_to_mongodb()
    cutoff_date = datetime.now() - timedelta(days=days_back)
    
    # Obtener analíticas de edificios
    building_analytics = list(db.building_analytics.find({
        'date': {'$gte': cutoff_date}
    }))
    
    # Obtener analíticas de eventos
    event_analytics = list(db.event_analytics.find({
        'date': {'$gte': cutoff_date}
    }))
    
    data = []
    
    # Datos de edificios
    for analytics in building_analytics:
        analytics_date = analytics.get('date')
        if isinstance(analytics_date, str):
            analytics_date = datetime.fromisoformat(analytics_date.replace('Z', '+00:00'))
        elif not isinstance(analytics_date, datetime):
            continue
        
        day_of_week = analytics_date.weekday()
        hour = analytics_date.hour if hasattr(analytics_date, 'hour') else 12
        
        peak_hours = analytics.get('peakHours', [])
        total_peak_visits = sum(ph.get('count', 0) for ph in peak_hours) if peak_hours else 0
        
        # Determinar saturación basado en umbrales
        # Saturación = 3 (Alta), 2 (Media), 1 (Baja), 0 (Normal)
        unique_visitors = analytics.get('uniqueVisitors', 0)
        view_count = analytics.get('viewCount', 0)
        
        if unique_visitors > 150 or view_count > 300:
            saturation_level = 3  # Alta saturación
        elif unique_visitors > 100 or view_count > 200:
            saturation_level = 2  # Media saturación
        elif unique_visitors > 50 or view_count > 100:
            saturation_level = 1  # Baja saturación
        else:
            saturation_level = 0  # Normal
        
        row = {
            'viewCount': view_count,
            'uniqueVisitors': unique_visitors,
            'dayOfWeek': day_of_week,
            'hour': hour,
            'peakVisits': total_peak_visits,
            'averageViewDuration': analytics.get('averageViewDuration', 0),
            'type': 0,  # 0 = Edificio, 1 = Evento
            'saturationLevel': saturation_level
        }
        
        data.append(row)
    
    # Datos de eventos
    for analytics in event_analytics:
        analytics_date = analytics.get('date')
        if isinstance(analytics_date, str):
            analytics_date = datetime.fromisoformat(analytics_date.replace('Z', '+00:00'))
        elif not isinstance(analytics_date, datetime):
            continue
        
        day_of_week = analytics_date.weekday()
        hour = analytics_date.hour if hasattr(analytics_date, 'hour') else 12
        
        # Determinar saturación
        unique_visitors = analytics.get('uniqueVisitors', 0)
        view_count = analytics.get('viewCount', 0)
        popularity_score = analytics.get('popularityScore', 0)
        
        if unique_visitors > 100 or view_count > 200 or popularity_score > 500:
            saturation_level = 3  # Alta saturación
        elif unique_visitors > 60 or view_count > 120 or popularity_score > 300:
            saturation_level = 2  # Media saturación
        elif unique_visitors > 30 or view_count > 60 or popularity_score > 150:
            saturation_level = 1  # Baja saturación
        else:
            saturation_level = 0  # Normal
        
        row = {
            'viewCount': view_count,
            'uniqueVisitors': unique_visitors,
            'dayOfWeek': day_of_week,
            'hour': hour,
            'peakVisits': 0,
            'averageViewDuration': 0,
            'popularityScore': popularity_score,
            'type': 1,  # Evento
            'saturationLevel': saturation_level
        }
        
        data.append(row)
    
    df = pd.DataFrame(data)
    
    if len(df) == 0:
        print('⚠️  No hay datos de saturación. Generando datos sintéticos...')
        return generate_synthetic_saturation_data()
    
    return df

def generate_synthetic_saturation_data(n_samples=300):
    """Generar datos sintéticos para desarrollo"""
    np.random.seed(42)
    
    data = {
        'viewCount': np.random.randint(10, 500, n_samples),
        'uniqueVisitors': np.random.randint(5, 200, n_samples),
        'dayOfWeek': np.random.randint(0, 7, n_samples),
        'hour': np.random.randint(8, 20, n_samples),
        'peakVisits': np.random.randint(0, 100, n_samples),
        'averageViewDuration': np.random.uniform(10, 300, n_samples),
        'popularityScore': np.random.uniform(0, 600, n_samples),
        'type': np.random.randint(0, 2, n_samples),  # 0 o 1
    }
    
    # Calcular nivel de saturación basado en los datos
    saturation_levels = []
    for i in range(n_samples):
        uv = data['uniqueVisitors'][i]
        vc = data['viewCount'][i]
        ps = data['popularityScore'][i] if data['type'][i] == 1 else 0
        
        if (uv > 150 and data['type'][i] == 0) or (uv > 100 and data['type'][i] == 1) or vc > 300 or ps > 500:
            saturation_levels.append(3)
        elif (uv > 100 and data['type'][i] == 0) or (uv > 60 and data['type'][i] == 1) or vc > 200 or ps > 300:
            saturation_levels.append(2)
        elif (uv > 50 and data['type'][i] == 0) or (uv > 30 and data['type'][i] == 1) or vc > 100 or ps > 150:
            saturation_levels.append(1)
        else:
            saturation_levels.append(0)
    
    data['saturationLevel'] = saturation_levels
    
    return pd.DataFrame(data)

def train_saturation_model():
    """
    Entrenar modelo de clasificación de saturación
    """
    print('🔄 Extrayendo datos de saturación para entrenamiento...')
    df = extract_saturation_data(days_back=180)
    
    if len(df) < 10:
        print('⚠️  Pocos datos para entrenar. Generando datos de ejemplo...')
        df = generate_synthetic_saturation_data()
    
    print(f'📊 Datos cargados: {len(df)} registros')
    
    # Features (incluir popularityScore solo si existe)
    base_features = ['viewCount', 'uniqueVisitors', 'dayOfWeek', 'hour', 'peakVisits', 'averageViewDuration', 'type']
    
    # Agregar popularityScore si existe en los datos
    if 'popularityScore' in df.columns:
        features = base_features + ['popularityScore']
    else:
        # Agregar columna de popularityScore con ceros
        df['popularityScore'] = 0
        features = base_features + ['popularityScore']
    
    X = df[features].copy()
    y = df['saturationLevel'].copy()
    
    # Limpiar datos
    X = X.replace([np.inf, -np.inf], np.nan)
    X = X.fillna(X.mean())
    y = y.fillna(0)
    
    # Dividir en train/test
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )
    
    print(f'📈 Entrenando con {len(X_train)} muestras...')
    
    # Usar Random Forest si hay suficientes datos, sino Logistic Regression
    if len(df) >= 50:
        model = RandomForestClassifier(n_estimators=100, random_state=42, max_depth=10)
        model_name = 'RandomForestClassifier'
    else:
        model = LogisticRegression(random_state=42, max_iter=1000)
        model_name = 'LogisticRegression'
    
    # Entrenar
    model.fit(X_train, y_train)
    
    # Evaluar
    y_pred = model.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    
    print(f'\n📊 Resultados del modelo ({model_name}):')
    print(f'   Accuracy: {accuracy:.4f}')
    print('\n   Classification Report:')
    print(classification_report(y_test, y_pred, target_names=['Normal', 'Baja', 'Media', 'Alta']))
    
    # Guardar modelo
    model_path = f'{MODELS_DIR}/saturation_predictor.pkl'
    joblib.dump(model, model_path)
    print(f'\n✅ Modelo guardado en: {model_path}')
    
    # Guardar metadata
    metadata = {
        'model_type': model_name,
        'trained_at': datetime.now().isoformat(),
        'features': list(X.columns),
        'samples_trained': len(X_train),
        'metrics': {
            'accuracy': float(accuracy)
        },
        'classes': ['Normal (0)', 'Baja (1)', 'Media (2)', 'Alta (3)']
    }
    
    metadata_path = f'{MODELS_DIR}/saturation_predictor_metadata.json'
    with open(metadata_path, 'w') as f:
        json.dump(metadata, f, indent=2)
    
    print(f'✅ Metadata guardada en: {metadata_path}')
    
    return model, metadata

if __name__ == '__main__':
    print('🚀 Iniciando entrenamiento del modelo de saturación...')
    print('=' * 50)
    
    model, metadata = train_saturation_model()
    
    print('\n✅ Entrenamiento completado!')
    print('=' * 50)

