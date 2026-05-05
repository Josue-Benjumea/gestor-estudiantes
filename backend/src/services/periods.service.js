import { periodRepository } from '../repositories/period.repository.js';

/**
 * Periods Service - Business logic for academic period management.
 */
export class PeriodsService {
  getAll() {
    return periodRepository.findAll();
  }

  getActive() {
    return periodRepository.findActive();
  }

  getById(id) {
    const period = periodRepository.findById(id);
    if (!period) {
      const error = new Error('Periodo no encontrado');
      error.status = 404;
      throw error;
    }
    return period;
  }

  create(data) {
    return periodRepository.create(data);
  }

  update(id, data) {
    this.getById(id);
    return periodRepository.update(id, data);
  }

  /** Start (activate) a period — deactivates all others */
  activate(id) {
    this.getById(id);
    return periodRepository.activate(id);
  }

  /** End (deactivate) a period */
  deactivate(id) {
    this.getById(id);
    return periodRepository.deactivate(id);
  }

  delete(id) {
    const period = this.getById(id);
    if (period.is_active) {
      const error = new Error('No se puede eliminar un periodo activo. Desactívelo primero');
      error.status = 400;
      throw error;
    }
    periodRepository.delete(id);
  }
}

export const periodsService = new PeriodsService();
