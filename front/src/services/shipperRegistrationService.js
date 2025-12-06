import axios from 'axios';
import authService from './authService';
import { ENV_CONFIG } from '../config/environment';

// Helper to get API base URL dynamically
const getBaseURL = () => ENV_CONFIG.getApiBaseUrl().replace('/api', '');

// Create axios instance
const registrationAPI = axios.create({
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
registrationAPI.interceptors.request.use(
  (config) => {
    // Set baseURL dynamically for each request
    if (!config.baseURL) {
      config.baseURL = getBaseURL();
    }
    
    const token = authService.getToken(); // Tự động chọn id_token hoặc local_token dựa trên role
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

const shipperRegistrationService = {
  // POST /api/ShipperRegistration/register - Đăng ký làm shipper
  submitApplication: async (applicationData) => {
    try {
      console.log('🚚 Submitting shipper registration...', applicationData);
      console.log('🔗 Request URL:', `${getBaseURL()}/api/ShipperRegistration/register`);
      console.log('🔑 Token:', authService.getToken() ? 'Present' : 'Missing');
      
      const response = await registrationAPI.post('/api/ShipperRegistration/register', applicationData);
      console.log('✅ Shipper registration submitted successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error submitting shipper registration:', error);
      console.error('❌ Error details:', error.response?.data);
      console.error('❌ Status code:', error.response?.status);
      console.error('❌ Status text:', error.response?.statusText);
      
      if (error.response?.status === 401) {
        throw new Error('Bạn cần đăng nhập để nộp đơn ứng tuyển.');
      } else if (error.response?.status === 400) {
        const errorMessage = error.response?.data?.message || 'Thông tin đăng ký không hợp lệ.';
        throw new Error(errorMessage);
      } else if (error.response?.status === 409) {
        throw new Error('Bạn đã nộp đơn ứng tuyển trước đó. Vui lòng chờ phản hồi từ admin.');
      } else if (error.response?.status === 500) {
        throw new Error('Lỗi server. Vui lòng thử lại sau.');
      } else if (error.code === 'ECONNREFUSED') {
        throw new Error('Không thể kết nối tới server. Vui lòng thử lại sau.');
      }
      
      throw error;
    }
  },

  // Utility function để format data trước khi gửi
  formatApplicationData: (formData) => {
    return {
      fullName: formData.fullName.trim(),
      email: formData.email.trim().toLowerCase(),
    };
  },

  // Validate form data before submission
  validateApplicationData: (formData) => {
    const errors = {};

    // Full name validation
    if (!formData.fullName?.trim()) {
      errors.fullName = 'Họ tên là bắt buộc';
    } else if (formData.fullName.trim().length < 2) {
      errors.fullName = 'Họ tên phải có ít nhất 2 ký tự';
    }

    // Email validation
    if (!formData.email?.trim()) {
      errors.email = 'Email là bắt buộc';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errors.email = 'Email không hợp lệ';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }
};

export default shipperRegistrationService;