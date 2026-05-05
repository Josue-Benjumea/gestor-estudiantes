import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from './config/env.js';
import { initDatabase } from './config/database.js';
import { errorHandler } from './middleware/errorHandler.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Routes
import authRoutes from './routes/auth.routes.js';
import usersRoutes from './routes/users.routes.js';
import subjectsRoutes from './routes/subjects.routes.js';
import groupsRoutes from './routes/groups.routes.js';
import gradesRoutes from './routes/grades.routes.js';
import periodsRoutes from './routes/periods.routes.js';
import dashboardRoutes from './routes/dashboard.routes.js';
import activitiesRoutes from './routes/activities.routes.js';
import settingsRoutes from './routes/settings.routes.js';

// ─── Initialize ────────────────────────────────────────────
const app = express();

// Initialize database (auto-creates tables)
initDatabase();

// Run schema migration (e.g. FK updates)
import { migrateDatabase } from './config/migrate-fk.js';
await migrateDatabase();

// Auto-seed if database is empty (first deploy)
import bcrypt from 'bcryptjs';
const _db = (await import('./config/database.js')).getDatabase();
const userCount = _db.prepare('SELECT COUNT(*) as count FROM users').get();
if (userCount.count === 0) {
  console.log('🌱 Empty database detected — creating admin user...');
  const hash = bcrypt.hashSync('Admin123!', 10);
  _db.prepare('INSERT INTO users (email, password, first_name, last_name, role) VALUES (?, ?, ?, ?, ?)')
    .run('admin@school.com', hash, 'Carlos', 'Administrador', 'admin');
  console.log('✅ Admin created: admin@school.com / Admin123!');
}

// ─── Middleware ─────────────────────────────────────────────
app.use(cors({ origin: config.corsOrigin, credentials: true }));
app.use(express.json());
app.use(morgan('dev'));

// ─── API Routes ─────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/subjects', subjectsRoutes);
app.use('/api/groups', groupsRoutes);
app.use('/api/grades', gradesRoutes);
app.use('/api/periods', periodsRoutes);
app.use('/api/activities', activitiesRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/settings', settingsRoutes);

// Serve uploaded files (institution logo, etc.)
const uploadsPath = process.env.UPLOADS_PATH || path.join(__dirname, '..', 'data', 'uploads');
app.use('/uploads', express.static(uploadsPath));

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ success: true, message: 'API is running', timestamp: new Date().toISOString() });
});

// ─── Production: Serve Frontend Build ───────────────────────
if (config.nodeEnv === 'production') {
  const frontendDist = path.join(__dirname, '..', '..', 'frontend', 'dist');
  app.use(express.static(frontendDist));

  // SPA fallback: any non-API route → index.html
  app.get('*', (_req, res) => {
    res.sendFile(path.join(frontendDist, 'index.html'));
  });
} else {
  // Dev: 404 for non-API routes
  app.use((_req, res) => {
    res.status(404).json({ success: false, message: 'Ruta no encontrada' });
  });
}

// Global error handler
app.use(errorHandler);

// ─── Start Server ───────────────────────────────────────────
app.listen(config.port, () => {
  console.log(`\n🚀 Server running on http://localhost:${config.port}`);
  console.log(`📚 API Docs: http://localhost:${config.port}/api/health`);
  console.log(`🌍 Environment: ${config.nodeEnv}\n`);
});

export default app;
