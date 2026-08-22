import { Router } from 'express';
import * as adminController from '../controllers/admin.controller.js';
import { protect, requireAdmin } from '../middleware/auth.middleware.js';

const router = Router();

// Protect ALL admin endpoints: Require valid JWT token AND ADMIN role!
router.use(protect);
router.use(requireAdmin);

router.get('/stats', adminController.getAdminAnalytics);
router.get('/analytics', adminController.getAdminAnalytics);
router.get('/users', adminController.getAllUsers);
router.patch('/users/:userId/role', adminController.updateUserRole);

export default router;
