import { subjectsService } from '../services/subjects.service.js';

export class SubjectsController {
  getAll(req, res, next) {
    try {
      const subjects = subjectsService.getAll();
      res.json({ success: true, data: subjects });
    } catch (error) {
      next(error);
    }
  }

  getById(req, res, next) {
    try {
      const subject = subjectsService.getById(parseInt(req.params.id));
      res.json({ success: true, data: subject });
    } catch (error) {
      next(error);
    }
  }

  create(req, res, next) {
    try {
      const subject = subjectsService.create(req.validatedBody);
      res.status(201).json({ success: true, data: subject });
    } catch (error) {
      next(error);
    }
  }

  update(req, res, next) {
    try {
      const subject = subjectsService.update(parseInt(req.params.id), req.validatedBody);
      res.json({ success: true, data: subject });
    } catch (error) {
      next(error);
    }
  }

  delete(req, res, next) {
    try {
      subjectsService.delete(parseInt(req.params.id));
      res.json({ success: true, message: 'Materia eliminada exitosamente' });
    } catch (error) {
      next(error);
    }
  }
}

export const subjectsController = new SubjectsController();
