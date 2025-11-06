# setup.py
"""
Script de configuración inicial del ML Service
Verifica dependencias y configura el entorno
"""
import sys
import subprocess
import os

def check_python_version():
    """Verificar versión de Python"""
    version = sys.version_info
    if version.major < 3 or (version.major == 3 and version.minor < 9):
        print('❌ Se requiere Python 3.9 o superior')
        print(f'   Versión actual: {version.major}.{version.minor}.{version.micro}')
        return False
    print(f'✅ Python {version.major}.{version.minor}.{version.micro}')
    return True

def check_dependencies():
    """Verificar dependencias instaladas"""
    required_packages = [
        'fastapi',
        'uvicorn',
        'scikit-learn',
        'pandas',
        'numpy',
        'pymongo',
        'joblib',
        'python-dotenv'
    ]
    
    missing = []
    for package in required_packages:
        try:
            __import__(package.replace('-', '_'))
            print(f'✅ {package}')
        except ImportError:
            print(f'❌ {package} - NO INSTALADO')
            missing.append(package)
    
    return missing

def install_dependencies():
    """Instalar dependencias"""
    print('\n📦 Instalando dependencias...')
    try:
        subprocess.check_call([sys.executable, '-m', 'pip', 'install', '-r', 'requirements.txt'])
        print('✅ Dependencias instaladas correctamente')
        return True
    except subprocess.CalledProcessError:
        print('❌ Error instalando dependencias')
        return False

def create_directories():
    """Crear directorios necesarios"""
    directories = ['models', 'data']
    for dir_name in directories:
        os.makedirs(dir_name, exist_ok=True)
        print(f'✅ Directorio {dir_name}/ creado')

def check_env_file():
    """Verificar archivo .env"""
    if not os.path.exists('.env'):
        print('⚠️  Archivo .env no encontrado')
        if os.path.exists('.env.example'):
            print('   Copia .env.example a .env y configura MONGO_URI')
        return False
    print('✅ Archivo .env encontrado')
    return True

if __name__ == '__main__':
    print('🔧 Configuración del ML Service')
    print('=' * 50)
    
    # Verificar Python
    if not check_python_version():
        sys.exit(1)
    
    print('\n📦 Verificando dependencias...')
    missing = check_dependencies()
    
    if missing:
        print(f'\n⚠️  Faltan {len(missing)} dependencias')
        response = input('¿Deseas instalarlas ahora? (s/n): ')
        if response.lower() == 's':
            if not install_dependencies():
                sys.exit(1)
        else:
            print('❌ Instala las dependencias manualmente: pip install -r requirements.txt')
            sys.exit(1)
    
    print('\n📁 Creando directorios...')
    create_directories()
    
    print('\n⚙️  Verificando configuración...')
    check_env_file()
    
    print('\n✅ Setup completado!')
    print('\n📝 Próximos pasos:')
    print('   1. Configura .env con tu MONGO_URI')
    print('   2. Ejecuta: python train_model.py')
    print('   3. Ejecuta: python main.py')

