import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

async function testPeakHoursEndpoint() {
  try {
    console.log('🧪 PROBANDO ENDPOINT DE PEAK HOURS\n');
    console.log('='.repeat(60));
    
    const baseURL = process.env.BASE_URL || 'http://localhost:4000';
    const endpoint = `${baseURL}/api/bigdata/buildings/peak-hours`;
    
    console.log(`📍 Endpoint: ${endpoint}`);
    console.log('⏳ Realizando petición...\n');
    
    // Nota: Este endpoint requiere autenticación
    // Si falla por autenticación, debes usar el token de un admin
    
    const response = await axios.get(endpoint, {
      params: {
        limit: 5 // Solo los primeros 5 para ver resultado
      },
      validateStatus: () => true // Aceptar cualquier status para ver el error
    });
    
    console.log(`📊 Status: ${response.status}`);
    
    if (response.status === 401 || response.status === 403) {
      console.log('\n⚠️  REQUIERE AUTENTICACIÓN');
      console.log('Este endpoint requiere token de administrador.');
      console.log('\n📝 Para probarlo desde el navegador:');
      console.log('   1. Inicia el backend: npm run dev');
      console.log('   2. Abre el panel admin: http://localhost:5173');
      console.log('   3. Inicia sesión como admin');
      console.log('   4. Desde la consola del navegador, ejecuta:');
      console.log(`   fetch('${endpoint}?limit=5', {`);
      console.log(`     headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }`);
      console.log('   }).then(r => r.json()).then(console.log)');
      return;
    }
    
    if (response.status === 200) {
      console.log('✅ RESPUESTA EXITOSA\n');
      console.log(JSON.stringify(response.data, null, 2));
      
      if (response.data.success && response.data.data.length > 0) {
        console.log('\n📊 RESUMEN:');
        console.log(`   - Edificios con datos: ${response.data.data.length}`);
        response.data.data.forEach((building, index) => {
          console.log(`   ${index + 1}. ${building.buildingName}`);
          console.log(`      - Total vistas: ${building.totalViews}`);
          console.log(`      - Horas pico registradas: ${building.peakHours?.length || 0}`);
        });
      }
    } else {
      console.log('❌ ERROR EN RESPUESTA\n');
      console.log(JSON.stringify(response.data, null, 2));
    }
    
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.log('❌ NO SE PUDO CONECTAR AL BACKEND\n');
      console.log('📝 Solución:');
      console.log('   1. Verifica que el backend esté corriendo');
      console.log('   2. Ejecuta: npm run dev');
      console.log('   3. Espera a que se inicie completamente');
      console.log('   4. Vuelve a ejecutar este script\n');
    } else {
      console.log('❌ ERROR:', error.message);
    }
  }
}

testPeakHoursEndpoint();

