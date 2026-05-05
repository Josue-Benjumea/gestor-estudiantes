import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = process.env.DB_PATH || path.join(__dirname, '..', '..', 'data', 'students.db');

let db;

/**
 * Initialize SQLite database connection and create tables if they don't exist.
 * Uses WAL mode for better concurrent read performance.
 */
export function initDatabase() {
  db = new Database(DB_PATH);

  // Performance optimizations
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  createTables();

  console.log('✅ Database initialized at:', DB_PATH);
  return db;
}

/**
 * Get the current database instance.
 */
export function getDatabase() {
  if (!db) {
    throw new Error('Database not initialized. Call initDatabase() first.');
  }
  return db;
}

/**
 * Create all tables with proper constraints and indexes.
 */
function createTables() {
  db.exec(`
    -- Users table (all roles: admin, professor, student)
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('admin','professor','student')),
      is_active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    -- Subjects (Materias)
    CREATE TABLE IF NOT EXISTS subjects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      description TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    -- Groups (Grupos: 6-A, 6-B, etc.)
    CREATE TABLE IF NOT EXISTS groups_ (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      description TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    -- Academic Periods (Periodos académicos)
    CREATE TABLE IF NOT EXISTS academic_periods (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      start_date TEXT,
      end_date TEXT,
      is_active INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    -- Student → Group assignment (1 student = 1 group)
    CREATE TABLE IF NOT EXISTS student_groups (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id INTEGER NOT NULL UNIQUE,
      group_id INTEGER NOT NULL,
      FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (group_id) REFERENCES groups_(id) ON DELETE CASCADE
    );

    -- Professor → Subject + Groups assignments
    CREATE TABLE IF NOT EXISTS professor_assignments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      professor_id INTEGER NOT NULL,
      subject_id INTEGER NOT NULL,
      group_id INTEGER NOT NULL,
      FOREIGN KEY (professor_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
      FOREIGN KEY (group_id) REFERENCES groups_(id) ON DELETE CASCADE,
      UNIQUE(professor_id, group_id)
    );

    -- Activities (created by professors, e.g. "Examen 1", "Tarea 3")
    CREATE TABLE IF NOT EXISTS activities (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      subject_id INTEGER NOT NULL,
      professor_id INTEGER NOT NULL,
      period_id INTEGER NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
      FOREIGN KEY (professor_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (period_id) REFERENCES academic_periods(id) ON DELETE CASCADE
    );

    -- Activity → Group assignments (which groups the activity applies to)
    CREATE TABLE IF NOT EXISTS activity_groups (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      activity_id INTEGER NOT NULL,
      group_id INTEGER NOT NULL,
      FOREIGN KEY (activity_id) REFERENCES activities(id) ON DELETE CASCADE,
      FOREIGN KEY (group_id) REFERENCES groups_(id) ON DELETE CASCADE,
      UNIQUE(activity_id, group_id)
    );

    -- Grades: 1 grade per student per activity
    CREATE TABLE IF NOT EXISTS grades (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id INTEGER NOT NULL,
      activity_id INTEGER NOT NULL,
      grade REAL NOT NULL CHECK(grade >= 0 AND grade <= 100),
      comments TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (activity_id) REFERENCES activities(id) ON DELETE CASCADE,
      UNIQUE(student_id, activity_id)
    );

    -- Settings (key-value store for institution config)
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT,
      updated_at TEXT DEFAULT (datetime('now'))
    );

    -- Indexes for performance
    CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    CREATE INDEX IF NOT EXISTS idx_grades_student ON grades(student_id);
    CREATE INDEX IF NOT EXISTS idx_grades_activity ON grades(activity_id);
    CREATE INDEX IF NOT EXISTS idx_activities_professor ON activities(professor_id);
    CREATE INDEX IF NOT EXISTS idx_activities_period ON activities(period_id);
    CREATE INDEX IF NOT EXISTS idx_activities_subject ON activities(subject_id);
    CREATE INDEX IF NOT EXISTS idx_student_groups_student ON student_groups(student_id);
    CREATE INDEX IF NOT EXISTS idx_professor_assignments_prof ON professor_assignments(professor_id);
    CREATE INDEX IF NOT EXISTS idx_academic_periods_active ON academic_periods(is_active);
    CREATE INDEX IF NOT EXISTS idx_activity_groups_activity ON activity_groups(activity_id);
  `);
}

export default { initDatabase, getDatabase };
