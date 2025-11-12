import axios from 'axios';
import authService from './authService';

const API_BASE_URL = 'http://localhost:5144';

// Create axios instance với interceptor để tự động thêm token
const paymentAPI = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
paymentAPI.interceptors.request.use(
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

const paymentService = {
  // POST /api/Payment/vnpay/create - Tạo payment URL cho VNPay
  createVNPayPayment: async (orderId, returnUrl = null) => {
    try {
      const defaultReturnUrl = `${window.location.origin}/payment-result`;
      const paymentRequest = {
        orderId: orderId,
        returnUrl: returnUrl || defaultReturnUrl
      };
      
      console.log('💳 Creating VNPay payment request:', paymentRequest);
      console.log('🔗 Request URL:', `${API_BASE_URL}/api/Payment/vnpay/create`);
      console.log('🔑 ID Token:', authService.getIdToken() ? 'Present' : 'Missing');
      
      const response = await paymentAPI.post('/api/Payment/vnpay/create', paymentRequest);
      console.log('✅ VNPay payment URL created successfully:', response.data);
      
      // Trả về URL để redirect
      return {
        paymentUrl: response.data,
        orderId: orderId
      };
    } catch (error) {
      console.error('❌ Error creating VNPay payment:', error);
      console.error('❌ Error details:', error.response?.data);
      console.error('❌ Status code:', error.response?.status);
      console.error('❌ Status text:', error.response?.statusText);
      
      if (error.response?.status === 401) {
        throw new Error('Không có quyền truy cập. Vui lòng đăng nhập lại.');
      } else if (error.response?.status === 400) {
        throw new Error('Thông tin thanh toán không hợp lệ. Vui lòng kiểm tra lại.');
      } else if (error.response?.status === 500) {
        throw new Error('Lỗi server. Kiểm tra backend và kết nối VNPay.');
      } else if (error.code === 'ECONNREFUSED') {
        throw new Error('Không thể kết nối tới backend. Kiểm tra server có chạy không.');
      }
      
      throw error;
    }
  },

  // GET /api/Payment/vnpay/callback - Xử lý callback từ VNPay
  handleVNPayCallback: async (callbackParams) => {
    try {
      console.log('🔄 Processing VNPay callback:', callbackParams);
      
      // Convert params object to query string
      const queryString = new URLSearchParams(callbackParams).toString();
      const response = await paymentAPI.get(`/api/Payment/vnpay/callback?${queryString}`);
      
      console.log('✅ VNPay callback processed successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error processing VNPay callback:', error);
      throw error;
    }
  },

  // GET /api/Payment/vnpay/ipn - Xử lý IPN (Instant Payment Notification) từ VNPay
  handleVNPayIPN: async (ipnParams) => {
    try {
      console.log('🔔 Processing VNPay IPN:', ipnParams);
      
      const queryString = new URLSearchParams(ipnParams).toString();
      const response = await paymentAPI.get(`/api/Payment/vnpay/ipn?${queryString}`);
      
      console.log('✅ VNPay IPN processed successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error processing VNPay IPN:', error);
      throw error;
    }
  },

  // GET /api/Payment/status/{orderId} - Kiểm tra trạng thái thanh toán
  getPaymentStatus: async (orderId) => {
    try {
      console.log(`🔍 Checking payment status for order: ${orderId}`);
      
      const response = await paymentAPI.get(`/api/Payment/status/${orderId}`);
      console.log('✅ Payment status retrieved successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error getting payment status:', error);
      console.error('❌ Error details:', error.response?.data);
      
      if (error.response?.status === 404) {
        throw new Error('Không tìm thấy thông tin thanh toán cho đơn hàng này.');
      }
      
      throw error;
    }
  },

  // Utility function để tạo payment request object (simplified for new API)
  createPaymentRequest: (orderId, returnUrl = null) => {
    const defaultReturnUrl = `${window.location.origin}/payment-result`;
    
    return {
      orderId: orderId,
      returnUrl: returnUrl || defaultReturnUrl
    };
  },

  // Utility function để redirect tới VNPay
  redirectToVNPay: (paymentUrl) => {
    if (paymentUrl) {
      console.log('🚀 Redirecting to VNPay:', paymentUrl);
      window.location.href = paymentUrl;
    } else {
      throw new Error('Payment URL is empty');
    }
  },

  // Utility function để parse callback parameters từ URL
  parseCallbackParams: (urlSearchParams) => {
    const params = {};
    for (const [key, value] of urlSearchParams.entries()) {
      params[key] = value;
    }
    return params;
  },

  // Utility function để validate callback response
  validateCallbackResponse: (callbackResponse) => {
    return callbackResponse && 
           callbackResponse.success !== undefined &&
           callbackResponse.orderId !== undefined;
  }
};

export default paymentService;