import axios from 'axios';
import authService from './authService';
import { ENV_CONFIG } from '../config/environment';

// Helper to get API base URL dynamically
const getBaseURL = () => ENV_CONFIG.getApiBaseUrl().replace('/api', '');

// Create axios instance với interceptor để tự động thêm token
const dashboardAPI = axios.create({
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
dashboardAPI.interceptors.request.use(
  (config) => {
    // Set baseURL dynamically for each request
    if (!config.baseURL) {
      config.baseURL = getBaseURL();
    }
    
    const token = authService.getToken(); // Tự động chọn id_token hoặc local_token dựa trên role
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('🔑 Adding admin token to dashboard request');
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor để handle errors
dashboardAPI.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('❌ Dashboard API Error:', error.response?.status, error.response?.data);
    if (error.response?.status === 401) {
      console.warn('🔒 Unauthorized - Admin token may be invalid or expired');
    } else if (error.response?.status === 403) {
      console.warn('🚫 Forbidden - Admin role required for dashboard access');
    }
    return Promise.reject(error);
  }
);

const dashboardService = {
  /**
   * 📊 Get comprehensive dashboard overview
   * Replaces multiple separate API calls with single optimized endpoint
   */
  getDashboardOverview: async () => {
    try {
      console.log('🚀 Fetching dashboard overview from /api/Dashboard/overview');
      const response = await dashboardAPI.get('/api/Dashboard/overview');
      console.log('✅ Dashboard overview loaded successfully:', response.data);
      
      return {
        success: true,
        data: response.data,
        timestamp: response.data.timestamp
      };
    } catch (error) {
      console.error('❌ Error fetching dashboard overview:', error);
      
      // Enhanced error handling
      if (error.response?.status === 401) {
        throw new Error('Phiên đăng nhập Admin đã hết hạn. Vui lòng đăng nhập lại.');
      } else if (error.response?.status === 403) {
        throw new Error('Bạn không có quyền truy cập Dashboard Admin.');
      } else if (error.response?.status === 404) {
        throw new Error('API Dashboard không tồn tại. Kiểm tra backend.');
      } else if (error.response?.status >= 500) {
        throw new Error('Lỗi server. Vui lòng thử lại sau.');
      } else if (error.code === 'ECONNREFUSED') {
        throw new Error('Không thể kết nối tới backend. Kiểm tra server có chạy không.');
      }
      
      throw new Error(error.response?.data?.message || 'Không thể tải dữ liệu dashboard');
    }
  },

  /**
   * ⚡ Get real-time metrics for live updates
   * Lightweight endpoint for frequent updates
   */
  getRealtimeMetrics: async () => {
    try {
      console.log('⚡ Fetching real-time metrics from /api/Dashboard/realtime');
      const response = await dashboardAPI.get('/api/Dashboard/realtime');
      console.log('✅ Real-time metrics loaded:', response.data);
      
      return {
        success: true,
        data: response.data,
        lastUpdated: response.data.lastUpdated
      };
    } catch (error) {
      console.error('❌ Error fetching real-time metrics:', error);
      
      // Return cached data structure if API fails
      return {
        success: false,
        data: {
          todayRevenue: 0,
          todayOrders: 0,
          pendingOrders: 0,
          activeShippers: 0,
          lastUpdated: new Date().toISOString()
        },
        error: error.message
      };
    }
  },

  /**
   * 📈 Get performance analytics
   * Detailed analytics for specific time periods
   */
  getPerformanceAnalytics: async (days = 30) => {
    try {
      console.log(`📈 Fetching performance analytics for ${days} days`);
      const response = await dashboardAPI.get(`/api/Dashboard/analytics?days=${days}`);
      console.log('✅ Performance analytics loaded:', response.data);
      
      return {
        success: true,
        data: response.data,
        period: response.data.period
      };
    } catch (error) {
      console.error('❌ Error fetching performance analytics:', error);
      throw new Error(error.response?.data?.message || 'Không thể tải dữ liệu phân tích');
    }
  },

  /**
   * 🔄 Helper function to format dashboard data for frontend
   */
  formatDashboardData: (rawData) => {
    try {
      const { summary, statistics, charts, recentActivities, alerts } = rawData;
      
      return {
        // Overview stats for cards
        overviewStats: {
          totalRevenue: summary?.todayRevenue || 0,
          todayOrders: summary?.todayOrders || 0,
          totalCustomers: summary?.totalCustomers || 0,
          pendingOrders: summary?.pendingOrders || 0,
          revenueGrowth: summary?.revenueGrowth || 0,
          ordersGrowth: summary?.ordersGrowth || 0,
          customersGrowth: summary?.customersGrowth || 0,
          inventoryHealthScore: summary?.inventoryHealthScore || 0
        },
        
        // Stock alerts
        stockAlerts: {
          totalAlerts: summary?.lowStockCount + summary?.outOfStockCount || 0,
          critical: summary?.outOfStockCount || 0,
          warnings: summary?.lowStockCount || 0,
          healthy: summary?.totalProducts - (summary?.lowStockCount || 0) - (summary?.outOfStockCount || 0) || 0
        },
        
        // Detailed statistics
        statistics: statistics || {},
        
        // Chart data
        charts: {
          revenueChart: charts?.revenueChart || [],
          topProducts: charts?.topProducts || [],
          orderStatusDistribution: charts?.orderStatusDistribution || {},
          monthlyTrend: charts?.monthlyRevenueTrend || []
        },
        
        // Recent activities
        recentActivities: recentActivities || [],
        
        // System alerts
        alerts: alerts || []
      };
    } catch (error) {
      console.error('❌ Error formatting dashboard data:', error);
      return {
        overviewStats: {},
        stockAlerts: { totalAlerts: 0, critical: 0, warnings: 0, healthy: 0 },
        statistics: {},
        charts: {},
        recentActivities: [],
        alerts: []
      };
    }
  },

  /**
   * 🎨 Helper function to get status colors and icons
   */
  getStatusDisplay: (status) => {
    const statusMap = {
      'Pending': { text: 'Chờ thanh toán', color: '#F59E0B', icon: '⏳' },
      'Processing': { text: 'Đang xử lý', color: '#3B82F6', icon: '💳' },
      'Confirmed': { text: 'Đã xác nhận', color: '#10B981', icon: '✅' },
      'Shipping': { text: 'Đang giao hàng', color: '#8B5CF6', icon: '🚚' },
      'Delivered': { text: 'Đã giao', color: '#06B6D4', icon: '📦' },
      'Completed': { text: 'Hoàn thành', color: '#059669', icon: '🎉' },
      'Cancelled': { text: 'Đã hủy', color: '#EF4444', icon: '❌' }
    };
    
    return statusMap[status] || { text: status, color: '#6B7280', icon: '📋' };
  },

  /**
   * 🔄 Helper function to get activity type display in Vietnamese
   */
  getActivityTypeDisplay: (type, action) => {
    const typeMap = {
      'order': {
        'created': 'Tạo đơn hàng',
        'payment confirmed': 'Xác nhận thanh toán', 
        'confirmed by admin': 'Admin xác nhận',
        'out for delivery': 'Bắt đầu giao hàng',
        'delivered': 'Đã giao hàng',
        'completed': 'Hoàn thành đơn hàng',
        'cancelled': 'Hủy đơn hàng'
      },
      'user': {
        'registered': 'Khách hàng đăng ký',
        'updated': 'Cập nhật thông tin'
      },
      'shipper': {
        'approved': 'Phê duyệt shipper',
        'registered': 'Đăng ký shipper',
        'rejected': 'Từ chối shipper'
      },
      'product': {
        'created': 'Thêm sản phẩm',
        'updated': 'Cập nhật sản phẩm',
        'deleted': 'Xóa sản phẩm'
      }
    };
    
    return typeMap[type]?.[action] || `${type} ${action}`;
  },

  /**
   * 💰 Format currency for display
   */
  formatCurrency: (amount) => {
    if (!amount || isNaN(amount)) return '0₫';
    return new Intl.NumberFormat('vi-VN').format(amount) + '₫';
  },

  /**
   * 📅 Format date for display
   */
  formatDate: (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',  
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  },

  /**
   * 📊 Format percentage for display
   */
  formatPercentage: (value) => {
    if (!value || isNaN(value)) return '0%';
    const sign = value > 0 ? '+' : '';
    return `${sign}${value.toFixed(1)}%`;
  },

  /**
   * 🔄 Helper function to get activity type display in Vietnamese
   */
  getActivityTypeDisplay: (type, action) => {
    const typeMap = {
      'order': {
        'created': 'Tạo đơn hàng',
        'payment confirmed': 'Xác nhận thanh toán', 
        'confirmed by admin': 'Admin xác nhận',
        'out for delivery': 'Bắt đầu giao hàng',
        'delivered': 'Đã giao hàng',
        'completed': 'Hoàn thành đơn hàng',
        'cancelled': 'Hủy đơn hàng'
      },
      'user': {
        'registered': 'Khách hàng đăng ký',
        'updated': 'Cập nhật thông tin'
      },
      'shipper': {
        'approved': 'Phê duyệt shipper',
        'registered': 'Đăng ký shipper',
        'rejected': 'Từ chối shipper'
      },
      'product': {
        'created': 'Thêm sản phẩm',
        'updated': 'Cập nhật sản phẩm',
        'deleted': 'Xóa sản phẩm'
      }
    };
    
    return typeMap[type]?.[action] || `${type} ${action}`;
  },

  /**
   * 🚨 Get alert severity display
   */
  getAlertSeverity: (severity) => {
    const severityMap = {
      'critical': { color: '#EF4444', icon: '🚨', priority: 1 },
      'high': { color: '#F59E0B', icon: '⚠️', priority: 2 },
      'warning': { color: '#F59E0B', icon: '⚠️', priority: 3 },
      'medium': { color: '#3B82F6', icon: 'ℹ️', priority: 4 },
      'low': { color: '#6B7280', icon: '📝', priority: 5 }
    };
    
    return severityMap[severity] || severityMap['low'];
  }
};

export default dashboardService;