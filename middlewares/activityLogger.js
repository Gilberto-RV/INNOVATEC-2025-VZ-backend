// middlewares/activityLogger.js
import { logUserActivity } from '../services/bigDataService.js';

/**
 * Middleware para registrar automáticamente la actividad de los usuarios
 * Se puede usar en rutas específicas o globalmente
 */
export const activityLogger = (action, resourceType = 'other') => {
  return async (req, res, next) => {
    // Ejecutar después de que la respuesta se envíe
    res.on('finish', async () => {
      // Solo registrar si la respuesta fue exitosa (200-299)
      if (res.statusCode >= 200 && res.statusCode < 300) {
        try {
          const userId = req.user?.id || req.user?._id || null;
          const userEmail = req.user?.email || null;
          const userRole = req.user?.role || null;

          // Obtener resourceId del parámetro de la ruta o del body
          const resourceId = req.params?.id || req.params?.buildingId || req.params?.eventId || null;

          // Detectar tipo de dispositivo desde User-Agent
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
          // No queremos que el logging rompa la aplicación
          console.error('Error al registrar actividad:', error);
        }
      }
    });

    next();
  };
};

