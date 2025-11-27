import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Building from '../models/Building.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Los 13 edificios válidos
const SELECTED_BUILDINGS = [
  'E-12', 'E-13', 'E-14', 'E-16', 'E-18', 
  'E-19', 'E-20', 'E-21', 'E-23', 'E-25', 
  'E-26', 'E-27', 'E-27-B'
];

async function loadBuildingsFromModularJSON() {
  try {
    console.log('🚀 CARGA DE EDIFICIOS DESDE JSON MODULAR\n');
    console.log('='.repeat(60));
    
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Conectado a MongoDB\n');
    
    // Leer archivos JSON modulares
    const edificiosPath = path.join(__dirname, '../../project/assets/geo/Edificios.json');
    const entradasPath = path.join(__dirname, '../../project/assets/geo/Entradas.json');
    
    console.log('📂 Leyendo archivos...');
    const edificiosData = JSON.parse(fs.readFileSync(edificiosPath, 'utf8'));
    const entradasData = JSON.parse(fs.readFileSync(entradasPath, 'utf8'));
    
    console.log(`✅ ${edificiosData.features.length} edificios en JSON`);
    console.log(`✅ ${entradasData.features.length} entradas en JSON\n`);
    
    // Verificar que tenemos exactamente 13 edificios
    if (edificiosData.features.length !== 13) {
      console.warn(`⚠️  ADVERTENCIA: Se esperaban 13 edificios, pero hay ${edificiosData.features.length}`);
    }
    
    console.log('📍 Procesando edificios...\n');
    
    let created = 0;
    let updated = 0;
    let errors = 0;
    
    for (const buildingFeature of edificiosData.features) {
      const buildingId = buildingFeature.properties.id;
      const buildingName = buildingFeature.properties.name;
      
      // Verificar que es uno de los 13 edificios válidos
      if (!SELECTED_BUILDINGS.includes(buildingId)) {
        console.log(`⏭️  Omitiendo ${buildingId} (no está en la lista de 13 edificios válidos)`);
        continue;
      }
      
      try {
        // Buscar entradas asociadas
        const buildingEntrances = entradasData.features
          .filter(e => e.properties.edificio_asociado === buildingId)
          .map(e => ({
            entrance_id: e.properties.id,
            description: e.properties.name,
            location_hint: `Entrada principal`
          }));
        
        // Calcular centro del edificio (promedio de coordenadas)
        const coords = buildingFeature.geometry.coordinates[0];
        const center = coords.reduce((acc, coord) => {
          return {
            longitude: acc.longitude + coord[0],
            latitude: acc.latitude + coord[1]
          };
        }, { longitude: 0, latitude: 0 });
        
        center.longitude /= coords.length;
        center.latitude /= coords.length;
        
        // Estructura de bathrooms según el modelo
        const bathroomsData = {
          floor_1: true,
          floor_2: false,
          floor_3: false,
          floor_4: false,
          floor_5: false
        };
        
        // Buscar si ya existe
        const existingBuilding = await Building.findOne({ id: buildingId });
        
        if (existingBuilding) {
          // Actualizar edificio existente
          existingBuilding.name = buildingName;
          existingBuilding.geo_id = buildingId;
          existingBuilding.entrances = buildingEntrances;
          existingBuilding.last_updated = new Date();
          
          await existingBuilding.save();
          updated++;
          console.log(`✏️  ${buildingId} - ${buildingName} (actualizado)`);
        } else {
          // Crear nuevo edificio
          const newBuilding = new Building({
            _id: buildingId,
            geo_id: buildingId,
            name: buildingName,
            description: `${buildingName} del campus universitario`,
            entrances: buildingEntrances,
            accessibility: true,
            floors: 2,
            availability: true,
            student_frequency: 'Media',
            bathrooms: bathroomsData,
            id_services: [],
            id_careers: [],
            subjects: [],
            last_updated: new Date()
          });
          
          await newBuilding.save();
          created++;
          console.log(`➕ ${buildingId} - ${buildingName} (creado)`);
        }
      } catch (err) {
        errors++;
        console.error(`❌ Error procesando ${buildingId}:`, err.message);
      }
    }
    
    // Resumen
    console.log('\n' + '='.repeat(60));
    console.log('📊 RESUMEN');
    console.log('-'.repeat(60));
    console.log(`➕ Edificios creados: ${created}`);
    console.log(`✏️  Edificios actualizados: ${updated}`);
    console.log(`❌ Errores: ${errors}`);
    console.log(`📍 Total procesado: ${created + updated}`);
    
    // Verificar en base de datos
    const dbCount = await Building.countDocuments();
    console.log(`\n✅ Edificios en base de datos: ${dbCount}`);
    
    if (dbCount === 13) {
      console.log('🎉 ¡PERFECTO! Los 13 edificios están en la base de datos');
    } else {
      console.warn(`⚠️  ADVERTENCIA: Se esperaban 13 edificios, pero hay ${dbCount}`);
    }
    
    // Listar edificios cargados
    console.log('\n📋 Edificios en base de datos:');
    const buildings = await Building.find({}, 'id name').sort('id');
    buildings.forEach((b, index) => {
      console.log(`   ${index + 1}. ${b.id} - ${b.name}`);
    });
    
    console.log('\n='.repeat(60));
    console.log('✅ Proceso completado exitosamente\n');
    
  } catch (error) {
    console.error('❌ Error fatal:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Desconectado de MongoDB\n');
  }
}

loadBuildingsFromModularJSON();

