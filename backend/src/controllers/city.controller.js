import * as cityService from '../services/city.service.js';
import { sendSuccess } from '../utils/responseFormatter.js';
import { apiCache } from '../utils/cache.js';

export const getCities = async (req, res, next) => {
  try {
    const cacheKey = `cities:${JSON.stringify(req.query)}`;
    const cached = apiCache.get(cacheKey);
    if (cached) {
      res.setHeader('Cache-Control', 'public, max-age=180, stale-while-revalidate=300');
      return sendSuccess(res, cached, 200);
    }

    const cities = await cityService.getCities(req.query);
    const result = { cities, count: cities.length };
    apiCache.set(cacheKey, result, 180000); // 3 min cache

    res.setHeader('Cache-Control', 'public, max-age=180, stale-while-revalidate=300');
    return sendSuccess(res, result, 200);
  } catch (err) {
    next(err);
  }
};

export const getCityById = async (req, res, next) => {
  try {
    const cacheKey = `city:${req.params.id}`;
    const cached = apiCache.get(cacheKey);
    if (cached) {
      res.setHeader('Cache-Control', 'public, max-age=180, stale-while-revalidate=300');
      return sendSuccess(res, cached, 200);
    }

    const city = await cityService.getCityById(req.params.id);
    const result = { city };
    apiCache.set(cacheKey, result, 180000);

    res.setHeader('Cache-Control', 'public, max-age=180, stale-while-revalidate=300');
    return sendSuccess(res, result, 200);
  } catch (err) {
    next(err);
  }
};
