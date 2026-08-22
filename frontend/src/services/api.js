import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach Bearer token from localStorage if present
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle API errors cleanly
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const customError = {
      message: error.response?.data?.error?.message || error.message || 'An unexpected error occurred.',
      code: error.response?.data?.error?.code || 'UNKNOWN_ERROR',
      status: error.response?.status || 500,
    };
    return Promise.reject(customError);
  }
);

export default api;
