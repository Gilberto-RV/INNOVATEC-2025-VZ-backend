// scripts/verifyDataConsistency.js
/**
 * Script para verificar la consistencia entre eventos/calendario y Big Data
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Event from '../models/Event.js';
import Building from '../models/Building.js';
import EventAnalytics from '../models/BigData/EventAnalytics.js';
import BuildingAnalytics from '../models/BigData/BuildingAnalytics.js';
import UserActivityLog from '../models/BigData/UserActivityLog.js';

dotenv.config();

async function verifyDataConsistency() {
  try {
    console.log('🔍 Verificando consistencia de datos...\n');
    
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Conectado a MongoDB\n');
    
    // 1. Verificar eventos
    console.log('📅 Verificando eventos...');
    const events = await Event.find();
    console.log(`   Total eventos en la base de datos: ${events.length}`);
    
    const eventAnalytics = await EventAnalytics.find();
    const uniqueEventIdsInAnalytics = new Set(
      eventAnalytics.map(a => a.eventId?.toString())
    );
    const uniqueEventIdsInEvents = new Set(
      events.map(e => e._id.toString())
    );
    
    // Eventos sin analíticas
    const eventsWithoutAnalytics = events.filter(
      e => !uniqueEventIdsInAnalytics.has(e._id.toString())
    );
    
    // Analíticas sin eventos
    const analyticsWithoutEvents = eventAnalytics.filter(
      a => !uniqueEventIdsInEvents.has(a.eventId?.toString())
    );
    
    console.log(`   - Eventos con analíticas: ${uniqueEventIdsInAnalytics.size}`);
    console.log(`   - Eventos sin analíticas: ${eventsWithoutAnalytics.length}`);
    if (eventsWithoutAnalytics.length > 0) {
      console.log(`     ⚠️  Eventos sin analíticas: ${eventsWithoutAnalytics.map(e => e.title).join(', ')}`);
    }
    console.log(`   - Analíticas sin eventos asociados: ${analyticsWithoutEvents.length}`);
    if (analyticsWithoutEvents.length > 0) {
      console.log(`     ⚠️  Esto puede ser normal si son datos ficticios de eventos eliminados`);
    }
    
    // 2. Verificar edificios
    console.log('\n🏢 Verificando edificios...');
    const buildings = await Building.find();
    console.log(`   Total edificios en la base de datos: ${buildings.length}`);
    
    const buildingAnalytics = await BuildingAnalytics.find();
    const uniqueBuildingIdsInAnalytics = new Set(
      buildingAnalytics.map(a => a.buildingId?.toString())
    );
    const uniqueBuildingIdsInBuildings = new Set(
      buildings.map(b => b._id?.toString())
    );
    
    const buildingsWithoutAnalytics = buildings.filter(
      b => !uniqueBuildingIdsInAnalytics.has(b._id?.toString())
    );
    
    const analyticsWithoutBuildings = buildingAnalytics.filter(
      a => !uniqueBuildingIdsInBuildings.has(a.buildingId?.toString())
    );
    
    console.log(`   - Edificios con analíticas: ${uniqueBuildingIdsInAnalytics.size}`);
    console.log(`   - Edificios sin analíticas: ${buildingsWithoutAnalytics.length}`);
    if (buildingsWithoutAnalytics.length > 0) {
      console.log(`     ⚠️  Edificios sin analíticas: ${buildingsWithoutAnalytics.map(b => b.name).join(', ')}`);
    }
    console.log(`   - Analíticas sin edificios asociados: ${analyticsWithoutBuildings.length}`);
    if (analyticsWithoutBuildings.length > 0) {
      console.log(`     ⚠️  Esto puede ser normal si son datos ficticios de edificios eliminados`);
    }
    
    // 3. Verificar eventos en edificios asignados
    console.log('\n🔗 Verificando relaciones eventos-edificios...');
    let eventsWithInvalidBuildings = 0;
    for (const event of events) {
      if (event.building_assigned && event.building_assigned.length > 0) {
        for (const buildingId of event.building_assigned) {
          const building = await Building.findById(buildingId);
          if (!building) {
            eventsWithInvalidBuildings++;
            console.log(`     ⚠️  Evento "${event.title}" tiene edificio asignado que no existe: ${buildingId}`);
          }
        }
      }
    }
    if (eventsWithInvalidBuildings === 0) {
      console.log('   ✅ Todos los eventos tienen edificios válidos asignados');
    }
    
    // 4. Verificar actividad de usuarios
    console.log('\n👥 Verificando actividad de usuarios...');
    const userLogs = await UserActivityLog.find();
    console.log(`   Total logs de actividad: ${userLogs.length}`);
    
    const logsByAction = {};
    userLogs.forEach(log => {
      logsByAction[log.action] = (logsByAction[log.action] || 0) + 1;
    });
    
    console.log('   Distribución por acción:');
    Object.entries(logsByAction).forEach(([action, count]) => {
      console.log(`     - ${action}: ${count}`);
    });
    
    // 5. Resumen
    console.log('\n📊 Resumen de consistencia:');
    const totalIssues = eventsWithoutAnalytics.length + analyticsWithoutEvents.length + 
                       buildingsWithoutAnalytics.length + analyticsWithoutBuildings.length + 
                       eventsWithInvalidBuildings;
    
    if (totalIssues === 0) {
      console.log('   ✅ Todos los datos son consistentes');
    } else {
      console.log(`   ⚠️  Se encontraron ${totalIssues} posibles inconsistencias`);
      console.log('   Nota: Algunas inconsistencias pueden ser normales si hay datos ficticios');
    }
    
  } catch (error) {
    console.error('❌ Error verificando consistencia:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('\n👋 Conexión cerrada');
  }
}

verifyDataConsistency();

