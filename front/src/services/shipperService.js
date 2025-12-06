import axios from 'axios';
import authService from './authService';
import { ENV_CONFIG } from '../config/environment';

// Helper to get API base URL dynamically
const getBaseURL = () => ENV_CONFIG.getApiBaseUrl().replace('/api', '');

// Create axios instance với interceptor để tự động thêm token
const shipperAPI = axios.create({
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
shipperAPI.interceptors.request.use(
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

const shipperService = {
  // GET /api/Admin/shippers/pending - Lấy danh sách shippers chờ phê duyệt
  getPendingShippers: async () => {
    try {
      console.log('🔍 Fetching pending shippers...');
      console.log('🔗 Request URL:', `${getBaseURL()}/api/Admin/shippers/pending`);
      console.log('🔑 Token:', authService.getToken() ? 'Present' : 'Missing');
      
      const response = await shipperAPI.get('/api/Admin/shippers/pending');
      console.log('✅ Pending shippers fetched successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching pending shippers:', error);
      console.error('❌ Error details:', error.response?.data);
      console.error('❌ Status code:', error.response?.status);
      console.error('❌ Status text:', error.response?.statusText);
      
      if (error.response?.status === 401) {
        throw new Error('Không có quyền truy cập. Vui lòng đăng nhập lại.');
      } else if (error.response?.status === 404) {
        throw new Error('Endpoint không tồn tại. Backend có thể chưa implement API Shipper.');
      } else if (error.response?.status === 500) {
        throw new Error('Lỗi server. Kiểm tra backend và kết nối database.');
      } else if (error.code === 'ECONNREFUSED') {
        throw new Error('Không thể kết nối tới backend. Kiểm tra server có chạy không.');
      }
      
      throw error;
    }
  },

  // GET /api/Admin/shippers - Lấy tất cả shippers
  getAllShippers: async () => {
    try {
      console.log('🔍 Fetching all shippers...');
      const response = await shipperAPI.get('/api/Admin/shippers');
      console.log('✅ All shippers fetched successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching all shippers:', error);
      throw error;
    }
  },



  // POST /api/Admin/shipper/{userId}/approve - Phê duyệt shipper
  approveShipper: async (userId) => {
    try {
      console.log(`✅ Approving shipper with ID: ${userId}`);
      const response = await shipperAPI.post(`/api/Admin/shipper/${userId}/approve`, {});
      console.log('✅ Shipper approved successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error(`❌ Error approving shipper ${userId}:`, error);
      
      if (error.response?.status === 400) {
        throw new Error('Yêu cầu không hợp lệ. Kiểm tra thông tin shipper.');
      } else if (error.response?.status === 404) {
        throw new Error('Không tìm thấy shipper.');
      }
      
      throw error;
    }
  },

  // POST /api/Admin/shipper/{userId}/reject - Từ chối shipper
  rejectShipper: async (userId, reason = '') => {
    try {
      console.log(`❌ Rejecting shipper with ID: ${userId}, reason: ${reason}`);
      const response = await shipperAPI.post(`/api/Admin/shipper/${userId}/reject`, { reason });
      console.log('✅ Shipper rejected successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error(`❌ Error rejecting shipper ${userId}:`, error);
      
      if (error.response?.status === 400) {
        throw new Error('Yêu cầu không hợp lệ. Kiểm tra thông tin shipper.');
      } else if (error.response?.status === 404) {
        throw new Error('Không tìm thấy shipper.');
      }
      
      throw error;
    }
  },

  // PUT /api/Admin/shipper/{userId}/lock - Khóa tài khoản shipper
  lockShipper: async (userId) => {
    try {
      console.log(`🔒 Locking shipper with ID: ${userId}`);
      const response = await shipperAPI.put(`/api/Admin/shipper/${userId}/lock`);
      console.log('✅ Shipper locked successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error(`❌ Error locking shipper ${userId}:`, error);
      
      if (error.response?.status === 400) {
        throw new Error('Yêu cầu không hợp lệ. Shipper có thể đã bị khóa.');
      } else if (error.response?.status === 404) {
        throw new Error('Không tìm thấy shipper.');
      }
      
      throw error;
    }
  },

  // POST /api/Admin/shipper/{userId}/reset-password - Reset mật khẩu shipper
  resetShipperPassword: async (userId) => {
    try {
      console.log(`🔑 Resetting password for shipper with ID: ${userId}`);
      const response = await shipperAPI.post(`/api/Admin/shipper/${userId}/reset-password`);
      console.log('✅ Shipper password reset successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error(`❌ Error resetting password for shipper ${userId}:`, error);
      
      if (error.response?.status === 400) {
        throw new Error('Yêu cầu không hợp lệ. Kiểm tra thông tin shipper.');
      } else if (error.response?.status === 404) {
        throw new Error('Không tìm thấy shipper.');
      }
      
      throw error;
    }
  },

  // Utility function để lấy thông tin chi tiết shipper theo ID
  getShipperById: async (shipperId) => {
    try {
      console.log(`🔍 Fetching shipper with ID: ${shipperId}`);
      // Giả sử có API endpoint để lấy thông tin chi tiết shipper
      const response = await shipperAPI.get(`/api/Shipper/${shipperId}`);
      console.log('✅ Shipper details fetched successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error(`❌ Error fetching shipper ${shipperId}:`, error);
      throw error;
    }
  },

  // Utility function để lấy shipper status text
  getStatusText: (status) => {
    switch (status?.toLowerCase()) {
      case 'pending': return 'Chờ phê duyệt';
      case 'approved': return 'Đã phê duyệt';
      case 'rejected': return 'Đã từ chối';
      case 'active': return 'Hoạt động';
      case 'locked': return 'Bị khóa';
      case 'inactive': return 'Không hoạt động';
      default: return status || 'Không xác định';
    }
  },

  // Utility function để lấy shipper status class cho CSS
  getStatusClass: (status) => {
    switch (status?.toLowerCase()) {
      case 'pending': return 'status-pending';
      case 'approved': return 'status-approved';
      case 'rejected': return 'status-rejected';
      case 'active': return 'status-active';
      case 'locked': return 'status-locked';
      case 'inactive': return 'status-inactive';
      default: return 'status-unknown';
    }
  }
};

export default shipperService;