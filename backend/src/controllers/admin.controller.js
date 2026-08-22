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

export const getAllUsers = async (req, res, next) => {
  try {
    const users = await adminService.getAllUsersForAdmin();
    return sendSuccess(res, { users, count: users.length }, 200);
  } catch (err) {
    next(err);
  }
};

export const updateUserRole = async (req, res, next) => {
  try {
    const user = await adminService.updateUserRole(req.params.userId, req.body.role);
    return sendSuccess(res, { user }, 200, `User ${user.name} role updated to ${user.role}!`);
  } catch (err) {
    next(err);
  }
};
