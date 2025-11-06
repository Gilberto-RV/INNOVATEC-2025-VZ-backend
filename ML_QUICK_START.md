# 🚀 Guía de Inicio Rápido - Machine Learning

## Objetivo
Implementar predicción de asistencia a eventos en menos de 3 horas.

---

## 📦 Instalación Rápida

### 1. Instalar Python 3.9+ (si no lo tienes)
- Windows: Descargar de python.org
- Verificar: `python --version`

### 2. Crear Estructura del Proyecto
```bash
cd backend
mkdir ml-service
cd ml-service
python -m venv venv
venv\Scripts\activate  # Windows
pip install fastapi uvicorn scikit-learn pandas numpy pymongo joblib
```

### 3. Crear Archivos Base

**requirements.txt:**
```
fastapi==0.104.1
uvicorn==0.24.0
scikit-learn==1.3.2
pandas==2.1.3
numpy==1.24.3
pymongo==4.6.0
joblib==1.3.2
python-multipart==0.0.6
python-dotenv==1.0.0
```

---

## 🎯 Scripts Necesarios

### 1. `extract_data.py` - Extraer datos de MongoDB
### 2. `train_model.py` - Entrenar modelo
### 3. `api.py` - API FastAPI para predicciones
### 4. `main.py` - Punto de entrada

---

## 🔄 Integración con Backend

El backend Node.js llamará al ML Service así:
```javascript
const prediction = await axios.post('http://localhost:8000/predict/attendance', eventData);
```

---

## ⏱️ Tiempo Total Estimado
- Setup: 30 min
- Extracción de datos: 30 min  
- Entrenamiento modelo: 30 min
- Crear API: 1 hora
- Integración: 30 min
**Total: ~3 horas**

---

Ver `ML_IMPLEMENTATION_PLAN.md` para detalles completos.

