import { Router } from 'express';
import * as adminController from '../controllers/admin.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = Router();

router.use(protect);

router.get('/stats', adminController.getAdminAnalytics);
router.get('/analytics', adminController.getAdminAnalytics);

export default router;
