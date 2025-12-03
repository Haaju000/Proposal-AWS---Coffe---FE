import axios from 'axios';
import authService from './authService';
import { ENV_CONFIG } from '../config/environment';

// Helper to get API base URL dynamically
const getBaseURL = () => ENV_CONFIG.getApiBaseUrl().replace('/api', '');

// Create axios instance với interceptor để tự động thêm token
const customerAPI = axios.create({
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
customerAPI.interceptors.request.use(
  (config) => {
    // Set baseURL dynamically for each request
    if (!config.baseURL) {
      config.baseURL = getBaseURL();
    }
    
    const token = authService.getIdToken(); // Sử dụng ID Token thay vì Access Token
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

const customerService = {
  // GET /api/Customer - Lấy danh sách tất cả customers
  getAllCustomers: async () => {
    try {
      console.log('🔍 Fetching all customers...');
      console.log('🔗 Request URL:', `${getBaseURL()}/api/Customer`);
      console.log('🔑 ID Token:', authService.getIdToken() ? 'Present' : 'Missing');
      
      const response = await customerAPI.get('/api/Customer');
      console.log('✅ Customers fetched successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching customers:', error);
      console.error('❌ Error details:', error.response?.data);
      console.error('❌ Status code:', error.response?.status);
      console.error('❌ Status text:', error.response?.statusText);
      
      // Thêm thông tin chi tiết về lỗi
      if (error.response?.status === 401) {
        throw new Error('Không có quyền truy cập. Vui lòng đăng nhập lại.');
      } else if (error.response?.status === 404) {
        throw new Error('Endpoint không tồn tại. Backend có thể chưa implement API Customer.');
      } else if (error.response?.status === 500) {
        throw new Error('Lỗi server. Kiểm tra backend và kết nối database.');
      } else if (error.code === 'ECONNREFUSED') {
        throw new Error('Không thể kết nối tới backend. Kiểm tra server có chạy không.');
      }
      
      throw error;
    }
  },

  // GET /api/Customer/{id} - Lấy thông tin customer theo ID
  getCustomerById: async (customerId) => {
    try {
      console.log(`🔍 Fetching customer with ID: ${customerId}`);
      const response = await customerAPI.get(`/api/Customer/${customerId}`);
      console.log('✅ Customer fetched successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error(`❌ Error fetching customer ${customerId}:`, error);
      throw error;
    }
  },

  // DELETE /api/Customer/{id} - Xóa customer
  deleteCustomer: async (customerId) => {
    try {
      console.log(`🗑️ Deleting customer with ID: ${customerId}`);
      const response = await customerAPI.delete(`/api/Customer/${customerId}`);
      console.log('✅ Customer deleted successfully');
      return response.data;
    } catch (error) {
      console.error(`❌ Error deleting customer ${customerId}:`, error);
      throw error;
    }
  },

  // PUT /api/Customer/{userId}/status - Cập nhật trạng thái customer
  updateCustomerStatus: async (userId, status) => {
    try {
      console.log(`🔄 Updating customer ${userId} status to: ${status}`);
      const response = await customerAPI.put(`/api/Customer/${userId}/status`, {
        status: status
      });
      console.log('✅ Customer status updated successfully');
      return response.data;
    } catch (error) {
      console.error(`❌ Error updating customer status:`, error);
      throw error;
    }
  }
};

export default customerService;