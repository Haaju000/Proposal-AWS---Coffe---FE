import axios from 'axios';

const API_BASE_URL = 'http://localhost:5144';

const inventoryService = {
  // GET /api/inventory/overview - Tổng quan kho hàng
  getInventoryOverview: async (token) => {
    try {
      console.log('📊 Fetching inventory overview...');
      
      const response = await axios.get(`${API_BASE_URL}/api/Inventory/overview`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('✅ Inventory overview response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching inventory overview:', error.response?.data || error.message);
      throw error;
    }
  },

  // GET /api/inventory/alerts - Cảnh báo stock
  getStockAlerts: async (token) => {
    try {
      console.log('🚨 Fetching stock alerts...');
      
      const response = await axios.get(`${API_BASE_URL}/api/Inventory/alerts`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('✅ Stock alerts response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching stock alerts:', error.response?.data || error.message);
      throw error;
    }
  },

  // Helper: Format inventory stats for display
  formatInventoryStats: (data) => {
    if (!data) return null;

    return {
      drinks: {
        total: data.drinks?.total || 0,
        inStock: data.drinks?.inStock || 0,
        outOfStock: data.drinks?.outOfStock || 0,
        lowStock: data.drinks?.lowStock || 0,
        totalValue: data.drinks?.totalValue || 0,
        stockPercentage: data.drinks?.total > 0 ? 
          Math.round((data.drinks.inStock / data.drinks.total) * 100) : 0
      },
      cakes: {
        total: data.cakes?.total || 0,
        inStock: data.cakes?.inStock || 0,
        outOfStock: data.cakes?.outOfStock || 0,
        lowStock: data.cakes?.lowStock || 0,
        totalValue: data.cakes?.totalValue || 0,
        stockPercentage: data.cakes?.total > 0 ? 
          Math.round((data.cakes.inStock / data.cakes.total) * 100) : 0
      },
      toppings: {
        total: data.toppings?.total || 0,
        inStock: data.toppings?.inStock || 0,
        outOfStock: data.toppings?.outOfStock || 0,
        lowStock: data.toppings?.lowStock || 0,
        totalValue: data.toppings?.totalValue || 0,
        stockPercentage: data.toppings?.total > 0 ? 
          Math.round((data.toppings.inStock / data.toppings.total) * 100) : 0
      }
    };
  },

  // Helper: Get alert severity color
  getAlertSeverityColor: (severity) => {
    switch (severity) {
      case 'critical': return '#EF4444'; // Red
      case 'warning': return '#F59E0B';  // Orange  
      default: return '#6B7280';         // Gray
    }
  },

  // Helper: Get alert icon
  getAlertIcon: (severity) => {
    switch (severity) {
      case 'critical': return '🚨';
      case 'warning': return '⚠️';
      default: return 'ℹ️';
    }
  }
};

export default inventoryService;