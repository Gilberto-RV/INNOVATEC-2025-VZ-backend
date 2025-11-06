# 🎲 Generador de Datos Ficticios para Big Data

Este script genera datos ficticios realistas para probar y visualizar el sistema de Big Data en el panel administrador.

## 📋 Descripción

El script `generateFakeBigData.js` genera datos históricos simulados para:

- **UserActivityLog**: Logs de actividad de usuarios (logins, vistas, búsquedas, etc.)
- **BuildingAnalytics**: Analíticas diarias de edificios (vistas, visitantes, horas pico)
- **EventAnalytics**: Analíticas de eventos (popularidad, predicciones, visitantes)
- **SystemMetrics**: Métricas del sistema (tiempo de respuesta, errores, uso de recursos)

## ✨ Características

- ✅ **Datos realistas**: Patrones de comportamiento coherentes
- ✅ **Distribuciones naturales**: Más actividad en horas laborales, menos en fines de semana
- ✅ **Integración con datos reales**: Usa usuarios, edificios y eventos existentes si están disponibles
- ✅ **Configurable**: Puedes elegir cuántos días de datos generar
- ✅ **Rápido**: Inserción por lotes para mejor rendimiento

## 🚀 Uso

### Opción 1: Usando npm scripts (Recomendado)

```bash
# Generar 30 días de datos (por defecto)
npm run generate-fake-data

# Generar 60 días de datos
npm run generate-fake-data -- --days=60

# Limpiar datos existentes y generar nuevos
npm run generate-fake-data:clear

# Limpiar y generar 90 días
npm run generate-fake-data -- --days=90 --clear
```

### Scripts Relacionados

```bash
# Generar eventos de ejemplo (necesarios para las analíticas)
npm run generate-events

# Cargar edificios desde GeoJSON
npm run load-buildings

# Verificar consistencia entre eventos y analíticas
npm run verify-consistency
```

### Opción 2: Ejecutar directamente con Node.js

```bash
# Generar 30 días (por defecto)
node scripts/generateFakeBigData.js

# Generar 60 días
node scripts/generateFakeBigData.js --days=60

# Limpiar datos existentes primero
node scripts/generateFakeBigData.js --clear

# Combinar opciones
node scripts/generateFakeBigData.js --days=90 --clear
```

## 📊 Parámetros

- `--days=N`: Número de días de datos históricos a generar (por defecto: 30)
- `--clear`: Elimina todos los datos existentes antes de generar nuevos

## 📈 Datos Generados

### UserActivityLog
- **Cantidad**: ~50-200 acciones por día
- **Distribución**: Más actividad entre 8 AM - 6 PM
- **Acciones**: login, logout, view_building, view_event, search_building, etc.
- **Metadatos**: IP addresses, User Agents, tipos de dispositivo

### BuildingAnalytics
- **Cantidad**: Un registro por edificio por día
- **Métricas**: Vistas, visitantes únicos, horas pico, duración promedio
- **Distribución por rol**: Estudiantes, profesores, administradores

### EventAnalytics
- **Cantidad**: ~3-8 eventos analizados por día
- **Métricas**: Vistas, popularidad, predicción de asistencia
- **Patrones**: Eventos más cercanos a su fecha tienen más vistas

### SystemMetrics
- **Cantidad**: 7 métricas por hora (1 registro cada hora)
- **Métricas**: Tiempo de respuesta API, errores, uso de CPU/memoria, usuarios activos
- **Distribución**: Variación según hora del día

## 🎯 Ejemplos de Uso

### Generar datos para la última semana
```bash
npm run generate-fake-data -- --days=7
```

### Generar datos para los últimos 3 meses
```bash
npm run generate-fake-data -- --days=90
```

### Reemplazar todos los datos existentes
```bash
npm run generate-fake-data:clear -- --days=60
```

## ⚙️ Configuración

El script utiliza las siguientes variables de entorno (ya configuradas en tu `.env`):

- `MONGO_URI`: URI de conexión a MongoDB

Asegúrate de que tu archivo `.env` esté configurado correctamente antes de ejecutar el script.

## 📝 Notas Importantes

1. **Datos Existentes**: Por defecto, el script agrega datos a los existentes. Usa `--clear` para reemplazarlos.

2. **Rendimiento**: La generación puede tardar varios minutos dependiendo de la cantidad de días y datos existentes.

3. **Memoria**: Para períodos muy largos (>90 días), el script puede usar mucha memoria. Considera ejecutar en períodos más cortos si encuentras problemas.

4. **Datos Reales**: El script intenta usar usuarios, edificios y eventos reales de tu base de datos. Si no existen, crea datos ficticios en memoria (solo para analíticas).

5. **Consistencia con Eventos**: Para que las analíticas de eventos sean consistentes, asegúrate de tener eventos reales en la base de datos. Ejecuta `npm run generate-events` antes de generar datos de Big Data.

## 🔍 Verificación

Después de ejecutar el script, puedes verificar los datos generados:

1. **Panel Administrador**: Ve al dashboard de Big Data en la interfaz web
2. **MongoDB Compass**: Conecta a tu base de datos y revisa las colecciones:
   - `user_activity_logs`
   - `building_analytics`
   - `event_analytics`
   - `system_metrics`

## 🐛 Troubleshooting

### Error de conexión a MongoDB
```
❌ Error: MongoServerError: Authentication failed
```
**Solución**: Verifica que tu `MONGO_URI` en `.env` sea correcto.

### Script muy lento
**Solución**: Reduce el número de días o ejecuta en períodos más cortos.

### Sin datos en el dashboard
**Solución**: 
1. Verifica que los datos se insertaron en MongoDB
2. Ejecuta el procesamiento por lotes desde el panel administrador
3. Verifica que las fechas generadas estén dentro del rango que estás visualizando

### Inconsistencia entre eventos y analíticas
**Solución**: 
1. Ejecuta `npm run generate-events` para crear eventos reales
2. Ejecuta `npm run generate-fake-data:clear` para regenerar analíticas basadas en eventos reales
3. Verifica la consistencia con `npm run verify-consistency`

## 📞 Soporte

Si encuentras problemas o tienes preguntas:
1. Verifica los logs en la consola
2. Revisa la configuración de MongoDB
3. Consulta la documentación de Big Data: `README_BIG_DATA.md`

---

## 📚 Scripts Relacionados

Este proyecto incluye otros scripts útiles:

### `generateSampleEvents.js`
Genera eventos reales en la base de datos para uso con las analíticas.
```bash
npm run generate-events
```

### `loadBuildingsFromGeoJSON.js`
Carga edificios desde el archivo GeoJSON del proyecto.
```bash
npm run load-buildings
```

### `verifyDataConsistency.js`
Verifica la consistencia entre eventos, edificios y sus analíticas.
```bash
npm run verify-consistency
```

---

**¡Listo para generar datos ficticios y probar tu dashboard!** 🚀

