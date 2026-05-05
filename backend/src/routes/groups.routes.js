import { Router } from 'express';
import { groupsController } from '../controllers/groups.controller.js';
import { authenticate } from '../middleware/auth.js';
import { authorize } from '../middleware/rbac.js';

const router = Router();

router.use(authenticate);

router.get('/', authorize('admin', 'professor'), (req, res, next) => groupsController.getAll(req, res, next));
router.get('/:id', authorize('admin', 'professor'), (req, res, next) => groupsController.getById(req, res, next));
router.post('/', authorize('admin'), (req, res, next) => groupsController.create(req, res, next));
router.put('/:id', authorize('admin'), (req, res, next) => groupsController.update(req, res, next));
router.delete('/:id', authorize('admin'), (req, res, next) => groupsController.delete(req, res, next));

export default router;
