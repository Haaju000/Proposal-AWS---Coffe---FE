import axios from 'axios';
import authService from './authService';

const API_BASE_URL = 'http://localhost:5144';

// Create axios instance với interceptor để tự động thêm token
const shipperAPIService = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
shipperAPIService.interceptors.request.use(
  (config) => {
    const token = authService.getToken(); // Sử dụng token phù hợp theo role (local_token cho Shipper)
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('🔑 Adding token to request:', token ? 'Present' : 'Missing');
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor để handle errors
shipperAPIService.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('❌ API Error Response:', error.response?.status, error.response?.data);
    if (error.response?.status === 401) {
      console.warn('🔒 Unauthorized - Token may be invalid or expired');
    }
    return Promise.reject(error);
  }
);

const shipperAPI = {
  // GET /api/Shipper/orders/available - Xem danh sách đơn hàng available (status = Confirmed)
  getAvailableOrders: async () => {
    try {
      console.log('🔍 Fetching available orders from: /api/Shipper/orders/available');
      const response = await shipperAPIService.get('/api/Shipper/orders/available');
      console.log('✅ Available orders response:', response.data);
      return response.data || [];
    } catch (error) {
      console.error('❌ Error fetching available orders:', error);
      console.error('❌ Request URL:', '/api/Shipper/orders/available');
      console.error('❌ Status:', error.response?.status);
      console.error('❌ Error data:', error.response?.data);
      
      if (error.response?.status === 401) {
        throw new Error('Không có quyền truy cập. Vui lòng đăng nhập lại với tài khoản Shipper.');
      }
      if (error.response?.status === 404) {
        console.warn('🔍 Endpoint not found - Backend may not be running');
        return [];
      }
      return [];
    }
  },

  // GET /api/Shipper/orders/{orderId} - Xem chi tiết đơn hàng
  getOrderDetail: async (orderId) => {
    try {
      console.log(`🔍 Fetching order detail for ID: ${orderId}`);
      const response = await shipperAPIService.get(`/api/Shipper/orders/${orderId}`);
      console.log('✅ Order detail response:', response.data);
      return response.data;
    } catch (error) {
      console.error(`❌ Error fetching order detail for ${orderId}:`, error);
      if (error.response?.status === 404) {
        throw new Error('Không tìm thấy đơn hàng');
      }
      if (error.response?.status === 401) {
        throw new Error('Không có quyền truy cập đơn hàng này');
      }
      throw new Error(error.response?.data?.error || 'Không thể tải chi tiết đơn hàng');
    }
  },

  // POST /api/Shipper/orders/{orderId}/calculate-fee - Tính phí ship cho đơn hàng
  calculateShippingFee: async (orderId) => {
    try {
      console.log(`🔍 Calculating shipping fee for order: ${orderId}`);
      const response = await shipperAPIService.post(`/api/Shipper/orders/${orderId}/calculate-fee`);
      console.log('✅ Shipping fee calculation response:', response.data);
      return response.data;
    } catch (error) {
      console.error(`❌ Error calculating shipping fee for ${orderId}:`, error);
      if (error.response?.status === 400) {
        throw new Error(error.response?.data?.error || 'Không thể tính phí ship cho đơn hàng này');
      }
      if (error.response?.status === 404) {
        throw new Error('Không tìm thấy đơn hàng');
      }
      throw new Error(error.response?.data?.error || 'Không thể tính phí giao hàng');
    }
  },

  // POST /api/Shipper/orders/{orderId}/accept - Chấp nhận đơn hàng (Confirmed → Shipping)
  acceptOrder: async (orderId) => {
    try {
      console.log(`🔍 Accepting order: ${orderId}`);
      const response = await shipperAPIService.post(`/api/Shipper/orders/${orderId}/accept`);
      console.log('✅ Order accepted successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error(`❌ Error accepting order ${orderId}:`, error);
      if (error.response?.status === 400) {
        throw new Error(error.response?.data?.error || 'Không thể nhận đơn hàng này');
      }
      if (error.response?.status === 404) {
        throw new Error('Không tìm thấy đơn hàng');
      }
      if (error.response?.status === 401) {
        throw new Error('Không có quyền truy cập. Token không hợp lệ');
      }
      throw new Error(error.response?.data?.error || 'Không thể nhận đơn hàng');
    }
  },

  // POST /api/Shipper/orders/{orderId}/complete - Hoàn thành giao hàng (Shipping → Delivered)
  completeDelivery: async (orderId) => {
    try {
      console.log(`🔍 Completing delivery for order: ${orderId}`);
      const response = await shipperAPIService.post(`/api/Shipper/orders/${orderId}/complete`);
      console.log('✅ Delivery completed successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error(`❌ Error completing delivery for ${orderId}:`, error);
      if (error.response?.status === 400) {
        throw new Error(error.response?.data?.error || 'Không thể hoàn thành giao hàng');
      }
      if (error.response?.status === 404) {
        throw new Error('Không tìm thấy đơn hàng');
      }
      if (error.response?.status === 401) {
        throw new Error('Không có quyền truy cập. Token không hợp lệ');
      }
      throw new Error(error.response?.data?.error || 'Không thể hoàn thành giao hàng');
    }
  },

  // GET /api/Shipper/orders/history - Xem lịch sử đơn hàng của shipper
  getOrderHistory: async () => {
    try {
      console.log('🔍 Fetching shipper order history');
      const response = await shipperAPIService.get('/api/Shipper/orders/history');
      console.log('✅ Order history response:', response.data);
      return response.data || [];
    } catch (error) {
      console.error('❌ Error fetching order history:', error);
      if (error.response?.status === 401) {
        throw new Error('Không có quyền truy cập. Token không hợp lệ');
      }
      return [];
    }
  },

  // GET /api/Shipper/statistics - Xem thống kê của shipper
  getStatistics: async () => {
    try {
      console.log('🔍 Fetching shipper statistics');
      const response = await shipperAPIService.get('/api/Shipper/statistics');
      console.log('✅ Statistics response:', response.data);
      return response.data || {
        totalOrders: 0,
        completedOrders: 0,
        shippingOrders: 0,
        totalEarnings: 0,
        todayOrders: 0
      };
    } catch (error) {
      console.error('❌ Error fetching statistics:', error);
      if (error.response?.status === 401) {
        console.warn('🔒 Unauthorized - may need to login again');
      }
      return {
        totalOrders: 0,
        completedOrders: 0,
        shippingOrders: 0,
        totalEarnings: 0,
        todayOrders: 0
      };
    }
  },

  // GET /api/Shipper/history - Xem lịch sử giao hàng chi tiết của shipper
  getDeliveryHistory: async () => {
    try {
      console.log('🔍 Fetching delivery history');
      const response = await shipperAPIService.get('/api/Shipper/history');
      console.log('✅ Delivery history response:', response.data);
      return response.data || [];
    } catch (error) {
      console.error('❌ Error fetching delivery history:', error);
      if (error.response?.status === 401) {
        throw new Error('Không có quyền truy cập. Token không hợp lệ');
      }
      return [];
    }
  },

  // GET /api/Shipper/profile - Xem profile của shipper
  getProfile: async () => {
    try {
      console.log('🔍 Fetching shipper profile from /api/Shipper/profile');
      const response = await shipperAPIService.get('/api/Shipper/profile');
      console.log('✅ Profile response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching profile:', error);
      console.log('📋 Error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      });
      
      if (error.response?.status === 404) {
        console.warn('🔍 Profile not found - creating empty profile template');
        // Trả về empty profile template thay vì null để frontend có thể xử lý
        return {
          shipperId: null,
          fullName: '',
          email: '',
          phone: '',
          address: '',
          vehicleType: '',
          vehiclePlate: '',
          driverLicense: '',
          vehicleColor: '',
          bankAccount: '',
          bankName: '',
          bankAccountName: '',
          workingHours: '',
          workingArea: '',
          totalEarnings: 0,
          totalDeliveries: 0,
          rating: 0,
          isProfileComplete: false
        };
      }
      if (error.response?.status === 401) {
        console.error('🔒 Unauthorized access - check token validity');
        throw new Error('Không có quyền truy cập. Vui lòng đăng nhập lại');
      }
      if (error.response?.status === 400) {
        console.error('📝 Bad request - check ShipperId mapping');
        throw new Error('Yêu cầu không hợp lệ. Vui lòng thử lại');
      }
      
      console.error('🚨 Unexpected error:', error.message);
      throw error;
    }
  },

  // PUT /api/Shipper/profile - Cập nhật profile của shipper
  updateProfile: async (profileData) => {
    try {
      console.log('🔍 Updating shipper profile:', profileData);
      const response = await shipperAPIService.put('/api/Shipper/profile', profileData);
      console.log('✅ Profile updated successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error updating profile:', error);
      if (error.response?.status === 401) {
        throw new Error('Không có quyền truy cập. Token không hợp lệ');
      }
      if (error.response?.status === 400) {
        throw new Error(error.response?.data?.error || 'Dữ liệu profile không hợp lệ');
      }
      throw new Error(error.response?.data?.error || 'Không thể cập nhật hồ sơ');
    }
  },

  // Helper functions for UI
  getOrderStatusText: (status) => {
    const statusMap = {
      'Pending': 'Chờ xác nhận',
      'Confirmed': 'Đã xác nhận', 
      'Available': 'Có thể nhận',
      'Shipping': 'Đang giao',
      'Delivered': 'Đã giao',
      'Completed': 'Hoàn thành',
      'Cancelled': 'Đã hủy',
      'Returned': 'Đã trả lại'
    };
    return statusMap[status] || status;
  },

  getOrderStatusClass: (status) => {
    const statusClassMap = {
      'Pending': 'status-pending',
      'Confirmed': 'status-confirmed',
      'Available': 'status-available',
      'Shipping': 'status-shipping',
      'Delivered': 'status-delivered',
      'Completed': 'status-completed',
      'Cancelled': 'status-cancelled',
      'Returned': 'status-returned'
    };
    return statusClassMap[status] || 'status-default';
  },

  // Format currency
  formatCurrency: (amount) => {
    if (!amount) return '0';
    return new Intl.NumberFormat('vi-VN').format(amount);
  },

  // Format date
  formatDate: (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',  
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
};

export default shipperAPI;