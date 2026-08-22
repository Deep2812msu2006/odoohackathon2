import * as tripService from '../services/trip.service.js';
import { sendSuccess } from '../utils/responseFormatter.js';

export const createTrip = async (req, res, next) => {
  try {
    const data = { ...req.body };
    if (req.file) {
      data.coverPhotoUrl = `/uploads/${req.file.filename}`;
    }
    const trip = await tripService.createTrip(req.user.id, data);
    return sendSuccess(res, { trip }, 201, 'Trip created successfully.');
  } catch (err) {
    next(err);
  }
};

export const generateAiItinerary = async (req, res, next) => {
  try {
    const trip = await tripService.generateAiItinerary(req.user.id, req.body);
    return sendSuccess(res, { trip }, 201, 'AI Itinerary generated & optimized successfully!');
  } catch (err) {
    next(err);
  }
};

export const getUserTrips = async (req, res, next) => {
  try {
    const trips = await tripService.getUserTrips(req.user.id);
    return sendSuccess(res, { trips, count: trips.length }, 200);
  } catch (err) {
    next(err);
  }
};

export const getTripById = async (req, res, next) => {
  try {
    const userId = req.user ? req.user.id : null;
    const trip = await tripService.getTripById(req.params.id, userId);
    return sendSuccess(res, { trip }, 200);
  } catch (err) {
    next(err);
  }
};

export const updateTrip = async (req, res, next) => {
  try {
    const data = { ...req.body };
    if (req.file) {
      data.coverPhotoUrl = `/uploads/${req.file.filename}`;
    }
    const trip = await tripService.updateTrip(req.params.id, req.user.id, data);
    return sendSuccess(res, { trip }, 200, 'Trip updated successfully.');
  } catch (err) {
    next(err);
  }
};

export const deleteTrip = async (req, res, next) => {
  try {
    const result = await tripService.deleteTrip(req.params.id, req.user.id);
    return sendSuccess(res, result, 200);
  } catch (err) {
    next(err);
  }
};

export const publishTrip = async (req, res, next) => {
  try {
    const trip = await tripService.publishTrip(req.params.id, req.user.id, req.body.isPublic);
    return sendSuccess(res, { trip }, 200, `Trip ${req.body.isPublic ? 'published' : 'unpublished'} successfully.`);
  } catch (err) {
    next(err);
  }
};
