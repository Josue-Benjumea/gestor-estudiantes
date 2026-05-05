import { groupRepository } from '../repositories/group.repository.js';

/**
 * Groups Service - Business logic for group management.
 */
export class GroupsService {
  getAll() {
    return groupRepository.findAll();
  }

  getById(id) {
    const group = groupRepository.findById(id);
    if (!group) {
      const error = new Error('Grupo no encontrado');
      error.status = 404;
      throw error;
    }
    return group;
  }

  create(data) {
    return groupRepository.create(data);
  }

  update(id, data) {
    this.getById(id);
    return groupRepository.update(id, data);
  }

  delete(id) {
    this.getById(id);
    groupRepository.delete(id);
  }
}

export const groupsService = new GroupsService();
