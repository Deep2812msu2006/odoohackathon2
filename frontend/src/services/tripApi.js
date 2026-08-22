import api from './api.js';

export const tripApi = {
  getUserTrips: () => api.get('/trips'),
  getTripById: (id) => api.get(`/trips/${id}`),
  createTrip: (data) => api.post('/trips', data),
  updateTrip: (id, data) => api.patch(`/trips/${id}`, data),
  deleteTrip: (id) => api.delete(`/trips/${id}`),
  publishTrip: (id, isPublic) => api.patch(`/trips/${id}/publish`, { isPublic }),

  // Stop APIs
  addStop: (tripId, data) => api.post(`/trips/${tripId}/stops`, data),
  updateStop: (tripId, stopId, data) => api.patch(`/trips/${tripId}/stops/${stopId}`, data),
  deleteStop: (tripId, stopId) => api.delete(`/trips/${tripId}/stops/${stopId}`),
  reorderStops: (tripId, stops) => api.patch(`/trips/${tripId}/stops/reorder`, { stops }),

  // Activity Link APIs
  addActivityToStop: (tripId, stopId, data) => api.post(`/trips/${tripId}/stops/${stopId}/activities`, data),
  updateActivityLink: (tripId, stopId, linkId, data) => api.patch(`/trips/${tripId}/stops/${stopId}/activities/${linkId}`, data),
  removeActivityLink: (tripId, stopId, linkId) => api.delete(`/trips/${tripId}/stops/${stopId}/activities/${linkId}`),

  // Budget Engine API
  getTripBudget: (tripId, targetDailyBudget = 150) => api.get(`/trips/${tripId}/budget?targetDailyBudget=${targetDailyBudget}`),
};
