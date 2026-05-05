import { getDatabase } from '../config/database.js';

/**
 * Period Repository - Data access layer for academic_periods table.
 */
export class PeriodRepository {
  findAll() {
    const db = getDatabase();
    return db.prepare(`
      SELECT ap.*, 
        (SELECT COUNT(*) FROM grades g 
         JOIN activities a ON a.id = g.activity_id 
         WHERE a.period_id = ap.id) as grade_count
      FROM academic_periods ap 
      ORDER BY ap.id
    `).all();
  }

  findById(id) {
    const db = getDatabase();
    return db.prepare('SELECT * FROM academic_periods WHERE id = ?').get(id);
  }

  findActive() {
    const db = getDatabase();
    return db.prepare('SELECT * FROM academic_periods WHERE is_active = 1').get();
  }

  create({ name, description, start_date, end_date }) {
    const db = getDatabase();
    const result = db.prepare(`
      INSERT INTO academic_periods (name, description, start_date, end_date, is_active) 
      VALUES (?, ?, ?, ?, 0)
    `).run(name, description || null, start_date || null, end_date || null);
    return this.findById(result.lastInsertRowid);
  }

  update(id, data) {
    const db = getDatabase();
    const fields = [];
    const values = [];

    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined && key !== 'id') {
        fields.push(`${key} = ?`);
        values.push(value);
      }
    }

    if (fields.length === 0) return this.findById(id);

    fields.push("updated_at = datetime('now')");
    values.push(id);

    db.prepare(`UPDATE academic_periods SET ${fields.join(', ')} WHERE id = ?`).run(...values);
    return this.findById(id);
  }

  /** Activate a period (deactivates all others first) */
  activate(id) {
    const db = getDatabase();
    const activate = db.transaction(() => {
      db.prepare('UPDATE academic_periods SET is_active = 0, updated_at = datetime(\'now\')').run();
      db.prepare('UPDATE academic_periods SET is_active = 1, start_date = COALESCE(start_date, datetime(\'now\')), updated_at = datetime(\'now\') WHERE id = ?').run(id);
    });
    activate();
    return this.findById(id);
  }

  /** Deactivate a period (end it) */
  deactivate(id) {
    const db = getDatabase();
    db.prepare(`
      UPDATE academic_periods 
      SET is_active = 0, end_date = COALESCE(end_date, datetime('now')), updated_at = datetime('now') 
      WHERE id = ?
    `).run(id);
    return this.findById(id);
  }

  delete(id) {
    const db = getDatabase();
    return db.prepare('DELETE FROM academic_periods WHERE id = ?').run(id);
  }
}

export const periodRepository = new PeriodRepository();
