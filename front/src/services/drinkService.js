import axios from 'axios';

const API_BASE_URL = 'http://localhost:5144'; // Khớp với Swagger backend

const drinkService = {
  // GET /api/drink - Lấy tất cả đồ uống
  getAllDrinks: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/Drink`);
      return response.data;
    } catch (error) {
      console.error('Error fetching drinks:', error);
      throw error;
    }
  },

  // GET /api/drink/{id} - Lấy đồ uống theo ID
  getDrinkById: async (id) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/Drink/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching drink by id:', error);
      throw error;
    }
  },

  // POST /api/Drink - Tạo đồ uống mới (admin only)
  createDrink: async (drinkData, token) => {
    try {
      // Ensure all required fields are present (theo backend Drink model từ Swagger)
      const payload = {
        name: drinkData.name,
        basePrice: parseInt(drinkData.basePrice) || 0,
        stock: parseInt(drinkData.stock) || 0,
        category: drinkData.category || 'Coffee',
        imageUrl: drinkData.imageUrl || ""
      };
      
      console.log('☕ Creating drink with payload:', payload);
      
      const response = await axios.post(`${API_BASE_URL}/api/Drink`, payload, {
        headers: {
          'Authorization': `Bearer ${token}`, // Thêm Bearer prefix cho JWT token
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      console.error('❌ Error creating drink:', error.response?.data || error.message);
      throw error;
    }
  },

  // PUT /api/Drink/{id} - Cập nhật đồ uống (admin only)
  updateDrink: async (id, drinkData, token) => {
    try {
      const payload = {
        id: id, // Bao gồm ID trong payload
        name: drinkData.name,
        basePrice: parseInt(drinkData.basePrice) || 0,
        stock: parseInt(drinkData.stock) || 0,
        category: drinkData.category || 'Coffee',
        imageUrl: drinkData.imageUrl || ""
      };
      
      console.log('☕ Updating drink with payload:', payload);
      
      const response = await axios.put(`${API_BASE_URL}/api/Drink/${id}`, payload, {
        headers: {
          'Authorization': `Bearer ${token}`, // Thêm Bearer prefix cho JWT token
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      console.error('❌ Error updating drink:', error.response?.data || error.message);
      throw error;
    }
  },

  // DELETE /api/Drink/{id} - Xóa đồ uống (admin only)
  deleteDrink: async (id, token) => {
    try {
      console.log('🗑️ Deleting drink with id:', id);
      const response = await axios.delete(`${API_BASE_URL}/api/Drink/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}` // Thêm Bearer prefix cho JWT token
        }
      });
      return response.data;
    } catch (error) {
      console.error('❌ Error deleting drink:', error.response?.data || error.message);
      throw error;
    }
  },

  // PATCH /api/drink/{id}/decreaseStock/{quantity} - Giảm stock
  decreaseStock: async (id, quantity, token) => {
    try {
      const response = await axios.patch(`${API_BASE_URL}/api/Drink/${id}/decreaseStock/${quantity}`, {}, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error decreasing drink stock:', error);
      throw error;
    }
  }
};

export default drinkService;