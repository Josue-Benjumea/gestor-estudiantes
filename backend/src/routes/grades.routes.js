import { Router } from 'express';
import { gradesController } from '../controllers/grades.controller.js';
import { authenticate } from '../middleware/auth.js';
import { authorize } from '../middleware/rbac.js';

const router = Router();

router.use(authenticate);

// Student: get own grades grouped by period/subject/activity
router.get('/my-grades', authorize('student'), (req, res, next) => gradesController.getMyGrades(req, res, next));

// Student: get subject averages
router.get('/my-averages', authorize('student'), (req, res, next) => gradesController.getMyAverages(req, res, next));

// Professor: upsert a single grade
router.post('/', authorize('professor'), (req, res, next) => gradesController.upsert(req, res, next));

// Professor: bulk grade an activity
router.post('/activity/:activityId/bulk', authorize('professor'), (req, res, next) => gradesController.bulkGrade(req, res, next));

export default router;
