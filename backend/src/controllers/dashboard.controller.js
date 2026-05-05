import { dashboardService } from '../services/dashboard.service.js';

export class DashboardController {
  getFullDashboard(req, res, next) {
    try {
      const data = dashboardService.getFullDashboard();
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  getStats(req, res, next) {
    try {
      const stats = dashboardService.getStats();
      res.json({ success: true, data: stats });
    } catch (error) {
      next(error);
    }
  }

  getAverages(req, res, next) {
    try {
      const data = {
        bySubject: dashboardService.getAveragesBySubject(),
        byGroup: dashboardService.getAveragesByGroup(),
      };
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }
}

export const dashboardController = new DashboardController();
