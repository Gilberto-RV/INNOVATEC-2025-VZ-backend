// scripts/loadBuildingsFromGeoJSON.js
/**
 * Script para cargar edificios desde el archivo GeoJSON a MongoDB
 * 
 * Extrae los edificios del archivo caminos.json y los carga en la base de datos
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Building from '../models/Building.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function loadBuildingsFromGeoJSON() {
  try {
    console.log('🚀 Iniciando carga de edificios desde GeoJSON...\n');
    
    // Conectar a MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Conectado a MongoDB\n');
    
    // Leer el archivo GeoJSON
    const geoJSONPath = path.join(__dirname, '../../project/assets/geo/caminos.json');
    const geoJSONData = JSON.parse(fs.readFileSync(geoJSONPath, 'utf8'));
    
    // Filtrar solo los edificios (tipo: "EDIFICIO")
    const buildings = geoJSONData.features.filter(
      feature => feature.properties?.tipo === 'EDIFICIO'
    );
    
    console.log(`📊 Encontrados ${buildings.length} edificios en el GeoJSON\n`);
    
    let created = 0;
    let updated = 0;
    let skipped = 0;
    
    for (const buildingFeature of buildings) {
      const buildingId = buildingFeature.properties.id;
      const buildingName = buildingFeature.properties.name || `Edificio ${buildingId}`;
      
      // Buscar si ya existe
      const existingBuilding = await Building.findById(buildingId);
      
      if (existingBuilding) {
        // Actualizar edificio existente con información básica si no tiene nombre
        if (!existingBuilding.name || existingBuilding.name.startsWith('Edificio')) {
          existingBuilding.name = buildingName;
          existingBuilding.geo_id = buildingId;
          existingBuilding.description = existingBuilding.description || `Edificio del campus ${buildingId}`;
          existingBuilding.availability = existingBuilding.availability !== undefined ? existingBuilding.availability : true;
          existingBuilding.accessibility = existingBuilding.accessibility !== undefined ? existingBuilding.accessibility : true;
          existingBuilding.floors = existingBuilding.floors || 1;
          existingBuilding.last_updated = new Date();
          await existingBuilding.save();
          updated++;
          console.log(`🔄 Actualizado: ${buildingName} (${buildingId})`);
        } else {
          skipped++;
          console.log(`⏭️  Saltado (ya existe): ${buildingName} (${buildingId})`);
        }
      } else {
        // Crear nuevo edificio
        const newBuilding = new Building({
          _id: buildingId,
          geo_id: buildingId,
          name: buildingName,
          description: `Edificio del campus ${buildingId}`,
          availability: true,
          accessibility: true,
          floors: 1,
          student_frequency: 'medium',
          bathrooms: {
            floor_1: false,
            floor_2: false,
            floor_3: false,
            floor_4: false,
            floor_5: false
          },
          entrances: [],
          id_services: [],
          id_careers: [],
          subjects: [],
          last_updated: new Date()
        });
        
        await newBuilding.save();
        created++;
        console.log(`✅ Creado: ${buildingName} (${buildingId})`);
      }
    }
    
    console.log('\n✨ Proceso completado!\n');
    console.log('📊 Resumen:');
    console.log(`   - Creados: ${created}`);
    console.log(`   - Actualizados: ${updated}`);
    console.log(`   - Saltados: ${skipped}`);
    console.log(`   - Total procesados: ${buildings.length}\n`);
    
    // Verificar total de edificios en la base de datos
    const totalBuildings = await Building.countDocuments();
    console.log(`📦 Total de edificios en la base de datos: ${totalBuildings}\n`);
    
  } catch (error) {
    console.error('❌ Error cargando edificios:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('👋 Conexión cerrada');
  }
}

// Ejecutar
loadBuildingsFromGeoJSON();

