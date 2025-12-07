// scripts/generateFakeBigData.js
/**
 * Script para generar datos ficticios de Big Data
 * 
 * Genera datos históricos realistas para:
 * - UserActivityLog
 * - BuildingAnalytics
 * - EventAnalytics
 * - SystemMetrics
 * 
 * Uso: node scripts/generateFakeBigData.js [--days=30] [--clear]
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import UserActivityLog from '../models/BigData/UserActivityLog.js';
import BuildingAnalytics from '../models/BigData/BuildingAnalytics.js';
import EventAnalytics from '../models/BigData/EventAnalytics.js';
import SystemMetrics from '../models/BigData/SystemMetrics.js';
import Building from '../models/Building.js';
import Event from '../models/Event.js';
import Auth from '../models/Auth.js';

dotenv.config();

// Configuración
const DAYS_TO_GENERATE = process.argv.find(arg => arg.startsWith('--days=')) 
  ? parseInt(process.argv.find(arg => arg.startsWith('--days=')).split('=')[1]) 
  : 30;

const CLEAR_EXISTING = process.argv.includes('--clear');

// Datos ficticios predefinidos
const FAKE_USER_IDS = [];
const FAKE_BUILDING_IDS = [];
const FAKE_EVENT_IDS = [];

// Roles y acciones posibles
const USER_ROLES = ['estudiante', 'profesor', 'administrador'];
const ACTIONS = [
  'login',
  'logout',
  'view_building',
  'view_event',
  'search_building',
  'create_event',
  'update_event',
  'delete_event',
  'view_profile',
  'update_profile'
];

const DEVICE_TYPES = ['mobile', 'desktop', 'tablet', 'unknown'];
const DAYS_OF_WEEK = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'];
const EVENT_STATUSES = ['programado', 'en_curso', 'finalizado', 'cancelado'];

// Funciones auxiliares
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFloat(min, max) {
  return Math.random() * (max - min) + min;
}

function randomChoice(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function randomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

// Función para obtener peso de actividad según hora del día
function getActivityWeight(hour) {
  // Más actividad entre 8 AM y 6 PM
  if (hour >= 8 && hour < 18) {
    return randomFloat(0.7, 1.0);
  } else if (hour >= 18 && hour < 22) {
    return randomFloat(0.4, 0.7);
  } else {
    return randomFloat(0.1, 0.4);
  }
}

// Función para obtener peso según día de la semana
function getDayWeight(dayOfWeek) {
  // Menos actividad los domingos y sábados
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    return randomFloat(0.3, 0.6);
  }
  return randomFloat(0.7, 1.0);
}

async function loadRealData() {
  console.log('📊 Cargando datos reales de la base de datos...');
  
  try {
    // Cargar usuarios reales
    const users = await Auth.find().limit(50).select('_id email role');
    if (users.length > 0) {
      FAKE_USER_IDS.push(...users.map(u => ({
        id: u._id,
        email: u.email || `user${u._id}@innovatec.edu`,
        role: u.role || randomChoice(USER_ROLES)
      })));
      console.log(`✅ Cargados ${users.length} usuarios reales`);
    }
    
    // Crear usuarios ficticios si no hay suficientes
    while (FAKE_USER_IDS.length < 30) {
      const fakeId = new mongoose.Types.ObjectId();
      FAKE_USER_IDS.push({
        id: fakeId,
        email: `estudiante${FAKE_USER_IDS.length}@innovatec.edu`,
        role: randomChoice(USER_ROLES)
      });
    }
    
    // Cargar edificios reales
    const buildings = await Building.find().limit(20).select('_id name');
    if (buildings.length > 0) {
      FAKE_BUILDING_IDS.push(...buildings.map(b => ({
        id: b._id,
        name: b.name || `Edificio ${b._id}`
      })));
      console.log(`✅ Cargados ${buildings.length} edificios reales`);
    }
    
    // Crear edificios ficticios si no hay suficientes
    const buildingNames = [
      'Edificio A - Ciencias', 'Edificio B - Ingeniería', 'Edificio C - Administración',
      'Edificio D - Humanidades', 'Edificio E - Biblioteca', 'Edificio F - Laboratorios',
      'Edificio G - Auditorios', 'Edificio H - Deportes', 'Edificio I - Cafetería',
      'Edificio J - Servicios'
    ];
    
    while (FAKE_BUILDING_IDS.length < 10) {
      FAKE_BUILDING_IDS.push({
        id: `B${String(FAKE_BUILDING_IDS.length + 1).padStart(3, '0')}`,
        name: buildingNames[FAKE_BUILDING_IDS.length] || `Edificio ${FAKE_BUILDING_IDS.length + 1}`
      });
    }
    
    // Cargar eventos reales
    const events = await Event.find().limit(50).select('_id title building_assigned category status date_time');
    if (events.length > 0) {
      FAKE_EVENT_IDS.push(...events.map(e => ({
        id: e._id,
        title: e.title || `Evento ${e._id}`,
        buildingId: e.building_assigned?.[0] || (FAKE_BUILDING_IDS.length > 0 ? randomChoice(FAKE_BUILDING_IDS).id : null),
        category: e.category || [],
        status: e.status || randomChoice(EVENT_STATUSES),
        date_time: e.date_time || new Date()
      })));
      console.log(`✅ Cargados ${events.length} eventos reales`);
    }
    
    // Solo crear eventos ficticios en memoria si no hay suficientes eventos reales
    // NOTA: No creamos eventos ficticios reales en la BD, solo usamos los existentes
    if (FAKE_EVENT_IDS.length < 5 && FAKE_BUILDING_IDS.length > 0) {
      console.log(`⚠️  Solo hay ${FAKE_EVENT_IDS.length} eventos reales. Considera ejecutar: npm run generate-events`);
      const eventTitles = [
        'Conferencia de Tecnología', 'Taller de Programación', 'Seminario de Investigación',
        'Exposición de Proyectos', 'Concurso de Hackathon', 'Charla de Emprendimiento',
        'Workshop de Diseño', 'Presentación de Tesis', 'Feria de Ciencias',
        'Festival Cultural', 'Torneo Deportivo', 'Encuentro de Egresados'
      ];
      
      // Solo crear IDs ficticios en memoria para las analíticas, no eventos reales
      while (FAKE_EVENT_IDS.length < Math.min(20, eventTitles.length)) {
        FAKE_EVENT_IDS.push({
          id: new mongoose.Types.ObjectId(),
          title: eventTitles[FAKE_EVENT_IDS.length] || `Evento ${FAKE_EVENT_IDS.length + 1}`,
          buildingId: randomChoice(FAKE_BUILDING_IDS).id,
          category: [],
          status: randomChoice(EVENT_STATUSES),
          date_time: randomDate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), new Date())
        });
      }
      console.log(`⚠️  Se usarán ${FAKE_EVENT_IDS.length - events.length} eventos ficticios (solo en analíticas)`);
    }
    
    console.log(`📋 Total preparado: ${FAKE_USER_IDS.length} usuarios, ${FAKE_BUILDING_IDS.length} edificios, ${FAKE_EVENT_IDS.length} eventos\n`);
  } catch (error) {
    console.error('⚠️ Error cargando datos reales, usando solo datos ficticios:', error.message);
  }
}

async function generateUserActivityLogs(startDate, endDate) {
  console.log('📝 Generando logs de actividad de usuarios...');
  
  const logs = [];
  const currentDate = new Date(startDate);
  
  while (currentDate <= endDate) {
    const dayOfWeek = currentDate.getDay();
    const dayWeight = getDayWeight(dayOfWeek);
    
    // Generar entre 50 y 200 acciones por día (ajustado por peso del día)
    const actionsPerDay = Math.floor(randomInt(50, 200) * dayWeight);
    
    for (let i = 0; i < actionsPerDay; i++) {
      const hour = randomInt(0, 23);
      const minute = randomInt(0, 59);
      const timestamp = new Date(currentDate);
      timestamp.setHours(hour, minute, 0, 0);
      
      const activityWeight = getActivityWeight(hour);
      const user = randomChoice(FAKE_USER_IDS);
      const action = randomChoice(ACTIONS);
      
      // Determinar resourceType y resourceId según la acción
      let resourceType = 'other';
      let resourceId = null;
      
      if (action === 'view_building' || action === 'search_building') {
        resourceType = 'building';
        resourceId = randomChoice(FAKE_BUILDING_IDS).id;
      } else if (action === 'view_event') {
        resourceType = 'event';
        resourceId = randomChoice(FAKE_EVENT_IDS).id.toString();
      } else if (action === 'view_profile' || action === 'update_profile') {
        resourceType = 'profile';
        resourceId = user.id.toString();
      } else if (action.includes('event')) {
        resourceType = 'event';
        resourceId = randomChoice(FAKE_EVENT_IDS).id.toString();
      } else if (action === 'login' || action === 'logout') {
        resourceType = 'auth';
      }
      
      // Generar IP y User Agent ficticios
      const ipAddress = `${randomInt(192, 223)}.${randomInt(1, 255)}.${randomInt(1, 255)}.${randomInt(1, 255)}`;
      const userAgents = [
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        'Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15',
        'Mozilla/5.0 (Android 11; Mobile; rv:68.0) Gecko/68.0 Firefox/88.0'
      ];
      
      if (Math.random() < activityWeight) {
        logs.push({
          userId: user.id,
          userEmail: user.email,
          userRole: user.role,
          action,
          resourceType,
          resourceId,
          ipAddress,
          userAgent: randomChoice(userAgents),
          deviceType: randomChoice(DEVICE_TYPES),
          timestamp,
          metadata: {}
        });
      }
    }
    
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  // Insertar en lotes para mejor rendimiento
  const batchSize = 500;
  for (let i = 0; i < logs.length; i += batchSize) {
    const batch = logs.slice(i, i + batchSize);
    await UserActivityLog.insertMany(batch, { ordered: false });
  }
  
  console.log(`✅ Generados ${logs.length} logs de actividad de usuarios`);
  return logs.length;
}

async function generateBuildingAnalytics(startDate, endDate) {
  console.log('🏢 Generando analíticas de edificios...');
  
  const analytics = [];
  const currentDate = new Date(startDate);
  
  while (currentDate <= endDate) {
    for (const building of FAKE_BUILDING_IDS) {
      const dayOfWeek = currentDate.getDay();
      const dayWeight = getDayWeight(dayOfWeek);
      
      // Generar vistas para este edificio en este día (escalado para datos más realistas)
      const viewCount = Math.floor(randomInt(50, 500) * dayWeight);
      const uniqueVisitors = Math.floor(viewCount * randomFloat(0.4, 0.8));
      
      // Distribuir visitantes por rol
      const estudiantes = Math.floor(uniqueVisitors * randomFloat(0.6, 0.8));
      const profesores = Math.floor(uniqueVisitors * randomFloat(0.1, 0.2));
      const administradores = Math.floor(uniqueVisitors * randomFloat(0.05, 0.1));
      
      // Generar horas pico - MEJORADO para tener datos más completos
      const peakHours = [];
      const viewsPerHour = {}; // Objeto para acumular vistas por hora
      
      // Distribuir las vistas entre las horas del día de forma realista
      for (let h = 0; h < 24; h++) {
        const hourWeight = getActivityWeight(h);
        const hourViews = Math.floor(viewCount * (hourWeight / 10)); // Distribuir proporcionalmente
        
        if (hourViews > 0) {
          viewsPerHour[h] = hourViews;
        }
      }
      
      // Convertir a array y agregar solo las horas con actividad significativa
      Object.entries(viewsPerHour).forEach(([hour, count]) => {
        if (count > 0) {
          peakHours.push({
            hour: parseInt(hour),
            count: count
          });
        }
      });
      
      // Ordenar por hora para mejor visualización
      peakHours.sort((a, b) => a.hour - b.hour);
      
      const date = new Date(currentDate);
      date.setHours(0, 0, 0, 0);
      
      analytics.push({
        buildingId: building.id,
        buildingName: building.name,
        viewCount,
        searchCount: Math.floor(viewCount * randomFloat(0.1, 0.3)),
        uniqueVisitors,
        visitorsByRole: {
          estudiante: estudiantes,
          profesor: profesores,
          administrador: administradores
        },
        averageViewDuration: randomFloat(30, 300), // 30 segundos a 5 minutos
        peakHours,
        dayOfWeek: DAYS_OF_WEEK[dayOfWeek],
        date,
        metadata: {}
      });
    }
    
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  await BuildingAnalytics.insertMany(analytics, { ordered: false });
  console.log(`✅ Generadas ${analytics.length} analíticas de edificios`);
  return analytics.length;
}

async function generateEventAnalytics(startDate, endDate) {
  console.log('📅 Generando analíticas de eventos...');
  
  const analytics = [];
  const currentDate = new Date(startDate);
  
  while (currentDate <= endDate) {
    // Seleccionar algunos eventos aleatorios para cada día
    const eventsForDay = randomChoice(FAKE_EVENT_IDS.slice(0, Math.min(FAKE_EVENT_IDS.length, 10)));
    const eventsToAnalyze = Array.from({ length: randomInt(3, 8) }, () => randomChoice(FAKE_EVENT_IDS));
    
    for (const event of eventsToAnalyze) {
      const dayOfWeek = currentDate.getDay();
      const dayWeight = getDayWeight(dayOfWeek);
      
      // Eventos más cercanos a su fecha tienen más vistas
      const daysUntilEvent = Math.floor((event.date_time - currentDate) / (1000 * 60 * 60 * 24));
      let viewMultiplier = 1;
      
      if (daysUntilEvent >= -7 && daysUntilEvent <= 7) {
        viewMultiplier = randomFloat(1.5, 3.0); // Más popular cerca de la fecha
      } else if (daysUntilEvent > 30) {
        viewMultiplier = randomFloat(0.3, 0.7); // Menos popular si está muy lejos
      }
      
      const viewCount = Math.floor(randomInt(100, 800) * dayWeight * viewMultiplier);
      const uniqueVisitors = Math.floor(viewCount * randomFloat(0.5, 0.85));
      
      // Calcular popularidad score
      const popularityScore = Math.min(100, Math.floor(
        (viewCount * 0.2) + 
        (uniqueVisitors * 0.25) + 
        (daysUntilEvent <= 7 ? 20 : 0) +
        randomInt(0, 25)
      ));
      
      // Predicción de asistencia (basada en vistas) - más realista
      const attendancePrediction = Math.floor(uniqueVisitors * randomFloat(0.4, 0.8));
      
      // Si el evento ya pasó, agregar asistencia real
      let actualAttendance = null;
      if (event.date_time < currentDate && event.status === 'finalizado') {
        actualAttendance = Math.floor(attendancePrediction * randomFloat(0.85, 1.15));
      }
      
      const date = new Date(currentDate);
      date.setHours(0, 0, 0, 0);
      
      analytics.push({
        eventId: event.id,
        eventTitle: event.title,
        viewCount,
        uniqueVisitors,
        buildingId: event.buildingId,
        category: event.category,
        status: event.status,
        attendancePrediction,
        actualAttendance,
        popularityScore,
        date,
        metadata: {}
      });
    }
    
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  await EventAnalytics.insertMany(analytics, { ordered: false });
  console.log(`✅ Generadas ${analytics.length} analíticas de eventos`);
  return analytics.length;
}

async function generateSystemMetrics(startDate, endDate) {
  console.log('⚙️ Generando métricas del sistema...');
  
  const metrics = [];
  const currentDate = new Date(startDate);
  
  const metricTypes = [
    'api_response_time',
    'api_error_rate',
    'database_query_time',
    'active_users',
    'requests_per_minute',
    'memory_usage',
    'cpu_usage'
  ];
  
  const endpoints = [
    '/api/buildings',
    '/api/events',
    '/api/auth/login',
    '/api/bigdata/stats',
    '/api/buildings/:id'
  ];
  
  while (currentDate <= endDate) {
    // Generar métricas cada hora
    for (let hour = 0; hour < 24; hour++) {
      const timestamp = new Date(currentDate);
      timestamp.setHours(hour, 0, 0, 0);
      
      const activityWeight = getActivityWeight(hour);
      
      // API Response Time
      metrics.push({
        metricType: 'api_response_time',
        value: randomFloat(50, 300) * activityWeight,
        unit: 'ms',
        endpoint: randomChoice(endpoints),
        timestamp,
        metadata: {}
      });
      
      // API Error Rate (bajo, pero ocasional)
      if (Math.random() < 0.1) {
        metrics.push({
          metricType: 'api_error_rate',
          value: randomFloat(0.1, 5.0),
          unit: 'percentage',
          endpoint: randomChoice(endpoints),
          errorCode: randomChoice(['500', '404', '400', '401']),
          timestamp,
          metadata: {}
        });
      }
      
      // Database Query Time
      metrics.push({
        metricType: 'database_query_time',
        value: randomFloat(10, 150) * activityWeight,
        unit: 'ms',
        timestamp,
        metadata: {}
      });
      
      // Active Users
      metrics.push({
        metricType: 'active_users',
        value: Math.floor(randomInt(5, 50) * activityWeight),
        unit: 'count',
        timestamp,
        metadata: {}
      });
      
      // Requests per minute
      metrics.push({
        metricType: 'requests_per_minute',
        value: Math.floor(randomInt(10, 200) * activityWeight),
        unit: 'count',
        timestamp,
        metadata: {}
      });
      
      // Memory Usage
      metrics.push({
        metricType: 'memory_usage',
        value: randomFloat(40, 85),
        unit: 'percentage',
        timestamp,
        metadata: {}
      });
      
      // CPU Usage
      metrics.push({
        metricType: 'cpu_usage',
        value: randomFloat(20, 70) * activityWeight,
        unit: 'percentage',
        timestamp,
        metadata: {}
      });
    }
    
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  // Insertar en lotes
  const batchSize = 500;
  for (let i = 0; i < metrics.length; i += batchSize) {
    const batch = metrics.slice(i, i + batchSize);
    await SystemMetrics.insertMany(batch, { ordered: false });
  }
  
  console.log(`✅ Generadas ${metrics.length} métricas del sistema`);
  return metrics.length;
}

async function clearExistingData() {
  if (CLEAR_EXISTING) {
    console.log('🗑️ Eliminando datos existentes...');
    await UserActivityLog.deleteMany({});
    await BuildingAnalytics.deleteMany({});
    await EventAnalytics.deleteMany({});
    await SystemMetrics.deleteMany({});
    console.log('✅ Datos existentes eliminados\n');
  }
}

async function main() {
  try {
    console.log('🚀 Iniciando generación de datos ficticios de Big Data\n');
    console.log(`📅 Período: ${DAYS_TO_GENERATE} días\n`);
    
    // Conectar a MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Conectado a MongoDB\n');
    
    // Limpiar datos existentes si se solicita
    await clearExistingData();
    
    // Cargar datos reales o crear ficticios
    await loadRealData();
    
    // Calcular fechas
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - DAYS_TO_GENERATE);
    startDate.setHours(0, 0, 0, 0);
    
    console.log(`📊 Generando datos del ${startDate.toLocaleDateString()} al ${endDate.toLocaleDateString()}\n`);
    
    // Generar todos los datos
    const userLogsCount = await generateUserActivityLogs(startDate, endDate);
    const buildingAnalyticsCount = await generateBuildingAnalytics(startDate, endDate);
    const eventAnalyticsCount = await generateEventAnalytics(startDate, endDate);
    const systemMetricsCount = await generateSystemMetrics(startDate, endDate);
    
    console.log('\n✨ Generación completada!\n');
    console.log('📊 Resumen:');
    console.log(`   - User Activity Logs: ${userLogsCount.toLocaleString()}`);
    console.log(`   - Building Analytics: ${buildingAnalyticsCount.toLocaleString()}`);
    console.log(`   - Event Analytics: ${eventAnalyticsCount.toLocaleString()}`);
    console.log(`   - System Metrics: ${systemMetricsCount.toLocaleString()}`);
    console.log(`   - Total registros: ${(userLogsCount + buildingAnalyticsCount + eventAnalyticsCount + systemMetricsCount).toLocaleString()}\n`);
    
    console.log('🎉 ¡Datos ficticios generados exitosamente!');
    console.log('📈 Ahora puedes ver los datos en el panel de administración.\n');
    
  } catch (error) {
    console.error('❌ Error generando datos ficticios:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('👋 Conexión cerrada');
  }
}

// Ejecutar
main();

