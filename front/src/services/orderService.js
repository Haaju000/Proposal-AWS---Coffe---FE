import axios from 'axios';

const API_BASE_URL = 'http://localhost:5263'; // Khớp với backend C#

const orderService = {
  // POST /api/order - Tạo đơn hàng mới
  createOrder: async (orderData, token) => {
    try {
      console.log('Sending order data:', orderData);
      const response = await axios.post(`${API_BASE_URL}/api/order`, orderData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error creating order:', error.response?.data || error);
      throw error;
    }
  },

  // GET /api/order - Lấy tất cả đơn hàng của user hiện tại
  getUserOrders: async (token) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/order`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching user orders:', error);
      throw error;
    }
  },

  // GET /api/order/{id} - Lấy đơn hàng theo ID
  getOrderById: async (id, token) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/order/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching order by id:', error);
      throw error;
    }
  },

  // PATCH /api/order/{id}/status - Cập nhật trạng thái đơn hàng (admin only)
  updateOrderStatus: async (id, status, token) => {
    try {
      const response = await axios.patch(`${API_BASE_URL}/api/order/${id}/status`, 
        { status }, 
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error updating order status:', error);
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