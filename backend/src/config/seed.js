import { initDatabase, getDatabase } from './database.js';
import bcrypt from 'bcryptjs';

/**
 * Seed the database with test data.
 * Now creates activities per subject and grades per activity/student.
 */
async function seed() {
  console.log('🌱 Seeding database...\n');

  initDatabase();
  const db = getDatabase();

  // Clear existing data
  db.exec(`
    DELETE FROM grades;
    DELETE FROM activity_groups;
    DELETE FROM activities;
    DELETE FROM professor_assignments;
    DELETE FROM student_groups;
    DELETE FROM academic_periods;
    DELETE FROM groups_;
    DELETE FROM subjects;
    DELETE FROM users;
  `);

  // ────────────────────────────────────────────
  // 1. CREATE USERS
  // ────────────────────────────────────────────
  const hashPassword = (pwd) => bcrypt.hashSync(pwd, 10);

  const insertUser = db.prepare(`
    INSERT INTO users (email, password, first_name, last_name, role) 
    VALUES (?, ?, ?, ?, ?)
  `);

  // Admin
  insertUser.run('admin@school.com', hashPassword('Admin123!'), 'Carlos', 'Administrador', 'admin');

  // Professors
  const professors = [
    ['prof.martinez@school.com', 'Prof123!', 'Ana', 'Martínez'],
    ['prof.garcia@school.com', 'Prof123!', 'Roberto', 'García'],
    ['prof.lopez@school.com', 'Prof123!', 'María', 'López'],
    ['prof.hernandez@school.com', 'Prof123!', 'José', 'Hernández'],
    ['prof.torres@school.com', 'Prof123!', 'Laura', 'Torres'],
    ['prof.ramirez@school.com', 'Prof123!', 'Pedro', 'Ramírez'],
  ];

  professors.forEach(([email, pwd, fn, ln]) => {
    insertUser.run(email, hashPassword(pwd), fn, ln, 'professor');
  });

  // Students
  const students = [
    ['est.lopez@school.com', 'Est123!', 'Daniel', 'López'],
    ['est.rodriguez@school.com', 'Est123!', 'Sofía', 'Rodríguez'],
    ['est.perez@school.com', 'Est123!', 'Miguel', 'Pérez'],
    ['est.sanchez@school.com', 'Est123!', 'Valentina', 'Sánchez'],
    ['est.gomez@school.com', 'Est123!', 'Andrés', 'Gómez'],
    ['est.diaz@school.com', 'Est123!', 'Camila', 'Díaz'],
    ['est.morales@school.com', 'Est123!', 'Sebastián', 'Morales'],
    ['est.castillo@school.com', 'Est123!', 'Isabella', 'Castillo'],
    ['est.romero@school.com', 'Est123!', 'Mateo', 'Romero'],
    ['est.herrera@school.com', 'Est123!', 'Luciana', 'Herrera'],
    ['est.vargas@school.com', 'Est123!', 'Santiago', 'Vargas'],
    ['est.mendoza@school.com', 'Est123!', 'Mariana', 'Mendoza'],
    ['est.flores@school.com', 'Est123!', 'Nicolás', 'Flores'],
    ['est.arias@school.com', 'Est123!', 'Gabriela', 'Arias'],
    ['est.ortiz@school.com', 'Est123!', 'Alejandro', 'Ortiz'],
    ['est.silva@school.com', 'Est123!', 'Paula', 'Silva'],
    ['est.reyes@school.com', 'Est123!', 'Emilio', 'Reyes'],
    ['est.cruz@school.com', 'Est123!', 'Renata', 'Cruz'],
    ['est.jimenez@school.com', 'Est123!', 'Tomás', 'Jiménez'],
    ['est.medina@school.com', 'Est123!', 'Carolina', 'Medina'],
  ];

  students.forEach(([email, pwd, fn, ln]) => {
    insertUser.run(email, hashPassword(pwd), fn, ln, 'student');
  });

  console.log(`  ✓ ${1 + professors.length + students.length} users created`);

  // ────────────────────────────────────────────
  // 2. CREATE SUBJECTS
  // ────────────────────────────────────────────
  const insertSubject = db.prepare(`INSERT INTO subjects (name, description) VALUES (?, ?)`);
  const subjectNames = [
    ['Matemáticas', 'Álgebra, geometría y cálculo'],
    ['Español', 'Lengua castellana y literatura'],
    ['Ciencias Naturales', 'Biología, química y física'],
    ['Historia', 'Historia universal y nacional'],
    ['Inglés', 'Idioma inglés nivel intermedio'],
    ['Educación Física', 'Deportes y actividad física'],
  ];

  subjectNames.forEach(([name, desc]) => insertSubject.run(name, desc));
  console.log(`  ✓ ${subjectNames.length} subjects created`);

  // ────────────────────────────────────────────
  // 3. CREATE GROUPS
  // ────────────────────────────────────────────
  const insertGroup = db.prepare(`INSERT INTO groups_ (name, description) VALUES (?, ?)`);
  const groupNames = [
    ['6-A', 'Sexto grado sección A'],
    ['6-B', 'Sexto grado sección B'],
    ['7-A', 'Séptimo grado sección A'],
    ['7-B', 'Séptimo grado sección B'],
    ['8-A', 'Octavo grado sección A'],
  ];

  groupNames.forEach(([name, desc]) => insertGroup.run(name, desc));
  console.log(`  ✓ ${groupNames.length} groups created`);

  // ────────────────────────────────────────────
  // 4. CREATE ACADEMIC PERIODS
  // ────────────────────────────────────────────
  const insertPeriod = db.prepare(`
    INSERT INTO academic_periods (name, description, start_date, end_date, is_active) 
    VALUES (?, ?, ?, ?, ?)
  `);

  const periods = [
    ['Periodo 1', 'Enero - Marzo 2026', '2026-01-15', '2026-03-31', 0],
    ['Periodo 2', 'Abril - Junio 2026', '2026-04-01', '2026-06-30', 1],
    ['Periodo 3', 'Julio - Septiembre 2026', '2026-07-01', '2026-09-30', 0],
    ['Periodo 4', 'Octubre - Diciembre 2026', '2026-10-01', '2026-12-15', 0],
  ];

  periods.forEach(([name, desc, start, end, active]) => {
    insertPeriod.run(name, desc, start, end, active);
  });
  console.log(`  ✓ ${periods.length} academic periods created (Period 2 active)`);

  // ────────────────────────────────────────────
  // 5. ASSIGN STUDENTS TO GROUPS
  // ────────────────────────────────────────────
  const allStudents = db.prepare(`SELECT id FROM users WHERE role = 'student' ORDER BY id`).all();
  const allGroups = db.prepare(`SELECT id FROM groups_ ORDER BY id`).all();
  const insertStudentGroup = db.prepare(`INSERT INTO student_groups (student_id, group_id) VALUES (?, ?)`);

  allStudents.forEach((student, idx) => {
    const groupIdx = idx % allGroups.length;
    insertStudentGroup.run(student.id, allGroups[groupIdx].id);
  });
  console.log(`  ✓ ${allStudents.length} students assigned to groups`);

  // ────────────────────────────────────────────
  // 6. ASSIGN PROFESSORS (1 subject, multiple groups)
  // ────────────────────────────────────────────
  const allProfessors = db.prepare(`SELECT id FROM users WHERE role = 'professor' ORDER BY id`).all();
  const allSubjects = db.prepare(`SELECT id, name FROM subjects ORDER BY id`).all();
  const insertAssignment = db.prepare(`
    INSERT INTO professor_assignments (professor_id, subject_id, group_id) VALUES (?, ?, ?)
  `);

  // Each professor gets 1 subject, assigned to 2-3 groups
  const profAssignments = [];
  allProfessors.forEach((prof, idx) => {
    const subject = allSubjects[idx % allSubjects.length];
    const numGroups = 2 + (idx % 2);
    for (let g = 0; g < numGroups && g < allGroups.length; g++) {
      const groupIdx = (idx + g) % allGroups.length;
      try {
        insertAssignment.run(prof.id, subject.id, allGroups[groupIdx].id);
        profAssignments.push({ professor_id: prof.id, subject_id: subject.id, group_id: allGroups[groupIdx].id, subject_name: subject.name });
      } catch (e) {
        // Skip duplicate
      }
    }
  });
  console.log(`  ✓ ${profAssignments.length} professor assignments created`);

  // ────────────────────────────────────────────
  // 7. CREATE ACTIVITIES AND GRADES (for Periods 1 and 2)
  // ────────────────────────────────────────────
  const insertActivity = db.prepare(`
    INSERT INTO activities (name, description, subject_id, professor_id, period_id) 
    VALUES (?, ?, ?, ?, ?)
  `);
  const insertActivityGroup = db.prepare(`
    INSERT OR IGNORE INTO activity_groups (activity_id, group_id) VALUES (?, ?)
  `);
  const insertGrade = db.prepare(`
    INSERT OR IGNORE INTO grades (student_id, activity_id, grade, comments) VALUES (?, ?, ?, ?)
  `);

  const allPeriods = db.prepare(`SELECT id FROM academic_periods ORDER BY id`).all();
  const studentGroupsList = db.prepare(`SELECT * FROM student_groups`).all();

  // Activity name templates per subject
  const activityTemplates = {
    'Matemáticas': ['Examen Parcial', 'Tarea de Álgebra', 'Quiz de Geometría', 'Trabajo Práctico'],
    'Español': ['Ensayo Literario', 'Dictado', 'Exposición Oral', 'Análisis de Lectura'],
    'Ciencias Naturales': ['Laboratorio', 'Examen Teórico', 'Proyecto Científico', 'Quiz'],
    'Historia': ['Examen Parcial', 'Línea de Tiempo', 'Ensayo Histórico', 'Investigación'],
    'Inglés': ['Listening Test', 'Writing Essay', 'Oral Presentation', 'Grammar Quiz'],
    'Educación Física': ['Evaluación Física', 'Prueba de Resistencia', 'Trabajo Teórico', 'Participación'],
  };

  const comments = [
    'Excelente desempeño', 'Buen trabajo', 'Puede mejorar',
    'Necesita refuerzo', 'Muy bien', 'Sobresaliente',
    'Debe practicar más', 'Gran progreso', null, null,
  ];

  let activityCount = 0;
  let gradeCount = 0;

  // For periods 1 and 2
  [allPeriods[0], allPeriods[1]].forEach((period) => {
    // For each professor assignment, create activities
    const uniqueProfs = [...new Map(profAssignments.map(a => [a.professor_id + '-' + a.subject_id, a])).values()];

    uniqueProfs.forEach((assignment) => {
      const templates = activityTemplates[assignment.subject_name] || ['Actividad 1', 'Actividad 2', 'Actividad 3'];
      const profGroups = profAssignments.filter(a => a.professor_id === assignment.professor_id && a.subject_id === assignment.subject_id);

      // Create 3-4 activities per subject per period
      const numActivities = 3 + Math.floor(Math.random() * 2);
      for (let a = 0; a < numActivities && a < templates.length; a++) {
        const actName = `${templates[a]} - ${period === allPeriods[0] ? 'P1' : 'P2'}`;
        const result = insertActivity.run(
          actName,
          `Actividad de ${assignment.subject_name}`,
          assignment.subject_id,
          assignment.professor_id,
          period.id
        );
        const activityId = result.lastInsertRowid;
        activityCount++;

        // Assign activity to professor's groups
        profGroups.forEach((pg) => {
          insertActivityGroup.run(activityId, pg.group_id);

          // Grade each student in the group
          const studentsInGroup = studentGroupsList.filter(sg => sg.group_id === pg.group_id);
          studentsInGroup.forEach((sg) => {
            const base = 50 + Math.random() * 40;
            const variance = (Math.random() - 0.5) * 20;
            const grade = Math.min(100, Math.max(0, Math.round(base + variance)));
            const comment = comments[Math.floor(Math.random() * comments.length)];

            try {
              insertGrade.run(sg.student_id, activityId, grade, comment);
              gradeCount++;
            } catch (e) {
              // Skip duplicates
            }
          });
        });
      }
    });
  });

  console.log(`  ✓ ${activityCount} activities created`);
  console.log(`  ✓ ${gradeCount} grades generated for Periods 1 & 2`);

  console.log('\n✅ Seed completed successfully!');
  console.log('\n📋 Login credentials:');
  console.log('  Admin:     admin@school.com / Admin123!');
  console.log('  Professor: prof.martinez@school.com / Prof123!');
  console.log('  Student:   est.lopez@school.com / Est123!');

  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
