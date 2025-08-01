import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';

// Rutas
import buildingRoutes from './routes/buildingRoutes.js';
import authRoutes from './routes/authRoutes.js';

// Conexión y modelos
import connectDB from './config/db.js';
import './models/Building.js';
import './models/Career.js';
import './models/Service.js';
import './models/Auth.js'; // Asegúrate de que este archivo esté correctamente exportado

// Configuración
dotenv.config();
connectDB();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Rutas
app.use('/api/buildings', buildingRoutes);
app.use('/api/auth', authRoutes); // ← nueva ruta para autenticación

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
