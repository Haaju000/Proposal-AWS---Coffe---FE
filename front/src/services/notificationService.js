import axios from 'axios';
import { ENV_CONFIG } from '../config/environment';

// Helper to get API base URL dynamically
const getBaseURL = () => ENV_CONFIG.getApiBaseUrl();

// Create axios instance
const apiClient = axios.create({
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

// Add token interceptor - match authService priority
apiClient.interceptors.request.use(
  (config) => {
    // Set baseURL dynamically for each request
    if (!config.baseURL) {
      config.baseURL = getBaseURL();
    }
    
    // Priority: id_token > access_token > local_token (same as authService)
    const idToken = localStorage.getItem('id_token');
    const accessToken = localStorage.getItem('access_token');
    const localToken = localStorage.getItem('local_token');
    
    const token = idToken || accessToken || localToken;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    console.log('🔑 Notification request with token:', token ? 'Present' : 'Missing');
    console.log('🔍 Token type:', idToken ? 'id_token' : accessToken ? 'access_token' : localToken ? 'local_token' : 'none');
    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ SỬA: Handle response errors - KHÔNG tự động logout
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    // ✅ CHỈ log error, KHÔNG logout tự động
    if (error.response?.status === 401) {
      console.warn('⚠️ Notification API 401 error - may need authentication setup on backend');
      console.warn('Error details:', error.response?.data);
      
      // ❌ LOẠI BỎ: Không clear storage hay redirect ở đây
      // Let parent components handle auth state
    } else {
      console.error('❌ Notification API error:', error.response?.status, error.response?.data);
    }
    return Promise.reject(error);
  }
);

const notificationService = {
  // ✅ SỬA: Get all notifications với better error handling
  getNotifications: async (limit = 50) => {
    try {
      console.log('📋 Getting notifications with limit:', limit);
      const response = await apiClient.get('/Notification', {
        params: { limit }
      });
      console.log('✅ Notifications retrieved successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching notifications:', error);
      
      // ✅ THÊM: Xử lý 401 đặc biệt cho notifications
      if (error.response?.status === 401) {
        console.warn('🔒 Notification API requires authentication - backend may not be configured');
        // Return empty array instead of throwing error
        return [];
      }
      
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      } else if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else if (error.message) {
        throw new Error(error.message);
      } else {
        throw new Error('Không thể tải thông báo. Vui lòng thử lại.');
      }
    }
  },

  // ✅ SỬA: Get unread notifications với fallback
  getUnreadNotifications: async () => {
    try {
      console.log('📋 Getting unread notifications...');
      const response = await apiClient.get('/Notification/unread');
      console.log('✅ Unread notifications retrieved successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching unread notifications:', error);
      
      // ✅ THÊM: Return empty array cho 401
      if (error.response?.status === 401) {
        console.warn('🔒 Unread notifications requires authentication');
        return [];
      }
      
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      throw error;
    }
  },

  // ✅ SỬA: Get unread count với safe fallback
  getUnreadCount: async () => {
    try {
      console.log('🔢 Getting unread count...');
      const response = await apiClient.get('/Notification/unread/count');
      console.log('✅ Unread count retrieved successfully:', response.data.unreadCount);
      return response.data.unreadCount;
    } catch (error) {
      console.error('❌ Error fetching unread count:', error);
      // ✅ LUÔN return 0 on error để không crash UI
      return 0;
    }
  },

  // ✅ SỬA: Mark as read với better error handling
  markAsRead: async (notificationId) => {
    try {
      console.log('📖 Marking notification as read:', notificationId);
      const response = await apiClient.put(`/Notification/${notificationId}/read`);
      console.log('✅ Notification marked as read successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error marking notification as read:', error);
      
      // ✅ THÊM: Ignore 401 errors for mark as read
      if (error.response?.status === 401) {
        console.warn('🔒 Mark as read requires authentication');
        return { success: false, message: 'Authentication required' };
      }
      
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      throw error;
    }
  },

  // ✅ SỬA: Mark all as read với safe handling
  markAllAsRead: async () => {
    try {
      console.log('📖 Marking all notifications as read...');
      const response = await apiClient.put('/Notification/read-all');
      console.log('✅ All notifications marked as read successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error marking all notifications as read:', error);
      
      // ✅ THÊM: Safe fallback cho 401
      if (error.response?.status === 401) {
        console.warn('🔒 Mark all as read requires authentication');
        return { success: false, message: 'Authentication required' };
      }
      
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      throw error;
    }
  },

  // ✅ SỬA: Delete notification với safe handling  
  deleteNotification: async (notificationId) => {
    try {
      console.log('🗑️ Deleting notification:', notificationId);
      const response = await apiClient.delete(`/Notification/${notificationId}`);
      console.log('✅ Notification deleted successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error deleting notification:', error);
      
      // ✅ THÊM: Safe fallback cho 401
      if (error.response?.status === 401) {
        console.warn('🔒 Delete notification requires authentication');
        return { success: false, message: 'Authentication required' };
      }
      
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      throw error;
    }
  },

  // Get notification icon based on type
  getNotificationIcon: (type) => {
    const iconMap = {
      'OrderConfirmed': '✅',
      'ShipperAccepted': '🚚',
      'OrderShipping': '📦',
      'OrderDelivered': '🎉',
      'OrderCancelled': '❌',
      'PaymentSuccess': '💳',
      'PointsEarned': '⭐',
      'Promotion': '🎁',
      'System': '📢',
      'default': '🔔'
    };
    return iconMap[type] || iconMap.default;
  },

  // Get notification color based on type
  getNotificationColor: (type) => {
    const colorMap = {
      'OrderConfirmed': 'success',
      'ShipperAccepted': 'info',
      'OrderShipping': 'warning',
      'OrderDelivered': 'success',
      'OrderCancelled': 'danger',
      'PaymentSuccess': 'success',
      'PointsEarned': 'warning',
      'Promotion': 'info',
      'System': 'primary',
      'default': 'secondary'
    };
    return colorMap[type] || colorMap.default;
  },

  // Format notification time for display
  formatNotificationTime: (createdAt) => {
    const now = new Date();
    const created = new Date(createdAt);
    const diffMs = now - created;
    const diffMinutes = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMinutes < 1) {
      return 'Vừa xong';
    } else if (diffMinutes < 60) {
      return `${diffMinutes} phút trước`;
    } else if (diffHours < 24) {
      return `${diffHours} giờ trước`;
    } else if (diffDays < 7) {
      return `${diffDays} ngày trước`;
    } else {
      return created.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    }
  },

  // Get formatted status text
  getStatusText: (status) => {
    const statusMap = {
      'OrderConfirmed': 'Đã xác nhận',
      'ShipperAccepted': 'Shipper đã nhận',
      'OrderShipping': 'Đang giao hàng',
      'OrderDelivered': 'Đã giao hàng',
      'OrderCancelled': 'Đã hủy',
      'PaymentSuccess': 'Thanh toán thành công',
      'PointsEarned': 'Nhận điểm thưởng',
      'Promotion': 'Khuyến mãi',
      'System': 'Thông báo hệ thống'
    };
    return statusMap[status] || status;
  }
};

export default notificationService;