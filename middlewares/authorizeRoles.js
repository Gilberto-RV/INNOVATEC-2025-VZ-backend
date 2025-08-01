// middlewares/authorizeRoles.js
const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    const userRole = req.user?.role;

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        error: 'Acceso denegado: No tienes los permisos suficientes'
      });
    }

    next();
  };
};

export default authorizeRoles;
