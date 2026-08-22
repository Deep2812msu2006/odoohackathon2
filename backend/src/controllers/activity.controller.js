import * as activityService from '../services/activity.service.js';
import { sendSuccess } from '../utils/responseFormatter.js';

export const getActivities = async (req, res, next) => {
  try {
    const activities = await activityService.getActivities(req.query);
    return sendSuccess(res, { activities, count: activities.length }, 200);
  } catch (err) {
    next(err);
  }
};
