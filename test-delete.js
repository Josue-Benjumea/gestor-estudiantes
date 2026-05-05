import { initDatabase, getDatabase } from './backend/src/config/database.js';
import { userRepository } from './backend/src/repositories/user.repository.js';
import { activityRepository } from './backend/src/repositories/activity.repository.js';
import { gradeRepository } from './backend/src/repositories/grade.repository.js';

initDatabase();
const db = getDatabase();

// 1. Check activities FK
const fkList = db.prepare("PRAGMA foreign_key_list(activities)").all();
console.log("Activities FKs:", fkList);

// 2. Create a test professor
const prof = userRepository.create({
  email: 'testprof@test.com',
  password: '123',
  first_name: 'Test',
  last_name: 'Prof',
  role: 'professor'
});
console.log("Created Prof ID:", prof.id);

// 3. Create test student
const student = userRepository.create({
  email: 'teststudent@test.com',
  password: '123',
  first_name: 'Test',
  last_name: 'Student',
  role: 'student'
});
console.log("Created Student ID:", student.id);

// 4. Create an activity
const act = activityRepository.create({
  name: 'Test Activity',
  subject_id: 1, // Assume 1 exists
  professor_id: prof.id,
  period_id: 1 // Assume 1 exists
});
console.log("Created Activity ID:", act.id);

// 5. Create a grade
const grade = gradeRepository.upsert({
  student_id: student.id,
  activity_id: act.id,
  grade: 100,
  comments: 'Test'
});
console.log("Created Grade ID:", grade.id);

// 6. Delete professor
userRepository.delete(prof.id);
console.log("Deleted Prof ID:", prof.id);

// 7. Check if activity still exists
const actAfter = db.prepare("SELECT * FROM activities WHERE id = ?").get(act.id);
console.log("Activity after prof delete:", actAfter);

// 8. Check if grade still exists
const gradeAfter = db.prepare("SELECT * FROM grades WHERE id = ?").get(grade.id);
console.log("Grade after prof delete:", gradeAfter);
