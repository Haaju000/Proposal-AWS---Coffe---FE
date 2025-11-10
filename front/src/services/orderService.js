import axios from 'axios';

// API base URL - match với Swagger backend
const API_BASE_URL = 'http://localhost:5000/api';

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

console.log('✅ OrderService initialized with base URL:', API_BASE_URL);

// Add token interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Get token - try multiple storage keys
    const token = localStorage.getItem('access_token') 
                  || localStorage.getItem('id_token')
                  || localStorage.getItem('token');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    console.log('🔑 Request with token:', token ? 'Present' : 'Missing');
    return config;
  },
  (error) => Promise.reject(error)
);

const orderService = {
  // Create order - match backend API exactly
  createOrder: async (orderData) => {
    try {
      console.log('🚀 Creating order with data:', orderData);
      
      const response = await apiClient.post('/Order', orderData);
      
      console.log('✅ Order created successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Order creation error:', error);
      
      // Enhanced error handling
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      } else if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else if (error.message) {
        throw new Error(error.message);
      } else {
        throw new Error('Không thể tạo đơn hàng. Vui lòng thử lại.');
      }
    }
  },

  // Validate order item before adding to cart
  validateOrderItem: async (orderItem) => {
    try {
      console.log('🔍 Validating item:', orderItem);
      const response = await apiClient.post('/OrderItem/validate', orderItem);
      console.log('✅ Item validation successful:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Item validation error:', error);
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      throw error;
    }
  },

  // Apply voucher to order
  applyVoucher: async (orderId, voucherCode) => {
    try {
      console.log('🎫 Applying voucher:', { orderId, voucherCode });
      const response = await apiClient.post(`/Order/${orderId}/apply-voucher`, {
        voucherCode: voucherCode
      });
      console.log('✅ Voucher applied successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Apply voucher error:', error);
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      throw error;
    }
  },

  // Get order by ID
  getOrderById: async (orderId) => {
    try {
      console.log('📋 Getting order by ID:', orderId);
      const response = await apiClient.get(`/Order/${orderId}`);
      console.log('✅ Order retrieved successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Get order error:', error);
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      throw error;
    }
  },

  // Get all orders (Admin only)
  getAllOrders: async () => {
    try {
      console.log('📋 Getting all orders...');
      const response = await apiClient.get('/Order');
      console.log('✅ All orders retrieved successfully');
      return response.data;
    } catch (error) {
      console.error('❌ Get all orders error:', error);
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      throw error;
    }
  },

  // Update order status (Admin only)
  updateOrderStatus: async (orderId, status) => {
    try {
      console.log('📝 Updating order status:', { orderId, status });
      const response = await apiClient.put(`/Order/${orderId}/status`, {
        status: status
      });
      console.log('✅ Order status updated successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Update order status error:', error);
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      throw error;
    }
  },

  // Helper function để format order item cho API
  formatOrderItem: (productId, productType, productName, quantity, unitPrice, toppings = []) => {
    return {
      productId: productId,
      productType: productType, // "cake" hoặc "drink"
      productName: productName,
      quantity: quantity,
      unitPrice: unitPrice,
      toppings: toppings // Array of topping objects
    };
  },

  // Helper function để tính tổng tiền
  calculateTotal: (items) => {
    return items.reduce((total, item) => {
      const itemTotal = item.unitPrice * item.quantity;
      const toppingsTotal = item.toppings ? 
        item.toppings.reduce((toppingSum, topping) => 
          toppingSum + (topping.price * item.quantity), 0
        ) : 0;
      return total + itemTotal + toppingsTotal;
    }, 0);
  },

  // Helper function để format trạng thái
  getStatusText: (status) => {
    const statusMap = {
      'Pending': 'Chờ xử lý',
      'Processing': 'Đang xử lý', 
      'Completed': 'Hoàn thành',
      'Cancelled': 'Đã hủy'
    };
    return statusMap[status] || status;
  }
};

export default orderService;