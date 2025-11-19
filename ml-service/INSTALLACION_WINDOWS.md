# 🪟 Instalación en Windows - Solución de Problemas

## ⚠️ Problema: Error al instalar scikit-learn con Python 3.14

Si estás usando **Python 3.14** (muy reciente), es posible que algunas versiones antiguas de scikit-learn intenten compilarse desde fuente y fallen.

## ✅ Solución 1: Usar versiones más recientes (Recomendado)

El archivo `requirements.txt` ya fue actualizado con versiones más recientes que tienen wheels precompilados para Python 3.14:

```bash
# Activa el entorno virtual primero
venv\Scripts\activate

# Actualiza pip, setuptools y wheel
python -m pip install --upgrade pip setuptools wheel

# Instala las dependencias (usará versiones más recientes compatibles)
pip install -r requirements.txt
```

## ✅ Solución 2: Si aún falla, instalar versión específica de scikit-learn

Si la solución 1 no funciona, instala scikit-learn con una versión más reciente que tenga wheels:

```bash
venv\Scripts\activate
python -m pip install --upgrade pip setuptools wheel

# Instalar scikit-learn más reciente
pip install scikit-learn>=1.6.0

# Luego instalar el resto
pip install fastapi>=0.115.0 uvicorn[standard]>=0.32.0 pandas>=2.2.0 numpy>=2.0.0 pymongo>=4.10.0 joblib>=1.4.0 python-multipart>=0.0.12 python-dotenv>=1.0.1 pydantic>=2.10.0
```

## ✅ Solución 3: Usar Python 3.12 (Alternativa)

Si prefieres usar una versión más estable de Python:

1. **Instalar Python 3.12** desde [python.org](https://www.python.org/downloads/)
2. **Recrear el entorno virtual:**
```bash
# Elimina el venv actual
Remove-Item -Recurse -Force venv

# Crea nuevo venv con Python 3.12
py -3.12 -m venv venv

# Activa el venv
venv\Scripts\activate

# Instala dependencias
pip install -r requirements.txt
```

## 📋 Verificar el archivo .env

Asegúrate de que el archivo `.env` en `backend/ml-service/` tenga este contenido:

```env
MONGO_URI=mongodb+srv://innovatec_user:TU_PASSWORD@cluster0.nctkhhn.mongodb.net/innovatec?retryWrites=true&w=majority
ML_PORT=8000
ML_HOST=0.0.0.0
MODELS_DIR=./models
DATA_DIR=./data
```

**⚠️ Importante:** Reemplaza `TU_PASSWORD` con la contraseña real de tu base de datos MongoDB Atlas.

## 🔍 Verificar que el archivo .env existe

Ejecuta en PowerShell (desde `backend/ml-service`):

```powershell
Test-Path .env  # Debe retornar True
Get-Content .env  # Debe mostrar el contenido del archivo
```

Si no existe, créalo manualmente con el contenido de arriba.

## 🚀 Después de instalar

1. **Entrena los modelos:**
```bash
python train_all_models.py
```

2. **Inicia el servicio:**
```bash
python main.py
```

3. **Verifica que funcione:**
```bash
curl http://localhost:8000/health
# O abre en el navegador: http://localhost:8000/docs
```

## ❓ ¿Problemas persistents?

Si aún tienes problemas:

1. **Actualiza pip:**
```bash
python -m pip install --upgrade pip
```

2. **Instala solo las dependencias críticas primero:**
```bash
pip install numpy pandas scikit-learn fastapi uvicorn pymongo joblib python-dotenv
```

3. **Luego instala el resto:**
```bash
pip install -r requirements.txt
```

