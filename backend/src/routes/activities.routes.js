import { Router } from 'express';
import { activitiesController } from '../controllers/activities.controller.js';
import { authenticate } from '../middleware/auth.js';
import { authorize } from '../middleware/rbac.js';

const router = Router();

// All routes require auth
router.use(authenticate);

// Professor: get own activities grouped by period
router.get('/my-activities', authorize('professor'), (req, res, next) => activitiesController.getMyActivities(req, res, next));

// Professor/Admin: list activities
router.get('/', authorize('professor', 'admin'), (req, res, next) => activitiesController.getAll(req, res, next));

// Professor/Admin: get single activity
router.get('/:id', authorize('professor', 'admin'), (req, res, next) => activitiesController.getById(req, res, next));

// Professor: get students for an activity with grades
router.get('/:id/students', authorize('professor', 'admin'), (req, res, next) => activitiesController.getStudents(req, res, next));

// Professor: create activity
router.post('/', authorize('professor'), (req, res, next) => activitiesController.create(req, res, next));

// Professor: update activity
router.put('/:id', authorize('professor'), (req, res, next) => activitiesController.update(req, res, next));

// Professor: delete activity
router.delete('/:id', authorize('professor', 'admin'), (req, res, next) => activitiesController.delete(req, res, next));

export default router;
