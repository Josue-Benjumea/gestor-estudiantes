import { periodsService } from '../services/periods.service.js';

export class PeriodsController {
  getAll(req, res, next) {
    try {
      const periods = periodsService.getAll();
      res.json({ success: true, data: periods });
    } catch (error) {
      next(error);
    }
  }

  getActive(req, res, next) {
    try {
      const period = periodsService.getActive();
      res.json({ success: true, data: period });
    } catch (error) {
      next(error);
    }
  }

  create(req, res, next) {
    try {
      const period = periodsService.create(req.body);
      res.status(201).json({ success: true, data: period });
    } catch (error) {
      next(error);
    }
  }

  update(req, res, next) {
    try {
      const period = periodsService.update(parseInt(req.params.id), req.body);
      res.json({ success: true, data: period });
    } catch (error) {
      next(error);
    }
  }

  activate(req, res, next) {
    try {
      const period = periodsService.activate(parseInt(req.params.id));
      res.json({ success: true, data: period, message: 'Periodo activado exitosamente' });
    } catch (error) {
      next(error);
    }
  }

  deactivate(req, res, next) {
    try {
      const period = periodsService.deactivate(parseInt(req.params.id));
      res.json({ success: true, data: period, message: 'Periodo finalizado exitosamente' });
    } catch (error) {
      next(error);
    }
  }

  delete(req, res, next) {
    try {
      periodsService.delete(parseInt(req.params.id));
      res.json({ success: true, message: 'Periodo eliminado exitosamente' });
    } catch (error) {
      next(error);
    }
  }
}

export const periodsController = new PeriodsController();
