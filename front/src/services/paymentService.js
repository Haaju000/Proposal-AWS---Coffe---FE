import axios from 'axios';

// API base URL - match với Swagger backend
const API_BASE_URL = 'http://localhost:5144/api';

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000, // 15 second timeout for payments
});

console.log('✅ PaymentService initialized with base URL:', API_BASE_URL);

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
    
    console.log('🔑 Payment request with token:', token ? 'Present' : 'Missing');
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

const paymentService = {
  // Create VNPay payment URL
  createVNPayPayment: async (orderId) => {
    try {
      console.log('💳 Creating VNPay payment for order:', orderId);
      const response = await apiClient.post('/Payment/vnpay/create', {
        orderId: orderId
      });
      
      console.log('✅ VNPay payment URL created successfully:', response.data);
      return {
        success: response.data.Success || response.data.success || true,
        paymentUrl: response.data.PaymentUrl || response.data.paymentUrl,
        message: response.data.Message || response.data.message || 'Tạo URL thanh toán thành công'
      };
    } catch (error) {
      console.error('❌ Error creating VNPay payment:', error);
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      } else if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else if (error.message) {
        throw new Error(error.message);
      } else {
        throw new Error('Không thể tạo URL thanh toán VNPay. Vui lòng thử lại.');
      }
    }
  },

  // Create MoMo payment URL
  createMoMoPayment: async (orderId) => {
    try {
      console.log('💰 Creating MoMo payment for order:', orderId);
      const response = await apiClient.post('/MoMoPayment/create', {
        orderId: orderId
      });
      
      console.log('✅ MoMo payment created successfully:', response.data);
      return {
        success: response.data.success || true,
        payUrl: response.data.payUrl,
        qrCodeUrl: response.data.qrCodeUrl,
        deepLink: response.data.deepLink,
        message: response.data.message || 'Tạo thanh toán MoMo thành công'
      };
    } catch (error) {
      console.error('❌ Error creating MoMo payment:', error);
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      } else if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else if (error.message) {
        throw new Error(error.message);
      } else {
        throw new Error('Không thể tạo thanh toán MoMo. Vui lòng thử lại.');
      }
    }
  },

  // Get payment status
  getPaymentStatus: async (orderId) => {
    try {
      console.log('📊 Getting payment status for order:', orderId);
      const response = await apiClient.get(`/Payment/status/${orderId}`);
      
      console.log('✅ Payment status retrieved successfully:', response.data);
      return {
        orderId: response.data.orderId,
        status: response.data.status,
        totalPrice: response.data.totalPrice,
        finalPrice: response.data.finalPrice,
        isPaid: response.data.isPaid,
        message: response.data.message
      };
    } catch (error) {
      console.error('❌ Error getting payment status:', error);
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      throw error;
    }
  },

  // Test MoMo callback (for testing purposes)
  testMoMoCallback: async (orderId, resultCode = 0) => {
    try {
      console.log('🧪 Testing MoMo callback for order:', orderId);
      const response = await apiClient.post('/MoMoPayment/test-callback', {
        orderId: orderId,
        resultCode: resultCode
      });
      
      console.log('✅ MoMo callback test successful:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error testing MoMo callback:', error);
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      throw error;
    }
  },

  // Redirect to VNPay
  redirectToVNPay: (paymentUrl) => {
    if (!paymentUrl) {
      throw new Error('URL thanh toán không hợp lệ');
    }
    console.log('🔄 Redirecting to VNPay:', paymentUrl);
    window.location.href = paymentUrl;
  },

  // Redirect to MoMo
  redirectToMoMo: (payUrl) => {
    if (!payUrl) {
      throw new Error('URL thanh toán MoMo không hợp lệ');
    }
    console.log('🔄 Redirecting to MoMo:', payUrl);
    window.location.href = payUrl;
  },

  // Open MoMo deep link (for mobile app)
  openMoMoDeepLink: (deepLink) => {
    if (!deepLink) {
      throw new Error('Deep link MoMo không hợp lệ');
    }
    console.log('📱 Opening MoMo deep link:', deepLink);
    window.location.href = deepLink;
  },

  // Get payment method display name
  getPaymentMethodName: (method) => {
    const methodNames = {
      'vnpay': 'VNPay',
      'momo': 'MoMo',
      'cod': 'Thanh toán khi nhận hàng',
      'bank_transfer': 'Chuyển khoản ngân hàng'
    };
    return methodNames[method] || method;
  },

  // Get payment method icon
  getPaymentMethodIcon: (method) => {
    const methodIcons = {
      'vnpay': '💳',
      'momo': '🍑',
      'cod': '💵',
      'bank_transfer': '🏦'
    };
    return methodIcons[method] || '💰';
  },

  // Format amount for display
  formatAmount: (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  },

  // Get status display text
  getStatusText: (status) => {
    const statusMap = {
      'Pending': 'Chờ thanh toán',
      'Processing': 'Đã thanh toán, đang xử lý',
      'Completed': 'Hoàn thành',
      'Cancelled': 'Đã hủy',
      'Refunded': 'Đã hoàn tiền'
    };
    return statusMap[status] || status;
  },

  // Get status color
  getStatusColor: (status) => {
    const colorMap = {
      'Pending': 'warning',
      'Processing': 'info',
      'Completed': 'success',
      'Cancelled': 'danger',
      'Refunded': 'secondary'
    };
    return colorMap[status] || 'secondary';
  }
};

export default paymentService;