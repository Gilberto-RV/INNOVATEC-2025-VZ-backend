import mongoose from 'mongoose';
import dotenv from 'dotenv';
import BuildingAnalytics from '../models/BigData/BuildingAnalytics.js';

dotenv.config();

async function verifyPeakHours() {
  try {
    console.log('🔍 VERIFICANDO DATOS DE HORAS PICO\n');
    console.log('='.repeat(60));
    
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Conectado a MongoDB\n');
    
    // Obtener una muestra de analíticas con peakHours
    const analytics = await BuildingAnalytics.find()
      .sort({ date: -1 })
      .limit(5);
    
    if (analytics.length === 0) {
      console.log('❌ No hay analíticas en la base de datos');
      console.log('   Ejecuta: npm run generate-fake-data\n');
      process.exit(1);
    }
    
    console.log(`📊 Total de analíticas: ${await BuildingAnalytics.countDocuments()}`);
    console.log(`\n📋 Mostrando últimas 5 analíticas:\n`);
    
    let hasValidPeakHours = false;
    
    analytics.forEach((analytic, index) => {
      console.log(`${index + 1}. ${analytic.buildingName} - ${analytic.date.toLocaleDateString()}`);
      console.log(`   Views: ${analytic.viewCount}`);
      console.log(`   Peak Hours: ${analytic.peakHours?.length || 0} horas registradas`);
      
      if (analytic.peakHours && analytic.peakHours.length > 0) {
        hasValidPeakHours = true;
        console.log(`   Horas con más actividad:`);
        
        // Mostrar top 5 horas
        const topHours = [...analytic.peakHours]
          .sort((a, b) => b.count - a.count)
          .slice(0, 5);
        
        topHours.forEach(ph => {
          const hourStr = `${ph.hour}:00`.padStart(5, ' ');
          console.log(`     ${hourStr} - ${ph.count} vistas`);
        });
      } else {
        console.log(`   ⚠️  NO tiene datos de peakHours`);
      }
      console.log('');
    });
    
    console.log('='.repeat(60));
    
    if (hasValidPeakHours) {
      console.log('✅ Los datos de peakHours están en MongoDB\n');
      console.log('📝 Siguiente paso: Verificar que el backend los esté devolviendo');
      console.log('   Revisa: /api/bigdata/buildings/analytics');
    } else {
      console.log('❌ NO hay datos de peakHours en MongoDB\n');
      console.log('📝 Solución: Regenera los datos con:');
      console.log('   npm run generate-fake-data:clear');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Desconectado\n');
  }
}

verifyPeakHours();

