import { Router } from 'express';
import * as activityController from '../controllers/activity.controller.js';

const router = Router();

router.get('/', activityController.getActivities);

export default router;
