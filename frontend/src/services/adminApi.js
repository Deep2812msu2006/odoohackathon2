import api from './api.js';

export const adminApi = {
  getAnalytics: () => api.get('/admin/analytics'),
};
