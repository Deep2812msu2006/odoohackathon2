import api from './api.js';

export const publicApi = {
  getPublicTripBySlug: (slug) => api.get(`/public/trips/${slug}`),
  copyTrip: (slug) => api.post(`/public/trips/${slug}/copy`),
};
