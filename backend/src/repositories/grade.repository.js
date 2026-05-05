import { getDatabase } from '../config/database.js';

/**
 * Grade Repository - Data access layer for grades table.
 * Grades are now linked to activities, not directly to subjects.
 */
export class GradeRepository {
  findById(id) {
    const db = getDatabase();
    return db.prepare(`
      SELECT gr.*, a.name as activity_name, a.subject_id, a.professor_id, a.period_id,
        s.name as subject_name, u.first_name as student_first_name, u.last_name as student_last_name
      FROM grades gr
      JOIN activities a ON a.id = gr.activity_id
      JOIN subjects s ON s.id = a.subject_id
      JOIN users u ON u.id = gr.student_id
      WHERE gr.id = ?
    `).get(id);
  }

  /** Create or update a grade for a student on an activity */
  upsert({ student_id, activity_id, grade, comments }) {
    const db = getDatabase();
    const existing = db.prepare('SELECT id FROM grades WHERE student_id = ? AND activity_id = ?').get(student_id, activity_id);

    if (existing) {
      db.prepare(`UPDATE grades SET grade = ?, comments = ?, updated_at = datetime('now') WHERE id = ?`)
        .run(grade, comments || null, existing.id);
      return this.findById(existing.id);
    } else {
      const result = db.prepare(`INSERT INTO grades (student_id, activity_id, grade, comments) VALUES (?, ?, ?, ?)`)
        .run(student_id, activity_id, grade, comments || null);
      return this.findById(result.lastInsertRowid);
    }
  }

  /** Bulk upsert grades for an activity */
  bulkUpsert(activityId, grades) {
    const db = getDatabase();
    const upsert = db.transaction(() => {
      grades.forEach(({ student_id, grade, comments }) => {
        const existing = db.prepare('SELECT id FROM grades WHERE student_id = ? AND activity_id = ?').get(student_id, activityId);
        if (existing) {
          db.prepare(`UPDATE grades SET grade = ?, comments = ?, updated_at = datetime('now') WHERE id = ?`)
            .run(grade, comments || null, existing.id);
        } else {
          db.prepare(`INSERT INTO grades (student_id, activity_id, grade, comments) VALUES (?, ?, ?, ?)`)
            .run(student_id, activityId, grade, comments || null);
        }
      });
    });
    upsert();
  }

  /** Get student's grades grouped by subject and period — with activity detail */
  getStudentGradesBySubject(studentId) {
    const db = getDatabase();
    return db.prepare(`
      SELECT gr.id, gr.grade, gr.comments, gr.created_at,
        a.id as activity_id, a.name as activity_name, a.period_id,
        s.id as subject_id, s.name as subject_name,
        ap.name as period_name, ap.is_active as period_active,
        u.first_name as professor_first_name, u.last_name as professor_last_name
      FROM grades gr
      JOIN activities a ON a.id = gr.activity_id
      JOIN subjects s ON s.id = a.subject_id
      JOIN academic_periods ap ON ap.id = a.period_id
      LEFT JOIN users u ON u.id = a.professor_id
      WHERE gr.student_id = ?
      ORDER BY ap.id DESC, s.name, a.created_at DESC
    `).all(studentId);
  }

  /** Get subject averages per student (for dashboard) */
  getStudentSubjectAverages(studentId) {
    const db = getDatabase();
    return db.prepare(`
      SELECT s.id as subject_id, s.name as subject_name, a.period_id,
        ap.name as period_name, ap.is_active as period_active,
        ROUND(AVG(gr.grade), 1) as average,
        COUNT(gr.id) as activity_count
      FROM grades gr
      JOIN activities a ON a.id = gr.activity_id
      JOIN subjects s ON s.id = a.subject_id
      JOIN academic_periods ap ON ap.id = a.period_id
      WHERE gr.student_id = ?
      GROUP BY s.id, a.period_id
      ORDER BY ap.id DESC, s.name
    `).all(studentId);
  }

  /** Get grade averages by subject (dashboard) */
  getAveragesBySubject() {
    const db = getDatabase();
    return db.prepare(`
      SELECT s.id, s.name, 
        ROUND(AVG(gr.grade), 1) as average,
        COUNT(gr.id) as total_grades,
        MIN(gr.grade) as min_grade,
        MAX(gr.grade) as max_grade
      FROM subjects s
      LEFT JOIN activities a ON a.subject_id = s.id
      LEFT JOIN grades gr ON gr.activity_id = a.id
      WHERE gr.id IS NOT NULL
      GROUP BY s.id
      ORDER BY average DESC
    `).all();
  }

  /** Get grade averages by group (dashboard) */
  getAveragesByGroup() {
    const db = getDatabase();
    return db.prepare(`
      SELECT g.id, g.name,
        ROUND(AVG(gr.grade), 1) as average,
        COUNT(DISTINCT gr.student_id) as student_count,
        COUNT(gr.id) as total_grades
      FROM groups_ g
      LEFT JOIN student_groups sg ON sg.group_id = g.id
      LEFT JOIN grades gr ON gr.student_id = sg.student_id
      WHERE gr.id IS NOT NULL
      GROUP BY g.id
      ORDER BY average DESC
    `).all();
  }

  /** Get top/bottom students by overall average */
  getStudentRankings(limit = 5) {
    const db = getDatabase();
    const top = db.prepare(`
      SELECT u.id, u.first_name, u.last_name, u.email,
        g.name as group_name,
        ROUND(AVG(gr.grade), 1) as average,
        COUNT(gr.id) as total_grades
      FROM users u
      JOIN grades gr ON gr.student_id = u.id
      LEFT JOIN student_groups sg ON sg.student_id = u.id
      LEFT JOIN groups_ g ON g.id = sg.group_id
      WHERE u.role = 'student'
      GROUP BY u.id
      ORDER BY average DESC
      LIMIT ?
    `).all(limit);

    const bottom = db.prepare(`
      SELECT u.id, u.first_name, u.last_name, u.email,
        g.name as group_name,
        ROUND(AVG(gr.grade), 1) as average,
        COUNT(gr.id) as total_grades
      FROM users u
      JOIN grades gr ON gr.student_id = u.id
      LEFT JOIN student_groups sg ON sg.student_id = u.id
      LEFT JOIN groups_ g ON g.id = sg.group_id
      WHERE u.role = 'student'
      GROUP BY u.id
      ORDER BY average ASC
      LIMIT ?
    `).all(limit);

    return { top, bottom };
  }

  /** Get grade distribution */
  getGradeDistribution() {
    const db = getDatabase();
    return db.prepare(`
      SELECT 
        CASE 
          WHEN grade >= 90 THEN 'A (90-100)'
          WHEN grade >= 80 THEN 'B (80-89)'
          WHEN grade >= 70 THEN 'C (70-79)'
          WHEN grade >= 60 THEN 'D (60-69)'
          ELSE 'F (0-59)'
        END as range,
        COUNT(*) as count
      FROM grades
      GROUP BY range
      ORDER BY range
    `).all();
  }
}

export const gradeRepository = new GradeRepository();
