# verify_ml_setup.py
"""
Script para verificar que el entorno ML está correctamente configurado
"""

import sys
import os
from pathlib import Path

def check_python_version():
    """Verificar versión de Python"""
    print('🐍 Python:')
    version = sys.version_info
    version_str = f'{version.major}.{version.minor}.{version.micro}'
    print(f'   Versión: {version_str}')
    
    if version.major >= 3 and version.minor >= 8:
        print('   ✅ Versión compatible (>= 3.8)')
        return True
    else:
        print('   ❌ Versión incompatible (necesitas >= 3.8)')
        return False

def check_dependencies():
    """Verificar dependencias instaladas"""
    print('\n📦 Dependencias:')
    
    required_packages = {
        'pandas': 'pandas',
        'numpy': 'numpy',
        'sklearn': 'scikit-learn',
        'pymongo': 'pymongo',
        'joblib': 'joblib',
        'fastapi': 'fastapi',
        'uvicorn': 'uvicorn',
        'dotenv': 'python-dotenv',
        'pydantic': 'pydantic'
    }
    
    all_installed = True
    
    for import_name, package_name in required_packages.items():
        try:
            __import__(import_name)
            print(f'   ✅ {package_name}')
        except ImportError:
            print(f'   ❌ {package_name} (falta)')
            all_installed = False
    
    return all_installed

def check_env_file():
    """Verificar archivo .env"""
    print('\n⚙️  Configuración:')
    
    env_path = Path(__file__).parent / '.env'
    
    if not env_path.exists():
        print('   ❌ Archivo .env no encontrado')
        print('   💡 Crea un .env con: MONGO_URI=mongodb+srv://...')
        return False
    
    print('   ✅ Archivo .env encontrado')
    
    # Verificar contenido
    with open(env_path, 'r') as f:
        content = f.read()
        if 'MONGO_URI' in content:
            print('   ✅ MONGO_URI configurado')
            return True
        else:
            print('   ❌ MONGO_URI no encontrado en .env')
            return False

def check_mongodb_connection():
    """Verificar conexión a MongoDB"""
    print('\n🗄️  MongoDB:')
    
    try:
        from dotenv import load_dotenv
        import pymongo
        
        load_dotenv()
        mongo_uri = os.getenv('MONGO_URI')
        
        if not mongo_uri:
            print('   ❌ MONGO_URI no está definido')
            return False
        
        client = pymongo.MongoClient(mongo_uri, serverSelectionTimeoutMS=5000)
        client.admin.command('ping')
        
        # Obtener información de la base de datos
        db = client.get_database()
        collections = db.list_collection_names()
        
        print('   ✅ Conexión exitosa')
        print(f'   📊 Base de datos: {db.name}')
        print(f'   📦 Colecciones: {len(collections)}')
        
        # Verificar colecciones importantes
        important_collections = ['buildings', 'building_analytics', 'events', 'event_analytics']
        for coll in important_collections:
            count = db[coll].count_documents({})
            status = '✅' if count > 0 else '⚠️ '
            print(f'      {status} {coll}: {count} documentos')
        
        client.close()
        return True
        
    except Exception as e:
        print(f'   ❌ Error: {e}')
        return False

def check_directories():
    """Verificar directorios necesarios"""
    print('\n📁 Directorios:')
    
    required_dirs = ['data', 'models']
    all_exist = True
    
    for dir_name in required_dirs:
        dir_path = Path(__file__).parent / dir_name
        if dir_path.exists():
            print(f'   ✅ {dir_name}/')
        else:
            print(f'   ⚠️  {dir_name}/ (será creado)')
            dir_path.mkdir(exist_ok=True)
    
    return True

def check_existing_models():
    """Verificar modelos existentes"""
    print('\n🤖 Modelos ML:')
    
    models_dir = Path(__file__).parent / 'models'
    
    expected_models = [
        'attendance_predictor.pkl',
        'mobility_demand_predictor.pkl',
        'saturation_predictor.pkl'
    ]
    
    models_exist = True
    for model_name in expected_models:
        model_path = models_dir / model_name
        if model_path.exists():
            size_kb = model_path.stat().st_size / 1024
            print(f'   ✅ {model_name} ({size_kb:.1f} KB)')
        else:
            print(f'   ⚠️  {model_name} (no entrenado)')
            models_exist = False
    
    return models_exist

def main():
    """Verificar todo el setup"""
    print('='*60)
    print('🔍 VERIFICACIÓN DEL ENTORNO ML')
    print('='*60)
    
    checks = {
        'python': check_python_version(),
        'dependencies': check_dependencies(),
        'env': check_env_file(),
        'mongodb': check_mongodb_connection(),
        'directories': check_directories(),
        'models': check_existing_models()
    }
    
    print('\n' + '='*60)
    print('📊 RESUMEN')
    print('='*60)
    
    for check_name, result in checks.items():
        status = '✅' if result else '❌'
        print(f'{status} {check_name.capitalize()}')
    
    all_good = all(checks.values())
    
    print('\n' + '='*60)
    if all_good:
        print('🎉 TODO ESTÁ LISTO')
        print('='*60)
        print('\n📝 Siguiente paso:')
        print('   python train_all_models.py  # Entrenar modelos')
        print('   python main.py              # Iniciar servicio')
        return 0
    else:
        print('⚠️  HAY PROBLEMAS QUE RESOLVER')
        print('='*60)
        print('\n💡 Soluciones:')
        
        if not checks['python']:
            print('   - Instala Python 3.8 o superior')
        
        if not checks['dependencies']:
            print('   - Ejecuta: pip install -r requirements.txt')
        
        if not checks['env']:
            print('   - Crea un archivo .env con MONGO_URI')
        
        if not checks['mongodb']:
            print('   - Verifica tu conexión a MongoDB Atlas')
            print('   - Configura Network Access para permitir tu IP')
        
        if not checks['models']:
            print('   - Ejecuta: python train_all_models.py')
        
        return 1

if __name__ == '__main__':
    try:
        exit_code = main()
        print()
        sys.exit(exit_code)
    except KeyboardInterrupt:
        print('\n\n❌ Verificación cancelada')
        sys.exit(1)
    except Exception as e:
        print(f'\n\n❌ Error: {e}')
        import traceback
        traceback.print_exc()
        sys.exit(1)

