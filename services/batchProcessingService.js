// services/batchProcessingService.js
import BuildingAnalytics from '../models/BigData/BuildingAnalytics.js';
import EventAnalytics from '../models/BigData/EventAnalytics.js';

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
 * Procesamiento por lotes: Limpiar datos antiguos de edificios y eventos
 */
export const cleanOldData = async (daysToKeep = 90) => {
  try {
    console.log(`🔵 Limpiando datos más antiguos de ${daysToKeep} días...`);
    
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const results = {
      buildingAnalytics: 0,
      eventAnalytics: 0
    };

    // Limpiar analíticas de edificios antiguas
    const buildingResult = await BuildingAnalytics.deleteMany({
      date: { $lt: cutoffDate }
    });
    results.buildingAnalytics = buildingResult.deletedCount;

    // Limpiar analíticas de eventos antiguas
    const eventResult = await EventAnalytics.deleteMany({
      date: { $lt: cutoffDate }
    });
    results.eventAnalytics = eventResult.deletedCount;

    console.log(`✅ Limpieza completada: ${results.buildingAnalytics} analíticas de edificios y ${results.eventAnalytics} analíticas de eventos eliminadas`);
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
      buildingAnalytics: null,
      eventPopularity: null,
      cleanup: null,
      timestamp: new Date()
    };

    // Ejecutar todos los procesos
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

