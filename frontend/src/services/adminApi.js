import api from './api.js';

export const adminApi = {
  getAnalytics: () => api.get('/admin/analytics'),
  getUsers: () => api.get('/admin/users'),
  updateUserRole: (userId, role) => api.patch(`/admin/users/${userId}/role`, { role }),
};
