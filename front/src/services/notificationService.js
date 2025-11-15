import axios from 'axios';

// API base URL - match với Swagger backend
const API_BASE_URL = 'http://localhost:5144/api';

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

console.log('✅ NotificationService initialized with base URL:', API_BASE_URL);

// Add token interceptor - match authService priority
apiClient.interceptors.request.use(
  (config) => {
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

// Handle response errors
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      console.warn('Token expired, logging out...');
      // Clear all tokens
      localStorage.removeItem('access_token');
      localStorage.removeItem('id_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('local_token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

const notificationService = {
  // Get all notifications for current user
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

  // Get unread notifications only
  getUnreadNotifications: async () => {
    try {
      console.log('📋 Getting unread notifications...');
      const response = await apiClient.get('/Notification/unread');
      console.log('✅ Unread notifications retrieved successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching unread notifications:', error);
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      throw error;
    }
  },

  // Get unread notifications count (for badge)
  getUnreadCount: async () => {
    try {
      console.log('🔢 Getting unread count...');
      const response = await apiClient.get('/Notification/unread/count');
      console.log('✅ Unread count retrieved successfully:', response.data.unreadCount);
      return response.data.unreadCount;
    } catch (error) {
      console.error('❌ Error fetching unread count:', error);
      return 0; // Return 0 on error to avoid breaking UI
    }
  },

  // Mark a notification as read
  markAsRead: async (notificationId) => {
    try {
      console.log('📖 Marking notification as read:', notificationId);
      const response = await apiClient.put(`/Notification/${notificationId}/read`);
      console.log('✅ Notification marked as read successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error marking notification as read:', error);
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      throw error;
    }
  },

  // Mark all notifications as read
  markAllAsRead: async () => {
    try {
      console.log('📖 Marking all notifications as read...');
      const response = await apiClient.put('/Notification/read-all');
      console.log('✅ All notifications marked as read successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error marking all notifications as read:', error);
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      throw error;
    }
  },

  // Delete a notification
  deleteNotification: async (notificationId) => {
    try {
      console.log('🗑️ Deleting notification:', notificationId);
      const response = await apiClient.delete(`/Notification/${notificationId}`);
      console.log('✅ Notification deleted successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error deleting notification:', error);
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