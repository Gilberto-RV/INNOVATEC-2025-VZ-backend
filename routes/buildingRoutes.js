import express from 'express';
import authMiddleware from '../middlewares/authMiddleware.js';
import authorizeRoles from '../middlewares/authorizeRoles.js';
import { createBuildingController } from '../controllers/building/createBuildingController.js';
import { getAllBuildingsController } from '../controllers/building/getAllBuildingsController.js';
import { getBuildingByIdController } from '../controllers/building/getBuildingByIdController.js';
import { updateBuildingController } from '../controllers/building/updateBuildingController.js';
import { deleteBuildingController } from '../controllers/building/deleteBuildingController.js';

const router = express.Router();
router.use(authMiddleware);

router.get('/', getAllBuildingsController);
router.get('/:id', getBuildingByIdController);

router.post('/', authorizeRoles('administrador'), createBuildingController);
router.put('/:id', authorizeRoles('administrador'), updateBuildingController);
router.delete('/:id', authorizeRoles('administrador'), deleteBuildingController);

export default router;
