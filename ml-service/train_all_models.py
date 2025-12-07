# train_all_models.py
"""
Script para re-entrenar todos los modelos ML a la vez
Usa datos de los 13 edificios modulares
"""

import sys
import os
from pathlib import Path
from datetime import datetime

# Importar extractores
from data_extractor_updated import (
    extract_event_data,
    extract_mobility_data,
    extract_saturation_data,
    verify_data_quality
)

def ensure_directories():
    """Crear directorios necesarios"""
    dirs = ['data', 'models']
    for dir_name in dirs:
        Path(dir_name).mkdir(exist_ok=True)
        print(f'✅ Directorio {dir_name}/ verificado')

def train_attendance_model():
    """Entrenar modelo de predicción de asistencia"""
    print('\n' + '='*60)
    print('1️⃣  MODELO DE PREDICCIÓN DE ASISTENCIA A EVENTOS')
    print('='*60)
    
    try:
        # Extraer datos
        print('📊 Extrayendo datos de eventos...')
        df = extract_event_data(days_back=90)
        
        if len(df) < 10:
            print('❌ No hay suficientes datos para entrenar')
            print('   Ejecuta: cd ../../backend && npm run generate-fake-data')
            return False
        
        # Importar librerías ML
        from sklearn.model_selection import train_test_split
        from sklearn.ensemble import RandomForestRegressor
        from sklearn.metrics import mean_squared_error, r2_score
        import joblib
        import json
        
        # Preparar features y target
        feature_columns = ['viewCount', 'uniqueVisitors', 'dayOfWeek', 'hour', 'category_count', 'popularityScore']
        X = df[feature_columns]
        y = df['attendance']
        
        # Split
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42
        )
        
        # Entrenar con hiperparámetros mejorados
        print('🎯 Entrenando modelo con hiperparámetros optimizados...')
        model = RandomForestRegressor(
            n_estimators=200,           # Más árboles para mejor precisión
            max_depth=15,               # Mayor profundidad para capturar patrones complejos
            random_state=42,
            min_samples_split=4,        # Ajustado para mejor generalización
            min_samples_leaf=2,
            max_features='sqrt',        # Mejor selección de features
            n_jobs=-1                   # Usar todos los cores disponibles
        )
        model.fit(X_train, y_train)
        
        # Evaluar
        y_pred = model.predict(X_test)
        r2 = r2_score(y_test, y_pred)
        mse = mean_squared_error(y_test, y_pred)
        
        print(f'📏 R² Score: {r2:.4f}')
        print(f'📏 MSE: {mse:.4f}')
        
        # Guardar modelo
        model_path = 'models/attendance_predictor.pkl'
        joblib.dump(model, model_path)
        print(f'💾 Modelo guardado en {model_path}')
        
        # Guardar metadata
        metadata = {
            'model_type': 'RandomForestRegressor',
            'trained_on': datetime.now().isoformat(),
            'features': feature_columns,
            'n_samples': len(df),
            'r2_score': float(r2),
            'mse': float(mse),
            'hyperparameters': {
                'n_estimators': 200,
                'max_depth': 15,
                'random_state': 42,
                'min_samples_split': 4,
                'min_samples_leaf': 2,
                'max_features': 'sqrt'
            }
        }
        
        with open('models/attendance_predictor_metadata.json', 'w') as f:
            json.dump(metadata, f, indent=2)
        
        print('✅ Modelo de asistencia entrenado correctamente')
        return True
        
    except Exception as e:
        print(f'❌ Error entrenando modelo de asistencia: {e}')
        return False

def train_mobility_model():
    """Entrenar modelo de predicción de demanda de movilidad"""
    print('\n' + '='*60)
    print('2️⃣  MODELO DE PREDICCIÓN DE DEMANDA DE MOVILIDAD')
    print('='*60)
    
    try:
        # Extraer datos
        print('📊 Extrayendo datos de movilidad...')
        df = extract_mobility_data(days_back=90)
        
        if len(df) < 10:
            print('❌ No hay suficientes datos para entrenar')
            return False
        
        # Importar librerías ML
        from sklearn.model_selection import train_test_split
        from sklearn.ensemble import RandomForestClassifier
        from sklearn.metrics import accuracy_score, classification_report
        from sklearn.preprocessing import LabelEncoder
        import joblib
        import json
        
        # Preparar features y target
        feature_columns = ['viewCount', 'uniqueVisitors', 'dayOfWeek', 'hour', 'peakHour', 'eventsCount', 'averageViewDuration']
        X = df[feature_columns]
        y = df['mobility_demand']
        
        # Encodear target
        le = LabelEncoder()
        y_encoded = le.fit_transform(y)
        
        # Split
        X_train, X_test, y_train, y_test = train_test_split(
            X, y_encoded, test_size=0.2, random_state=42
        )
        
        # Entrenar con hiperparámetros mejorados
        print('🎯 Entrenando modelo con hiperparámetros optimizados...')
        model = RandomForestClassifier(
            n_estimators=200,
            max_depth=15,
            random_state=42,
            class_weight='balanced',
            min_samples_split=4,
            min_samples_leaf=2,
            max_features='sqrt',
            n_jobs=-1
        )
        model.fit(X_train, y_train)
        
        # Evaluar
        y_pred = model.predict(X_test)
        accuracy = accuracy_score(y_test, y_pred)
        
        print(f'📏 Accuracy: {accuracy:.4f}')
        print('\n📊 Classification Report:')
        print(classification_report(y_test, y_pred, target_names=le.classes_))
        
        # Guardar modelo
        model_path = 'models/mobility_demand_predictor.pkl'
        joblib.dump({
            'model': model,
            'label_encoder': le
        }, model_path)
        print(f'💾 Modelo guardado en {model_path}')
        
        # Guardar metadata
        metadata = {
            'model_type': 'RandomForestClassifier',
            'trained_on': datetime.now().isoformat(),
            'features': feature_columns,
            'classes': le.classes_.tolist(),
            'n_samples': len(df),
            'accuracy': float(accuracy),
            'hyperparameters': {
                'n_estimators': 200,
                'max_depth': 15,
                'random_state': 42,
                'class_weight': 'balanced',
                'min_samples_split': 4,
                'min_samples_leaf': 2,
                'max_features': 'sqrt'
            }
        }
        
        with open('models/mobility_demand_predictor_metadata.json', 'w') as f:
            json.dump(metadata, f, indent=2)
        
        print('✅ Modelo de movilidad entrenado correctamente')
        return True
        
    except Exception as e:
        print(f'❌ Error entrenando modelo de movilidad: {e}')
        import traceback
        traceback.print_exc()
        return False

def train_saturation_model():
    """Entrenar modelo de predicción de saturación"""
    print('\n' + '='*60)
    print('3️⃣  MODELO DE PREDICCIÓN DE NIVEL DE SATURACIÓN')
    print('='*60)
    
    try:
        # Extraer datos
        print('📊 Extrayendo datos de saturación...')
        df = extract_saturation_data(days_back=90)
        
        if len(df) < 10:
            print('❌ No hay suficientes datos para entrenar')
            return False
        
        # Importar librerías ML
        from sklearn.model_selection import train_test_split
        from sklearn.ensemble import RandomForestClassifier
        from sklearn.metrics import accuracy_score, classification_report
        import joblib
        import json
        
        # Preparar features y target
        feature_columns = ['viewCount', 'uniqueVisitors', 'peakVisits', 'averageViewDuration', 'popularityScore', 'type']
        X = df[feature_columns]
        y = df['saturationLevel']
        
        # Split
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42
        )
        
        # Entrenar con hiperparámetros mejorados
        print('🎯 Entrenando modelo con hiperparámetros optimizados...')
        model = RandomForestClassifier(
            n_estimators=200,
            max_depth=15,
            random_state=42,
            class_weight='balanced',
            min_samples_split=4,
            min_samples_leaf=2,
            max_features='sqrt',
            n_jobs=-1
        )
        model.fit(X_train, y_train)
        
        # Evaluar
        y_pred = model.predict(X_test)
        accuracy = accuracy_score(y_test, y_pred)
        
        print(f'📏 Accuracy: {accuracy:.4f}')
        
        # Mapeo de niveles
        saturation_labels = {0: 'Normal', 1: 'Baja', 2: 'Media', 3: 'Alta'}
        unique_classes = sorted(y.unique())
        class_names = [saturation_labels.get(c, f'Level_{c}') for c in unique_classes]
        
        print('\n📊 Classification Report:')
        print(classification_report(y_test, y_pred, target_names=class_names, labels=unique_classes))
        
        # Guardar modelo
        model_path = 'models/saturation_predictor.pkl'
        joblib.dump(model, model_path)
        print(f'💾 Modelo guardado en {model_path}')
        
        # Guardar metadata
        metadata = {
            'model_type': 'RandomForestClassifier',
            'trained_on': datetime.now().isoformat(),
            'features': feature_columns,
            'classes': [int(c) for c in unique_classes],
            'class_labels': saturation_labels,
            'n_samples': len(df),
            'accuracy': float(accuracy),
            'hyperparameters': {
                'n_estimators': 200,
                'max_depth': 15,
                'random_state': 42,
                'class_weight': 'balanced',
                'min_samples_split': 4,
                'min_samples_leaf': 2,
                'max_features': 'sqrt'
            }
        }
        
        with open('models/saturation_predictor_metadata.json', 'w') as f:
            json.dump(metadata, f, indent=2)
        
        print('✅ Modelo de saturación entrenado correctamente')
        return True
        
    except Exception as e:
        print(f'❌ Error entrenando modelo de saturación: {e}')
        import traceback
        traceback.print_exc()
        return False

def main():
    """Entrenar todos los modelos"""
    print('\n' + '='*60)
    print('🚀 ENTRENAMIENTO DE TODOS LOS MODELOS ML')
    print('   13 Edificios Modulares')
    print('='*60)
    
    # Verificar calidad de datos
    print('\n🔍 Verificando datos en MongoDB...')
    verify_data_quality()
    
    print('\n⏳ Preparando entorno...')
    ensure_directories()
    
    # Resultados
    results = {
        'attendance': False,
        'mobility': False,
        'saturation': False
    }
    
    # Entrenar cada modelo
    results['attendance'] = train_attendance_model()
    results['mobility'] = train_mobility_model()
    results['saturation'] = train_saturation_model()
    
    # Resumen final
    print('\n' + '='*60)
    print('📊 RESUMEN DE ENTRENAMIENTO')
    print('='*60)
    
    success_count = sum(results.values())
    total_count = len(results)
    
    for model_name, success in results.items():
        status = '✅' if success else '❌'
        print(f'{status} {model_name.capitalize()}: {"Éxito" if success else "Error"}')
    
    print('\n' + '='*60)
    if success_count == total_count:
        print('🎉 TODOS LOS MODELOS ENTRENADOS EXITOSAMENTE')
        print('='*60)
        print('\n📝 Siguiente paso:')
        print('   python main.py  # Iniciar servicio ML')
        print()
        return 0
    else:
        print(f'⚠️  {success_count}/{total_count} MODELOS ENTRENADOS')
        print('='*60)
        print('\n💡 Verifica los errores arriba y:')
        print('   1. Asegúrate de tener datos en MongoDB')
        print('   2. Ejecuta: cd ../../backend && npm run generate-fake-data')
        print('   3. Vuelve a ejecutar este script')
        print()
        return 1

if __name__ == '__main__':
    try:
        exit_code = main()
        sys.exit(exit_code)
    except KeyboardInterrupt:
        print('\n\n❌ Entrenamiento cancelado por el usuario')
        sys.exit(1)
    except Exception as e:
        print(f'\n\n❌ Error fatal: {e}')
        import traceback
        traceback.print_exc()
        sys.exit(1)
