import axios from 'axios';

const API_BASE_URL = 'http://localhost:5263'; // Khớp với backend C#

const cakeService = {
  // GET /api/cake - Lấy tất cả bánh
  getAllCakes: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/cake`);
      return response.data;
    } catch (error) {
      console.error('Error fetching cakes:', error);
      throw error;
    }
  },

  // GET /api/cake/{id} - Lấy bánh theo ID
  getCakeById: async (id) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/cake/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching cake by id:', error);
      throw error;
    }
  },

  // POST /api/cake - Tạo bánh mới (admin only)
  createCake: async (cakeData, token) => {
    try {
      // Ensure all required fields are present (theo backend Cake model)
      const payload = {
        name: cakeData.name,
        price: cakeData.price,
        stock: cakeData.stock || 0,
        imageUrl: cakeData.imageUrl || null
      };
      
      console.log('🍰 Creating cake with payload:', payload);
      
      const response = await axios.post(`${API_BASE_URL}/api/cake`, payload, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error creating cake:', error);
      throw error;
    }
  },

  // PUT /api/cake/{id} - Cập nhật bánh (admin only)
  updateCake: async (id, cakeData, token) => {
    try {
      const payload = {
        name: cakeData.name,
        price: cakeData.price,
        stock: cakeData.stock || 0,
        imageUrl: cakeData.imageUrl || null
      };
      
      console.log('🍰 Updating cake with payload:', payload);
      
      const response = await axios.put(`${API_BASE_URL}/api/cake/${id}`, payload, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error updating cake:', error);
      throw error;
    }
  },

  // DELETE /api/cake/{id} - Xóa bánh (admin only)
  deleteCake: async (id, token) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/api/cake/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error deleting cake:', error);
      throw error;
    }
  },

  // PATCH /api/cake/{id}/decreaseStock/{quantity} - Giảm stock
  decreaseStock: async (id, quantity, token) => {
    try {
      const response = await axios.patch(`${API_BASE_URL}/api/cake/${id}/decreaseStock/${quantity}`, {}, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error decreasing cake stock:', error);
      throw error;
    }
  }
};

export default cakeService;