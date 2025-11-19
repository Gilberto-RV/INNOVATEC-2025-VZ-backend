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
 * Predecir demanda de movilidad en un edificio/área
 */
export const predictMobilityDemand = async (mobilityData) => {
  try {
    const response = await axios.post(`${ML_SERVICE_URL}/predict/mobility`, {
      viewCount: mobilityData.viewCount || 0,
      uniqueVisitors: mobilityData.uniqueVisitors || 0,
      dayOfWeek: mobilityData.dayOfWeek,
      hour: mobilityData.hour,
      peakHour: mobilityData.peakHour,
      eventsCount: mobilityData.eventsCount || 0,
      averageViewDuration: mobilityData.averageViewDuration || 0,
      date_time: mobilityData.date_time
    });

    return response.data;
  } catch (error) {
    console.error('Error en predicción de movilidad ML:', error.message);
    
    // Fallback si ML service no está disponible
    if (error.code === 'ECONNREFUSED' || error.response?.status === 503) {
      console.log('⚠️  ML Service no disponible, usando cálculo de fallback');
      return {
        prediction: calculateSimpleMobilityPrediction(mobilityData),
        confidence: 0.3,
        model_type: 'fallback',
        features_used: []
      };
    }
    
    throw error;
  }
};

/**
 * Cálculo simple de fallback para movilidad
 */
function calculateSimpleMobilityPrediction(mobilityData) {
  const baseDemand = (mobilityData.uniqueVisitors || 0) * (1 + (mobilityData.eventsCount || 0) * 0.5);
  const hour = mobilityData.hour || 12;
  
  let hourMultiplier = 1.0;
  if (hour >= 10 && hour <= 16) {
    hourMultiplier = 1.3; // Horas pico de movilidad
  } else if (hour < 8 || hour > 19) {
    hourMultiplier = 0.7; // Horas de baja movilidad
  }
  
  return Math.round(baseDemand * hourMultiplier);
}

/**
 * Predecir nivel de saturación (Normal, Baja, Media, Alta)
 */
export const predictSaturation = async (saturationData) => {
  try {
    const response = await axios.post(`${ML_SERVICE_URL}/predict/saturation`, {
      viewCount: saturationData.viewCount || 0,
      uniqueVisitors: saturationData.uniqueVisitors || 0,
      dayOfWeek: saturationData.dayOfWeek,
      hour: saturationData.hour,
      peakVisits: saturationData.peakVisits || 0,
      averageViewDuration: saturationData.averageViewDuration || 0,
      popularityScore: saturationData.popularityScore || 0,
      type: saturationData.type || 0, // 0 = Edificio, 1 = Evento
      date_time: saturationData.date_time
    });

    return response.data;
  } catch (error) {
    console.error('Error en predicción de saturación ML:', error.message);
    
    // Fallback si ML service no está disponible
    if (error.code === 'ECONNREFUSED' || error.response?.status === 503) {
      console.log('⚠️  ML Service no disponible, usando cálculo de fallback');
      return {
        saturationLevel: calculateSimpleSaturation(saturationData),
        saturationLabel: getSaturationLabel(calculateSimpleSaturation(saturationData)),
        confidence: 0.3,
        model_type: 'fallback',
        features_used: []
      };
    }
    
    throw error;
  }
};

/**
 * Cálculo simple de saturación (fallback)
 */
function calculateSimpleSaturation(saturationData) {
  const uniqueVisitors = saturationData.uniqueVisitors || 0;
  const viewCount = saturationData.viewCount || 0;
  const popularityScore = saturationData.popularityScore || 0;
  const type = saturationData.type || 0; // 0 = Edificio, 1 = Evento
  
  // Umbrales diferentes para edificios y eventos
  if (type === 0) { // Edificio
    if (uniqueVisitors > 150 || viewCount > 300) {
      return 3; // Alta saturación
    } else if (uniqueVisitors > 100 || viewCount > 200) {
      return 2; // Media saturación
    } else if (uniqueVisitors > 50 || viewCount > 100) {
      return 1; // Baja saturación
    }
  } else { // Evento
    if (uniqueVisitors > 100 || viewCount > 200 || popularityScore > 500) {
      return 3; // Alta saturación
    } else if (uniqueVisitors > 60 || viewCount > 120 || popularityScore > 300) {
      return 2; // Media saturación
    } else if (uniqueVisitors > 30 || viewCount > 60 || popularityScore > 150) {
      return 1; // Baja saturación
    }
  }
  
  return 0; // Normal
}

/**
 * Obtener etiqueta de saturación
 */
function getSaturationLabel(level) {
  const labels = { 0: 'Normal', 1: 'Baja', 2: 'Media', 3: 'Alta' };
  return labels[level] || 'Normal';
}

/**
 * Verificar si el ML service está disponible
 */
export const checkMLServiceHealth = async () => {
  try {
    const response = await axios.get(`${ML_SERVICE_URL}/health`);
    return {
      available: true,
      modelsLoaded: response.data.models_loaded || {},
      ...response.data
    };
  } catch (error) {
    return {
      available: false,
      error: error.message
    };
  }
};

