# config.py
import os
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.getenv('MONGO_URI', 'mongodb://localhost:27017/innovatec')
ML_PORT = int(os.getenv('ML_PORT', 8000))
ML_HOST = os.getenv('ML_HOST', '0.0.0.0')
MODELS_DIR = os.getenv('MODELS_DIR', './models')
DATA_DIR = os.getenv('DATA_DIR', './data')

# Crear directorios si no existen
os.makedirs(MODELS_DIR, exist_ok=True)
os.makedirs(DATA_DIR, exist_ok=True)

