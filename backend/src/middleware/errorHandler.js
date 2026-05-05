/**
 * Global Error Handler Middleware
 * Catches all unhandled errors and returns a consistent JSON response.
 */
export function errorHandler(err, req, res, _next) {
  console.error('❌ Error:', err.message);

  if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
    return res.status(409).json({
      success: false,
      message: 'El registro ya existe o viola una restricción única',
    });
  }

  if (err.code === 'SQLITE_CONSTRAINT_FOREIGNKEY') {
    return res.status(400).json({
      success: false,
      message: 'Referencia a un registro que no existe',
    });
  }

  if (err.status) {
    return res.status(err.status).json({
      success: false,
      message: err.message,
    });
  }

  res.status(500).json({
    success: false,
    message: 'Error interno del servidor',
  });
}
