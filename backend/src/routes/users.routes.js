import { Router } from 'express';
import { usersController } from '../controllers/users.controller.js';
import { authenticate } from '../middleware/auth.js';
import { authorize } from '../middleware/rbac.js';
import { validate } from '../middleware/validate.js';
import { createUserSchema, updateUserSchema, assignGroupSchema, assignSubjectSchema } from '../validators/user.validator.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Admin-only routes
router.get('/', authorize('admin'), (req, res, next) => usersController.getAll(req, res, next));
router.get('/students', authorize('admin'), (req, res, next) => usersController.getStudentsWithGroups(req, res, next));
router.get('/professors', authorize('admin'), (req, res, next) => usersController.getProfessorsWithAssignments(req, res, next));
router.get('/group/:groupId/students', authorize('admin', 'professor'), (req, res, next) => usersController.getStudentsByGroup(req, res, next));
router.get('/:id', authorize('admin'), (req, res, next) => usersController.getById(req, res, next));
router.get('/:id/assignments', authorize('admin', 'professor'), (req, res, next) => usersController.getProfessorAssignments(req, res, next));

router.post('/', authorize('admin'), validate(createUserSchema), (req, res, next) => usersController.create(req, res, next));
router.put('/:id', authorize('admin'), validate(updateUserSchema), (req, res, next) => usersController.update(req, res, next));
router.delete('/:id', authorize('admin'), (req, res, next) => usersController.delete(req, res, next));

// Assignments
router.post('/:id/assign-group', authorize('admin'), validate(assignGroupSchema), (req, res, next) => usersController.assignGroup(req, res, next));
router.post('/:id/assign-subject', authorize('admin'), validate(assignSubjectSchema), (req, res, next) => usersController.assignSubject(req, res, next));
router.delete('/assignments/:assignmentId', authorize('admin'), (req, res, next) => usersController.removeAssignment(req, res, next));

export default router;
