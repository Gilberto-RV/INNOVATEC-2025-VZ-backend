// services/mlService.js
import axios from 'axios';

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';

/**
 * Predecir asistencia a un evento
 */
export const predictEventAttendance = async (eventData) => {
  try {
    const response = await axios.post(`${ML_SERVICE_URL}/predict/attendance`, {
      viewCount: eventData.viewCount || 0,
      uniqueVisitors: eventData.uniqueVisitors || 0,
      dayOfWeek: eventData.dayOfWeek,
      hour: eventData.hour,
      category_count: eventData.category_count || 1,
      popularityScore: eventData.popularityScore || 0,
      date_time: eventData.date_time
    });

    return response.data;
  } catch (error) {
    console.error('Error en predicción ML:', error.message);
    
    // Fallback: cálculo simple si ML service no está disponible
    if (error.code === 'ECONNREFUSED' || error.response?.status === 503) {
      console.log('⚠️  ML Service no disponible, usando cálculo de fallback');
      return {
        prediction: calculateSimpleAttendancePrediction(eventData),
        confidence: 0.3,
        model_type: 'fallback',
        features_used: []
      };
    }
    
    throw error;
  }
};

/**
 * Cálculo simple de fallback si ML service no está disponible
 */
function calculateSimpleAttendancePrediction(eventData) {
  // Regla simple: asistencia ≈ uniqueVisitors * 1.5
  const basePrediction = (eventData.uniqueVisitors || 0) * 1.5;
  
  // Ajustar por hora del día
  const hour = eventData.hour || 12;
  let hourMultiplier = 1.0;
  if (hour >= 14 && hour <= 18) {
    hourMultiplier = 1.2; // Horas pico
  } else if (hour < 9 || hour > 19) {
    hourMultiplier = 0.8; // Horas menos populares
  }
  
  return Math.round(basePrediction * hourMultiplier);
}

/**
 * Verificar si el ML service está disponible
 */
export const checkMLServiceHealth = async () => {
  try {
    const response = await axios.get(`${ML_SERVICE_URL}/health`);
    return {
      available: true,
      modelLoaded: response.data.model_loaded,
      ...response.data
    };
  } catch (error) {
    return {
      available: false,
      error: error.message
    };
  }
};

