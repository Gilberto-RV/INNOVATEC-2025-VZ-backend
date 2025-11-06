// controllers/bigData/mlPredictionController.js
import * as mlService from '../../services/mlService.js';
import EventAnalytics from '../../models/BigData/EventAnalytics.js';
import Event from '../../models/Event.js';

/**
 * Obtener predicción de asistencia para un evento
 */
export const getAttendancePrediction = async (req, res) => {
  try {
    const { eventId } = req.params;
    
    // Obtener datos del evento
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Evento no encontrado'
      });
    }

    // Obtener analíticas del evento
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const analytics = await EventAnalytics.findOne({
      eventId,
      date: today
    });

    // Preparar datos para predicción
    const eventDate = new Date(event.date_time);
    const predictionData = {
      viewCount: analytics?.viewCount || 0,
      uniqueVisitors: analytics?.uniqueVisitors || 0,
      dayOfWeek: eventDate.getDay(),
      hour: eventDate.getHours(),
      category_count: event.category?.length || 1,
      popularityScore: analytics?.popularityScore || 0,
      date_time: event.date_time?.toISOString()
    };

    // Obtener predicción del ML Service
    const prediction = await mlService.predictEventAttendance(predictionData);

    // Actualizar el campo attendancePrediction en analytics si existe
    if (analytics) {
      analytics.attendancePrediction = prediction.prediction;
      await analytics.save();
    }

    res.json({
      success: true,
      data: {
        eventId,
        eventTitle: event.title,
        prediction: prediction.prediction,
        confidence: prediction.confidence,
        modelType: prediction.model_type,
        features: prediction.features_used,
        eventData: predictionData
      }
    });
  } catch (error) {
    console.error('Error obteniendo predicción ML:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener predicción',
      error: error.message
    });
  }
};

/**
 * Obtener predicciones para múltiples eventos
 */
export const getBatchPredictions = async (req, res) => {
  try {
    const { eventIds } = req.body; // Array de IDs de eventos
    
    if (!Array.isArray(eventIds)) {
      return res.status(400).json({
        success: false,
        message: 'eventIds debe ser un array'
      });
    }

    const predictions = [];
    
    for (const eventId of eventIds) {
      try {
        const event = await Event.findById(eventId);
        if (!event) continue;

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const analytics = await EventAnalytics.findOne({
          eventId,
          date: today
        });

        const eventDate = new Date(event.date_time);
        const predictionData = {
          viewCount: analytics?.viewCount || 0,
          uniqueVisitors: analytics?.uniqueVisitors || 0,
          dayOfWeek: eventDate.getDay(),
          hour: eventDate.getHours(),
          category_count: event.category?.length || 1,
          popularityScore: analytics?.popularityScore || 0,
          date_time: event.date_time?.toISOString()
        };

        const prediction = await mlService.predictEventAttendance(predictionData);
        
        predictions.push({
          eventId,
          eventTitle: event.title,
          prediction: prediction.prediction,
          confidence: prediction.confidence
        });
      } catch (error) {
        console.error(`Error prediciendo evento ${eventId}:`, error);
      }
    }

    res.json({
      success: true,
      data: predictions
    });
  } catch (error) {
    console.error('Error en predicciones batch:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener predicciones',
      error: error.message
    });
  }
};

/**
 * Verificar estado del ML Service
 */
export const checkMLServiceStatus = async (req, res) => {
  try {
    const status = await mlService.checkMLServiceHealth();
    res.json({
      success: true,
      data: status
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error verificando ML Service',
      error: error.message
    });
  }
};

