import { Router } from 'express';
import * as tripController from '../controllers/trip.controller.js';
import * as stopController from '../controllers/stop.controller.js';
import * as activityLinkController from '../controllers/activityLink.controller.js';
import * as budgetController from '../controllers/budget.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { upload } from '../middleware/upload.middleware.js';
import { createTripSchema, updateTripSchema, publishTripSchema, aiGenerateTripSchema } from '../validators/trip.validator.js';
import { addStopSchema, updateStopSchema, reorderStopsSchema } from '../validators/stop.validator.js';
import { addActivitySchema, updateActivityLinkSchema } from '../validators/activity.validator.js';

const router = Router();

router.use(protect);

// Trip CRUD & Publish
router.get('/', tripController.getUserTrips);
router.post('/', upload.single('coverPhoto'), validate(createTripSchema), tripController.createTrip);

// AI Itinerary Generator & Smart Route Optimizer Endpoint
router.post('/ai-generate', validate(aiGenerateTripSchema), tripController.generateAiItinerary);

router.get('/:id', tripController.getTripById);
router.patch('/:id', upload.single('coverPhoto'), validate(updateTripSchema), tripController.updateTrip);
router.delete('/:id', tripController.deleteTrip);
router.patch('/:id/publish', validate(publishTripSchema), tripController.publishTrip);

// Stop CRUD & Reorder
router.post('/:id/stops', validate(addStopSchema), stopController.addStop);
router.patch('/:id/stops/reorder', validate(reorderStopsSchema), stopController.reorderStops);
router.patch('/:id/stops/:stopId', validate(updateStopSchema), stopController.updateStop);
router.delete('/:id/stops/:stopId', stopController.deleteStop);

// Activity Links in Stops
router.post('/:id/stops/:stopId/activities', validate(addActivitySchema), activityLinkController.addActivityToStop);
router.patch('/:id/stops/:stopId/activities/:activityLinkId', validate(updateActivityLinkSchema), activityLinkController.updateActivityLink);
router.delete('/:id/stops/:stopId/activities/:activityLinkId', activityLinkController.removeActivityLink);

// Budget Engine
router.get('/:id/budget', budgetController.getTripBudget);

export default router;
