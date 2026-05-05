import { usersService } from '../services/users.service.js';

export class UsersController {
  getAll(req, res, next) {
    try {
      const { role, search, limit, offset } = req.query;
      const result = usersService.getAll({
        role,
        search,
        limit: limit ? parseInt(limit) : 100,
        offset: offset ? parseInt(offset) : 0,
      });
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  getById(req, res, next) {
    try {
      const user = usersService.getById(parseInt(req.params.id));
      res.json({ success: true, data: user });
    } catch (error) {
      next(error);
    }
  }

  create(req, res, next) {
    try {
      const user = usersService.create(req.validatedBody);
      res.status(201).json({ success: true, data: user });
    } catch (error) {
      next(error);
    }
  }

  update(req, res, next) {
    try {
      const user = usersService.update(parseInt(req.params.id), req.validatedBody);
      res.json({ success: true, data: user });
    } catch (error) {
      next(error);
    }
  }

  delete(req, res, next) {
    try {
      usersService.delete(parseInt(req.params.id));
      res.json({ success: true, message: 'Usuario eliminado exitosamente' });
    } catch (error) {
      next(error);
    }
  }

  assignGroup(req, res, next) {
    try {
      const group = usersService.assignGroup(parseInt(req.params.id), req.validatedBody.group_id);
      res.json({ success: true, data: group, message: 'Grupo asignado exitosamente' });
    } catch (error) {
      next(error);
    }
  }

  assignSubject(req, res, next) {
    try {
      const { subject_id, group_id } = req.validatedBody;
      const assignments = usersService.assignSubject(parseInt(req.params.id), subject_id, group_id);
      res.json({ success: true, data: assignments, message: 'Materia asignada exitosamente' });
    } catch (error) {
      next(error);
    }
  }

  removeAssignment(req, res, next) {
    try {
      usersService.removeProfessorAssignment(parseInt(req.params.assignmentId));
      res.json({ success: true, message: 'Asignación eliminada exitosamente' });
    } catch (error) {
      next(error);
    }
  }

  getStudentsWithGroups(req, res, next) {
    try {
      const students = usersService.getStudentsWithGroups();
      res.json({ success: true, data: students });
    } catch (error) {
      next(error);
    }
  }

  getProfessorsWithAssignments(req, res, next) {
    try {
      const professors = usersService.getProfessorsWithAssignments();
      res.json({ success: true, data: professors });
    } catch (error) {
      next(error);
    }
  }

  getStudentsByGroup(req, res, next) {
    try {
      const students = usersService.getStudentsByGroup(parseInt(req.params.groupId));
      res.json({ success: true, data: students });
    } catch (error) {
      next(error);
    }
  }

  getProfessorAssignments(req, res, next) {
    try {
      const assignments = usersService.getProfessorAssignments(parseInt(req.params.id));
      res.json({ success: true, data: assignments });
    } catch (error) {
      next(error);
    }
  }
}

export const usersController = new UsersController();
