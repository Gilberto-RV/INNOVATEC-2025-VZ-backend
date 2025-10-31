// jobs/batchProcessor.js
import cron from 'node-cron';
import * as batchService from '../services/batchProcessingService.js';

/**
 * Programar tareas de procesamiento por lotes
 * 
 * Horarios:
 * - Procesamiento diario: Todos los días a las 2:00 AM
 * - Limpieza semanal: Domingos a las 3:00 AM
 */

// Procesamiento diario a las 2:00 AM
const dailyProcessingJob = cron.schedule('0 2 * * *', async () => {
  console.log('⏰ Ejecutando procesamiento diario programado...');
  try {
    await batchService.runBatchProcessing();
    console.log('✅ Procesamiento diario completado exitosamente');
  } catch (error) {
    console.error('❌ Error en procesamiento diario programado:', error);
  }
}, {
  scheduled: false, // No iniciar automáticamente, se debe iniciar manualmente
  timezone: "America/Caracas"
});

// Limpieza semanal los domingos a las 3:00 AM
const weeklyCleanupJob = cron.schedule('0 3 * * 0', async () => {
  console.log('⏰ Ejecutando limpieza semanal programada...');
  try {
    await batchService.cleanOldData(90);
    console.log('✅ Limpieza semanal completada exitosamente');
  } catch (error) {
    console.error('❌ Error en limpieza semanal programada:', error);
  }
}, {
  scheduled: false,
  timezone: "America/Caracas"
});

/**
 * Iniciar todos los trabajos programados
 */
export const startScheduledJobs = () => {
  dailyProcessingJob.start();
  weeklyCleanupJob.start();
  console.log('✅ Trabajos de procesamiento por lotes iniciados');
  console.log('   - Procesamiento diario: 2:00 AM');
  console.log('   - Limpieza semanal: Domingos 3:00 AM');
};

/**
 * Detener todos los trabajos programados
 */
export const stopScheduledJobs = () => {
  dailyProcessingJob.stop();
  weeklyCleanupJob.stop();
  console.log('⏸️ Trabajos de procesamiento por lotes detenidos');
};

// Exportar los trabajos individuales por si se necesitan controlar por separado
export { dailyProcessingJob, weeklyCleanupJob };

