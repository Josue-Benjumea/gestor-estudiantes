import bcrypt from 'bcryptjs';
import { userRepository } from '../repositories/user.repository.js';

/**
 * Users Service - Business logic for user management.
 */
export class UsersService {
  getAll(filters) {
    const users = userRepository.findAll(filters);
    const total = userRepository.count(filters);
    return { users, total };
  }

  getById(id) {
    const user = userRepository.findById(id);
    if (!user) {
      const error = new Error('Usuario no encontrado');
      error.status = 404;
      throw error;
    }
    return user;
  }

  create({ email, password, first_name, last_name, role }) {
    const existing = userRepository.findByEmail(email);
    if (existing) {
      const error = new Error('El email ya está registrado');
      error.status = 409;
      throw error;
    }

    const hashedPassword = bcrypt.hashSync(password, 10);
    return userRepository.create({
      email,
      password: hashedPassword,
      first_name,
      last_name,
      role,
    });
  }

  update(id, data) {
    this.getById(id); // Check existence
    if (data.password) {
      data.password = bcrypt.hashSync(data.password, 10);
    }
    return userRepository.update(id, data);
  }

  delete(id) {
    this.getById(id); // Check existence
    userRepository.delete(id);
  }

  assignGroup(studentId, groupId) {
    const user = this.getById(studentId);
    if (user.role !== 'student') {
      const error = new Error('Solo se pueden asignar grupos a estudiantes');
      error.status = 400;
      throw error;
    }
    userRepository.assignStudentToGroup(studentId, groupId);
    return userRepository.getStudentGroup(studentId);
  }

  assignSubject(professorId, subjectId, groupId) {
    const user = this.getById(professorId);
    if (user.role !== 'professor') {
      const error = new Error('Solo se pueden asignar materias a profesores');
      error.status = 400;
      throw error;
    }
    userRepository.assignProfessorToSubject(professorId, subjectId, groupId);
    return userRepository.getProfessorAssignments(professorId);
  }

  removeProfessorAssignment(assignmentId) {
    userRepository.removeProfessorAssignment(assignmentId);
  }

  getStudentsWithGroups() {
    return userRepository.getAllStudentsWithGroups();
  }

  getProfessorsWithAssignments() {
    return userRepository.getAllProfessorsWithAssignments();
  }

  getStudentsByGroup(groupId) {
    return userRepository.getStudentsByGroup(groupId);
  }

  getProfessorAssignments(professorId) {
    return userRepository.getProfessorAssignments(professorId);
  }
}

export const usersService = new UsersService();
