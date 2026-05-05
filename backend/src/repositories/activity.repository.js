import { getDatabase } from '../config/database.js';

/**
 * Activity Repository - Data access layer for activities table.
 */
export class ActivityRepository {
  /** Get all activities with group info, filtered by professor and/or period */
  findAll({ professor_id, period_id, subject_id }) {
    const db = getDatabase();
    let query = `
      SELECT DISTINCT a.*, 
        s.name as subject_name,
        u.first_name as professor_first_name, u.last_name as professor_last_name,
        ap.name as period_name, ap.is_active as period_active,
        (SELECT COUNT(*) FROM grades g WHERE g.activity_id = a.id) as grade_count,
        (SELECT COUNT(*) FROM activity_groups ag2 
         JOIN student_groups sg ON sg.group_id = ag2.group_id 
         WHERE ag2.activity_id = a.id) as student_count
      FROM activities a
      JOIN subjects s ON s.id = a.subject_id
      LEFT JOIN users u ON u.id = a.professor_id
      JOIN academic_periods ap ON ap.id = a.period_id
      LEFT JOIN activity_groups ag ON ag.activity_id = a.id
      WHERE 1=1
    `;
    const params = [];

    if (professor_id) { 
      query += ` AND (a.professor_id = ? OR EXISTS (
        SELECT 1 FROM professor_assignments pa
        WHERE pa.professor_id = ? AND pa.subject_id = a.subject_id AND pa.group_id = ag.group_id
      ))`; 
      params.push(professor_id, professor_id); 
    }
    if (period_id) { query += ' AND a.period_id = ?'; params.push(period_id); }
    if (subject_id) { query += ' AND a.subject_id = ?'; params.push(subject_id); }

    query += ' ORDER BY a.created_at DESC';
    return db.prepare(query).all(...params);
  }

  findById(id) {
    const db = getDatabase();
    return db.prepare(`
      SELECT a.*, 
        s.name as subject_name,
        u.first_name as professor_first_name, u.last_name as professor_last_name,
        ap.name as period_name, ap.is_active as period_active
      FROM activities a
      JOIN subjects s ON s.id = a.subject_id
      LEFT JOIN users u ON u.id = a.professor_id
      JOIN academic_periods ap ON ap.id = a.period_id
      WHERE a.id = ?
    `).get(id);
  }

  create({ name, description, subject_id, professor_id, period_id }) {
    const db = getDatabase();
    const result = db.prepare(`
      INSERT INTO activities (name, description, subject_id, professor_id, period_id)
      VALUES (?, ?, ?, ?, ?)
    `).run(name, description || null, subject_id, professor_id, period_id);
    return this.findById(result.lastInsertRowid);
  }

  update(id, { name, description }) {
    const db = getDatabase();
    const fields = [];
    const values = [];
    if (name !== undefined) { fields.push('name = ?'); values.push(name); }
    if (description !== undefined) { fields.push('description = ?'); values.push(description); }
    if (fields.length === 0) return this.findById(id);
    values.push(id);
    db.prepare(`UPDATE activities SET ${fields.join(', ')} WHERE id = ?`).run(...values);
    return this.findById(id);
  }

  delete(id) {
    const db = getDatabase();
    return db.prepare('DELETE FROM activities WHERE id = ?').run(id);
  }

  /** Assign activity to groups */
  assignGroups(activityId, groupIds) {
    const db = getDatabase();
    // Clear existing
    db.prepare('DELETE FROM activity_groups WHERE activity_id = ?').run(activityId);
    const insert = db.prepare('INSERT INTO activity_groups (activity_id, group_id) VALUES (?, ?)');
    groupIds.forEach((gid) => insert.run(activityId, gid));
  }

  /** Get groups for an activity */
  getActivityGroups(activityId) {
    const db = getDatabase();
    return db.prepare(`
      SELECT g.* FROM groups_ g
      JOIN activity_groups ag ON ag.group_id = g.id
      WHERE ag.activity_id = ?
    `).all(activityId);
  }

  /** Get students for an activity (from its assigned groups) with their grades */
  getActivityStudentsWithGrades(activityId) {
    const db = getDatabase();
    return db.prepare(`
      SELECT u.id as student_id, u.first_name, u.last_name, u.email,
        g.name as group_name, g.id as group_id,
        gr.id as grade_id, gr.grade, gr.comments
      FROM activity_groups ag
      JOIN student_groups sg ON sg.group_id = ag.group_id
      JOIN users u ON u.id = sg.student_id
      JOIN groups_ g ON g.id = sg.group_id
      LEFT JOIN grades gr ON gr.student_id = u.id AND gr.activity_id = ag.activity_id
      WHERE ag.activity_id = ?
      ORDER BY g.name, u.last_name, u.first_name
    `).all(activityId);
  }
}

export const activityRepository = new ActivityRepository();
