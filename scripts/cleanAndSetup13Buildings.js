import mongoose from 'mongoose';
import dotenv from 'dotenv';
import UserActivityLog from '../models/BigData/UserActivityLog.js';
import BuildingAnalytics from '../models/BigData/BuildingAnalytics.js';
import EventAnalytics from '../models/BigData/EventAnalytics.js';
import SystemMetrics from '../models/BigData/SystemMetrics.js';
import Event from '../models/Event.js';
import Building from '../models/Building.js';

dotenv.config();

// Los 13 edificios válidos con conexiones y entradas
const SELECTED_BUILDINGS = [
  'E-12', 'E-13', 'E-14', 'E-16', 'E-18', 
  'E-19', 'E-20', 'E-21', 'E-23', 'E-25', 
  'E-26', 'E-27', 'E-27-B'
];

async function cleanAndSetupDatabase() {
  try {
    console.log('🧹 LIMPIEZA TOTAL Y CONFIGURACIÓN DE 13 EDIFICIOS\n');
    console.log('='.repeat(60));
    
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Conectado a MongoDB\n');
    
    // ==========================================
    // PASO 1: LIMPIEZA TOTAL
    // ==========================================
    console.log('📍 PASO 1: Limpieza Total de Base de Datos');
    console.log('-'.repeat(60));
    
    // 1.1 Eliminar TODOS los logs de actividad
    const deletedLogs = await UserActivityLog.deleteMany({});
    console.log(`🗑️  UserActivityLog eliminados: ${deletedLogs.deletedCount}`);
    
    // 1.2 Eliminar TODAS las analíticas de edificios
    const deletedBuildingAnalytics = await BuildingAnalytics.deleteMany({});
    console.log(`🗑️  BuildingAnalytics eliminados: ${deletedBuildingAnalytics.deletedCount}`);
    
    // 1.3 Eliminar TODOS los eventos
    const deletedEvents = await Event.deleteMany({});
    console.log(`🗑️  Eventos eliminados: ${deletedEvents.deletedCount}`);
    
    // 1.4 Eliminar TODAS las analíticas de eventos
    const deletedEventAnalytics = await EventAnalytics.deleteMany({});
    console.log(`🗑️  EventAnalytics eliminados: ${deletedEventAnalytics.deletedCount}`);
    
    // 1.5 Eliminar TODAS las métricas del sistema
    const deletedMetrics = await SystemMetrics.deleteMany({});
    console.log(`🗑️  SystemMetrics eliminados: ${deletedMetrics.deletedCount}`);
    
    // 1.6 Eliminar TODOS los edificios
    const deletedBuildings = await Building.deleteMany({});
    console.log(`🗑️  Buildings eliminados: ${deletedBuildings.deletedCount}`);
    
    console.log('\n✅ Limpieza completada - Base de datos vacía');
    
    // ==========================================
    // PASO 2: VERIFICACIÓN
    // ==========================================
    console.log('\n📍 PASO 2: Verificación de Limpieza');
    console.log('-'.repeat(60));
    
    const counts = {
      buildings: await Building.countDocuments(),
      events: await Event.countDocuments(),
      logs: await UserActivityLog.countDocuments(),
      buildingAnalytics: await BuildingAnalytics.countDocuments(),
      eventAnalytics: await EventAnalytics.countDocuments(),
      metrics: await SystemMetrics.countDocuments()
    };
    
    console.log('Conteo actual:');
    console.log(`  Buildings: ${counts.buildings}`);
    console.log(`  Events: ${counts.events}`);
    console.log(`  UserActivityLog: ${counts.logs}`);
    console.log(`  BuildingAnalytics: ${counts.buildingAnalytics}`);
    console.log(`  EventAnalytics: ${counts.eventAnalytics}`);
    console.log(`  SystemMetrics: ${counts.metrics}`);
    
    const allZero = Object.values(counts).every(c => c === 0);
    if (allZero) {
      console.log('\n✅ Verificación exitosa - Todas las colecciones están vacías');
    } else {
      console.log('\n⚠️  ADVERTENCIA: Algunas colecciones no están vacías');
    }
    
    // ==========================================
    // PASO 3: INFORMACIÓN
    // ==========================================
    console.log('\n📍 PASO 3: Siguientes Pasos');
    console.log('-'.repeat(60));
    console.log('');
    console.log('✅ Base de datos lista para los 13 edificios:');
    SELECTED_BUILDINGS.forEach((id, index) => {
      console.log(`   ${index + 1}. ${id}`);
    });
    console.log('');
    console.log('📝 Ejecuta los siguientes comandos en orden:');
    console.log('   1. npm run load-buildings-modular  (cargar los 13 edificios)');
    console.log('   2. npm run generate-events         (crear eventos de ejemplo)');
    console.log('   3. npm run generate-fake-data      (generar datos sintéticos)');
    console.log('');
    console.log('='.repeat(60));
    
  } catch (error) {
    console.error('❌ Error en limpieza:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Desconectado de MongoDB');
  }
}

cleanAndSetupDatabase();

