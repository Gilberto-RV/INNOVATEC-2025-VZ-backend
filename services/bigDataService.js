// services/bigDataService.js
import UserActivityLog from '../models/BigData/UserActivityLog.js';
import BuildingAnalytics from '../models/BigData/BuildingAnalytics.js';
import EventAnalytics from '../models/BigData/EventAnalytics.js';
import SystemMetrics from '../models/BigData/SystemMetrics.js';

/**
 * Servicio para registrar actividad de usuario
 */
export const logUserActivity = async (activityData) => {
  try {
    const {
      userId,
      userEmail,
      userRole,
      action,
      resourceType,
      resourceId,
      metadata = {},
      ipAddress,
      userAgent,
      deviceType
    } = activityData;

    const log = new UserActivityLog({
      userId,
      userEmail,
      userRole,
      action,
      resourceType,
      resourceId,
      metadata,
      ipAddress,
      userAgent,
      deviceType,
      timestamp: new Date()
    });

    await log.save();
    return log;
  } catch (error) {
    console.error('Error al registrar actividad de usuario:', error);
    throw error;
  }
};

/**
 * Servicio para registrar métricas de edificios
 */
export const logBuildingView = async (buildingData) => {
  try {
    const { buildingId, buildingName, userId, userRole, viewDuration } = buildingData;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Buscar o crear registro del día
    let analytics = await BuildingAnalytics.findOne({
      buildingId,
      date: today
    });

    if (!analytics) {
      analytics = new BuildingAnalytics({
        buildingId,
        buildingName,
        date: today,
        viewCount: 0,
        uniqueVisitors: 0,
        visitorsByRole: {
          estudiante: 0,
          profesor: 0,
          administrador: 0
        }
      });
    }

    // Incrementar contadores
    analytics.viewCount += 1;
    // Nota: Para un seguimiento real de visitantes únicos por día, 
    // deberías usar un array o Set. Por ahora incrementamos el contador
    if (userId) {
      analytics.uniqueVisitors += 1;
      if (userRole && analytics.visitorsByRole[userRole]) {
        analytics.visitorsByRole[userRole] += 1;
      }
    }

    // Actualizar duración promedio
    if (viewDuration) {
      const totalDuration = analytics.averageViewDuration * (analytics.viewCount - 1) + viewDuration;
      analytics.averageViewDuration = totalDuration / analytics.viewCount;
    }

    // Actualizar hora pico
    const currentHour = new Date().getHours();
    const peakHourIndex = analytics.peakHours.findIndex(ph => ph.hour === currentHour);
    if (peakHourIndex >= 0) {
      analytics.peakHours[peakHourIndex].count += 1;
    } else {
      analytics.peakHours.push({ hour: currentHour, count: 1 });
    }

    await analytics.save();
    return analytics;
  } catch (error) {
    console.error('Error al registrar vista de edificio:', error);
    throw error;
  }
};

/**
 * Servicio para registrar métricas de eventos
 */
export const logEventView = async (eventData) => {
  try {
    const { eventId, eventTitle, userId, buildingId, category, status } = eventData;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let analytics = await EventAnalytics.findOne({
      eventId,
      date: today
    });

    if (!analytics) {
      analytics = new EventAnalytics({
        eventId,
        eventTitle,
        buildingId,
        category,
        status,
        date: today,
        viewCount: 0,
        uniqueVisitors: 0
      });
    }

    analytics.viewCount += 1;
    if (userId) {
      // En una implementación real, aquí podrías usar un Set o array para trackear visitantes únicos
      analytics.uniqueVisitors += 1;
    }

    await analytics.save();
    return analytics;
  } catch (error) {
    console.error('Error al registrar vista de evento:', error);
    throw error;
  }
};

/**
 * Servicio para registrar métricas del sistema
 */
export const logSystemMetric = async (metricData) => {
  try {
    const { metricType, value, unit = 'ms', endpoint, errorCode, metadata = {} } = metricData;

    const metric = new SystemMetrics({
      metricType,
      value,
      unit,
      endpoint,
      errorCode,
      metadata,
      timestamp: new Date()
    });

    await metric.save();
    return metric;
  } catch (error) {
    console.error('Error al registrar métrica del sistema:', error);
    throw error;
  }
};

/**
 * Obtener estadísticas de actividad de usuarios
 */
export const getUserActivityStats = async (filters = {}) => {
  try {
    const { startDate, endDate, action, userRole } = filters;
    const query = {};

    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate);
      if (endDate) query.timestamp.$lte = new Date(endDate);
    }
    if (action) query.action = action;
    if (userRole) query.userRole = userRole;

    const stats = await UserActivityLog.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$action',
          count: { $sum: 1 },
          uniqueUsers: { $addToSet: '$userId' }
        }
      },
      {
        $project: {
          action: '$_id',
          count: 1,
          uniqueUsersCount: { $size: '$uniqueUsers' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    return stats;
  } catch (error) {
    console.error('Error al obtener estadísticas de actividad:', error);
    throw error;
  }
};

/**
 * Obtener estadísticas de edificios
 */
export const getBuildingStats = async (filters = {}) => {
  try {
    const { startDate, endDate, buildingId } = filters;
    const query = {};

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }
    if (buildingId) query.buildingId = buildingId;

    const stats = await BuildingAnalytics.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$buildingId',
          buildingName: { $first: '$buildingName' },
          totalViews: { $sum: '$viewCount' },
          totalUniqueVisitors: { $sum: '$uniqueVisitors' },
          avgViewDuration: { $avg: '$averageViewDuration' }
        }
      },
      { $sort: { totalViews: -1 } }
    ]);

    return stats;
  } catch (error) {
    console.error('Error al obtener estadísticas de edificios:', error);
    throw error;
  }
};

/**
 * Obtener estadísticas de eventos
 */
export const getEventStats = async (filters = {}) => {
  try {
    const { startDate, endDate, status } = filters;
    const query = {};

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }
    if (status) query.status = status;

    const stats = await EventAnalytics.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$eventId',
          eventTitle: { $first: '$eventTitle' },
          totalViews: { $sum: '$viewCount' },
          totalUniqueVisitors: { $sum: '$uniqueVisitors' }
        }
      },
      { $sort: { totalViews: -1 } }
    ]);

    return stats;
  } catch (error) {
    console.error('Error al obtener estadísticas de eventos:', error);
    throw error;
  }
};

