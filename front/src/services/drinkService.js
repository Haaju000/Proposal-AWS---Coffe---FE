import axios from 'axios';

const API_BASE_URL = 'http://localhost:5263'; // Khớp với backend C#

const drinkService = {
  // GET /api/drink - Lấy tất cả đồ uống
  getAllDrinks: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/drink`);
      return response.data;
    } catch (error) {
      console.error('Error fetching drinks:', error);
      throw error;
    }
  },

  // GET /api/drink/{id} - Lấy đồ uống theo ID
  getDrinkById: async (id) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/drink/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching drink by id:', error);
      throw error;
    }
  },

  // POST /api/drink - Tạo đồ uống mới (admin only)
  createDrink: async (drinkData, token) => {
    try {
      // Ensure all required fields are present (theo backend Drink model)
      const payload = {
        name: drinkData.name,
        basePrice: drinkData.basePrice,
        stock: drinkData.stock || 0,
        category: drinkData.category || 'Default',
        imageUrl: drinkData.imageUrl || null
      };
      
      console.log('☕ Creating drink with payload:', payload);
      
      const response = await axios.post(`${API_BASE_URL}/api/drink`, payload, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error creating drink:', error);
      throw error;
    }
  },

  // PUT /api/drink/{id} - Cập nhật đồ uống (admin only)
  updateDrink: async (id, drinkData, token) => {
    try {
      const payload = {
        name: drinkData.name,
        basePrice: drinkData.basePrice,
        stock: drinkData.stock || 0,
        category: drinkData.category || 'Default',
        imageUrl: drinkData.imageUrl || null
      };
      
      console.log('☕ Updating drink with payload:', payload);
      
      const response = await axios.put(`${API_BASE_URL}/api/drink/${id}`, payload, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error updating drink:', error);
      throw error;
    }
  },

  // DELETE /api/drink/{id} - Xóa đồ uống (admin only)
  deleteDrink: async (id, token) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/api/drink/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error deleting drink:', error);
      throw error;
    }
  },

  // PATCH /api/drink/{id}/decreaseStock/{quantity} - Giảm stock
  decreaseStock: async (id, quantity, token) => {
    try {
      const response = await axios.patch(`${API_BASE_URL}/api/drink/${id}/decreaseStock/${quantity}`, {}, {
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