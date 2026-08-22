import * as publicService from '../services/public.service.js';
import { sendSuccess } from '../utils/responseFormatter.js';

export const getPublicTripBySlug = async (req, res, next) => {
  try {
    const trip = await publicService.getPublicTripBySlug(req.params.slug);
    return sendSuccess(res, { trip }, 200);
  } catch (err) {
    next(err);
  }
};

export const copyTrip = async (req, res, next) => {
  try {
    const newTrip = await publicService.copyTrip(req.params.slug, req.user.id);
    return sendSuccess(res, { trip: newTrip }, 201, 'Trip copied to your account successfully!');
  } catch (err) {
    next(err);
  }
};
