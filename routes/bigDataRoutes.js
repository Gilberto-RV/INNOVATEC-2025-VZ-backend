// routes/bigDataRoutes.js
import express from 'express';
import authMiddleware from '../middlewares/authMiddleware.js';
import authorizeRoles from '../middlewares/authorizeRoles.js';
import * as bigDataController from '../controllers/bigData/bigDataController.js';

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// Dashboard y estadísticas (solo administradores)
router.get('/dashboard', authorizeRoles('administrador'), bigDataController.getDashboardStats);
router.get('/stats/users', authorizeRoles('administrador'), bigDataController.getUserActivityStats);
router.get('/stats/buildings', authorizeRoles('administrador'), bigDataController.getBuildingStats);
router.get('/stats/events', authorizeRoles('administrador'), bigDataController.getEventStats);

// Procesamiento por lotes (solo administradores)
router.post('/batch/process', authorizeRoles('administrador'), bigDataController.runBatchProcessing);

export default router;

