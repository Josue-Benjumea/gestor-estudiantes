import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { getDatabase } from '../config/database.js';
import { authenticate } from '../middleware/auth.js';
import { authorize } from '../middleware/rbac.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const UPLOADS_DIR = path.join(__dirname, '..', '..', 'data', 'uploads');

// Ensure uploads directory exists
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Configure multer for logo upload
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOADS_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `institution-logo${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: (_req, file, cb) => {
    const allowed = ['.png', '.jpg', '.jpeg', '.webp', '.svg'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) cb(null, true);
    else cb(new Error('Solo se permiten imágenes (png, jpg, webp, svg)'));
  },
});

const router = Router();

// ─── Public: Get institution logo ──────────────────────────
router.get('/institution-logo', (req, res) => {
  const db = getDatabase();
  const setting = db.prepare("SELECT value FROM settings WHERE key = 'institution_logo'").get();

  if (setting && setting.value) {
    const logoPath = path.join(UPLOADS_DIR, setting.value);
    if (fs.existsSync(logoPath)) {
      return res.sendFile(logoPath);
    }
  }

  res.status(404).json({ success: false, message: 'Logo no configurado' });
});

// ─── Public: Get institution name ──────────────────────────
router.get('/institution-name', (req, res) => {
  const db = getDatabase();
  const setting = db.prepare("SELECT value FROM settings WHERE key = 'institution_name'").get();
  res.json({ success: true, data: setting?.value || 'Institución Educativa' });
});

// ─── Public: Get all settings ──────────────────────────────
router.get('/', (req, res) => {
  const db = getDatabase();
  const settings = db.prepare('SELECT key, value FROM settings').all();
  const result = {};
  settings.forEach((s) => { result[s.key] = s.value; });
  res.json({ success: true, data: result });
});

// ─── Admin: Upload institution logo ────────────────────────
router.post('/institution-logo', authenticate, authorize('admin'), upload.single('logo'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No se proporcionó un archivo' });
  }

  const db = getDatabase();
  db.prepare(`
    INSERT INTO settings (key, value, updated_at) VALUES ('institution_logo', ?, datetime('now'))
    ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = datetime('now')
  `).run(req.file.filename);

  res.json({ success: true, message: 'Logo actualizado exitosamente', data: { filename: req.file.filename } });
});

// ─── Admin: Update institution name ────────────────────────
router.post('/institution-name', authenticate, authorize('admin'), (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ success: false, message: 'El nombre es requerido' });

  const db = getDatabase();
  db.prepare(`
    INSERT INTO settings (key, value, updated_at) VALUES ('institution_name', ?, datetime('now'))
    ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = datetime('now')
  `).run(name);

  res.json({ success: true, message: 'Nombre actualizado', data: { name } });
});

// ─── Admin: Delete institution logo ────────────────────────
router.delete('/institution-logo', authenticate, authorize('admin'), (req, res) => {
  const db = getDatabase();
  const setting = db.prepare("SELECT value FROM settings WHERE key = 'institution_logo'").get();

  if (setting && setting.value) {
    const logoPath = path.join(UPLOADS_DIR, setting.value);
    if (fs.existsSync(logoPath)) fs.unlinkSync(logoPath);
  }

  db.prepare("DELETE FROM settings WHERE key = 'institution_logo'").run();
  res.json({ success: true, message: 'Logo eliminado' });
});

// ─── Certificate data: get student info for PDF ────────────
router.get('/certificate/:studentId', authenticate, authorize('admin'), (req, res) => {
  const db = getDatabase();
  const studentId = parseInt(req.params.studentId);

  const student = db.prepare(`
    SELECT u.*, g.name as group_name, g.description as group_description
    FROM users u
    LEFT JOIN student_groups sg ON sg.student_id = u.id
    LEFT JOIN groups_ g ON g.id = sg.group_id
    WHERE u.id = ? AND u.role = 'student'
  `).get(studentId);

  if (!student) {
    return res.status(404).json({ success: false, message: 'Estudiante no encontrado' });
  }

  const institutionName = db.prepare("SELECT value FROM settings WHERE key = 'institution_name'").get();
  const institutionLogo = db.prepare("SELECT value FROM settings WHERE key = 'institution_logo'").get();

  // Get active period
  const activePeriod = db.prepare('SELECT * FROM academic_periods WHERE is_active = 1').get();

  // Get student's subject averages for active period (or latest)
  const subjects = db.prepare(`
    SELECT s.name as subject_name,
      ROUND(AVG(gr.grade), 1) as average,
      COUNT(gr.id) as activity_count
    FROM grades gr
    JOIN activities a ON a.id = gr.activity_id
    JOIN subjects s ON s.id = a.subject_id
    WHERE gr.student_id = ?
    ${activePeriod ? 'AND a.period_id = ?' : ''}
    GROUP BY s.id
    ORDER BY s.name
  `).all(...(activePeriod ? [studentId, activePeriod.id] : [studentId]));

  let logoBase64 = null;
  if (institutionLogo?.value) {
    const logoPath = path.join(UPLOADS_DIR, institutionLogo.value);
    if (fs.existsSync(logoPath)) {
      const fileData = fs.readFileSync(logoPath);
      const ext = path.extname(institutionLogo.value).toLowerCase().replace('.', '');
      const mime = ext === 'svg' ? 'image/svg+xml' : `image/${ext === 'jpg' ? 'jpeg' : ext}`;
      logoBase64 = `data:${mime};base64,${fileData.toString('base64')}`;
    }
  }

  res.json({
    success: true,
    data: {
      student: {
        id: student.id,
        first_name: student.first_name,
        last_name: student.last_name,
        email: student.email,
        group_name: student.group_name,
        group_description: student.group_description,
        created_at: student.created_at,
      },
      institution: {
        name: institutionName?.value || 'Institución Educativa',
        logo: logoBase64,
      },
      period: activePeriod ? { name: activePeriod.name, start_date: activePeriod.start_date, end_date: activePeriod.end_date } : null,
      subjects,
      generated_at: new Date().toISOString(),
    },
  });
});

export default router;
