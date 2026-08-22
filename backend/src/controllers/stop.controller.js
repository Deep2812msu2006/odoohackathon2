import * as stopService from '../services/stop.service.js';
import { sendSuccess } from '../utils/responseFormatter.js';

export const addStop = async (req, res, next) => {
  try {
    const stop = await stopService.addStop(req.params.id, req.user.id, req.body);
    return sendSuccess(res, { stop }, 201, 'Stop added to trip successfully.');
  } catch (err) {
    next(err);
  }
};

export const updateStop = async (req, res, next) => {
  try {
    const stop = await stopService.updateStop(req.params.id, req.params.stopId, req.user.id, req.body);
    return sendSuccess(res, { stop }, 200, 'Stop updated successfully.');
  } catch (err) {
    next(err);
  }
};

export const deleteStop = async (req, res, next) => {
  try {
    const result = await stopService.deleteStop(req.params.id, req.params.stopId, req.user.id);
    return sendSuccess(res, result, 200);
  } catch (err) {
    next(err);
  }
};

export const reorderStops = async (req, res, next) => {
  try {
    const stops = await stopService.reorderStops(req.params.id, req.user.id, req.body.stops);
    return sendSuccess(res, { stops }, 200, 'Stops reordered successfully.');
  } catch (err) {
    next(err);
  }
};
