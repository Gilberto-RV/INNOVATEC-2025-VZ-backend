// controllers/bigData/mlPredictionController.js
import * as mlService from '../../services/mlService.js';
import EventAnalytics from '../../models/BigData/EventAnalytics.js';
import BuildingAnalytics from '../../models/BigData/BuildingAnalytics.js';
import Event from '../../models/Event.js';
import Building from '../../models/Building.js';

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
 * Predecir demanda de movilidad para un edificio
 */
export const getMobilityPrediction = async (req, res) => {
  let analytics = null; // Declarar fuera del try para acceso en catch
  
  try {
    const { buildingId } = req.params;
    const { date } = req.query; // Fecha opcional (YYYY-MM-DD)
    
    // Obtener datos del edificio
    const building = await Building.findById(buildingId);
    if (!building) {
      return res.status(404).json({
        success: false,
        message: 'Edificio no encontrado'
      });
    }

    // Obtener analíticas del edificio
    const targetDate = date ? new Date(date) : new Date();
    targetDate.setHours(0, 0, 0, 0);
    
    analytics = await BuildingAnalytics.findOne({
      buildingId,
      date: targetDate
    });

    // Contar eventos en ese edificio ese día
    const eventsCount = await Event.countDocuments({
      building_assigned: buildingId,
      date_time: {
        $gte: targetDate,
        $lt: new Date(targetDate.getTime() + 24 * 60 * 60 * 1000)
      }
    });

    // Obtener peak hours
    const peakHours = analytics?.peakHours || [];
    const maxPeakHour = peakHours.length > 0 
      ? peakHours.reduce((max, ph) => (ph.count || 0) > (max.count || 0) ? ph : max, peakHours[0]).hour 
      : targetDate.getHours();

    // Preparar datos para predicción
    const predictionData = {
      viewCount: analytics?.viewCount || 0,
      uniqueVisitors: analytics?.uniqueVisitors || 0,
      dayOfWeek: targetDate.getDay(),
      hour: targetDate.getHours(),
      peakHour: maxPeakHour,
      eventsCount: eventsCount,
      averageViewDuration: analytics?.averageViewDuration || 0,
      date_time: targetDate.toISOString()
    };

    // Obtener predicción del ML Service
    console.log('🔍 Datos para predicción:', predictionData);
    const prediction = await mlService.predictMobilityDemand(predictionData);
    console.log('✅ Predicción recibida:', prediction);

    res.json({
      success: true,
      data: {
        buildingId,
        buildingName: building._id || building.name || buildingId,
        date: targetDate.toISOString(),
        prediction: prediction.prediction,
        confidence: prediction.confidence,
        modelType: prediction.model_type,
        features: prediction.features_used,
        buildingData: predictionData
      }
    });
  } catch (error) {
    console.error('❌ Error obteniendo predicción de movilidad:', error);
    console.error('   BuildingId:', req.params.buildingId);
    console.error('   Message:', error.message);
    console.error('   Stack:', error.stack);
    
    // Error más específico
    let errorMessage = 'Error al obtener predicción de movilidad';
    if (error.code === 'ECONNREFUSED') {
      errorMessage = 'ML Service no está disponible. Por favor, inicia el servicio ML (python main.py)';
    } else if (error.response?.status === 503) {
      errorMessage = 'Modelo de movilidad no está entrenado. Ejecuta: python train_all_models.py';
    }
    
    res.status(500).json({
      success: false,
      message: errorMessage,
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      details: {
        buildingId: req.params.buildingId,
        hasAnalytics: !!analytics,
        analyticsData: analytics ? {
          viewCount: analytics.viewCount,
          uniqueVisitors: analytics.uniqueVisitors,
          peakHoursCount: analytics.peakHours?.length || 0
        } : null
      }
    });
  }
};

/**
 * Predecir nivel de saturación para un edificio o evento
 */
export const getSaturationPrediction = async (req, res) => {
  try {
    const { type, id } = req.params; // type: 'building' o 'event', id: buildingId o eventId
    const { date } = req.query;
    
    const targetDate = date ? new Date(date) : new Date();
    targetDate.setHours(0, 0, 0, 0);

    if (type === 'building') {
      const building = await Building.findById(id);
      if (!building) {
        return res.status(404).json({
          success: false,
          message: 'Edificio no encontrado'
        });
      }

      const analytics = await BuildingAnalytics.findOne({
        buildingId: id,
        date: targetDate
      });

      const peakHours = analytics?.peakHours || [];
      const totalPeakVisits = peakHours.reduce((sum, ph) => sum + (ph.count || 0), 0);

      const predictionData = {
        viewCount: analytics?.viewCount || 0,
        uniqueVisitors: analytics?.uniqueVisitors || 0,
        dayOfWeek: targetDate.getDay(),
        hour: targetDate.getHours(),
        peakVisits: totalPeakVisits,
        averageViewDuration: analytics?.averageViewDuration || 0,
        popularityScore: 0,
        type: 0, // Edificio
        date_time: targetDate.toISOString()
      };

      const prediction = await mlService.predictSaturation(predictionData);

      res.json({
        success: true,
        data: {
          buildingId: id,
          buildingName: building.name,
          date: targetDate.toISOString(),
          saturationLevel: prediction.saturationLevel,
          saturationLabel: prediction.saturationLabel,
          confidence: prediction.confidence,
          modelType: prediction.model_type,
          features: prediction.features_used,
          buildingData: predictionData
        }
      });
    } else if (type === 'event') {
      const event = await Event.findById(id);
      if (!event) {
        return res.status(404).json({
          success: false,
          message: 'Evento no encontrado'
        });
      }

      const analytics = await EventAnalytics.findOne({
        eventId: id,
        date: targetDate
      });

      const eventDate = new Date(event.date_time);
      const predictionData = {
        viewCount: analytics?.viewCount || 0,
        uniqueVisitors: analytics?.uniqueVisitors || 0,
        dayOfWeek: eventDate.getDay(),
        hour: eventDate.getHours(),
        peakVisits: 0,
        averageViewDuration: 0,
        popularityScore: analytics?.popularityScore || 0,
        type: 1, // Evento
        date_time: event.date_time?.toISOString()
      };

      const prediction = await mlService.predictSaturation(predictionData);

      res.json({
        success: true,
        data: {
          eventId: id,
          eventTitle: event.title,
          date: targetDate.toISOString(),
          saturationLevel: prediction.saturationLevel,
          saturationLabel: prediction.saturationLabel,
          confidence: prediction.confidence,
          modelType: prediction.model_type,
          features: prediction.features_used,
          eventData: predictionData
        }
      });
    } else {
      return res.status(400).json({
        success: false,
        message: 'Tipo debe ser "building" o "event"'
      });
    }
  } catch (error) {
    console.error('Error obteniendo predicción de saturación:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener predicción de saturación',
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

