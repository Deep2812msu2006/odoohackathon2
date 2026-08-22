import api from './api.js';

export const systemApi = {
  getHealth: () => api.get('/health'),
};
