import { getDatabase } from '../config/database.js';

/**
 * User Repository - Data access layer for users table.
 */
export class UserRepository {
  /** Find user by email */
  findByEmail(email) {
    const db = getDatabase();
    return db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  }

  /** Find user by ID */
  findById(id) {
    const db = getDatabase();
    return db.prepare('SELECT id, email, first_name, last_name, role, is_active, created_at FROM users WHERE id = ?').get(id);
  }

  /** Find user by ID including password (for auth) */
  findByIdFull(id) {
    const db = getDatabase();
    return db.prepare('SELECT * FROM users WHERE id = ?').get(id);
  }

  /** List all users, optionally filtered by role */
  findAll({ role, search, limit = 100, offset = 0 }) {
    const db = getDatabase();
    let query = 'SELECT id, email, first_name, last_name, role, is_active, created_at FROM users WHERE 1=1';
    const params = [];

    if (role) {
      query += ' AND role = ?';
      params.push(role);
    }

    if (search) {
      query += ' AND (first_name LIKE ? OR last_name LIKE ? OR email LIKE ?)';
      const s = `%${search}%`;
      params.push(s, s, s);
    }

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    return db.prepare(query).all(...params);
  }

  /** Count users with optional filters */
  count({ role, search }) {
    const db = getDatabase();
    let query = 'SELECT COUNT(*) as total FROM users WHERE 1=1';
    const params = [];

    if (role) {
      query += ' AND role = ?';
      params.push(role);
    }

    if (search) {
      query += ' AND (first_name LIKE ? OR last_name LIKE ? OR email LIKE ?)';
      const s = `%${search}%`;
      params.push(s, s, s);
    }

    return db.prepare(query).get(...params).total;
  }

  /** Create a new user */
  create({ email, password, first_name, last_name, role }) {
    const db = getDatabase();
    const result = db.prepare(
      'INSERT INTO users (email, password, first_name, last_name, role) VALUES (?, ?, ?, ?, ?)'
    ).run(email, password, first_name, last_name, role);
    return this.findById(result.lastInsertRowid);
  }

  /** Update user by ID */
  update(id, data) {
    const db = getDatabase();
    const fields = [];
    const values = [];

    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined) {
        fields.push(`${key} = ?`);
        values.push(value);
      }
    }

    if (fields.length === 0) return this.findById(id);

    fields.push("updated_at = datetime('now')");
    values.push(id);

    db.prepare(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`).run(...values);
    return this.findById(id);
  }

  /** Delete user by ID */
  delete(id) {
    const db = getDatabase();
    return db.prepare('DELETE FROM users WHERE id = ?').run(id);
  }

  /** Assign student to a group */
  assignStudentToGroup(studentId, groupId) {
    const db = getDatabase();
    // Remove existing assignment
    db.prepare('DELETE FROM student_groups WHERE student_id = ?').run(studentId);
    // Create new assignment
    db.prepare('INSERT INTO student_groups (student_id, group_id) VALUES (?, ?)').run(studentId, groupId);
  }

  /** Get student's group */
  getStudentGroup(studentId) {
    const db = getDatabase();
    return db.prepare(`
      SELECT g.* FROM groups_ g
      JOIN student_groups sg ON sg.group_id = g.id
      WHERE sg.student_id = ?
    `).get(studentId);
  }

  /** Assign professor to subject + group */
  assignProfessorToSubject(professorId, subjectId, groupId) {
    const db = getDatabase();
    db.prepare(
      'INSERT OR REPLACE INTO professor_assignments (professor_id, subject_id, group_id) VALUES (?, ?, ?)'
    ).run(professorId, subjectId, groupId);
  }

  /** Get professor's assignments */
  getProfessorAssignments(professorId) {
    const db = getDatabase();
    return db.prepare(`
      SELECT pa.*, s.name as subject_name, g.name as group_name
      FROM professor_assignments pa
      JOIN subjects s ON s.id = pa.subject_id
      JOIN groups_ g ON g.id = pa.group_id
      WHERE pa.professor_id = ?
    `).all(professorId);
  }

  /** Remove a professor assignment */
  removeProfessorAssignment(assignmentId) {
    const db = getDatabase();
    return db.prepare('DELETE FROM professor_assignments WHERE id = ?').run(assignmentId);
  }

  /** Get students by group with their group info */
  getStudentsByGroup(groupId) {
    const db = getDatabase();
    return db.prepare(`
      SELECT u.id, u.email, u.first_name, u.last_name, u.is_active,
             g.name as group_name, g.id as group_id
      FROM users u
      JOIN student_groups sg ON sg.student_id = u.id
      JOIN groups_ g ON g.id = sg.group_id
      WHERE sg.group_id = ? AND u.role = 'student'
      ORDER BY u.last_name, u.first_name
    `).all(groupId);
  }

  /** Get all students with group info */
  getAllStudentsWithGroups() {
    const db = getDatabase();
    return db.prepare(`
      SELECT u.id, u.email, u.first_name, u.last_name, u.is_active, u.created_at,
             g.name as group_name, g.id as group_id
      FROM users u
      LEFT JOIN student_groups sg ON sg.student_id = u.id
      LEFT JOIN groups_ g ON g.id = sg.group_id
      WHERE u.role = 'student'
      ORDER BY u.last_name, u.first_name
    `).all();
  }

  /** Get all professors with assignment info */
  getAllProfessorsWithAssignments() {
    const db = getDatabase();
    const professors = db.prepare(`
      SELECT id, email, first_name, last_name, is_active, created_at 
      FROM users WHERE role = 'professor' 
      ORDER BY last_name, first_name
    `).all();

    return professors.map((prof) => {
      const assignments = this.getProfessorAssignments(prof.id);
      return { ...prof, assignments };
    });
  }
}

export const userRepository = new UserRepository();
