import api from './api.js';

export const activityApi = {
  getActivities: (params) => api.get('/activities', { params }),
};
