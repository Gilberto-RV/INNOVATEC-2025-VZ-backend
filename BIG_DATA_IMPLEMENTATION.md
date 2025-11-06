# 📊 Implementación de Big Data - Guía Completa

## 📋 Índice
1. [Datos Recomendados para Recopilar](#datos-recomendados)
2. [Configuración MongoDB](#configuración-mongodb)
3. [Procesamiento por Lotes](#procesamiento-por-lotes)
4. [Estructura de Archivos](#estructura-de-archivos)
5. [Uso de los Servicios](#uso-de-los-servicios)
6. [Dashboard API](#dashboard-api)

---

## 🎯 Datos Recomendados para Recopilar

### 1. **Actividad de Usuarios** (`UserActivityLog`)
**¿Por qué?** Entender cómo los usuarios interactúan con la aplicación.

**Datos a recopilar:**
- ✅ Logins y logouts
- ✅ Visualizaciones de edificios
- ✅ Visualizaciones de eventos
- ✅ Búsquedas realizadas
- ✅ Creación/edición/eliminación de eventos (admins)
- ✅ Accesos a perfiles
- ✅ Tipo de dispositivo (móvil, desktop, tablet)
- ✅ IP address y User-Agent
- ✅ Timestamp de cada acción

**Valor de negocio:**
- Identificar horas pico de uso
- Entender qué edificios son más consultados
- Detectar patrones de comportamiento por rol (estudiante, profesor, admin)

---

### 2. **Analíticas de Edificios** (`BuildingAnalytics`)
**¿Por qué?** Optimizar la experiencia de navegación y entender preferencias.

**Datos a recopilar:**
- ✅ Conteo de visualizaciones por día
- ✅ Visitantes únicos por edificio
- ✅ Visitantes por rol (estudiante, profesor, admin)
- ✅ Duración promedio de visualización
- ✅ Horas pico de consulta
- ✅ Día de la semana más consultado
- ✅ Conteo de búsquedas

**Valor de negocio:**
- Priorizar mejoras en edificios más consultados
- Optimizar información de edificios populares
- Planificar mantenimiento según uso

---

### 3. **Analíticas de Eventos** (`EventAnalytics`)
**¿Por qué?** Mejorar la gestión de eventos y predecir asistencia.

**Datos a recopilar:**
- ✅ Visualizaciones por evento
- ✅ Visitantes únicos
- ✅ Popularidad del evento (score calculado)
- ✅ Edificio asociado
- ✅ Categoría del evento
- ✅ Estado (programado, en curso, finalizado, cancelado)
- ✅ Predicción de asistencia (futuro para ML)

**Valor de negocio:**
- Identificar eventos populares para repetir formato
- Optimizar horarios y ubicaciones
- Predecir demanda de espacios

---

### 4. **Métricas del Sistema** (`SystemMetrics`)
**¿Por qué?** Monitorear rendimiento y detectar problemas.

**Datos a recopilar:**
- ✅ Tiempo de respuesta de API
- ✅ Tasa de errores
- ✅ Tiempo de consulta a base de datos
- ✅ Usuarios activos por minuto/hora
- ✅ Peticiones por minuto
- ✅ Uso de memoria/CPU (opcional)

**Valor de negocio:**
- Detectar cuellos de botella
- Optimizar endpoints lentos
- Planificar escalabilidad

---

## 🗄️ Configuración MongoDB

### Opción Recomendada: **MongoDB Atlas** (Fácil y Gratuita)

#### 1. **Crear cuenta en MongoDB Atlas**
- Ve a: https://www.mongodb.com/cloud/atlas
- Crea una cuenta gratuita (M0 Cluster - Free Tier)
- Incluye 512MB de almacenamiento (suficiente para prueba inicial)

#### 2. **Crear un Cluster**
- Selecciona región más cercana a Venezuela
- Nombre sugerido: `innovatec-cluster` o similar
- Deja configuración por defecto (M0)

#### 3. **Configurar acceso**
- **Network Access**: Agrega IP `0.0.0.0/0` temporalmente para desarrollo
  - ⚠️ En producción, usa IPs específicas
- **Database Access**: Crea un usuario y contraseña

#### 4. **Obtener Connection String**
- Click en "Connect" → "Connect your application"
- Copia el string de conexión (ejemplo):
```
mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
```

#### 5. **Configurar en el Backend**
Agrega a tu archivo `.env`:
```env
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/innovatec?retryWrites=true&w=majority
ENABLE_BATCH_PROCESSING=true
```

---

### Opción Alternativa: MongoDB Local
Si prefieres instalar MongoDB localmente:

```bash
# Windows (usando Chocolatey)
choco install mongodb

# O descarga e instala desde:
# https://www.mongodb.com/try/download/community
```

Luego configura:
```env
MONGO_URI=mongodb://localhost:27017/innovatec
```

---

## ⚙️ Procesamiento por Lotes

### Herramienta: **node-cron** (Ya incluido en package.json)

**¿Por qué node-cron?**
- ✅ Fácil de implementar
- ✅ No requiere servicios externos
- ✅ Perfecto para volúmenes pequeños/medianos
- ✅ Integrado directamente en Node.js

### Tareas Programadas

1. **Procesamiento Diario** (2:00 AM)
   - Agrega estadísticas del día anterior
   - Calcula métricas consolidadas
   - Actualiza scores de popularidad

2. **Limpieza Semanal** (Domingos 3:00 AM)
   - Elimina logs antiguos (>90 días)
   - Mantiene solo agregaciones

### Configuración
En `.env`:
```env
ENABLE_BATCH_PROCESSING=true
```

Para desactivar temporalmente:
```env
ENABLE_BATCH_PROCESSING=false
```

---

## 📁 Estructura de Archivos Creada

```
backend/
├── models/
│   └── BigData/
│       ├── UserActivityLog.js      # Logs de actividad de usuarios
│       ├── BuildingAnalytics.js    # Analíticas de edificios
│       ├── EventAnalytics.js       # Analíticas de eventos
│       └── SystemMetrics.js        # Métricas del sistema
├── services/
│   ├── bigDataService.js           # Servicios de lectura/escritura
│   └── batchProcessingService.js   # Procesamiento por lotes
├── controllers/
│   └── bigData/
│       └── bigDataController.js    # Controladores para API
├── routes/
│   └── bigDataRoutes.js            # Rutas de Big Data
├── middlewares/
│   └── activityLogger.js           # Middleware para logging automático
└── jobs/
    └── batchProcessor.js           # Configuración de cron jobs
```

---

## 🔧 Uso de los Servicios

### 1. **Registrar Actividad de Usuario**

```javascript
import { logUserActivity } from '../services/bigDataService.js';

// Ejemplo en un controlador
await logUserActivity({
  userId: req.user.id,
  userEmail: req.user.email,
  userRole: req.user.role,
  action: 'view_building',
  resourceType: 'building',
  resourceId: buildingId,
  metadata: { additionalData: 'value' },
  ipAddress: req.ip,
  userAgent: req.headers['user-agent'],
  deviceType: 'mobile'
});
```

### 2. **Registrar Vista de Edificio**

```javascript
import { logBuildingView } from '../services/bigDataService.js';

await logBuildingView({
  buildingId: 'B001',
  buildingName: 'Edificio A',
  userId: req.user.id,
  userRole: req.user.role,
  viewDuration: 45 // segundos
});
```

### 3. **Registrar Vista de Evento**

```javascript
import { logEventView } from '../services/bigDataService.js';

await logEventView({
  eventId: event._id,
  eventTitle: event.title,
  userId: req.user.id,
  buildingId: event.building_assigned,
  category: event.category,
  status: event.status
});
```

### 4. **Usar Middleware Automático**

```javascript
import { activityLogger } from '../middlewares/activityLogger.js';

// En tus rutas
router.get('/buildings/:id', 
  authMiddleware, 
  activityLogger('view_building', 'building'),
  getBuildingByIdController
);
```

---

## 📊 Dashboard API

### Endpoints Disponibles

#### 1. **Dashboard General**
```
GET /api/bigdata/dashboard?startDate=2024-01-01&endDate=2024-01-31
```
Requiere: Autenticación + Rol Administrador

Respuesta:
```json
{
  "success": true,
  "data": {
    "userActivity": [...],
    "buildings": [...],
    "events": [...],
    "period": {
      "startDate": "2024-01-01",
      "endDate": "2024-01-31"
    }
  }
}
```

#### 2. **Estadísticas de Usuarios**
```
GET einzelnen/bigdata/stats/users?startDate=2024-01-01&action=view_building
```

#### 3. **Estadísticas de Edificios**
```
GET /api/bigdata/stats/buildings?buildingId=B001
```

#### 4. **Estadísticas de Eventos**
```
GET /api/bigdata/stats/events?status=programado
```

#### 5. **Ejecutar Procesamiento por Lotes Manualmente**
```
POST /api/bigdata/batch/process
```

---

## 🚀 Configuración Inicial del Sistema

### 1. Instalar Dependencias
```bash
cd backend
npm install
```

### 2. Configurar MongoDB Atlas (o local)
Ver `MONGODB_ATLAS_SETUP.md` para instrucciones detalladas.

### 3. Configuración Inicial de Datos
```bash
# Cargar edificios desde GeoJSON
npm run load-buildings

# Generar eventos de ejemplo
npm run generate-events

# Generar datos de Big Data para visualización
npm run generate-fake-data:clear

# Verificar consistencia
npm run verify-consistency
```

### 4. Crear Usuario Administrador
```bash
npm run create-admin
```

### 5. Acceder al Dashboard
Navega a `http://localhost:5173/admin/bigdata` y usa las credenciales:
- Email: `test@gmail.com`
- Password: `admin123`

## 🎨 Mejoras Recientes del Dashboard

### Visualizaciones Optimizadas
- **Gráficos horizontales**: Todos los gráficos ahora usan barras horizontales para mejor legibilidad
- **Nombres truncados**: Los nombres largos se muestran truncados con "..." pero el tooltip muestra el nombre completo
- **Altura aumentada**: Los gráficos tienen 400px de altura para mejor visualización
- **Mejor espaciado**: Etiquetas más legibles con tamaño de fuente optimizado

### Interfaz en Español
- Todas las acciones están traducidas al español
- Acciones de administrador marcadas con "(Admin)"
- Tooltips mejorados con información completa

### Scripts Disponibles
- `npm run generate-events` - Genera eventos de ejemplo
- `npm run load-buildings` - Carga edificios desde GeoJSON
- `npm run generate-fake-data` - Genera datos ficticios de Big Data
- `npm run generate-fake-data:clear` - Limpia y regenera datos
- `npm run verify-consistency` - Verifica consistencia de datos
- `npm run create-admin` - Crea/actualiza usuario administrador

---

## 📝 Notas Importantes

- ⚠️ Para volúmenes altos (>100K registros/día), considera usar MongoDB Sharding
- ⚠️ Los logs de actividad crecen rápido, la limpieza semanal es importante
- ⚠️ En producción, configura índices adicionales según tus consultas
- 💡 Considera agregar caché (Redis) para consultas frecuentes del dashboard
- ✅ **Consistencia de Datos**: Asegúrate de tener eventos reales antes de generar analíticas. Usa `npm run generate-events` primero.
- ✅ **Edificios**: Los edificios deben cargarse desde GeoJSON usando `npm run load-buildings`
- ✅ **Verificación**: Usa `npm run verify-consistency` para verificar que todos los datos estén sincronizados

---

## 🎯 Casos de Uso Futuros para ML

Con estos datos recopilados, podrás implementar:
- **Predicción de asistencia a eventos**
- **Recomendación de edificios** basada en historial
- **Detección de patrones anómalos** (fraude, uso inusual)
- **Clustering de usuarios** por comportamiento
- **Optimización de horarios** de eventos

---

¿Necesitas ayuda con algún paso específico? 🚀

