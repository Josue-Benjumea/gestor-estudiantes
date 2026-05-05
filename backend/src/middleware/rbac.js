/**
 * Role-Based Access Control Middleware
 * Restricts access to endpoints based on user roles.
 * @param  {...string} roles - Allowed roles (e.g., 'admin', 'professor', 'student')
 */
export function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'No autenticado',
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'No tiene permisos para acceder a este recurso',
      });
    }

    next();
  };
}
