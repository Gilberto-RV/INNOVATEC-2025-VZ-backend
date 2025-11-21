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
    
    // Leer el archivo GeoJSON actualizado
    const geoJSONPath = path.join(__dirname, '../../project/assets/geo/caminos.json');
    const geoJSONData = JSON.parse(fs.readFileSync(geoJSONPath, 'utf8'));

    const normalizeConnections = (raw) => {
      if (!raw) return [];
      if (Array.isArray(raw)) return raw;
      try {
        const parsed = JSON.parse(raw);
        return parsed ?? [];
      } catch {
        return String(raw)
          .split(',')
          .map(item => item.trim())
          .filter(Boolean);
      }
    };

    // Filtrar solo los edificios (tipo: "EDIFICIO")
    const buildings = (geoJSONData.features || []).filter(
      feature => feature.properties?.tipo === 'EDIFICIO'
    );
    
    console.log(`📊 Encontrados ${buildings.length} edificios en el GeoJSON\n`);
    
    let created = 0;
    let updated = 0;
    let skipped = 0;
    
    for (const buildingFeature of buildings) {
      const buildingId = buildingFeature.properties.id;
      if (!buildingId) {
        console.log('⚠️  Edificio sin ID definido, se omite');
        continue;
      }
      const buildingName = buildingFeature.properties.name || `Edificio ${buildingId}`;
      const connections = normalizeConnections(buildingFeature.properties.conexiones);
      const associatedEntrances = connections
        .filter(conn => typeof conn === 'string' && conn.startsWith('EE-'))
        .map(entryId => ({ entrance_id: entryId }));
      
      // Buscar si ya existe
      const existingBuilding = await Building.findById(buildingId);
      
      if (existingBuilding) {
        let mutated = false;
        if (!existingBuilding.name || existingBuilding.name.startsWith('Edificio')) {
          existingBuilding.name = buildingName;
          mutated = true;
        }
        if (!existingBuilding.geo_id) {
          existingBuilding.geo_id = buildingId;
          mutated = true;
        }
        if (!existingBuilding.description) {
          existingBuilding.description = `Edificio del campus ${buildingId}`;
          mutated = true;
        }
        if (existingBuilding.availability === undefined) {
          existingBuilding.availability = true;
          mutated = true;
        }
        if (existingBuilding.accessibility === undefined) {
          existingBuilding.accessibility = true;
          mutated = true;
        }
        if (!existingBuilding.floors) {
          existingBuilding.floors = 1;
          mutated = true;
        }
        if (connections.length > 0) {
          existingBuilding.connections = Array.from(new Set([...((existingBuilding.connections || [])), ...connections]));
          mutated = true;
        }
        if (associatedEntrances.length > 0) {
          const existingEntranceIds = new Set(existingBuilding.entrances?.map(e => e.entrance_id));
          const mergedEntrances = [
            ...(existingBuilding.entrances || []),
            ...associatedEntrances.filter(e => !existingEntranceIds.has(e.entrance_id))
          ];
          existingBuilding.entrances = mergedEntrances;
          mutated = true;
        }
        if (mutated) {
          existingBuilding.last_updated = new Date();
          await existingBuilding.save();
          updated++;
          console.log(`🔄 Actualizado: ${buildingName} (${buildingId})`);
        } else {
          skipped++;
          console.log(`⏭️  Saltado (sin cambios): ${buildingName} (${buildingId})`);
        }
      } else {
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
          entrances: associatedEntrances,
          connections,
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

