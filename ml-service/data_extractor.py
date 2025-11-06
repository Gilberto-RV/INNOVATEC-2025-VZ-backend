# data_extractor.py
import pymongo
import pandas as pd
from datetime import datetime, timedelta
from config import MONGO_URI, DATA_DIR

def connect_to_mongodb():
    """Conectar a MongoDB"""
    try:
        client = pymongo.MongoClient(MONGO_URI)
        db = client.get_database()
        # Verificar conexión
        client.admin.command('ping')
        print('✅ Conectado a MongoDB')
        return db
    except Exception as e:
        print(f'❌ Error conectando a MongoDB: {e}')
        raise

def extract_event_data(days_back=90):
    """
    Extraer datos de eventos para entrenamiento
    Retorna DataFrame con features y target
    """
    db = connect_to_mongodb()
    
    # Fecha límite
    cutoff_date = datetime.now() - timedelta(days=days_back)
    
    # Obtener analíticas de eventos
    event_analytics = list(db.event_analytics.find({
        'date': {'$gte': cutoff_date}
    }))
    
    # Obtener eventos para más información
    try:
        events_collection = db.events.find({
            'createdAt': {'$gte': cutoff_date}
        })
        events_dict = {str(event['_id']): event for event in events_collection}
    except:
        # Si la colección se llama diferente o no existe
        events_dict = {}
    
    # Preparar datos
    data = []
    for analytics in event_analytics:
        event_id = str(analytics.get('eventId'))
        event = events_dict.get(event_id, {})
        
        # Extraer fecha del evento
        event_date = analytics.get('date') or event.get('date_time')
        if isinstance(event_date, str):
            event_date = datetime.fromisoformat(event_date.replace('Z', '+00:00'))
        
        if event_date:
            day_of_week = event_date.weekday()  # 0=Lunes, 6=Domingo
            hour = event_date.hour
        else:
            day_of_week = 0
            hour = 12
        
        # Features
        row = {
            'viewCount': analytics.get('viewCount', 0),
            'uniqueVisitors': analytics.get('uniqueVisitors', 0),
            'dayOfWeek': day_of_week,
            'hour': hour,
            'category_count': len(analytics.get('category', [])),
            'popularityScore': analytics.get('popularityScore', 0),
            # Target: usar uniqueVisitors como proxy de asistencia si no hay actualAttendance
            'attendance': analytics.get('actualAttendance') or analytics.get('uniqueVisitors', 0)
        }
        
        data.append(row)
    
    df = pd.DataFrame(data)
    
    # Guardar datos extraídos
    csv_path = f'{DATA_DIR}/event_data_{datetime.now().strftime("%Y%m%d")}.csv'
    df.to_csv(csv_path, index=False)
    print(f'✅ Datos extraídos y guardados en {csv_path}')
    print(f'📊 Total de registros: {len(df)}')
    
    return df

if __name__ == '__main__':
    print('🔄 Extrayendo datos de MongoDB...')
    df = extract_event_data()
    print(f'\n📋 Primeras filas:')
    print(df.head())
    print(f'\n📈 Estadísticas:')
    print(df.describe())

