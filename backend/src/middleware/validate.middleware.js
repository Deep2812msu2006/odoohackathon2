import { AppError } from '../utils/appError.js';

export const validate = (schema) => (req, res, next) => {
  try {
    const parsed = schema.parse({
      body: req.body,
      query: req.query,
      params: req.params,
    });
    if (parsed.body) req.body = parsed.body;
    if (parsed.query) req.query = parsed.query;
    if (parsed.params) req.params = parsed.params;
    next();
  } catch (err) {
    if (err.errors && err.errors.length > 0) {
      const issue = err.errors[0];
      const message = `${issue.path.join('.')}: ${issue.message}`;
      return next(new AppError(message, 400, 'VALIDATION_ERROR'));
    }
    next(err);
  }
};
