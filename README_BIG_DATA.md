# 📊 Big Data en el Proyecto INNOVATEC-2025-VZ

## 🎯 ¿Qué hace el Big Data en este proyecto?

El módulo de **Big Data** está diseñado para recopilar, almacenar, procesar y visualizar grandes volúmenes de datos en este proyecto. Su objetivo es proporcionar **insights** (conocimientos) que ayuden a entender el comportamiento de los usuarios, optimizar el uso de recursos y mejorar la toma de decisiones estratégicas.

---

## 🚀 Funcionalidades Principales

### 1. **Recopilación de Datos**
El sistema captura automáticamente:
- **Actividad de usuarios**: Logins, visualizaciones, búsquedas, interacciones
- **Métricas de edificios**: Vistas, visitantes únicos, horas pico de consulta
- **Analíticas de eventos**: Popularidad, visualizaciones, predicciones de asistencia
- **Métricas del sistema**: Tiempo de respuesta, errores, rendimiento

### 2. **Almacenamiento Escalable**
- Utiliza **MongoDB Atlas** para almacenar grandes volúmenes de datos no estructurados
- Colecciones optimizadas con índices para consultas rápidas
- Diseñado para escalar horizontalmente según crezcan los datos

### 3. **Procesamiento por Lotes**
- **Procesamiento diario** (2:00 AM): Agrega estadísticas del día anterior
- **Limpieza semanal** (Domingos 3:00 AM): Elimina datos antiguos (>90 días)
- Cálculo de métricas consolidadas y scores de popularidad

### 4. **Visualización y Dashboards**
- Dashboard interactivo en el panel de administración
- **Gráficos horizontales** optimizados para mejor legibilidad
- **Nombres truncados** con tooltips que muestran el nombre completo
- **Interfaz completamente en español** con traducciones
- Gráficos de barras y tablas con datos en tiempo real
- Filtros por fecha (últimos 7 días, 30 días, todos)
- Exportación de estadísticas para análisis externos

---

## 📈 Valor de Negocio

### Para Administradores:
- **Entender el uso**: Ver qué edificios y eventos son más populares
- **Optimizar recursos**: Priorizar mejoras donde más se necesitan
- **Detectar patrones**: Identificar horas pico y tendencias de uso
- **Tomar decisiones basadas en datos**: No solo intuiciones

### Para el Sistema:
- **Monitoreo de rendimiento**: Detectar cuellos de botella y errores
- **Optimización continua**: Mejorar endpoints lentos y procesos ineficientes
- **Escalabilidad**: Planificar capacidad según el crecimiento de datos

### Para Futuro (Machine Learning):
Los datos recopilados son la base para:
- **Predicción de asistencia a eventos**
- **Recomendaciones personalizadas de edificios**
- **Detección de patrones anómalos**
- **Clustering de usuarios por comportamiento**

---

## 🔧 Componentes Técnicos

### Backend
- **Modelos**: `UserActivityLog`, `BuildingAnalytics`, `EventAnalytics`, `SystemMetrics`
- **Servicios**: `bigDataService.js` (lectura/escritura), `batchProcessingService.js` (procesamiento)
- **Controladores**: APIs REST para obtener estadísticas
- **Jobs**: Tareas programadas con `node-cron`

### Frontend (Panel Admin)
- **Dashboard**: Visualización interactiva con Recharts
- **Repositorios**: Conexión con APIs de Big Data
- **Casos de Uso**: Lógica de negocio para presentación de datos

---

## 📊 Estructura de Datos

### UserActivityLog
Registra cada acción de los usuarios:
```javascript
{
  userId: ObjectId,
  userEmail: String,
  userRole: String,
  action: String, // 'login', 'view_building', 'create_event', etc.
  resourceType: String,
  resourceId: String,
  metadata: Object,
  timestamp: Date
}
```

### BuildingAnalytics
Métricas agregadas por edificio y día:
```javascript
{
  buildingId: String,
  buildingName: String,
  viewCount: Number,
  uniqueVisitors: Number,
  visitorsByRole: Object,
  averageViewDuration: Number,
  peakHours: Array,
  date: Date
}
```

### EventAnalytics
Métricas de eventos:
```javascript
{
  eventId: ObjectId,
  eventTitle: String,
  viewCount: Number,
  uniqueVisitors: Number,
  popularityScore: Number,
  status: String,
  date: Date
}
```

---

## 🎮 Uso del Dashboard

1. **Acceder**: `http://localhost:5173/admin/bigdata`
2. **Ver estadísticas generales**: Tarjetas con métricas principales
3. **Explorar gráficos**: 
   - **Actividad de usuarios**: Gráfico horizontal con acciones traducidas al español
   - **Edificios más visitados**: Top 10 edificios con métricas
   - **Eventos más populares**: Top 10 eventos con nombres truncados para mejor visualización
4. **Filtrar por fecha**: Últimos 7 días, 30 días, o todos los datos
5. **Ejecutar procesamiento**: Botón para procesar datos manualmente
6. **Ver tablas detalladas**: Resumen de actividad de usuarios y edificios

### 🎨 Mejoras Visuales

- **Gráficos horizontales**: Todos los gráficos usan barras horizontales para mejor legibilidad
- **Nombres truncados**: Los nombres largos se muestran truncados con "..." pero el tooltip muestra el nombre completo
- **Traducciones**: Todas las acciones están en español (ej: "Crear Evento (Admin)", "Ver Edificio")
- **Tooltips mejorados**: Al pasar el mouse sobre los gráficos, se muestra información completa

---

## 🛠️ Scripts Disponibles

### Generar Datos de Prueba
```bash
# Generar datos ficticios de Big Data (30 días por defecto)
npm run generate-fake-data

# Limpiar y regenerar datos
npm run generate-fake-data:clear

# Generar eventos de ejemplo
npm run generate-events

# Cargar edificios desde GeoJSON
npm run load-buildings

# Verificar consistencia de datos
npm run verify-consistency
```

### Flujo Recomendado de Configuración
1. Cargar edificios: `npm run load-buildings`
2. Generar eventos: `npm run generate-events`
3. Generar datos de Big Data: `npm run generate-fake-data:clear`
4. Verificar consistencia: `npm run verify-consistency`

## 📚 Documentación Adicional

- **Guía de Implementación**: Ver `BIG_DATA_IMPLEMENTATION.md`
- **Generador de Datos Ficticios**: Ver `scripts/README_FAKE_DATA.md`
- **Configuración MongoDB**: Ver `MONGODB_ATLAS_SETUP.md`
- **Ejemplos de Integración**: Ver `examples/integrationExample.js`

---

## 🔮 Futuro

Esta implementación es la **fase 1** de un sistema completo de Big Data y Machine Learning. En el futuro se agregará:
- Procesamiento en tiempo real (streaming)
- Modelos de Machine Learning para predicciones
- Alertas automáticas basadas en patrones
- Integración con herramientas de BI externas

---

## 📝 Notas Importantes

- ⚠️ Los datos se generan automáticamente cuando los usuarios usan la aplicación
- 📈 Para volúmenes altos (>100K registros/día), considera sharding en MongoDB
- ⏰ El procesamiento por lotes se ejecuta automáticamente, pero puede ejecutarse manualmente
- 🔒 Solo usuarios con rol `administrador` pueden acceder al dashboard

---

## ✨ Actualizaciones Recientes

### Versión 1.1.0 (Enero 2025)
- ✅ **Gráficos horizontales**: Mejor legibilidad de nombres y etiquetas
- ✅ **Traducciones completas**: Todas las acciones en español
- ✅ **Nombres truncados**: Mejor visualización con tooltips informativos
- ✅ **Scripts de utilidad**: `generate-events`, `load-buildings`, `verify-consistency`
- ✅ **Consistencia de datos**: Verificación automática entre eventos y analíticas
- ✅ **Mejoras visuales**: Tooltips mejorados, mejor espaciado, tablas optimizadas

---

**Versión**: 1.1.0  
**Fecha**: Enero 2025  
**Mantenido por**: Equipo INNOVATEC-2025-VZ

