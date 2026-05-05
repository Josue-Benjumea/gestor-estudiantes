# EduManager — Sistema de Gestión de Estudiantes

Sistema fullstack completo para gestión académica con tres roles (Super Admin, Profesor, Estudiante), construido con una arquitectura profesional y diseño premium estilo Apple.

## 🚀 Inicio Rápido

```bash
# 1. Instalar dependencias
npm run install:all

# 2. Generar base de datos y datos de prueba
npm run seed

# 3. Iniciar la aplicación (frontend + backend)
npm run dev
```

La aplicación estará disponible en:
- **Frontend:** http://localhost:5173
- **Backend:** http://localhost:3001

## 📋 Credenciales de Prueba

| Rol | Email | Contraseña |
|-----|-------|------------|
| Super Admin | `admin@school.com` | `Admin123!` |
| Profesor | `prof.martinez@school.com` | `Prof123!` |
| Estudiante | `est.lopez@school.com` | `Est123!` |

## 🏗️ Arquitectura

### Stack Tecnológico

| Capa | Tecnología |
|------|-----------|
| Backend | Node.js + Express.js |
| Frontend | React 18 + Vite |
| Base de datos | SQLite (better-sqlite3) |
| Auth | JWT + bcryptjs |
| Estado | Zustand |
| Validación | Zod |
| Animaciones | Framer Motion |
| Charts | Recharts |
| Iconos | Lucide React |

### Patrones de Diseño

- **Clean Architecture por capas:** Routes → Controllers → Services → Repositories → Database
- **Repository Pattern:** Abstracción de acceso a datos
- **Middleware Pattern:** Auth, validación, manejo de errores
- **RBAC:** Control de acceso basado en roles
- **SOLID:** Responsabilidad única por módulo

## 📁 Estructura del Proyecto

```
Gestor Estudiantes/
├── package.json              # Scripts root (dev, build, seed)
├── backend/
│   ├── package.json
│   ├── data/                 # SQLite DB (autogenerada)
│   └── src/
│       ├── index.js          # Entry point Express
│       ├── config/           # Database, seed, env
│       ├── middleware/       # Auth, RBAC, validation, error handler
│       ├── routes/           # Definición de rutas
│       ├── controllers/      # Manejo de requests
│       ├── services/         # Lógica de negocio
│       ├── repositories/     # Acceso a datos
│       └── validators/       # Esquemas Zod
└── frontend/
    ├── package.json
    ├── index.html
    ├── vite.config.js
    └── src/
        ├── main.jsx          # Entry point React
        ├── App.jsx           # Router + protected routes
        ├── index.css         # Design system completo
        ├── api/              # Axios client + módulos API
        ├── store/            # Zustand (auth, theme, toasts)
        ├── components/       # UI primitivos + layout
        └── pages/            # Páginas por rol
```

## 🔐 Roles y Permisos

### Super Admin
- Dashboard con estadísticas globales
- CRUD completo de estudiantes, profesores, materias, grupos
- Gestión de periodos académicos (iniciar/finalizar)
- Asignación de estudiantes a grupos
- Asignación de materias a profesores

### Profesor
- Ver calificaciones por periodo y grupo
- Registrar y editar notas (solo periodo activo)
- Ver estudiantes de sus grupos asignados

### Estudiante
- Ver sus propias notas separadas por periodo
- Ver promedio, nota más alta, y clasificación por materia

## 📊 Periodos Académicos

El Super Admin controla el flujo de periodos:
1. **Crear** un periodo (nombre, descripción, fechas)
2. **Iniciar** un periodo → se vuelve activo (desactiva los demás)
3. Los profesores solo pueden registrar notas en el **periodo activo**
4. **Finalizar** un periodo → se cierra y quedan las notas históricas
5. Notas separadas por periodo tanto para estudiantes como profesores

## 📦 Scripts Disponibles

| Script | Descripción |
|--------|-------------|
| `npm run dev` | Iniciar frontend + backend en desarrollo |
| `npm run build` | Build de producción (frontend) |
| `npm run seed` | Generar datos de prueba |
| `npm run install:all` | Instalar todas las dependencias |
| `npm start` | Solo backend en producción |

## 🎨 Diseño UI/UX

- **Estilo Apple/SaaS premium** con tipografía Inter
- **Glassmorphism** con backdrop-filter blur
- **Modo oscuro/claro** con toggle persistente
- **Animaciones Framer Motion** tipo macOS (modales, transiciones)
- **Responsive** design (mobile, tablet, desktop)
- **Charts** interactivos (Recharts)

## 🗃️ Base de Datos

SQLite se autogenera al iniciar el proyecto. Tablas:

- `users` — Todos los usuarios (admin, professor, student)
- `subjects` — Materias
- `groups_` — Grupos escolares
- `academic_periods` — Periodos con estado activo/inactivo
- `student_groups` — Asignación estudiante → grupo (1:1)
- `professor_assignments` — Asignación profesor → materia + grupo
- `grades` — Notas vinculadas a periodo (escala 0-100)

## ⚙️ Decisiones Técnicas

1. **SQLite + better-sqlite3:** Sincrónico, rápido, zero-config. Ideal para proyectos que no requieren un servidor de base de datos separado.
2. **Zustand sobre Redux:** Mínimo boilerplate, API simple, performante. Perfecto para apps medianas.
3. **Zod validación dual:** Se usa tanto en backend (middleware) como en frontend para compartir lógica de validación.
4. **Framer Motion:** Animaciones declarativas con spring physics para un feel nativo tipo macOS.
5. **Concurrently:** Permite ejecutar frontend y backend con un solo comando `npm run dev`.
6. **ESM (import/export):** Módulos ES nativos en backend y frontend.
