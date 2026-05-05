import { gradesService } from '../services/grades.service.js';

export class GradesController {
  /** Upsert a single grade */
  upsert(req, res, next) {
    try {
      const grade = gradesService.upsertGrade(req.body, req.user.id);
      res.json({ success: true, data: grade });
    } catch (error) { next(error); }
  }

  /** Bulk upsert grades for an activity */
  bulkGrade(req, res, next) {
    try {
      const { grades } = req.body;
      const result = gradesService.bulkGrade(parseInt(req.params.activityId), grades, req.user.id);
      res.json({ success: true, data: result, message: 'Calificaciones guardadas' });
    } catch (error) { next(error); }
  }

  /** Student: get own grades grouped by period → subject → activities */
  getMyGrades(req, res, next) {
    try {
      const data = gradesService.getStudentGrades(req.user.id);
      res.json({ success: true, data });
    } catch (error) { next(error); }
  }

  /** Student: get subject averages */
  getMyAverages(req, res, next) {
    try {
      const data = gradesService.getStudentAverages(req.user.id);
      res.json({ success: true, data });
    } catch (error) { next(error); }
  }
}

export const gradesController = new GradesController();
