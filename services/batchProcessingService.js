// services/batchProcessingService.js
import UserActivityLog from '../models/BigData/UserActivityLog.js';
import BuildingAnalytics from '../models/BigData/BuildingAnalytics.js';
import EventAnalytics from '../models/BigData/EventAnalytics.js';
import SystemMetrics from '../models/BigData/SystemMetrics.js';

/**
 * Procesamiento por lotes: Agregar estadísticas diarias de actividad de usuarios
 */
export const processDailyUserActivity = async () => {
  try {
    console.log('🔵 Iniciando procesamiento diario de actividad de usuarios...');
    
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Agregar actividades por acción
    const activitySummary = await UserActivityLog.aggregate([
      {
        $match: {
          timestamp: {
            $gte: yesterday,
            $lt: today
          }
        }
      },
      {
        $group: {
          _id: {
            action: '$action',
            userRole: '$userRole'
          },
          count: { $sum: 1 },
          uniqueUsers: { $addToSet: '$userId' }
        }
      },
      {
        $project: {
          action: '$_id.action',
          userRole: '$_id.userRole',
          count: 1,
          uniqueUsersCount: { $size: '$uniqueUsers' }
        }
      }
    ]);

    console.log(`✅ Procesadas ${activitySummary.length} actividades del día anterior`);
    return {
      date: yesterday,
      summary: activitySummary,
      processed: true
    };
  } catch (error) {
    console.error('❌ Error en procesamiento diario de actividad:', error);
    throw error;
  }
};

/**
 * Procesamiento por lotes: Consolidar estadísticas de edificios
 */
export const processBuildingAnalytics = async () => {
  try {
    console.log('🔵 Iniciando consolidación de analíticas de edificios...');
    
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Obtener todos los registros del día anterior
    const dailyAnalytics = await BuildingAnalytics.find({
      date: yesterday
    });

    // Calcular estadísticas consolidadas
    const consolidated = await BuildingAnalytics.aggregate([
      {
        $match: {
          date: yesterday
        }
      },
      {
        $group: {
          _id: '$buildingId',
          buildingName: { $first: '$buildingName' },
          totalViews: { $sum: '$viewCount' },
          totalUniqueVisitors: { $sum: '$uniqueVisitors' },
          avgViewDuration: { $avg: '$averageViewDuration' },
          peakHours: { $push: '$peakHours' }
        }
      }
    ]);

    console.log(`✅ Consolidadas ${consolidated.length} analíticas de edificios`);
    return {
      date: yesterday,
      buildings: consolidated,
      processed: true
    };
  } catch (error) {
    console.error('❌ Error en consolidación de analíticas:', error);
    throw error;
  }
};

/**
 * Procesamiento por lotes: Calcular popularidad de eventos
 */
export const processEventPopularity = async () => {
  try {
    console.log('🔵 Calculando popularidad de eventos...');
    
    const last7Days = new Date();
    last7Days.setDate(last7Days.getDate() - 7);
    last7Days.setHours(0, 0, 0, 0);

    // Calcular score de popularidad basado en vistas, fechas, etc.
    const popularityScores = await EventAnalytics.aggregate([
      {
        $match: {
          date: { $gte: last7Days }
        }
      },
      {
        $group: {
          _id: '$eventId',
          eventTitle: { $first: '$eventTitle' },
          totalViews: { $sum: '$viewCount' },
          uniqueVisitors: { $sum: '$uniqueVisitors' },
          recentViews: { $sum: { $cond: [{ $gte: ['$date', new Date(Date.now() - 24*60*60*1000)] }, '$viewCount', 0] } }
        }
      },
      {
        $project: {
          eventId: '$_id',
          eventTitle: 1,
          totalViews: 1,
          uniqueVisitors: 1,
          popularityScore: {
            $add: [
              { $multiply: ['$totalViews', 1] },
              { $multiply: ['$uniqueVisitors', 2] },
              { $multiply: ['$recentViews', 3] }
            ]
          }
        }
      },
      { $sort: { popularityScore: -1 } },
      { $limit: 10 }
    ]);

    // Actualizar scores en la base de datos
    for (const event of popularityScores) {
      await EventAnalytics.updateMany(
        { eventId: event.eventId },
        { $set: { popularityScore: event.popularityScore } }
      );
    }

    console.log(`✅ Calculada popularidad para ${popularityScores.length} eventos`);
    return {
      topEvents: popularityScores,
      processed: true
    };
  } catch (error) {
    console.error('❌ Error calculando popularidad de eventos:', error);
    throw error;
  }
};

/**
 * Procesamiento por lotes: Limpiar datos antiguos (opcional)
 */
export const cleanOldData = async (daysToKeep = 90) => {
  try {
    console.log(`🔵 Limpiando datos más antiguos de ${daysToKeep} días...`);
    
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const results = {
      userActivityLogs: 0,
      systemMetrics: 0
    };

    // Limpiar logs de actividad antiguos (mantener solo agregaciones)
    const userLogsResult = await UserActivityLog.deleteMany({
      timestamp: { $lt: cutoffDate }
    });
    results.userActivityLogs = userLogsResult.deletedCount;

    // Limpiar métricas del sistema antiguas
    const metricsResult = await SystemMetrics.deleteMany({
      timestamp: { $lt: cutoffDate }
    });
    results.systemMetrics = metricsResult.deletedCount;

    console.log(`✅ Limpieza completada: ${results.userActivityLogs} logs y ${results.systemMetrics} métricas eliminados`);
    return results;
  } catch (error) {
    console.error('❌ Error en limpieza de datos:', error);
    throw error;
  }
};

/**
 * Procesamiento completo: Ejecutar todos los procesos
 */
export const runBatchProcessing = async () => {
  try {
    console.log('🚀 Iniciando procesamiento por lotes completo...');
    
    const results = {
      userActivity: null,
      buildingAnalytics: null,
      eventPopularity: null,
      cleanup: null,
      timestamp: new Date()
    };

    // Ejecutar todos los procesos
    results.userActivity = await processDailyUserActivity();
    results.buildingAnalytics = await processBuildingAnalytics();
    results.eventPopularity = await processEventPopularity();
    
    // Limpieza opcional (ejecutar solo una vez a la semana)
    const dayOfWeek = new Date().getDay();
    if (dayOfWeek === 0) { // Domingo
      results.cleanup = await cleanOldData(90);
    }

    console.log('✅ Procesamiento por lotes completado');
    return results;
  } catch (error) {
    console.error('❌ Error en procesamiento por lotes:', error);
    throw error;
  }
};

