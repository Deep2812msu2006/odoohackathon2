import * as adminService from '../services/admin.service.js';
import { sendSuccess } from '../utils/responseFormatter.js';

export const getAdminAnalytics = async (req, res, next) => {
  try {
    const analytics = await adminService.getAdminAnalytics();
    return sendSuccess(res, { analytics }, 200, 'Real-time admin analytics retrieved successfully.');
  } catch (err) {
    next(err);
  }
};
