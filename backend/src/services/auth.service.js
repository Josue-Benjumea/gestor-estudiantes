import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';
import { userRepository } from '../repositories/user.repository.js';

/**
 * Auth Service - Business logic for authentication.
 */
export class AuthService {
  /** Authenticate user and return JWT token */
  login(email, password) {
    const user = userRepository.findByEmail(email);

    if (!user) {
      const error = new Error('Credenciales inválidas');
      error.status = 401;
      throw error;
    }

    if (!user.is_active) {
      const error = new Error('Cuenta desactivada. Contacte al administrador');
      error.status = 403;
      throw error;
    }

    const isValid = bcrypt.compareSync(password, user.password);
    if (!isValid) {
      const error = new Error('Credenciales inválidas');
      error.status = 401;
      throw error;
    }

    const token = this.generateToken(user);
    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role,
      },
    };
  }

  /** Register a new student (public registration = student role only) */
  register({ email, password, first_name, last_name }) {
    const existing = userRepository.findByEmail(email);
    if (existing) {
      const error = new Error('El email ya está registrado');
      error.status = 409;
      throw error;
    }

    const hashedPassword = bcrypt.hashSync(password, 10);
    const user = userRepository.create({
      email,
      password: hashedPassword,
      first_name,
      last_name,
      role: 'student',
    });

    const token = this.generateToken(user);
    return { token, user };
  }

  /** Get current user profile */
  getProfile(userId) {
    const user = userRepository.findById(userId);
    if (!user) {
      const error = new Error('Usuario no encontrado');
      error.status = 404;
      throw error;
    }
    return user;
  }

  /** Generate JWT token */
  generateToken(user) {
    return jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn }
    );
  }
}

export const authService = new AuthService();
