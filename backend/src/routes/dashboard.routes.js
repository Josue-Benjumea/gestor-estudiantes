import { Router } from 'express';
import { dashboardController } from '../controllers/dashboard.controller.js';
import { authenticate } from '../middleware/auth.js';
import { authorize } from '../middleware/rbac.js';

const router = Router();

router.use(authenticate);

router.get('/', authorize('admin'), (req, res, next) => dashboardController.getFullDashboard(req, res, next));
router.get('/stats', authorize('admin'), (req, res, next) => dashboardController.getStats(req, res, next));
router.get('/averages', authorize('admin', 'professor'), (req, res, next) => dashboardController.getAverages(req, res, next));

export default router;
