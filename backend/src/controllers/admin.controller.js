import * as adminService from '../services/admin.service.js';
import { sendSuccess } from '../utils/responseFormatter.js';
import { apiCache } from '../utils/cache.js';

export const getAdminAnalytics = async (req, res, next) => {
  try {
    const cacheKey = 'admin:analytics';
    const cached = apiCache.get(cacheKey);
    if (cached) {
      res.setHeader('Cache-Control', 'public, max-age=120, stale-while-revalidate=300');
      return sendSuccess(res, cached, 200, 'Real-time admin analytics retrieved from cache.');
    }

    const analytics = await adminService.getAdminAnalytics();
    const result = { analytics };
    apiCache.set(cacheKey, result, 300000); // 5 min cache

    res.setHeader('Cache-Control', 'public, max-age=120, stale-while-revalidate=300');
    return sendSuccess(res, result, 200, 'Real-time admin analytics retrieved successfully.');
  } catch (err) {
    next(err);
  }
};

export const getAllUsers = async (req, res, next) => {
  try {
    const cacheKey = 'admin:users';
    const cached = apiCache.get(cacheKey);
    if (cached) {
      res.setHeader('Cache-Control', 'public, max-age=60, stale-while-revalidate=120');
      return sendSuccess(res, cached, 200);
    }

    const users = await adminService.getAllUsersForAdmin();
    const result = { users, count: users.length };
    apiCache.set(cacheKey, result, 120000); // 2 min cache

    res.setHeader('Cache-Control', 'public, max-age=60, stale-while-revalidate=120');
    return sendSuccess(res, result, 200);
  } catch (err) {
    next(err);
  }
};

export const updateUserRole = async (req, res, next) => {
  try {
    const user = await adminService.updateUserRole(req.params.userId, req.body.role);
    apiCache.invalidatePrefix('admin:');
    return sendSuccess(res, { user }, 200, `User ${user.name} role updated to ${user.role}!`);
  } catch (err) {
    next(err);
  }
};
