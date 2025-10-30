import express from 'express';
import authMiddleware from '../middlewares/authMiddleware.js';
import authorizeRoles from '../middlewares/authorizeRoles.js';

import { getAllBuildingsController } from '../controllers/building/getAllBuildingsController.js';
import { getBuildingByIdController } from '../controllers/building/getBuildingByIdController.js';
import { updateBuildingController } from '../controllers/building/updateBuildingController.js';

const router = express.Router();
router.use(authMiddleware);

router.get('/', getAllBuildingsController);
router.get('/:id', getBuildingByIdController);

router.put('/:id', authorizeRoles('administrador'), updateBuildingController);

export default router;
