import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';

/**
 * JWT Authentication Middleware
 * Verifies the Bearer token and attaches user info to req.user
 */
export function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Token de autenticación requerido',
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, config.jwtSecret);
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expirado, inicie sesión nuevamente',
      });
    }
    return res.status(401).json({
      success: false,
      message: 'Token inválido',
    });
  }
}
