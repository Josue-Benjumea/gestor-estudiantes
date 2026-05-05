import { getDatabase } from '../config/database.js';

/**
 * Group Repository - Data access layer for groups_ table.
 */
export class GroupRepository {
  findAll() {
    const db = getDatabase();
    return db.prepare(`
      SELECT g.*, 
        (SELECT COUNT(*) FROM student_groups sg WHERE sg.group_id = g.id) as student_count
      FROM groups_ g ORDER BY g.name
    `).all();
  }

  findById(id) {
    const db = getDatabase();
    return db.prepare('SELECT * FROM groups_ WHERE id = ?').get(id);
  }

  create({ name, description }) {
    const db = getDatabase();
    const result = db.prepare('INSERT INTO groups_ (name, description) VALUES (?, ?)').run(name, description || null);
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
    db.prepare(`UPDATE groups_ SET ${fields.join(', ')} WHERE id = ?`).run(...values);
    return this.findById(id);
  }

  delete(id) {
    const db = getDatabase();
    return db.prepare('DELETE FROM groups_ WHERE id = ?').run(id);
  }
}

export const groupRepository = new GroupRepository();
