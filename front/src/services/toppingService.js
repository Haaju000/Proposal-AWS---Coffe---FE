import axios from 'axios';

const API_BASE_URL = 'http://localhost:5144'; // Khớp với Swagger backend

const toppingService = {
  // GET /api/Topping - Lấy tất cả topping
  getAllToppings: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/Topping`);
      return response.data;
    } catch (error) {
      console.error('Error fetching toppings:', error);
      throw error;
    }
  },

  // GET /api/Topping/{id} - Lấy topping theo ID
  getToppingById: async (id) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/Topping/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching topping by id:', error);
      throw error;
    }
  },

  // POST /api/Topping - Tạo topping mới (admin only)
  createTopping: async (toppingData, token) => {
    try {
      // Ensure all required fields are present (theo backend Topping model từ Swagger)
      const payload = {
        name: toppingData.name,
        price: parseInt(toppingData.price) || 0,
        stock: parseInt(toppingData.stock) || 0,
        imageUrl: toppingData.imageUrl || ""
      };
      
      console.log('🧁 Creating topping with payload:', payload);
      
      const response = await axios.post(`${API_BASE_URL}/api/Topping`, payload, {
        headers: {
          'Authorization': `Bearer ${token}`, // Thêm Bearer prefix cho JWT token
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      console.error('❌ Error creating topping:', error.response?.data || error.message);
      throw error;
    }
  },

  // PUT /api/Topping/{id} - Cập nhật topping (admin only)
  updateTopping: async (id, toppingData, token) => {
    try {
      const payload = {
        id: id, // Bao gồm ID trong payload
        name: toppingData.name,
        price: parseInt(toppingData.price) || 0,
        stock: parseInt(toppingData.stock) || 0,
        imageUrl: toppingData.imageUrl || ""
      };
      
      console.log('🧁 Updating topping with payload:', payload);
      
      const response = await axios.put(`${API_BASE_URL}/api/Topping/${id}`, payload, {
        headers: {
          'Authorization': `Bearer ${token}`, // Thêm Bearer prefix cho JWT token
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      console.error('❌ Error updating topping:', error.response?.data || error.message);
      throw error;
    }
  },

  // DELETE /api/Topping/{id} - Xóa topping (admin only)
  deleteTopping: async (id, token) => {
    try {
      console.log('🗑️ Deleting topping with id:', id);
      const response = await axios.delete(`${API_BASE_URL}/api/Topping/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}` // Thêm Bearer prefix cho JWT token
        }
      });
      return response.data;
    } catch (error) {
      console.error('❌ Error deleting topping:', error.response?.data || error.message);
      throw error;
    }
  },

  // PATCH /api/Topping/{id}/stock - Cập nhật stock topping
  decreaseStock: async (id, quantity, token) => {
    try {
      const response = await axios.patch(`${API_BASE_URL}/api/Topping/${id}/stock`, 
        { quantity: -quantity }, // Giảm stock
        {
          headers: {
            'Authorization': token,
            'Content-Type': 'application/json'
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('❌ Error decreasing topping stock:', error.response?.data || error.message);
      throw error;
    }
  },

  // GET /api/Topping/low-stock - Lấy topping có stock thấp
  getLowStockToppings: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/Topping/low-stock`);
      return response.data;
    } catch (error) {
      console.error('Error fetching low-stock toppings:', error);
      throw error;
    }
  }
};

export default toppingService;