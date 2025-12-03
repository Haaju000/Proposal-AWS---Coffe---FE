import axios from 'axios';
import authService from './authService';
import { ENV_CONFIG } from '../config/environment';

// Tự động chọn LOCAL hoặc PRODUCTION - Bỏ /api vì getApiBaseUrl() đã có
const API_BASE_URL = ENV_CONFIG.getApiBaseUrl().replace('/api', '');

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
  // Lấy thông tin điểm thưởng và voucher statistics
  async getMyPoints() {
    try {
      const response = await loyaltyAPI.get('/api/loyalty/my-points');
      
      // Backend response structure:
      // {
      //   userId, currentPoints, pointsToNextVoucher, canClaimVoucher,
      //   statistics: { availableVouchers, usedVouchers, expiredVouchers, totalVouchers }
      // }
      console.log('🔄 Loyalty points response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching loyalty points:', error);
      throw error;
    }
  },

  // Lấy danh sách voucher với categories
  async getMyVouchers() {
    try {
      const response = await loyaltyAPI.get('/api/loyalty/my-vouchers');
      
      // Backend response structure:
      // {
      //   userId, totalVouchers,
      //   availableVouchers: [], usedVouchers: [], expiredVouchers: []
      // }
      console.log('🎫 My vouchers response:', response.data);
      
      // Flatten all vouchers into single array for compatibility
      const allVouchers = [
        ...(response.data.availableVouchers || []),
        ...(response.data.usedVouchers || []),
        ...(response.data.expiredVouchers || [])
      ];
      
      return allVouchers;
    } catch (error) {
      console.error('Error fetching vouchers:', error);
      throw error;
    }
  },

  // Lấy danh sách voucher khả dụng (chưa sử dụng và chưa hết hạn)
  async getMyAvailableVouchers() {
    try {
      const response = await loyaltyAPI.get('/api/loyalty/my-vouchers');
      
      // Backend đã filter availableVouchers cho chúng ta
      const availableVouchers = response.data.availableVouchers || [];
      
      console.log('✅ Available vouchers:', availableVouchers);
      return availableVouchers;
    } catch (error) {
      console.error('Error fetching available vouchers:', error);
      return []; // Return empty array instead of throwing
    }
  },

  // 🎁 Manual claim voucher (user click "Nhận voucher")
  async claimVoucher() {
    try {
      const response = await loyaltyAPI.post('/api/loyalty/claim-voucher');
      
      // Backend response:
      // {
      //   success: true, message: "...",
      //   voucher: { code, discountPercent, discountValue, expirationDate, validUntil },
      //   remainingPoints
      // }
      console.log('🎉 Voucher claimed:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error claiming voucher:', error);
      throw error;
    }
  },

  // Validate voucher trước khi apply
  async validateVoucher(voucherCode, orderTotal) {
    try {
      const response = await loyaltyAPI.post('/api/loyalty/validate-voucher', {
        voucherCode: voucherCode,
        orderTotal: orderTotal
      });
      
      // Backend response:
      // {
      //   isValid: true/false, message: "...",
      //   voucher: { code, discountPercent, expirationDate },
      //   calculation: { orderTotal, discountAmount, finalAmount }
      // }
      console.log('🔍 Voucher validation:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error validating voucher:', error);
      throw error;
    }
  },

  // Note: Voucher application is now handled directly in order creation
  // via voucherCode field in CreateOrderRequest
};

export default loyaltyService;
