import axios from 'axios';
import authService from './authService';

const API_BASE_URL = 'http://localhost:5144';

// Create axios instance với interceptor để tự động thêm token
const loyaltyAPI = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
loyaltyAPI.interceptors.request.use(
  (config) => {
    const token = authService.getIdToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

const loyaltyService = {
  // Lấy thông tin điểm thưởng và voucher
  async getMyPoints() {
    try {
      const response = await loyaltyAPI.get('/api/loyalty/my-points');
      
      // Nếu API không trả về currentPoints, thử lấy từ user profile
      if (!response.data.currentPoints && response.data.userId) {
        try {
          const userResponse = await loyaltyAPI.get(`/api/Customer/${response.data.userId}`);
          response.data.currentPoints = userResponse.data.rewardPoints || 0;
        } catch (userError) {
          console.warn('Could not fetch user reward points:', userError);
          response.data.currentPoints = 0;
        }
      }
      
      return response.data;
    } catch (error) {
      console.error('Error fetching loyalty points:', error);
      throw error;
    }
  },

  // Lấy danh sách voucher
  async getMyVouchers() {
    try {
      const response = await loyaltyAPI.get('/api/loyalty/my-vouchers');
      return response.data;
    } catch (error) {
      console.error('Error fetching vouchers:', error);
      throw error;
    }
  }
};

export default loyaltyService;
