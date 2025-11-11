import axios from 'axios';

const API_BASE_URL = 'http://localhost:5144'; // Khớp với Swagger backend

const cakeService = {
  // GET /api/Cake - Lấy tất cả bánh
  getAllCakes: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/Cake`);
      return response.data;
    } catch (error) {
      console.error('Error fetching cakes:', error);
      throw error;
    }
  },

  // GET /api/Cake/{id} - Lấy bánh theo ID
  getCakeById: async (id) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/Cake/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching cake by id:', error);
      throw error;
    }
  },

  // POST /api/Cake - Tạo bánh mới (admin only)
  createCake: async (cakeData, token) => {
    try {
      // Ensure all required fields are present (theo backend Cake model từ Swagger)
      const payload = {
        name: cakeData.name,
        price: parseInt(cakeData.price) || 0,
        stock: parseInt(cakeData.stock) || 0,
        imageUrl: cakeData.imageUrl || ""
      };
      
      console.log('🍰 Creating cake with payload:', payload);
      
      const response = await axios.post(`${API_BASE_URL}/api/Cake`, payload, {
        headers: {
          'Authorization': `Bearer ${token}`, // Thêm Bearer prefix cho JWT token
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      console.error('❌ Error creating cake:', error.response?.data || error.message);
      throw error;
    }
  },

  // PUT /api/Cake/{id} - Cập nhật bánh (admin only)
  updateCake: async (id, cakeData, token) => {
    try {
      const payload = {
        id: id, // Bao gồm ID trong payload
        name: cakeData.name,
        price: parseInt(cakeData.price) || 0,
        stock: parseInt(cakeData.stock) || 0,
        imageUrl: cakeData.imageUrl || ""
      };
      
      console.log('🍰 Updating cake with payload:', payload);
      
      const response = await axios.put(`${API_BASE_URL}/api/Cake/${id}`, payload, {
        headers: {
          'Authorization': `Bearer ${token}`, // Thêm Bearer prefix cho JWT token
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      console.error('❌ Error updating cake:', error.response?.data || error.message);
      throw error;
    }
  },

  // DELETE /api/Cake/{id} - Xóa bánh (admin only)
  deleteCake: async (id, token) => {
    try {
      console.log('🗑️ Deleting cake with id:', id);
      const response = await axios.delete(`${API_BASE_URL}/api/Cake/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}` // Thêm Bearer prefix cho JWT token
        }
      });
      return response.data;
    } catch (error) {
      console.error('❌ Error deleting cake:', error.response?.data || error.message);
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