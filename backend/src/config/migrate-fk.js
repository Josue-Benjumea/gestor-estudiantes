import { initDatabase, getDatabase } from './database.js';

export async function migrateDatabase() {
  console.log('🔄 Starting database migration: activities foreign key...');
  
  const db = getDatabase();

  try {
    // Check if migration is needed
    const fkList = db.prepare("PRAGMA foreign_key_list(activities)").all();
    const profFk = fkList.find(fk => fk.table === 'users' && fk.from === 'professor_id');
    
    if (profFk && profFk.on_delete === 'SET NULL') {
      console.log('✅ Migration already applied. Skipping.');
      return;
    }

    console.log('⚠️ Migration needed. Proceeding...');
    
    db.exec('PRAGMA foreign_keys=OFF;');
    const transaction = db.transaction(() => {
      console.log('1. Creating new_activities table...');
      db.exec(`
        CREATE TABLE new_activities (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          description TEXT,
          subject_id INTEGER NOT NULL,
          professor_id INTEGER,
          period_id INTEGER NOT NULL,
          created_at TEXT DEFAULT (datetime('now')),
          FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
          FOREIGN KEY (professor_id) REFERENCES users(id) ON DELETE SET NULL,
          FOREIGN KEY (period_id) REFERENCES academic_periods(id) ON DELETE CASCADE
        );
      `);

      console.log('2. Copying data...');
      db.exec(`INSERT INTO new_activities SELECT * FROM activities;`);

      console.log('3. Swapping tables...');
      db.exec(`DROP TABLE activities;`);
      db.exec(`ALTER TABLE new_activities RENAME TO activities;`);

      console.log('4. Recreating indexes...');
      db.exec(`
        CREATE INDEX IF NOT EXISTS idx_activities_professor ON activities(professor_id);
        CREATE INDEX IF NOT EXISTS idx_activities_period ON activities(period_id);
        CREATE INDEX IF NOT EXISTS idx_activities_subject ON activities(subject_id);
      `);
    });

    transaction();
    db.exec('PRAGMA foreign_keys=ON;');

    console.log('✅ Migration completed successfully.');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    db.exec('PRAGMA foreign_keys=ON;');
  }
}
