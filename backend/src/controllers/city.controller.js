import * as cityService from '../services/city.service.js';
import { sendSuccess } from '../utils/responseFormatter.js';

export const getCities = async (req, res, next) => {
  try {
    const cities = await cityService.getCities(req.query);
    return sendSuccess(res, { cities, count: cities.length }, 200);
  } catch (err) {
    next(err);
  }
};

export const getCityById = async (req, res, next) => {
  try {
    const city = await cityService.getCityById(req.params.id);
    return sendSuccess(res, { city }, 200);
  } catch (err) {
    next(err);
  }
};
