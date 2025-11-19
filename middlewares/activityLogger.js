// middlewares/activityLogger.js
/**
 * DEPRECADO: Este middleware ya no se usa.
 * 
 * El sistema BigData ahora solo recopila:
 * - Métricas de edificios (vistas, visitantes únicos, horas pico)
 * - Analíticas de eventos (popularidad, visualizaciones)
 * 
 * Se eliminó la recopilación de UserActivityLog y SystemMetrics.
 * 
 * Para registrar métricas de edificios o eventos, usar directamente:
 * - logBuildingView() desde services/bigDataService.js
 * - logEventView() desde services/bigDataService.js
 */

// Código deshabilitado - mantenido solo para referencia histórica
/*
import { logUserActivity } from '../services/bigDataService.js';

export const activityLogger = (action, resourceType = 'other') => {
  return async (req, res, next) => {
    res.on('finish', async () => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        try {
          const userId = req.user?.id || req.user?._id || null;
          const userEmail = req.user?.email || null;
          const userRole = req.user?.role || null;
          const resourceId = req.params?.id || req.params?.buildingId || req.params?.eventId || null;
          const userAgent = req.headers['user-agent'] || '';
          let deviceType = 'unknown';
          if (/mobile|android|iphone|ipad/i.test(userAgent)) {
            deviceType = 'mobile';
          } else if (/tablet|ipad/i.test(userAgent)) {
            deviceType = 'tablet';
          } else if (/desktop|windows|mac|linux/i.test(userAgent)) {
            deviceType = 'desktop';
          }

          await logUserActivity({
            userId,
            userEmail,
            userRole,
            action,
            resourceType,
            resourceId,
            metadata: {
              method: req.method,
              path: req.path,
              statusCode: res.statusCode
            },
            ipAddress: req.ip || req.connection.remoteAddress,
            userAgent,
            deviceType
          });
        } catch (error) {
          console.error('Error al registrar actividad:', error);
        }
      }
    });
    next();
  };
};
*/

// Exportar una función dummy para mantener compatibilidad si hay algún import
export const activityLogger = () => {
  return (req, res, next) => {
    // No hacer nada - middleware deshabilitado
    next();
  };
};

