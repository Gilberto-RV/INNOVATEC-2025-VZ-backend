// controllers/bigData/bigDataController.js
import * as bigDataService from '../../services/bigDataService.js';
import * as batchService from '../../services/batchProcessingService.js';

/**
 * Obtener dashboard general de Big Data
 */
export const getDashboardStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    // Obtener estadísticas de edificios y eventos
    const [buildingStats, eventStats] = await Promise.all([
      bigDataService.getBuildingStats({ startDate, endDate }),
      bigDataService.getEventStats({ startDate, endDate })
    ]);

    res.json({
      success: true,
      data: {
        buildings: buildingStats,
        events: eventStats,
        period: {
          startDate: startDate || null,
          endDate: endDate || null
        }
      }
    });
  } catch (error) {
    console.error('Error al obtener estadísticas del dashboard:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener estadísticas',
      error: error.message
    });
  }
};


/**
 * Obtener estadísticas de edificios
 */
export const getBuildingStats = async (req, res) => {
  try {
    const { startDate, endDate, buildingId } = req.query;
    
    const stats = await bigDataService.getBuildingStats({
      startDate,
      endDate,
      buildingId
    });

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error al obtener estadísticas de edificios:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener estadísticas de edificios',
      error: error.message
    });
  }
};

/**
 * Obtener horas pico de edificios
 */
export const getBuildingPeakHours = async (req, res) => {
  try {
    const { startDate, endDate, buildingId, limit } = req.query;
    
    const peakHoursData = await bigDataService.getBuildingPeakHours({
      startDate,
      endDate,
      buildingId,
      limit
    });

    res.json({
      success: true,
      data: peakHoursData
    });
  } catch (error) {
    console.error('Error al obtener horas pico:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener horas pico',
      error: error.message
    });
  }
};

/**
 * Obtener estadísticas de eventos
 */
export const getEventStats = async (req, res) => {
  try {
    const { startDate, endDate, status } = req.query;
    
    const stats = await bigDataService.getEventStats({
      startDate,
      endDate,
      status
    });

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error al obtener estadísticas de eventos:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener estadísticas de eventos',
      error: error.message
    });
  }
};

/**
 * Ejecutar procesamiento por lotes manualmente (solo admin)
 */
export const runBatchProcessing = async (req, res) => {
  try {
    console.log('📊 Ejecutando procesamiento por lotes desde API...');
    const results = await batchService.runBatchProcessing();

    res.json({
      success: true,
      message: 'Procesamiento por lotes completado',
      data: results
    });
  } catch (error) {
    console.error('Error en procesamiento por lotes:', error);
    res.status(500).json({
      success: false,
      message: 'Error al ejecutar procesamiento por lotes',
      error: error.message
    });
  }
};

