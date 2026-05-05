import { activitiesService } from '../services/activities.service.js';

export class ActivitiesController {
  /** Get activities (professor's own or by filters) */
  getAll(req, res, next) {
    try {
      const filters = {};
      if (req.user.role === 'professor') {
        filters.professor_id = req.user.id;
      }
      if (req.query.period_id) filters.period_id = parseInt(req.query.period_id);
      if (req.query.subject_id) filters.subject_id = parseInt(req.query.subject_id);

      const activities = activitiesService.getAll(filters);
      res.json({ success: true, data: activities });
    } catch (error) { next(error); }
  }

  /** Get professor activities grouped by period */
  getMyActivities(req, res, next) {
    try {
      const data = activitiesService.getProfessorActivities(req.user.id);
      res.json({ success: true, data });
    } catch (error) { next(error); }
  }

  /** Get single activity */
  getById(req, res, next) {
    try {
      const activity = activitiesService.getById(parseInt(req.params.id));
      res.json({ success: true, data: activity });
    } catch (error) { next(error); }
  }

  /** Create a new activity */
  create(req, res, next) {
    try {
      const { name, description, subject_id, period_id, group_ids } = req.body;
      const activity = activitiesService.create({
        name,
        description,
        subject_id,
        professor_id: req.user.id,
        period_id,
        group_ids,
      });
      res.status(201).json({ success: true, data: activity });
    } catch (error) { next(error); }
  }

  /** Update activity */
  update(req, res, next) {
    try {
      const activity = activitiesService.update(parseInt(req.params.id), req.body);
      res.json({ success: true, data: activity });
    } catch (error) { next(error); }
  }

  /** Delete activity */
  delete(req, res, next) {
    try {
      activitiesService.delete(parseInt(req.params.id));
      res.json({ success: true, message: 'Actividad eliminada' });
    } catch (error) { next(error); }
  }

  /** Get students for an activity with their grades */
  getStudents(req, res, next) {
    try {
      const students = activitiesService.getStudentsWithGrades(parseInt(req.params.id));
      res.json({ success: true, data: students });
    } catch (error) { next(error); }
  }
}

export const activitiesController = new ActivitiesController();
