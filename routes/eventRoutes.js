import express from 'express';
import authMiddleware from '../middlewares/authMiddleware.js';
import authorizeRoles from '../middlewares/authorizeRoles.js';

import {
  getAllEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  getEventStatistics,
  getCategories
} from '../controllers/events/eventController.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/', getAllEvents);
router.get('/:id', getEventById);
router.post('/', authorizeRoles('administrador'), createEvent);
router.put('/:id', authorizeRoles('administrador'), updateEvent);
router.delete('/:id', authorizeRoles('administrador'), deleteEvent);

// Extras
router.get('/tatistics/general', getEventStatistics);
router.get('/categories/list', getCategories);


export default router;
