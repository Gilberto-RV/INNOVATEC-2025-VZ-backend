// scripts/generateSampleEvents.js
/**
 * Script para generar eventos de ejemplo en la base de datos
 * Estos eventos coincidirán con las analíticas de Big Data
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Event from '../models/Event.js';
import Building from '../models/Building.js';

dotenv.config();

const EVENT_TITLES = [
  'Conferencia de Tecnología',
  'Taller de Programación',
  'Seminario de Investigación',
  'Exposición de Proyectos',
  'Concurso de Hackathon',
  'Charla de Emprendimiento',
  'Workshop de Diseño',
  'Presentación de Tesis',
  'Feria de Ciencias',
  'Festival Cultural',
  'Torneo Deportivo',
  'Encuentro de Egresados',
  'Conferencia de Inteligencia Artificial',
  'Taller de Robótica',
  'Seminario de Innovación',
  'Exposición de Arte',
  'Concurso de Matemáticas',
  'Charla de Liderazgo',
  'Workshop de Marketing Digital',
  'Presentación de Investigación'
];

const EVENT_DESCRIPTIONS = [
  'Una conferencia sobre las últimas tendencias en tecnología',
  'Taller práctico de programación para estudiantes',
  'Seminario sobre investigación académica',
  'Exposición de proyectos estudiantiles',
  'Concurso de desarrollo de aplicaciones',
  'Charla sobre emprendimiento y startups',
  'Workshop de diseño gráfico y UX/UI',
  'Presentación de tesis de grado',
  'Feria científica con proyectos de estudiantes',
  'Festival cultural con actividades diversas',
  'Torneo deportivo interuniversitario',
  'Encuentro de egresados y networking',
  'Conferencia sobre IA y machine learning',
  'Taller práctico de robótica',
  'Seminario sobre innovación empresarial',
  'Exposición de arte y cultura',
  'Concurso de resolución de problemas matemáticos',
  'Charla sobre liderazgo y desarrollo personal',
  'Workshop de marketing digital y redes sociales',
  'Presentación de investigaciones académicas'
];

const EVENT_STATUSES = ['programado', 'en_curso', 'finalizado', 'cancelado'];
const ORGANIZERS = [
  'Departamento de Ingeniería',
  'Facultad de Ciencias',
  'Dirección de Extensión',
  'Asociación de Estudiantes',
  'Comité de Eventos',
  'Departamento de Humanidades',
  'Facultad de Administración'
];

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomChoice(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function randomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

async function generateSampleEvents() {
  try {
    console.log('🚀 Generando eventos de ejemplo...\n');
    
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Conectado a MongoDB\n');
    
    // Obtener edificios disponibles
    const buildings = await Building.find();
    if (buildings.length === 0) {
      console.log('⚠️  No hay edificios en la base de datos. Ejecuta primero: npm run load-buildings');
      process.exit(1);
    }
    
    console.log(`📦 Encontrados ${buildings.length} edificios disponibles\n`);
    
    // Verificar eventos existentes
    const existingEvents = await Event.find();
    console.log(`📅 Eventos existentes: ${existingEvents.length}`);
    
    // Generar eventos
    const eventsToCreate = [];
    const now = new Date();
    const startDate = new Date(now);
    startDate.setDate(startDate.getDate() - 60); // 60 días atrás
    const endDate = new Date(now);
    endDate.setDate(endDate.getDate() + 30); // 30 días adelante
    
    // Crear entre 15 y 25 eventos
    const numEvents = randomInt(15, 25);
    
    for (let i = 0; i < numEvents; i++) {
      const title = EVENT_TITLES[i % EVENT_TITLES.length];
      const description = EVENT_DESCRIPTIONS[i % EVENT_DESCRIPTIONS.length];
      
      // Asignar fecha aleatoria en el rango
      const dateTime = randomDate(startDate, endDate);
      
      // Determinar estado basado en la fecha
      let status = 'programado';
      if (dateTime < now) {
        // Si la fecha ya pasó, puede estar finalizado o cancelado
        status = randomChoice(['finalizado', 'cancelado']);
      } else if (dateTime.getTime() - now.getTime() < 24 * 60 * 60 * 1000) {
        // Si es en menos de 24 horas, puede estar en curso
        status = randomChoice(['programado', 'en_curso']);
      }
      
      // Asignar edificio aleatorio
      const building = randomChoice(buildings);
      
      eventsToCreate.push({
        title: `${title} ${i > EVENT_TITLES.length - 1 ? `- ${Math.floor(i / EVENT_TITLES.length) + 1}` : ''}`,
        description,
        building_assigned: [building._id],
        classroom: `Aula ${randomInt(100, 500)}`,
        date_time: dateTime,
        organizer: randomChoice(ORGANIZERS),
        category: [],
        status,
        media: null
      });
    }
    
    // Insertar eventos
    console.log(`📝 Creando ${eventsToCreate.length} eventos...\n`);
    const createdEvents = await Event.insertMany(eventsToCreate, { ordered: false });
    
    console.log('✅ Eventos creados exitosamente!\n');
    console.log('📊 Resumen:');
    console.log(`   - Total eventos creados: ${createdEvents.length}`);
    
    // Contar por estado
    const statusCount = {};
    createdEvents.forEach(event => {
      statusCount[event.status] = (statusCount[event.status] || 0) + 1;
    });
    
    console.log('   - Distribución por estado:');
    Object.entries(statusCount).forEach(([status, count]) => {
      console.log(`     • ${status}: ${count}`);
    });
    
    // Mostrar algunos eventos creados
    console.log('\n📋 Algunos eventos creados:');
    createdEvents.slice(0, 5).forEach(event => {
      const buildingName = buildings.find(b => b._id === event.building_assigned[0])?.name || 'N/A';
      console.log(`   - ${event.title} (${buildingName}) - ${event.date_time.toLocaleDateString()}`);
    });
    
    const totalEvents = await Event.countDocuments();
    console.log(`\n📦 Total de eventos en la base de datos: ${totalEvents}\n`);
    
    console.log('💡 Nota: Si quieres regenerar las analíticas de Big Data para estos eventos, ejecuta:');
    console.log('   npm run generate-fake-data:clear\n');
    
  } catch (error) {
    console.error('❌ Error generando eventos:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('👋 Conexión cerrada');
  }
}

generateSampleEvents();

