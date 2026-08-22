import rateLimit from 'express-rate-limit';

export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // Limit each IP to 30 requests per windowMs
  message: {
    error: {
      message: 'Too many authentication attempts from this IP. Please try again after 15 minutes.',
      code: 'TOO_MANY_REQUESTS',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});
