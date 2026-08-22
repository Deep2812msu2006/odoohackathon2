import api from './api.js';

export const userApi = {
  updateProfile: (data) => {
    // Check if data is FormData or plain object
    const headers = data instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : {};
    return api.patch('/users/me', data, { headers });
  },
  deleteAccount: () => api.delete('/users/me'),
};
