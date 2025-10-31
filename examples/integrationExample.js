// examples/integrationExample.js
// Ejemplos de cómo integrar Big Data en controladores existentes

import { logUserActivity, logBuildingView, logEventView } from '../services/bigDataService.js';
import { activityLogger } from '../middlewares/activityLogger.js';

/**
 * EJEMPLO 1: Integrar en controlador de edificios
 * 
 * En: controllers/building/getBuildingByIdController.js
 */

export const getBuildingByIdControllerWithLogging = async (req, res) => {
  try {
    const building = await Building.findById(req.params.id);
    
    if (!building) {
      return res.status(404).json({ message: 'Edificio no encontrado' });
    }

    // Registrar actividad de Big Data
    if (req.user) {
      await logBuildingView({
        buildingId: building._id,
        buildingName: building.name,
        userId: req.user.id || req.user._id,
        userRole: req.user.role,
        viewDuration: null // Podrías calcular esto con timestamps
      });

      await logUserActivity({
        userId: req.user.id || req.user._id,
        userEmail: req.user.email,
        userRole: req.user.role,
        action: 'view_building',
        resourceType: 'building',
        resourceId: building._id,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
        deviceType: 'unknown'
      });
    }

    res.json({ building });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * EJEMPLO 2: Usar middleware automático en rutas
 * 
 * En: routes/buildingRoutes.js
 */

// ANTES:
// router.get('/:id', authMiddleware, getBuildingByIdController);

// DESPUÉS:
// import { activityLogger } from '../middlewares/activityLogger.js';
// router.get('/:id', 
//   authMiddleware, 
//   activityLogger('view_building', 'building'),
//   getBuildingByIdController
// );

/**
 * EJEMPLO 3: Integrar en controlador de eventos
 * 
 * En: controllers/events/eventController.js
 */

export const getAllEventsWithLogging = async (req, res) => {
  try {
    const events = await Event.find()
      .populate('building_assigned', 'name')
      .populate('category', 'nombre');

    // Registrar actividad
    if (req.user) {
      await logUserActivity({
        userId: req.user.id || req.user._id,
        userEmail: req.user.email,
        userRole: req.user.role,
        action: 'view_event',
        resourceType: 'event',
        resourceId: null,
        metadata: { count: events.length },
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
        deviceType: 'unknown'
      });
    }

    res.json({ events });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * EJEMPLO 4: Registrar login/logout
 * 
 * En: controllers/auth/loginController.js
 */

export const loginControllerWithLogging = async (req, res) => {
  try {
    // ... lógica de login existente ...
    const user = await authenticateUser(req.body.email, req.body.password);
    const token = generateToken(user);

    // Registrar actividad de login
    await logUserActivity({
      userId: user.id || user._id,
      userEmail: user.email,
      userRole: user.role,
      action: 'login',
      resourceType: 'auth',
      resourceId: null,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      deviceType: 'unknown'
    });

    res.json({ token, user });
  } catch (error) {
    res.status(401).json({ message: 'Credenciales inválidas' });
  }
};

/**
 * EJEMPLO 5: Registrar creación de eventos
 * 
 * En: controllers/events/eventController.js
 */

export const createEventWithLogging = async (req, res) => {
  try {
    const newEvent = await Event.create(req.body);

    // Registrar actividad
    if (req.user) {
      await logUserActivity({
        userId: req.user.id || req.user._id,
        userEmail: req.user.email,
        userRole: req.user.role,
        action: 'create_event',
        resourceType: 'event',
        resourceId: newEvent._id.toString(),
        metadata: {
          eventTitle: newEvent.title,
          buildingId: newEvent.building_assigned
        },
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
        deviceType: 'unknown'
      });

      // También registrar analítica del evento
      await logEventView({
        eventId: newEvent._id,
        eventTitle: newEvent.title,
        userId: req.user.id || req.user._id,
        buildingId: newEvent.building_assigned,
        category: newEvent.category,
        status: newEvent.status
      });
    }

    res.status(201).json(newEvent);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * NOTA: Para uso en producción, considera:
 * 1. Ejecutar logging en background (no bloquear respuesta)
 * 2. Usar colas (Bull/BullMQ) para procesamiento asíncrono
 * 3. Agregar try-catch alrededor del logging para no romper flujo principal
 */

