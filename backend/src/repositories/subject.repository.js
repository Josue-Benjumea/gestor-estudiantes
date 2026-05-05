import { getDatabase } from '../config/database.js';

/**
 * Subject Repository - Data access layer for subjects table.
 */
export class SubjectRepository {
  findAll() {
    const db = getDatabase();
    return db.prepare('SELECT * FROM subjects ORDER BY name').all();
  }

  findById(id) {
    const db = getDatabase();
    return db.prepare('SELECT * FROM subjects WHERE id = ?').get(id);
  }

  create({ name, description }) {
    const db = getDatabase();
    const result = db.prepare('INSERT INTO subjects (name, description) VALUES (?, ?)').run(name, description || null);
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
    db.prepare(`UPDATE subjects SET ${fields.join(', ')} WHERE id = ?`).run(...values);
    return this.findById(id);
  }

  delete(id) {
    const db = getDatabase();
    return db.prepare('DELETE FROM subjects WHERE id = ?').run(id);
  }
}

export const subjectRepository = new SubjectRepository();
