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
router.get('/stats/buildings', authorizeRoles('administrador'), bigDataController.getBuildingStats);
router.get('/stats/events', authorizeRoles('administrador'), bigDataController.getEventStats);

// Procesamiento por lotes (solo administradores)
router.post('/batch/process', authorizeRoles('administrador'), bigDataController.runBatchProcessing);

// Predicciones ML (solo administradores)
import * as mlPredictionController from '../controllers/bigData/mlPredictionController.js';
router.get('/predict/attendance/:eventId', authorizeRoles('administrador'), mlPredictionController.getAttendancePrediction);
router.post('/predict/batch', authorizeRoles('administrador'), mlPredictionController.getBatchPredictions);
router.get('/predict/mobility/:buildingId', authorizeRoles('administrador'), mlPredictionController.getMobilityPrediction);
router.get('/predict/saturation/:type/:id', authorizeRoles('administrador'), mlPredictionController.getSaturationPrediction);
router.get('/ml/status', authorizeRoles('administrador'), mlPredictionController.checkMLServiceStatus);

export default router;

