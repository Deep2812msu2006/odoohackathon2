import { Router } from 'express';
import * as authController from '../controllers/auth.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { authRateLimiter } from '../middleware/rateLimiter.js';
import { signupSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema } from '../validators/auth.validator.js';

const router = Router();

router.post('/signup', authRateLimiter, validate(signupSchema), authController.signup);
router.post('/login', authRateLimiter, validate(loginSchema), authController.login);
router.post('/logout', authController.logout);
router.post('/forgot-password', validate(forgotPasswordSchema), authController.resetPassword);
router.post('/reset-password', validate(resetPasswordSchema), authController.resetPassword);
router.get('/me', protect, authController.getMe);

export default router;
