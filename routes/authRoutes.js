// routes/authRoutes.js
import express from 'express';
import registerController from '../controllers/auth/registerController.js';
import loginController from '../controllers/auth/loginController.js';
import * as authUD from '../controllers/auth/authUD.js';
import authMiddleware from '../middlewares/authMiddleware.js';


const router = express.Router();

router.post('/register', registerController);
router.post('/login', loginController);
// Las siguientes requieren autenticación
router.put('/me', authMiddleware, authUD.updateProfile);
router.delete('/me', authMiddleware, authUD.deleteAccount);

export default router;
