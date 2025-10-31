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
- Gráficos de barras, líneas y tablas con datos en tiempo real
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
3. **Explorar gráficos**: Actividad de usuarios, edificios más visitados, eventos populares
4. **Filtrar por fecha**: Últimos 7 días, 30 días, o todos los datos
5. **Ejecutar procesamiento**: Botón para procesar datos manualmente

---

## 📚 Documentación Adicional

- **Guía de Implementación**: Ver `BIG_DATA_IMPLEMENTATION.md`
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

**Versión**: 1.0.0  
**Fecha**: Enero 2025  
**Mantenido por**: Equipo INNOVATEC-2025-VZ

