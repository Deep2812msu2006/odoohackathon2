import * as activityLinkService from '../services/activityLink.service.js';
import { sendSuccess } from '../utils/responseFormatter.js';

export const addActivityToStop = async (req, res, next) => {
  try {
    const activityLink = await activityLinkService.addActivityToStop(
      req.params.id,
      req.params.stopId,
      req.user.id,
      req.body
    );
    return sendSuccess(res, { activityLink }, 201, 'Activity added to stop successfully.');
  } catch (err) {
    next(err);
  }
};

export const updateActivityLink = async (req, res, next) => {
  try {
    const activityLink = await activityLinkService.updateActivityLink(
      req.params.id,
      req.params.stopId,
      req.params.activityLinkId,
      req.user.id,
      req.body
    );
    return sendSuccess(res, { activityLink }, 200, 'Activity schedule updated successfully.');
  } catch (err) {
    next(err);
  }
};

export const removeActivityLink = async (req, res, next) => {
  try {
    const result = await activityLinkService.removeActivityLink(
      req.params.id,
      req.params.stopId,
      req.params.activityLinkId,
      req.user.id
    );
    return sendSuccess(res, result, 200);
  } catch (err) {
    next(err);
  }
};
