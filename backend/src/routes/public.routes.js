import { Router } from 'express';
import * as publicController from '../controllers/public.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/trips/:slug', publicController.getPublicTripBySlug);
router.post('/trips/:slug/copy', protect, publicController.copyTrip);

export default router;
