import { Router } from 'express';
import { subjectsController } from '../controllers/subjects.controller.js';
import { authenticate } from '../middleware/auth.js';
import { authorize } from '../middleware/rbac.js';
import { validate } from '../middleware/validate.js';
import { createSubjectSchema, updateSubjectSchema } from '../validators/subject.validator.js';

const router = Router();

router.use(authenticate);

router.get('/', authorize('admin', 'professor'), (req, res, next) => subjectsController.getAll(req, res, next));
router.get('/:id', authorize('admin', 'professor'), (req, res, next) => subjectsController.getById(req, res, next));
router.post('/', authorize('admin'), validate(createSubjectSchema), (req, res, next) => subjectsController.create(req, res, next));
router.put('/:id', authorize('admin'), validate(updateSubjectSchema), (req, res, next) => subjectsController.update(req, res, next));
router.delete('/:id', authorize('admin'), (req, res, next) => subjectsController.delete(req, res, next));

export default router;
