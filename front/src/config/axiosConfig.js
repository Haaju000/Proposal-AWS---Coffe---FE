import axios from 'axios';
import { ENV_CONFIG } from './environment';

// ⚠️ Axios config for Mixed Content (HTTPS frontend → HTTP backend)
// Only works if backend supports BOTH HTTP and HTTPS

const api = axios.create({
  baseURL: ENV_CONFIG.getApiBaseUrl(),
  withCredentials: true, // Allow cookies/credentials
  headers: {
    'Content-Type': 'application/json',
  },
  // ⚠️ WARNING: Bypassing HTTPS enforcement
  // Backend MUST support HTTPS or this will upgrade HTTP → HTTPS and fail
  httpsAgent: false,
});

// Add auth token to all requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token') || 
                  localStorage.getItem('id_token') || 
                  localStorage.getItem('local_token');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      console.warn('Token expired or invalid');
      // Clear tokens
      localStorage.removeItem('access_token');
      localStorage.removeItem('id_token');
      localStorage.removeItem('local_token');
      // Redirect to login
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
