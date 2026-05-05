import { authService } from '../services/auth.service.js';

export class AuthController {
  login(req, res, next) {
    try {
      const { email, password } = req.validatedBody;
      const result = authService.login(email, password);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  register(req, res, next) {
    try {
      const result = authService.register(req.validatedBody);
      res.status(201).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  getProfile(req, res, next) {
    try {
      const user = authService.getProfile(req.user.id);
      res.json({ success: true, data: user });
    } catch (error) {
      next(error);
    }
  }
}

export const authController = new AuthController();
