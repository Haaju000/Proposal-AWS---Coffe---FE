import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import drinkService from '../services/drinkService';
import cakeService from '../services/cakeService';
import { useCart } from '../contexts/CartContext';
import '../css/CustomerFavorites.css';

const CustomerFavorites = () => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadFavoriteProducts();
  }, []);

  const loadFavoriteProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔍 Loading favorite products from menu APIs...');
      
      // Test API connectivity first
      console.log('📡 Testing API connectivity...');
      
      // Load drinks and cakes from menu
      const [drinks, cakes] = await Promise.all([
        drinkService.getAllDrinks().catch(err => {
          console.error('❌ Error loading drinks:', err);
          return [];
        }),
        cakeService.getAllCakes().catch(err => {
          console.error('❌ Error loading cakes:', err);
          return [];
        })
      ]);
      
      console.log('📊 API Results:', {
        drinks: drinks?.length || 0,
        cakes: cakes?.length || 0,
        drinksData: drinks,
        cakesData: cakes
      });
      
      // Select some featured products (you can customize this logic)
      const featuredProducts = [];
      
      // Add 2-3 popular drinks
      if (drinks && Array.isArray(drinks) && drinks.length > 0) {
        console.log('🍹 Processing drinks...');
        const popularDrinks = drinks
          .filter(drink => drink && (drink.stock === undefined || drink.stock > 0)) // Only available items
          .slice(0, 3); // Take first 3
        
        console.log('🎯 Selected drinks:', popularDrinks);
        
        popularDrinks.forEach(drink => {
          featuredProducts.push({
            id: `drink-${drink.id}`,
            productId: drink.id,
            type: 'Drink',
            name: drink.name || 'Đồ uống',
            price: `${(drink.basePrice || drink.price || 0).toLocaleString('vi-VN')}₫`,
            image: drink.imageUrl || '☕',
            description: drink.description || `${drink.name || 'Đồ uống'} thơm ngon`
          });
        });
      } else {
        console.log('⚠️ No drinks found or invalid drinks data');
      }
      
      // Add 1-2 popular cakes
      if (cakes && Array.isArray(cakes) && cakes.length > 0) {
        console.log('🧁 Processing cakes...');
        const popularCakes = cakes
          .filter(cake => cake && (cake.stock === undefined || cake.stock > 0)) // Only available items
          .slice(0, 1); // Take first 1
        
        console.log('🎯 Selected cakes:', popularCakes);
        
        popularCakes.forEach(cake => {
          featuredProducts.push({
            id: `cake-${cake.id}`,
            productId: cake.id,
            type: 'Cake',
            name: cake.name || 'Bánh ngọt',
            price: `${(cake.price || 0).toLocaleString('vi-VN')}₫`,
            image: cake.imageUrl || '🧁',
            description: cake.description || `${cake.name || 'Bánh ngọt'} tươi ngon`
          });
        });
      } else {
        console.log('⚠️ No cakes found or invalid cakes data');
      }
      
      console.log('✅ Final featured products:', featuredProducts);
      
      if (featuredProducts.length === 0) {
        // Fallback to mock data if no real products
        console.log('📝 Using fallback mock data...');
        setProducts([
          {
            id: 'mock-1',
            productId: 1,
            type: 'Drink',
            name: 'Cà phê đen',
            price: '25,000₫',
            image: '☕',
            description: 'Cà phê đen đậm đà truyền thống'
          },
          {
            id: 'mock-2',
            productId: 2,
            type: 'Drink',
            name: 'Cà phê sữa',
            price: '30,000₫',
            image: '🥛',
            description: 'Cà phê sữa ngọt ngào'
          },
          {
            id: 'mock-3',
            productId: 3,
            type: 'Cake',
            name: 'Bánh mì ngọt',
            price: '15,000₫',
            image: '🥐',
            description: 'Bánh mì ngọt tươi nướng'
          }
        ]);
      } else {
        setProducts(featuredProducts);
      }
      
    } catch (error) {
      console.error('❌ Error loading favorite products:', error);
      console.error('Error details:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data
      });
      setError(`Không thể tải sản phẩm: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (product) => {
    try {
      // Add to cart using CartContext
      const cartItem = {
        id: product.productId,
        type: product.type,
        name: product.name,
        price: parseFloat(product.price.replace(/[₫,.]/g, '')),
        quantity: 1,
        toppings: []
      };
      
      addToCart(cartItem);
      
      // Show success message (you can implement a toast notification)
      alert(`Đã thêm ${product.name} vào giỏ hàng!`);
      
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Không thể thêm vào giỏ hàng. Vui lòng thử lại.');
    }
  };

  const handleViewMenu = () => {
    navigate('/menu');
  };

  if (loading) {
    return (
      <section className="customer-favorites">
        <div className="favorites-container">
          <div className="favorites-header">
            <h2 className="favorites-title">Món được yêu thích nhất</h2>
            <p className="favorites-subtitle">Đang tải sản phẩm...</p>
          </div>
          
          <div className="products-grid">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="product-image-only loading-skeleton">
                <div className="skeleton-image"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="customer-favorites">
        <div className="favorites-container">
          <div className="favorites-header">
            <h2 className="favorites-title">Món được yêu thích nhất</h2>
            <p className="favorites-subtitle error-message">{error}</p>
          </div>
          
          <div className="favorites-footer">
            <button className="view-menu-btn" onClick={handleViewMenu}>
              Xem toàn bộ thực đơn
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="customer-favorites">
      <div className="favorites-container">
        <div className="favorites-header">
          <h2 className="favorites-title">Món được yêu thích nhất</h2>
          <p className="favorites-subtitle">Thử các đồ uống và món ăn được yêu thích</p>
        </div>
        
        <div className="products-grid">
          {products.map((product, index) => (
            <div key={product.id} className="product-image-only">
              <div className="product-image">
                {product.image && product.image.startsWith('http') ? (
                  <img 
                    src={product.image} 
                    alt={product.name}
                    className="product-img"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextElementSibling.style.display = 'block';
                    }}
                  />
                ) : null}
                <span 
                  className="product-emoji" 
                  style={{
                    display: product.image && product.image.startsWith('http') ? 'none' : 'block'
                  }}
                >
                  {product.image && !product.image.startsWith('http') ? product.image : 
                   product.type === 'Drink' ? '☕' : '🧁'}
                </span>
                
              </div>
            </div>
          ))}
        </div>
        
        {products.length === 0 ? (
          <div className="empty-favorites">
            <p>Hiện tại chưa có sản phẩm nào để hiển thị</p>
          </div>
        ) : null}
        
        <div className="favorites-footer">
          <button className="view-menu-btn" onClick={handleViewMenu}>
            Xem toàn bộ thực đơn
          </button>
        </div>
      </div>
    </section>
  );
};

export default CustomerFavorites;