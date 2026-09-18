import * as activityService from '../services/activity.service.js';
import { sendSuccess } from '../utils/responseFormatter.js';
import { apiCache } from '../utils/cache.js';

export const getActivities = async (req, res, next) => {
  try {
    const cacheKey = `activities:${JSON.stringify(req.query)}`;
    const cached = apiCache.get(cacheKey);
    if (cached) {
      res.setHeader('Cache-Control', 'public, max-age=180, stale-while-revalidate=300');
      return sendSuccess(res, cached, 200);
    }

    const activities = await activityService.getActivities(req.query);
    const result = { activities, count: activities.length };
    apiCache.set(cacheKey, result, 180000); // 3 min cache

    res.setHeader('Cache-Control', 'public, max-age=180, stale-while-revalidate=300');
    return sendSuccess(res, result, 200);
  } catch (err) {
    next(err);
  }
};
