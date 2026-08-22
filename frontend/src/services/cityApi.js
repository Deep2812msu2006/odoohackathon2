import api from './api.js';

export const cityApi = {
  getCities: (params) => api.get('/cities', { params }),
  getCityById: (id) => api.get(`/cities/${id}`),
};
