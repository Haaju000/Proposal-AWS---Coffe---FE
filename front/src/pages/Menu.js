import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import cakeService from '../services/cakeService';
import drinkService from '../services/drinkService';
import orderService from '../services/orderService';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import '../css/Menu.css';

const Menu = () => {
  const [activeFilter, setActiveFilter] = useState('All');
  const [drinks, setDrinks] = useState([]);
  const [cakes, setCakes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  
  const { user, isAuthenticated } = useAuth();
  const { 
    cartItems, 
    cartItemCount, 
    cartTotal, 
    addToCart, 
    removeFromCart, 
    updateQuantity: updateCartQuantity,
    clearCart,
    getItemPrice,
    isItemInCart,
    getItemInCart
  } = useCart();

  // Fetch data from API
  useEffect(() => {
    const fetchMenuData = async () => {
      try {
        setLoading(true);
        const [drinksResponse, cakesResponse] = await Promise.all([
          drinkService.getAllDrinks(),
          cakeService.getAllCakes()
        ]);
        
        setDrinks(drinksResponse);
        setCakes(cakesResponse);
        setError(null);
      } catch (err) {
        console.error('Error fetching menu data:', err);
        setError('Không thể tải dữ liệu thực đơn. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };

    fetchMenuData();
  }, []);

  // Helper function for quantity selector
  const [itemQuantities, setItemQuantities] = useState({});

  const getItemQuantity = (itemId) => {
    return itemQuantities[itemId] || 1;
  };

  const updateItemQuantity = (itemId, newQuantity) => {
    if (newQuantity < 1) newQuantity = 1;
    setItemQuantities(prev => ({
      ...prev,
      [itemId]: newQuantity
    }));
  };

  const handleAddToCart = (item) => {
    const quantity = getItemQuantity(item.id);
    // Add to cart with specified quantity
    for (let i = 0; i < quantity; i++) {
      addToCart(item);
    }
    // Reset quantity to 1 after adding
    setItemQuantities(prev => ({
      ...prev,
      [item.id]: 1
    }));
  };

  // Transform API data to menu format
  const transformedDrinks = drinks.map(drink => ({
    id: `drink_${drink.id}`,
    name: drink.name || 'Đồ uống',
    description: drink.category ? `${drink.category} - Đồ uống thơm ngon` : 'Đồ uống thơm ngon',
    price: drink.basePrice || 0, // Drinks sử dụng basePrice theo backend model
    category: drink.category || 'Default',
    image: drink.imageUrl || '☕',
    type: 'drink',
    stock: drink.stock || 0,
    originalId: drink.id
  }));

  const transformedCakes = cakes.map(cake => ({
    id: `cake_${cake.id}`,
    name: cake.name || 'Bánh ngọt',
    description: 'Bánh ngọt thơm ngon, được làm thủ công', // Backend không có description field
    price: cake.price || 0, // Cakes sử dụng price theo backend model
    category: 'Pastries',
    image: cake.imageUrl || '🧁',
    type: 'cake',
    stock: cake.stock || 0,
    originalId: cake.id
  }));

  const allItems = [...transformedDrinks, ...transformedCakes];
  
  const filterItems = (categoryKey) => {
    if (categoryKey === 'All') return allItems;
    return allItems.filter(item => item.category === categoryKey);
  };

  const filteredItems = filterItems(activeFilter);

  const categories = [
    { key: 'All', label: 'Tất cả' },
    { key: 'Drink', label: 'Đồ uống' },
    { key: 'Pastries', label: 'Bánh ngọt' }
  ];

  const activeLabel = categories.find(c => c.key === activeFilter)?.label || activeFilter;

  const categorySubtitle = (key) => {
    switch (key) {
      case 'All':
        return 'Khám phá toàn bộ thực đơn của chúng tôi';
      case 'Drink':
        return 'Các đồ uống thơm ngon từ cà phê đến trà';
      case 'Pastries':
        return 'Bánh nướng tươi ngon, phù hợp dùng kèm cà phê';
      default:
        return '';
    }
  };

  // Validate cart items trước khi đặt hàng
  const validateCartItems = async () => {
    try {
      console.log('🔍 Validating cart items...');
      
      const validationPromises = cartItems.map(async (item) => {
        const orderItem = {
          productId: String(item.originalId),
          productType: item.type === 'drink' ? 'Drink' : 'Cake',
          quantity: item.quantity,
          toppingIds: []
        };
        
        try {
          await orderService.validateOrderItem(orderItem);
          return { item, valid: true, error: null };
        } catch (error) {
          return { item, valid: false, error: error.message };
        }
      });
      
      const validationResults = await Promise.all(validationPromises);
      const invalidItems = validationResults.filter(result => !result.valid);
      
      if (invalidItems.length > 0) {
        const errorMessages = invalidItems.map(result => 
          `• ${result.item.name}: ${result.error}`
        ).join('\n');
        
        throw new Error(`Một số sản phẩm không hợp lệ:\n${errorMessages}`);
      }
      
      console.log('✅ All cart items are valid');
      return true;
    } catch (error) {
      console.error('❌ Cart validation failed:', error);
      throw error;
    }
  };

  // Checkout function
  const handleCheckout = async () => {
    if (!isAuthenticated) {
      alert('Vui lòng đăng nhập để đặt hàng');
      return;
    }

    if (cartItems.length === 0) {
      alert('Giỏ hàng trống!');
      return;
    }

    setCheckoutLoading(true);

    try {
      console.log('🛒 Starting checkout process...');
      console.log('📦 Cart items:', cartItems);
      console.log('👤 User:', user);

      // Validate cart items trước khi đặt hàng
      await validateCartItems();

      // Transform cart items to match backend CreateOrderRequest format
      const orderItems = cartItems.map(item => {
        const orderItem = {
          productId: String(item.originalId), // Ensure string type
          productType: item.type === 'drink' ? 'Drink' : 'Cake', // Capitalize for backend
          quantity: item.quantity,
          toppingIds: [] // No toppings for now, can be extended later
        };
        
        console.log('🔄 Transformed item:', orderItem);
        return orderItem;
      });

      // Create order request - Backend sẽ tự tính giá và lấy userId từ token
      const orderRequest = {
        items: orderItems
        // Không cần userId, totalPrice, status - backend tự xử lý
      };

      console.log('📤 Order request being sent:', orderRequest);

      // Call orderService
      const response = await orderService.createOrder(orderRequest);
      
      console.log('✅ Order created successfully:', response);
      
      // Extract order info from response
      const order = response.order || response;
      const orderId = order.id || order.orderId || 'N/A';
      const totalPrice = order.totalPrice || order.finalPrice || cartTotal;
      const status = order.status || 'Pending';
      
      // Show success message with order details
      alert(`🎉 Đặt hàng thành công!

📋 Mã đơn hàng: #${orderId}
💰 Tổng tiền: ₫${totalPrice.toLocaleString()}
📊 Trạng thái: ${status}
📅 Thời gian: ${new Date().toLocaleString()}

Cảm ơn bạn đã đặt hàng! 
Chúng tôi sẽ xử lý đơn hàng sớm nhất có thể.`);
      
      // Clear cart after successful order
      clearCart();
      setItemQuantities({});
      
      // Optional: Save order info to localStorage for tracking
      const orderHistory = JSON.parse(localStorage.getItem('orderHistory') || '[]');
      orderHistory.unshift({
        id: orderId,
        totalPrice: totalPrice,
        status: status,
        items: cartItems.length,
        createdAt: new Date().toISOString()
      });
      localStorage.setItem('orderHistory', JSON.stringify(orderHistory.slice(0, 10))); // Keep last 10 orders
      
    } catch (error) {
      console.error('❌ Order creation failed:', error);
      
      let errorMessage = 'Có lỗi xảy ra khi đặt hàng. Vui lòng thử lại.';
      
      // Handle specific backend errors
      if (error.message) {
        if (error.message.includes('Not enough stock')) {
          errorMessage = '❌ Một số sản phẩm đã hết hàng. Vui lòng kiểm tra lại giỏ hàng.';
        } else if (error.message.includes('Cannot identify user')) {
          errorMessage = '🔐 Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.';
          // Optionally redirect to login
          // navigate('/login');
        } else if (error.message.includes('UserId is required')) {
          errorMessage = '🔐 Lỗi xác thực người dùng. Vui lòng đăng nhập lại.';
        } else {
          errorMessage = error.message;
        }
      }
      
      alert(`🚫 Đặt hàng thất bại!\n\n${errorMessage}`);
    } finally {
      setCheckoutLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="menu-page">
        <Header />
        <div className="loading-container">
          <p>Đang tải thực đơn...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="menu-page">
        <Header />
        <div className="error-container">
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>Thử lại</button>
        </div>
      </div>
    );
  }

  return (
    <div className="menu-page">
      <Header />
      
      <main className="menu-main">
        <div className="menu-container">
          {/* Sidebar */}
          <aside className="menu-sidebar">
            <div className="sidebar-header">
              <h2 className="sidebar-title">Thực đơn</h2>
            </div>
            
            {/* Category Navigation */}
            <nav className="menu-categories">
              {categories.map((category) => (
                <button
                  key={category.key}
                  className={`category-btn ${activeFilter === category.key ? 'active' : ''}`}
                  onClick={() => setActiveFilter(category.key)}
                >
                  <span className="category-icon">
                    {category.key === 'All' && '🍽️'}
                    {category.key === 'Drink' && '☕'}
                    {category.key === 'Pastries' && '🥐'}
                  </span>
                  {category.label}
                </button>
              ))}
            </nav>

            {/* Online Ordering Options */}
            <div className="sidebar-actions">
              <button className="action-btn primary">
                <span className="btn-icon">🛒</span>
                Đặt hàng trực tuyến
              </button>
              <button className="action-btn secondary">
                <span className="btn-icon">📋</span>
                Đặt chỗ
              </button>
            </div>

            {/* Elegant Cart Summary */}
            {cartItemCount > 0 ? (
              <div className="elegant-cart-summary">
                <div className="cart-summary-header">
                  <div className="cart-brand">
                    <div className="cart-brand-icon">�️</div>
                    <div className="cart-brand-text">
                      <h3 className="cart-title">Đơn hàng của bạn</h3>
                      <span className="cart-subtitle">{cartItemCount} món đã chọn</span>
                    </div>
                  </div>
                </div>
                
                <div className="elegant-cart-items">
                  {cartItems.map((item) => (
                    <div key={item.id} className="elegant-cart-item">
                      <div className="cart-item-image">
                        <span className="item-emoji">{item.image}</span>
                      </div>
                      <div className="cart-item-content">
                        <div className="cart-item-main">
                          <h4 className="cart-item-name">{item.name}</h4>
                          <div className="cart-item-price-info">
                            <span className="unit-price">₫{getItemPrice(item.price).toLocaleString()}</span>
                            <span className="quantity-indicator">x {item.quantity}</span>
                          </div>
                        </div>
                        <div className="cart-item-controls">
                          <div className="quantity-controls">
                            <button 
                              className="qty-btn minus"
                              onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                            >
                              −
                            </button>
                            <span className="quantity-display">{item.quantity}</span>
                            <button 
                              className="qty-btn plus"
                              onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                            >
                              +
                            </button>
                          </div>
                          <button 
                            className="remove-item-btn"
                            onClick={() => removeFromCart(item.id)}
                            title="Xóa khỏi giỏ hàng"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                      <div className="cart-item-total">
                        <span className="item-total">₫{(getItemPrice(item.price) * item.quantity).toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="cart-summary-total">
                  <div className="total-calculation">
                    <div className="subtotal-line">
                      <span className="subtotal-label">Tạm tính</span>
                      <span className="subtotal-amount">₫{cartTotal.toLocaleString()}</span>
                    </div>
                    <div className="total-line">
                      <span className="total-label">Tổng cộng</span>
                      <span className="total-amount">₫{cartTotal.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
                
                <button 
                  className="elegant-checkout-btn" 
                  onClick={handleCheckout}
                  disabled={checkoutLoading || cartItems.length === 0}
                >
                  <div className="checkout-btn-content">
                    <span className="checkout-icon">
                      {checkoutLoading ? '⏳' : '💳'}
                    </span>
                    <div className="checkout-text">
                      <span className="checkout-label">
                        {checkoutLoading ? 'Đang xử lý...' : 'Thanh toán'}
                      </span>
                      <span className="checkout-amount">₫{cartTotal.toLocaleString()}</span>
                    </div>
                  </div>
                </button>
              </div>
            ) : (
              <div className="empty-cart">
                <div className="empty-cart-icon">🛒</div>
                <p>Giỏ hàng trống</p>
                <small>Thêm món yêu thích vào giỏ hàng</small>
              </div>
            )}

          </aside>

          {/* Main Content Area */}
          <div className="menu-content">
            {/* Category Header */}
            <div className="category-header">
              <h1 className="category-title">{activeLabel}</h1>
              <p className="category-subtitle">
                {categorySubtitle(activeFilter)}
              </p>
            </div>

            {/* Menu Items */}
            <div className="menu-items">
              {filteredItems.map((item) => (
                <div key={item.id} className="menu-item-card">
                  <div className="item-image">
                    {item.image && item.image.startsWith('http') ? (
                      <img src={item.image} alt={item.name} className="product-img" />
                    ) : (
                      <span className="item-emoji">{item.image}</span>
                    )}
                    {item.stock <= 5 && item.stock > 0 && (
                      <div className="stock-warning">Còn ít!</div>
                    )}
                    {item.stock === 0 && (
                      <div className="out-of-stock">Hết hàng</div>
                    )}
                  </div>
                  <div className="item-details">
                    <div className="item-header">
                      <h3 className="item-name">{item.name}</h3>
                      <button className="favorite-btn">♡</button>
                    </div>
                    <p className="item-description">{item.description}</p>
                    <div className="item-stock-info">
                      <span className="stock-label">
                        Kho: {item.stock > 0 ? item.stock : 'Hết hàng'}
                      </span>
                    </div>
                    <div className="item-footer">
                      <span className="item-price">₫{getItemPrice(item.price).toLocaleString()}</span>
                      <div className="item-actions">
                        <button 
                          className="quantity-btn"
                          onClick={() => updateItemQuantity(item.id, getItemQuantity(item.id) - 1)}
                          disabled={item.stock === 0}
                        >
                          -
                        </button>
                        <span className="quantity">{getItemQuantity(item.id)}</span>
                        <button 
                          className="quantity-btn"
                          onClick={() => updateItemQuantity(item.id, getItemQuantity(item.id) + 1)}
                          disabled={item.stock === 0 || getItemQuantity(item.id) >= item.stock}
                        >
                          +
                        </button>
                        <button 
                          className="add-to-cart"
                          onClick={() => handleAddToCart(item)}
                        >
                          Thêm vào giỏ
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Menu;