import { Router } from 'express';
import { periodsController } from '../controllers/periods.controller.js';
import { authenticate } from '../middleware/auth.js';
import { authorize } from '../middleware/rbac.js';

const router = Router();

router.use(authenticate);

// All authenticated users can see periods
router.get('/', authorize('admin', 'professor', 'student'), (req, res, next) => periodsController.getAll(req, res, next));
router.get('/active', authorize('admin', 'professor', 'student'), (req, res, next) => periodsController.getActive(req, res, next));

// Admin-only management
router.post('/', authorize('admin'), (req, res, next) => periodsController.create(req, res, next));
router.put('/:id', authorize('admin'), (req, res, next) => periodsController.update(req, res, next));
router.post('/:id/activate', authorize('admin'), (req, res, next) => periodsController.activate(req, res, next));
router.post('/:id/deactivate', authorize('admin'), (req, res, next) => periodsController.deactivate(req, res, next));
router.delete('/:id', authorize('admin'), (req, res, next) => periodsController.delete(req, res, next));

export default router;
