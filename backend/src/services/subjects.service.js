import { subjectRepository } from '../repositories/subject.repository.js';

/**
 * Subjects Service - Business logic for subject management.
 */
export class SubjectsService {
  getAll() {
    return subjectRepository.findAll();
  }

  getById(id) {
    const subject = subjectRepository.findById(id);
    if (!subject) {
      const error = new Error('Materia no encontrada');
      error.status = 404;
      throw error;
    }
    return subject;
  }

  create(data) {
    return subjectRepository.create(data);
  }

  update(id, data) {
    this.getById(id);
    return subjectRepository.update(id, data);
  }

  delete(id) {
    this.getById(id);
    subjectRepository.delete(id);
  }
}

export const subjectsService = new SubjectsService();
