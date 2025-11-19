# train_all_models.py
"""
Script para entrenar todos los modelos ML
"""
from train_model import train_attendance_model
from train_mobility_model import train_mobility_model
from train_saturation_model import train_saturation_model

if __name__ == '__main__':
    print('🚀 Iniciando entrenamiento de todos los modelos ML...')
    print('=' * 60)
    
    print('\n📊 1/3 - Entrenando modelo de asistencia a eventos...')
    print('-' * 60)
    try:
        train_attendance_model(use_random_forest=True)
        print('✅ Modelo de asistencia entrenado exitosamente\n')
    except Exception as e:
        print(f'❌ Error entrenando modelo de asistencia: {e}\n')
    
    print('\n🚶 2/3 - Entrenando modelo de demanda de movilidad...')
    print('-' * 60)
    try:
        train_mobility_model()
        print('✅ Modelo de movilidad entrenado exitosamente\n')
    except Exception as e:
        print(f'❌ Error entrenando modelo de movilidad: {e}\n')
    
    print('\n⚠️  3/3 - Entrenando modelo de saturación...')
    print('-' * 60)
    try:
        train_saturation_model()
        print('✅ Modelo de saturación entrenado exitosamente\n')
    except Exception as e:
        print(f'❌ Error entrenando modelo de saturación: {e}\n')
    
    print('=' * 60)
    print('✅ Entrenamiento de todos los modelos completado!')
    print('\n📝 Nota: Los modelos ya están listos para usar.')
    print('   Recarga los modelos en la API ejecutando:')
    print('   curl -X POST http://localhost:8000/model/reload')

