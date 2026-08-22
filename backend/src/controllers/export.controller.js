import * as exportService from '../services/export.service.js';
import { sendSuccess } from '../utils/responseFormatter.js';

export const exportICal = async (req, res, next) => {
  try {
    const userId = req.user ? req.user.id : null;
    const { icalString, filename } = await exportService.exportTripToICal(req.params.id, userId);

    res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    return res.status(200).send(icalString);
  } catch (err) {
    next(err);
  }
};

export const exportSummary = async (req, res, next) => {
  try {
    const userId = req.user ? req.user.id : null;
    const summary = await exportService.exportTripSummaryText(req.params.id, userId);
    return sendSuccess(res, summary, 200, 'Trip export summary generated successfully.');
  } catch (err) {
    next(err);
  }
};
