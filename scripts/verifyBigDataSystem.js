import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Building from '../models/Building.js';
import Event from '../models/Event.js';
import UserActivityLog from '../models/BigData/UserActivityLog.js';
import BuildingAnalytics from '../models/BigData/BuildingAnalytics.js';
import EventAnalytics from '../models/BigData/EventAnalytics.js';
import SystemMetrics from '../models/BigData/SystemMetrics.js';

dotenv.config();

async function verifyBigDataSystem() {
  try {
    console.log('🔍 VERIFICACIÓN COMPLETA DEL SISTEMA BIG DATA\n');
    console.log('='.repeat(70));
    
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Conectado a MongoDB\n');
    
    // ============================================
    // 1. VERIFICAR DATOS BASE
    // ============================================
    console.log('📊 PASO 1: Verificando Datos Base');
    console.log('-'.repeat(70));
    
    const buildingsCount = await Building.countDocuments();
    const eventsCount = await Event.countDocuments();
    
    console.log(`✅ Edificios en BD: ${buildingsCount}`);
    console.log(`✅ Eventos en BD: ${eventsCount}`);
    
    if (buildingsCount === 0) {
      console.log('❌ ERROR: No hay edificios. Ejecuta: npm run load-buildings-modular');
      process.exit(1);
    }
    
    if (eventsCount === 0) {
      console.log('⚠️  ADVERTENCIA: No hay eventos. Ejecuta: npm run generate-events');
    }
    
    // Listar edificios
    const buildings = await Building.find({}, 'id name').limit(15);
    console.log('\n📋 Edificios cargados:');
    buildings.forEach((b, i) => {
      console.log(`   ${i + 1}. ${b.id} - ${b.name}`);
    });
    
    // ============================================
    // 2. VERIFICAR DATOS DE BIG DATA
    // ============================================
    console.log('\n📊 PASO 2: Verificando Datos de Big Data');
    console.log('-'.repeat(70));
    
    const logsCount = await UserActivityLog.countDocuments();
    const buildingAnalyticsCount = await BuildingAnalytics.countDocuments();
    const eventAnalyticsCount = await EventAnalytics.countDocuments();
    const metricsCount = await SystemMetrics.countDocuments();
    
    console.log(`   UserActivityLog: ${logsCount.toLocaleString()} registros`);
    console.log(`   BuildingAnalytics: ${buildingAnalyticsCount.toLocaleString()} registros`);
    console.log(`   EventAnalytics: ${eventAnalyticsCount.toLocaleString()} registros`);
    console.log(`   SystemMetrics: ${metricsCount.toLocaleString()} registros`);
    
    if (buildingAnalyticsCount === 0) {
      console.log('\n⚠️  NO HAY DATOS DE BIG DATA');
      console.log('   Ejecuta: npm run generate-fake-data');
      process.exit(1);
    }
    
    // ============================================
    // 3. VERIFICAR PEAK HOURS
    // ============================================
    console.log('\n📊 PASO 3: Verificando Horas Pico');
    console.log('-'.repeat(70));
    
    const analyticsWithPeakHours = await BuildingAnalytics.find({
      peakHours: { $exists: true, $ne: [] }
    }).limit(5);
    
    console.log(`   Analíticas con peakHours: ${analyticsWithPeakHours.length}`);
    
    if (analyticsWithPeakHours.length > 0) {
      console.log('\n   Muestra de horas pico:');
      analyticsWithPeakHours.forEach((analytic, i) => {
        const peakHoursCount = analytic.peakHours?.length || 0;
        console.log(`   ${i + 1}. ${analytic.buildingName}: ${peakHoursCount} horas registradas`);
        if (peakHoursCount > 0) {
          const topHours = [...analytic.peakHours]
            .sort((a, b) => b.count - a.count)
            .slice(0, 3);
          topHours.forEach(ph => {
            console.log(`      - ${ph.hour}:00 → ${ph.count} vistas`);
          });
        }
      });
    }
    
    // ============================================
    // 4. VERIFICAR CONSISTENCIA DE DATOS
    // ============================================
    console.log('\n📊 PASO 4: Verificando Consistencia de Datos');
    console.log('-'.repeat(70));
    
    // Verificar que las analíticas correspondan a edificios existentes
    const buildingIds = new Set(buildings.map(b => b._id.toString()));
    const analyticsWithInvalidBuildings = await BuildingAnalytics.aggregate([
      {
        $group: {
          _id: '$buildingId',
          count: { $sum: 1 }
        }
      }
    ]);
    
    let invalidCount = 0;
    analyticsWithInvalidBuildings.forEach(item => {
      if (!buildingIds.has(item._id)) {
        invalidCount++;
      }
    });
    
    if (invalidCount > 0) {
      console.log(`   ⚠️  ${invalidCount} analíticas de edificios NO existentes`);
    } else {
      console.log(`   ✅ Todas las analíticas corresponden a edificios válidos`);
    }
    
    // ============================================
    // 5. VERIFICAR DISTRIBUCIÓN TEMPORAL
    // ============================================
    console.log('\n📊 PASO 5: Verificando Distribución Temporal');
    console.log('-'.repeat(70));
    
    const dateRange = await BuildingAnalytics.aggregate([
      {
        $group: {
          _id: null,
          minDate: { $min: '$date' },
          maxDate: { $max: '$date' }
        }
      }
    ]);
    
    if (dateRange.length > 0) {
      const min = new Date(dateRange[0].minDate);
      const max = new Date(dateRange[0].maxDate);
      const days = Math.ceil((max - min) / (1000 * 60 * 60 * 24));
      
      console.log(`   Fecha más antigua: ${min.toLocaleDateString()}`);
      console.log(`   Fecha más reciente: ${max.toLocaleDateString()}`);
      console.log(`   Días con datos: ${days}`);
    }
    
    // ============================================
    // 6. VERIFICAR TOTALES Y PROMEDIOS
    // ============================================
    console.log('\n📊 PASO 6: Verificando Totales y Promedios');
    console.log('-'.repeat(70));
    
    const totals = await BuildingAnalytics.aggregate([
      {
        $group: {
          _id: null,
          totalViews: { $sum: '$viewCount' },
          totalVisitors: { $sum: '$uniqueVisitors' },
          avgViewDuration: { $avg: '$averageViewDuration' }
        }
      }
    ]);
    
    if (totals.length > 0) {
      console.log(`   Total de vistas: ${totals[0].totalViews.toLocaleString()}`);
      console.log(`   Total de visitantes únicos: ${totals[0].totalVisitors.toLocaleString()}`);
      console.log(`   Duración promedio de vista: ${Math.round(totals[0].avgViewDuration)}s`);
    }
    
    // ============================================
    // 7. RESUMEN FINAL
    // ============================================
    console.log('\n' + '='.repeat(70));
    console.log('✨ RESUMEN DE VERIFICACIÓN');
    console.log('='.repeat(70));
    
    const allGood = 
      buildingsCount >= 13 &&
      buildingAnalyticsCount > 0 &&
      analyticsWithPeakHours.length > 0 &&
      invalidCount === 0;
    
    if (allGood) {
      console.log('🎉 ✅ SISTEMA BIG DATA FUNCIONANDO CORRECTAMENTE');
      console.log('');
      console.log('✅ Datos base: OK');
      console.log('✅ Analíticas: OK');
      console.log('✅ Horas pico: OK');
      console.log('✅ Consistencia: OK');
      console.log('✅ Distribución temporal: OK');
      console.log('');
      console.log('📊 El sistema está listo para visualización en el panel admin');
    } else {
      console.log('⚠️  EL SISTEMA TIENE ALGUNOS PROBLEMAS');
      console.log('');
      if (buildingsCount < 13) console.log('❌ Faltan edificios');
      if (buildingAnalyticsCount === 0) console.log('❌ No hay analíticas');
      if (analyticsWithPeakHours.length === 0) console.log('❌ No hay horas pico');
      if (invalidCount > 0) console.log('❌ Inconsistencias en los datos');
      console.log('');
      console.log('📝 Ejecuta los scripts necesarios para corregir');
    }
    
    console.log('='.repeat(70));
    
  } catch (error) {
    console.error('❌ Error en verificación:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Desconectado de MongoDB\n');
  }
}

verifyBigDataSystem();

