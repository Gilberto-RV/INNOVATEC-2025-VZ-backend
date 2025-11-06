# train_model.py
import pandas as pd
import numpy as np
from sklearn.linear_model import LinearRegression
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
import joblib
import os
from datetime import datetime
from config import MODELS_DIR
from data_extractor import extract_event_data

def prepare_features(df):
    """
    Preparar features para el modelo
    """
    # Seleccionar features
    features = ['viewCount', 'uniqueVisitors', 'dayOfWeek', 'hour', 'category_count', 'popularityScore']
    
    X = df[features].copy()
    y = df['attendance'].copy()
    
    # Limpiar datos (eliminar valores infinitos y NaN)
    X = X.replace([np.inf, -np.inf], np.nan)
    X = X.fillna(X.mean())
    y = y.fillna(y.mean())
    
    return X, y

def train_attendance_model(use_random_forest=False):
    """
    Entrenar modelo de predicción de asistencia
    """
    print('🔄 Extrayendo datos para entrenamiento...')
    df = extract_event_data(days_back=180)  # Últimos 180 días
    
    if len(df) < 10:
        print('⚠️  Pocos datos para entrenar. Generando datos de ejemplo...')
        # Generar datos sintéticos para desarrollo
        df = generate_synthetic_data()
    
    print(f'📊 Datos cargados: {len(df)} registros')
    
    # Preparar datos
    X, y = prepare_features(df)
    
    # Dividir en train/test
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )
    
    print(f'📈 Entrenando con {len(X_train)} muestras...')
    
    # Elegir modelo
    if use_random_forest and len(df) >= 50:
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
    model_path = f'{MODELS_DIR}/attendance_predictor.pkl'
    joblib.dump(model, model_path)
    print(f'\n✅ Modelo guardado en: {model_path}')
    
    # Guardar metadata del modelo
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
    
    import json
    metadata_path = f'{MODELS_DIR}/attendance_predictor_metadata.json'
    with open(metadata_path, 'w') as f:
        json.dump(metadata, f, indent=2)
    
    print(f'✅ Metadata guardada en: {metadata_path}')
    
    return model, metadata

def generate_synthetic_data(n_samples=100):
    """
    Generar datos sintéticos para desarrollo/pruebas
    """
    np.random.seed(42)
    
    data = {
        'viewCount': np.random.randint(10, 500, n_samples),
        'uniqueVisitors': np.random.randint(5, 200, n_samples),
        'dayOfWeek': np.random.randint(0, 7, n_samples),
        'hour': np.random.randint(8, 20, n_samples),
        'category_count': np.random.randint(1, 5, n_samples),
        'popularityScore': np.random.uniform(0, 100, n_samples),
    }
    
    # Calcular asistencia simulada (relación con vistas y visitantes)
    data['attendance'] = (
        data['viewCount'] * 0.3 +
        data['uniqueVisitors'] * 1.5 +
        np.random.normal(0, 10, n_samples)
    ).astype(int)
    data['attendance'] = np.maximum(data['attendance'], 0)  # No negativos
    
    return pd.DataFrame(data)

if __name__ == '__main__':
    print('🚀 Iniciando entrenamiento del modelo...')
    print('=' * 50)
    
    # Intentar Random Forest primero, si hay suficientes datos
    model, metadata = train_attendance_model(use_random_forest=True)
    
    print('\n✅ Entrenamiento completado!')
    print('=' * 50)

