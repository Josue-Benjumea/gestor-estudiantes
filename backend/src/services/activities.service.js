import { activityRepository } from '../repositories/activity.repository.js';
import { periodRepository } from '../repositories/period.repository.js';

/**
 * Activities Service - Business logic for activity management.
 */
export class ActivitiesService {
  getAll(filters) {
    return activityRepository.findAll(filters);
  }

  getById(id) {
    const activity = activityRepository.findById(id);
    if (!activity) {
      const error = new Error('Actividad no encontrada');
      error.status = 404;
      throw error;
    }
    // Attach groups
    activity.groups = activityRepository.getActivityGroups(id);
    return activity;
  }

  create({ name, description, subject_id, professor_id, period_id, group_ids }) {
    // Verify period is active
    const period = periodRepository.findById(period_id);
    if (!period) {
      const error = new Error('Periodo no encontrado');
      error.status = 404;
      throw error;
    }
    if (!period.is_active) {
      const error = new Error('Solo se pueden crear actividades en el periodo activo');
      error.status = 400;
      throw error;
    }

    const activity = activityRepository.create({ name, description, subject_id, professor_id, period_id });

    // Assign groups
    if (group_ids && group_ids.length > 0) {
      activityRepository.assignGroups(activity.id, group_ids);
    }

    return this.getById(activity.id);
  }

  update(id, data) {
    this.getById(id);
    return activityRepository.update(id, data);
  }

  delete(id) {
    this.getById(id);
    activityRepository.delete(id);
  }

  /** Get students for an activity with their grades */
  getStudentsWithGrades(activityId) {
    this.getById(activityId);
    return activityRepository.getActivityStudentsWithGrades(activityId);
  }

  /** Get activities for professor grouped by period */
  getProfessorActivities(professorId) {
    const activities = activityRepository.findAll({ professor_id: professorId });

    // Group by period
    const grouped = {};
    activities.forEach((a) => {
      if (!grouped[a.period_id]) {
        grouped[a.period_id] = {
          period_id: a.period_id,
          period_name: a.period_name,
          is_active: a.period_active,
          activities: [],
        };
      }
      grouped[a.period_id].activities.push(a);
    });

    return Object.values(grouped);
  }
}

export const activitiesService = new ActivitiesService();
