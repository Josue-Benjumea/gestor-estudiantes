import { groupsService } from '../services/groups.service.js';

export class GroupsController {
  getAll(req, res, next) {
    try {
      const groups = groupsService.getAll();
      res.json({ success: true, data: groups });
    } catch (error) {
      next(error);
    }
  }

  getById(req, res, next) {
    try {
      const group = groupsService.getById(parseInt(req.params.id));
      res.json({ success: true, data: group });
    } catch (error) {
      next(error);
    }
  }

  create(req, res, next) {
    try {
      const group = groupsService.create(req.body);
      res.status(201).json({ success: true, data: group });
    } catch (error) {
      next(error);
    }
  }

  update(req, res, next) {
    try {
      const group = groupsService.update(parseInt(req.params.id), req.body);
      res.json({ success: true, data: group });
    } catch (error) {
      next(error);
    }
  }

  delete(req, res, next) {
    try {
      groupsService.delete(parseInt(req.params.id));
      res.json({ success: true, message: 'Grupo eliminado exitosamente' });
    } catch (error) {
      next(error);
    }
  }
}

export const groupsController = new GroupsController();
