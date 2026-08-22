import * as budgetService from '../services/budget.service.js';
import { sendSuccess } from '../utils/responseFormatter.js';

export const getTripBudget = async (req, res, next) => {
  try {
    const userId = req.user ? req.user.id : null;
    const targetDailyBudget = req.query.targetDailyBudget ? parseFloat(req.query.targetDailyBudget) : 150;
    const budget = await budgetService.calculateTripBudget(req.params.id, userId, targetDailyBudget);
    return sendSuccess(res, { budget }, 200);
  } catch (err) {
    next(err);
  }
};
