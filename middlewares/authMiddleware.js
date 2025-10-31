// middlewares/authMiddleware.js
import jwt from 'jsonwebtoken';

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  // Verifica que venga el token con formato: Bearer TOKEN
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.log('❌ Auth: No hay header de autorización');
    return res.status(401).json({ error: 'No autorizado: Token no proporcionado' });
  }

  const token = authHeader.split(' ')[1];
  const jwtSecret = process.env.JWT_SECRET || 'clave_secreta';

  try {
    const decoded = jwt.verify(token, jwtSecret);
    // Asegurar que req.user tenga la estructura correcta
    req.user = {
      userId: decoded.userId || decoded.id,
      role: decoded.role
    };
    console.log('✅ Auth: Usuario autenticado:', req.user);
    next();
  } catch (error) {
    console.log('❌ Auth: Error verificando token:', error.message);
    return res.status(401).json({ error: 'Token inválido o expirado' });
  }
};

export default authMiddleware;
