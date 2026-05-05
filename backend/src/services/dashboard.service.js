import { gradeRepository } from '../repositories/grade.repository.js';
import { getDatabase } from '../config/database.js';

/**
 * Dashboard Service - Business logic for statistics and analytics.
 */
export class DashboardService {
  /** Get all dashboard stats */
  getStats() {
    const db = getDatabase();

    const counts = db.prepare(`
      SELECT 
        (SELECT COUNT(*) FROM users WHERE role = 'student') as total_students,
        (SELECT COUNT(*) FROM users WHERE role = 'professor') as total_professors,
        (SELECT COUNT(*) FROM subjects) as total_subjects,
        (SELECT COUNT(*) FROM groups_) as total_groups,
        (SELECT COUNT(*) FROM academic_periods WHERE is_active = 1) as active_periods,
        (SELECT ROUND(AVG(grade), 1) FROM grades) as overall_average,
        (SELECT COUNT(*) FROM grades) as total_grades
    `).get();

    return counts;
  }

  /** Get averages by subject */
  getAveragesBySubject() {
    return gradeRepository.getAveragesBySubject();
  }

  /** Get averages by group */
  getAveragesByGroup() {
    return gradeRepository.getAveragesByGroup();
  }

  /** Get student rankings */
  getStudentRankings(limit = 5) {
    return gradeRepository.getStudentRankings(limit);
  }

  /** Get grade distribution */
  getGradeDistribution() {
    return gradeRepository.getGradeDistribution();
  }

  /** Get full dashboard data */
  getFullDashboard() {
    return {
      stats: this.getStats(),
      averagesBySubject: this.getAveragesBySubject(),
      averagesByGroup: this.getAveragesByGroup(),
      rankings: this.getStudentRankings(5),
      distribution: this.getGradeDistribution(),
    };
  }
}

export const dashboardService = new DashboardService();
