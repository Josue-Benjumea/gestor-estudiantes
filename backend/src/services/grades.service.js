import { gradeRepository } from '../repositories/grade.repository.js';
import { activityRepository } from '../repositories/activity.repository.js';
import { periodRepository } from '../repositories/period.repository.js';

/**
 * Grades Service - Business logic for grade management.
 * Grades are linked to activities. Averages are computed per subject.
 */
export class GradesService {
  /** Upsert a single grade */
  upsertGrade({ student_id, activity_id, grade, comments }) {
    const activity = activityRepository.findById(activity_id);
    if (!activity) {
      const error = new Error('Actividad no encontrada');
      error.status = 404;
      throw error;
    }
    const period = periodRepository.findById(activity.period_id);
    if (!period || !period.is_active) {
      const error = new Error('Solo se pueden registrar notas en el periodo activo');
      error.status = 400;
      throw error;
    }
    return gradeRepository.upsert({ student_id, activity_id, grade, comments });
  }

  /** Bulk upsert grades for an activity */
  bulkGrade(activityId, grades) {
    const activity = activityRepository.findById(activityId);
    if (!activity) {
      const error = new Error('Actividad no encontrada');
      error.status = 404;
      throw error;
    }
    const period = periodRepository.findById(activity.period_id);
    if (!period || !period.is_active) {
      const error = new Error('Solo se pueden registrar notas en el periodo activo');
      error.status = 400;
      throw error;
    }
    gradeRepository.bulkUpsert(activityId, grades);
    return activityRepository.getActivityStudentsWithGrades(activityId);
  }

  /** Get student grades grouped by period → subject → activities */
  getStudentGrades(studentId) {
    const grades = gradeRepository.getStudentGradesBySubject(studentId);

    // Group: period → subject → grades[]
    const periods = {};
    grades.forEach((g) => {
      if (!periods[g.period_id]) {
        periods[g.period_id] = {
          period_id: g.period_id,
          period_name: g.period_name,
          is_active: g.period_active,
          subjects: {},
        };
      }
      const subjectKey = g.subject_id;
      if (!periods[g.period_id].subjects[subjectKey]) {
        periods[g.period_id].subjects[subjectKey] = {
          subject_id: g.subject_id,
          subject_name: g.subject_name,
          professor: `${g.professor_first_name} ${g.professor_last_name}`,
          activities: [],
          average: 0,
        };
      }
      periods[g.period_id].subjects[subjectKey].activities.push({
        activity_id: g.activity_id,
        activity_name: g.activity_name,
        grade: g.grade,
        comments: g.comments,
        date: g.created_at,
      });
    });

    // Compute averages and convert subjects object to array
    const result = Object.values(periods).map((p) => ({
      ...p,
      subjects: Object.values(p.subjects).map((s) => ({
        ...s,
        average: s.activities.length > 0
          ? Math.round((s.activities.reduce((sum, a) => sum + a.grade, 0) / s.activities.length) * 10) / 10
          : 0,
      })),
    }));

    return result;
  }

  /** Get subject averages for student (summary view) */
  getStudentAverages(studentId) {
    return gradeRepository.getStudentSubjectAverages(studentId);
  }
}

export const gradesService = new GradesService();
