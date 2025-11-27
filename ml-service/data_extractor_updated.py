# data_extractor_updated.py
"""
Extractor de datos actualizado para los 13 edificios modulares
Usa datos de MongoDB y archivos GeoJSON modulares
"""

import pymongo
import pandas as pd
import json
from datetime import datetime, timedelta
from pathlib import Path
import os
from dotenv import load_dotenv

load_dotenv()

# Los 13 edificios seleccionados
SELECTED_BUILDINGS = [
    'E-12', 'E-13', 'E-14', 'E-16', 'E-18', 
    'E-19', 'E-20', 'E-21', 'E-23', 'E-25', 
    'E-26', 'E-27', 'E-27-B'
]

def connect_to_mongodb():
    """Conectar a MongoDB"""
    try:
        mongo_uri = os.getenv('MONGO_URI')
        if not mongo_uri:
            raise ValueError('MONGO_URI no está definido en .env')
        
        client = pymongo.MongoClient(mongo_uri)
        db = client.get_database()
        client.admin.command('ping')
        print('✅ Conectado a MongoDB')
        return db, client
    except Exception as e:
        print(f'❌ Error conectando a MongoDB: {e}')
        raise

def load_geo_data():
    """Cargar datos geográficos desde archivos modulares"""
    try:
        geo_path = Path(__file__).parent.parent.parent / 'project' / 'assets' / 'geo'
        
        with open(geo_path / 'Edificios.json', 'r', encoding='utf-8') as f:
            edificios = json.load(f)
        
        with open(geo_path / 'Caminos.json', 'r', encoding='utf-8') as f:
            caminos = json.load(f)
        
        with open(geo_path / 'Entradas.json', 'r', encoding='utf-8') as f:
            entradas = json.load(f)
        
        print('✅ Archivos GeoJSON cargados')
        print(f'   Edificios: {len(edificios["features"])}')
        print(f'   Caminos: {len(caminos["features"])}')
        print(f'   Entradas: {len(entradas["features"])}')
        
        return edificios, caminos, entradas
    except Exception as e:
        print(f'⚠️  Error cargando archivos GeoJSON: {e}')
        return None, None, None

def extract_building_data_from_mongo():
    """Extraer datos de edificios desde MongoDB (solo los 13 seleccionados)"""
    db, client = connect_to_mongodb()
    
    try:
        # Obtener edificios
        buildings = list(db.buildings.find({
            '_id': {'$in': SELECTED_BUILDINGS}
        }))
        
        # Obtener analíticas de edificios
        analytics = list(db.building_analytics.find({
            'buildingId': {'$in': SELECTED_BUILDINGS}
        }))
        
        print(f'✅ Edificios extraídos: {len(buildings)}')
        print(f'✅ Analíticas extraídas: {len(analytics)}')
        
        return buildings, analytics
    finally:
        client.close()

def extract_event_data(days_back=90):
    """
    Extraer datos de eventos para entrenamiento
    Solo eventos asociados a los 13 edificios
    """
    db, client = connect_to_mongodb()
    
    try:
        cutoff_date = datetime.now() - timedelta(days=days_back)
        
        # Obtener analíticas de eventos asociados a los 13 edificios
        event_analytics = list(db.event_analytics.find({
            'date': {'$gte': cutoff_date},
            'buildingId': {'$in': SELECTED_BUILDINGS}
        }))
        
        print(f'✅ Analíticas de eventos extraídas: {len(event_analytics)}')
        
        # Preparar datos
        data = []
        for analytics in event_analytics:
            event_date = analytics.get('date')
            if isinstance(event_date, str):
                event_date = datetime.fromisoformat(event_date.replace('Z', '+00:00'))
            
            if event_date:
                day_of_week = event_date.weekday()
                hour = event_date.hour
            else:
                day_of_week = 0
                hour = 12
            
            row = {
                'viewCount': analytics.get('viewCount', 0),
                'uniqueVisitors': analytics.get('uniqueVisitors', 0),
                'dayOfWeek': day_of_week,
                'hour': hour,
                'category_count': len(analytics.get('category', [])),
                'popularityScore': analytics.get('popularityScore', 0),
                'attendance': analytics.get('actualAttendance') or analytics.get('attendancePrediction') or analytics.get('uniqueVisitors', 0)
            }
            
            data.append(row)
        
        df = pd.DataFrame(data)
        
        # Guardar datos extraídos
        data_dir = Path(__file__).parent / 'data'
        data_dir.mkdir(exist_ok=True)
        csv_path = data_dir / f'event_data_{datetime.now().strftime("%Y%m%d")}.csv'
        df.to_csv(csv_path, index=False)
        
        print(f'✅ Datos guardados en {csv_path}')
        print(f'📊 Total de registros: {len(df)}')
        
        return df
    finally:
        client.close()

def extract_mobility_data(days_back=90):
    """
    Extraer datos de movilidad para los 13 edificios
    """
    db, client = connect_to_mongodb()
    
    try:
        cutoff_date = datetime.now() - timedelta(days=days_back)
        
        # Obtener analíticas solo de los 13 edificios
        building_analytics = list(db.building_analytics.find({
            'date': {'$gte': cutoff_date},
            'buildingId': {'$in': SELECTED_BUILDINGS}
        }))
        
        print(f'✅ Analíticas de movilidad extraídas: {len(building_analytics)}')
        
        data = []
        for analytics in building_analytics:
            # Calcular hora pico
            peak_hours = analytics.get('peakHours', [])
            peak_hour = 12  # Default
            if peak_hours and len(peak_hours) > 0:
                max_peak = max(peak_hours, key=lambda x: x.get('count', 0))
                peak_hour = max_peak.get('hour', 12)
            
            # Contar eventos en ese edificio ese día
            date = analytics.get('date')
            building_id = analytics.get('buildingId')
            
            events_count = 0
            if date and building_id:
                events_count = db.events.count_documents({
                    'building': building_id,
                    'date': {
                        '$gte': date,
                        '$lt': datetime.combine(date, datetime.max.time())
                    }
                })
            
            # Calcular demanda basada en métricas
            view_count = analytics.get('viewCount', 0)
            unique_visitors = analytics.get('uniqueVisitors', 0)
            score = (view_count * 0.4) + (unique_visitors * 0.3) + (events_count * 10)
            
            if score > 100:
                demand = 'Alta'
            elif score > 50:
                demand = 'Media'
            else:
                demand = 'Baja'
            
            row = {
                'buildingId': building_id,
                'viewCount': view_count,
                'uniqueVisitors': unique_visitors,
                'dayOfWeek': analytics.get('date').weekday() if analytics.get('date') else 0,
                'hour': 12,  # Usar mediodía como referencia
                'peakHour': peak_hour,
                'eventsCount': events_count,
                'averageViewDuration': analytics.get('averageViewDuration', 0),
                'mobility_demand': demand
            }
            
            data.append(row)
        
        df = pd.DataFrame(data)
        
        # Guardar datos
        data_dir = Path(__file__).parent / 'data'
        data_dir.mkdir(exist_ok=True)
        csv_path = data_dir / f'mobility_data_{datetime.now().strftime("%Y%m%d")}.csv'
        df.to_csv(csv_path, index=False)
        
        print(f'✅ Datos de movilidad guardados en {csv_path}')
        print(f'📊 Total de registros: {len(df)}')
        
        return df
    finally:
        client.close()

def extract_saturation_data(days_back=90):
    """
    Extraer datos de saturación para los 13 edificios
    """
    db, client = connect_to_mongodb()
    
    try:
        cutoff_date = datetime.now() - timedelta(days=days_back)
        
        # Analíticas de edificios
        building_analytics = list(db.building_analytics.find({
            'date': {'$gte': cutoff_date},
            'buildingId': {'$in': SELECTED_BUILDINGS}
        }))
        
        print(f'✅ Analíticas para saturación extraídas: {len(building_analytics)}')
        
        data = []
        for analytics in building_analytics:
            # Calcular suma de peak visits
            peak_hours = analytics.get('peakHours', [])
            peak_visits = sum(ph.get('count', 0) for ph in peak_hours)
            
            view_count = analytics.get('viewCount', 0)
            unique_visitors = analytics.get('uniqueVisitors', 0)
            
            # Calcular nivel de saturación
            score = (view_count * 0.3) + (unique_visitors * 0.2) + (peak_visits * 0.5)
            
            if score > 150:
                saturation = 3  # Alta
            elif score > 100:
                saturation = 2  # Media
            elif score > 50:
                saturation = 1  # Baja
            else:
                saturation = 0  # Normal
            
            row = {
                'buildingId': analytics.get('buildingId'),
                'viewCount': view_count,
                'uniqueVisitors': unique_visitors,
                'dayOfWeek': analytics.get('date').weekday() if analytics.get('date') else 0,
                'hour': 12,
                'peakVisits': peak_visits,
                'averageViewDuration': analytics.get('averageViewDuration', 0),
                'popularityScore': 0,  # No aplica para edificios
                'type': 0,  # 0 = Edificio
                'saturationLevel': saturation
            }
            
            data.append(row)
        
        df = pd.DataFrame(data)
        
        # Guardar datos
        data_dir = Path(__file__).parent / 'data'
        data_dir.mkdir(exist_ok=True)
        csv_path = data_dir / f'saturation_data_{datetime.now().strftime("%Y%m%d")}.csv'
        df.to_csv(csv_path, index=False)
        
        print(f'✅ Datos de saturación guardados en {csv_path}')
        print(f'📊 Total de registros: {len(df)}')
        print(f'📈 Distribución de saturación:')
        print(df['saturationLevel'].value_counts())
        
        return df
    finally:
        client.close()

def verify_data_quality():
    """Verificar la calidad de los datos extraídos"""
    print('\n🔍 VERIFICACIÓN DE CALIDAD DE DATOS')
    print('=' * 60)
    
    db, client = connect_to_mongodb()
    
    try:
        # Verificar edificios
        buildings_count = db.buildings.count_documents({
            '_id': {'$in': SELECTED_BUILDINGS}
        })
        print(f'✅ Edificios en BD: {buildings_count}/13')
        
        # Verificar analíticas
        analytics_count = db.building_analytics.count_documents({
            'buildingId': {'$in': SELECTED_BUILDINGS}
        })
        print(f'✅ Analíticas de edificios: {analytics_count}')
        
        # Verificar eventos
        events_count = db.events.count_documents({
            'building': {'$in': SELECTED_BUILDINGS}
        })
        print(f'✅ Eventos asociados: {events_count}')
        
        # Verificar analíticas de eventos
        event_analytics_count = db.event_analytics.count_documents({
            'buildingId': {'$in': SELECTED_BUILDINGS}
        })
        print(f'✅ Analíticas de eventos: {event_analytics_count}')
        
        # Verificar peakHours
        with_peak_hours = db.building_analytics.count_documents({
            'buildingId': {'$in': SELECTED_BUILDINGS},
            'peakHours': {'$exists': True, '$ne': []}
        })
        print(f'✅ Analíticas con peakHours: {with_peak_hours}')
        
        # Recomendaciones
        print('\n📝 Recomendaciones:')
        if buildings_count < 13:
            print('   ⚠️  Ejecuta: npm run load-buildings-modular')
        if analytics_count < 100:
            print('   ⚠️  Ejecuta: npm run generate-fake-data')
        if events_count < 5:
            print('   ⚠️  Ejecuta: npm run generate-events')
        
        if buildings_count == 13 and analytics_count > 100:
            print('   ✅ Los datos están listos para entrenamiento ML')
        
    finally:
        client.close()

if __name__ == '__main__':
    print('🔄 EXTRACTOR DE DATOS ML - 13 EDIFICIOS MODULARES')
    print('=' * 60)
    print()
    
    # Verificar calidad de datos
    verify_data_quality()
    
    print('\n' + '=' * 60)
    print('📊 EXTRAYENDO DATOS PARA MODELOS ML')
    print('=' * 60)
    print()
    
    # Extraer datos para cada modelo
    print('1️⃣ Extrayendo datos de eventos...')
    event_df = extract_event_data(days_back=90)
    print(f'   ✅ {len(event_df)} registros extraídos\n')
    
    print('2️⃣ Extrayendo datos de movilidad...')
    mobility_df = extract_mobility_data(days_back=90)
    print(f'   ✅ {len(mobility_df)} registros extraídos\n')
    
    print('3️⃣ Extrayendo datos de saturación...')
    saturation_df = extract_saturation_data(days_back=90)
    print(f'   ✅ {len(saturation_df)} registros extraídos\n')
    
    print('=' * 60)
    print('🎉 EXTRACCIÓN COMPLETADA')
    print('=' * 60)
    print()
    print('📝 Siguiente paso: Entrenar modelos con:')
    print('   python train_all_models.py')
    print()

