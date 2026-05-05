import { Router } from 'express';
import { authController } from '../controllers/auth.controller.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { loginSchema, registerSchema } from '../validators/auth.validator.js';

const router = Router();

router.post('/login', validate(loginSchema), (req, res, next) => authController.login(req, res, next));
router.post('/register', validate(registerSchema), (req, res, next) => authController.register(req, res, next));
router.get('/me', authenticate, (req, res, next) => authController.getProfile(req, res, next));

export default router;
