import axios from 'axios';

// URL backend C# của bạn
const API_BASE_URL = 'http://localhost:5263/api';

// Tạo axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor để thêm token vào mỗi request
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor để xử lý response errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth service functions
export const authService = {
  // Login function
  login: async (username, password) => {
    try {
      const response = await apiClient.post('/auth/login', {
        username,
        password
      });
      
      console.log('Login response:', response.data);
      
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        // Backend chỉ trả về token, tạo user object từ username
        const userData = response.data.user || { username };
        localStorage.setItem('user', JSON.stringify(userData));
      }
      
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      throw error.response?.data || { message: 'Login failed. Please try again.' };
    }
  },

  // Register function
  register: async (userData) => {
    try {
      const response = await apiClient.post('/auth/register', userData);
      console.log('Register response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Register error:', error);
      throw error.response?.data || { message: 'Registration failed. Please try again.' };
    }
  },

  // Logout function
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  // Get current user
  getCurrentUser: () => {
    try {
      const user = localStorage.getItem('user');
      return user ? JSON.parse(user) : null;
    } catch (error) {
      console.error('Error parsing user data:', error);
      return null;
    }
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    const token = localStorage.getItem('token');
    return !!token;
  }
};

export default authService;