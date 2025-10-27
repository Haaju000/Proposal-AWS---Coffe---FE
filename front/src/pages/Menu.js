import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import cakeService from '../services/cakeService';
import drinkService from '../services/drinkService';
import orderService from '../services/orderService';
import { useAuth } from '../contexts/AuthContext';
import '../css/Menu.css';

const Menu = () => {
  const [activeFilter, setActiveFilter] = useState('All');
  const [cart, setCart] = useState({});
  const [itemQuantities, setItemQuantities] = useState({});
  const [drinks, setDrinks] = useState([]);
  const [cakes, setCakes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  
  const { user, isAuthenticated } = useAuth();

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

  // Helper functions for cart management
  const getItemPrice = (price) => {
    // Handle undefined, null, or empty price
    if (!price && price !== 0) return 0;
    
    // If price is already a number, return it
    if (typeof price === 'number') return price;
    
    // If price is a string, remove $ and parse
    if (typeof price === 'string') {
      const cleanPrice = price.replace(/[$,]/g, '');
      const parsed = parseFloat(cleanPrice);
      return isNaN(parsed) ? 0 : parsed;
    }
    
    return 0;
  };

  const getItemQuantity = (itemId) => {
    return itemQuantities[itemId] || 1;
  };

  const updateQuantity = (itemId, newQuantity) => {
    if (newQuantity < 1) newQuantity = 1;
    setItemQuantities(prev => ({
      ...prev,
      [itemId]: newQuantity
    }));
  };

  const addToCart = (item) => {
    const quantity = getItemQuantity(item.id);
    setCart(prev => ({
      ...prev,
      [item.id]: {
        ...item,
        quantity: (prev[item.id]?.quantity || 0) + quantity
      }
    }));
    // Reset quantity to 1 after adding
    setItemQuantities(prev => ({
      ...prev,
      [item.id]: 1
    }));
  };

  const removeFromCart = (itemId) => {
    setCart(prev => {
      const newCart = { ...prev };
      delete newCart[itemId];
      return newCart;
    });
  };

  const updateCartQuantity = (itemId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    setCart(prev => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        quantity: newQuantity
      }
    }));
  };

  // Calculate cart totals
  const cartItems = Object.values(cart);
  const cartItemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cartItems.reduce((sum, item) => sum + (getItemPrice(item.price) * item.quantity), 0);

  // Debug logs
  console.log('Cart state:', cart);
  console.log('Cart items:', cartItems);
  console.log('Cart count:', cartItemCount);

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
      // Transform cart items to match API schema
      const orderItems = cartItems.map(item => {
        return {
          productId: item.originalId,
          productType: item.type, // "cake" or "drink"
          productName: item.name,
          quantity: item.quantity,
          unitPrice: getItemPrice(item.price),
          toppings: [] // For now, no toppings. Can be extended later
        };
      });

      const orderData = {
        userId: user?.id || user?.username, // Adjust based on your user object structure
        items: orderItems,
        totalPrice: cartTotal,
        status: "Pending"
      };

      console.log('Order data being sent:', orderData);

      const token = localStorage.getItem('token');
      const response = await orderService.createOrder(orderData, token);
      
      console.log('Order created successfully:', response);
      alert('Đặt hàng thành công! Mã đơn hàng: #' + response.id);
      
      // Clear cart after successful order
      setCart({});
      setItemQuantities({});
      
      // Optionally redirect to orders page
      // navigate('/orders');
      
    } catch (error) {
      console.error('Error creating order:', error);
      if (error.response?.data?.message) {
        alert('Lỗi: ' + error.response.data.message);
      } else {
        alert('Có lỗi xảy ra khi đặt hàng. Vui lòng thử lại.');
      }
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

            {/* Cart Summary */}
            {cartItemCount > 0 ? (
              <div className="cart-summary">
                <div className="cart-header">
                  <h3 className="cart-title">
                    <span className="cart-icon">🛒</span>
                    Đơn hàng của bạn ({cartItemCount} món)
                  </h3>
                </div>
                
                <div className="cart-items">
                  {cartItems.map((item) => (
                    <div key={item.id} className="cart-item">
                      <div className="cart-item-emoji">{item.image}</div>
                      <div className="cart-item-info">
                        <div className="cart-item-details">
                          <p className="cart-item-name">{item.name}</p>
                          <p className="cart-item-price">
                            ₫{getItemPrice(item.price).toLocaleString()} x {item.quantity}
                          </p>
                          <p className="cart-item-subtotal">
                            Tổng: ₫{(getItemPrice(item.price) * item.quantity).toLocaleString()}
                          </p>
                        </div>
                        <div className="cart-item-controls">
                          <div className="cart-qty-controls">
                            <button 
                              className="cart-qty-btn"
                              onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                            >
                              -
                            </button>
                            <span className="cart-qty">{item.quantity}</span>
                            <button 
                              className="cart-qty-btn"
                              onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                            >
                              +
                            </button>
                          </div>
                          <button 
                            className="cart-remove-btn"
                            onClick={() => removeFromCart(item.id)}
                            title="Xóa khỏi giỏ hàng"
                          >
                            ×
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="cart-total">
                  <div className="total-line">
                    <span className="total-label">Tổng cộng:</span>
                    <span className="total-amount">₫{cartTotal.toLocaleString()}</span>
                  </div>
                  <div className="total-info">
                    <small>{cartItemCount} món trong giỏ hàng</small>
                  </div>
                </div>
                
                <button 
                  className="checkout-btn" 
                  onClick={handleCheckout}
                  disabled={checkoutLoading || cartItems.length === 0}
                >
                  <span className="btn-icon">
                    {checkoutLoading ? '⏳' : '💳'}
                  </span>
                  {checkoutLoading ? 'Đang xử lý...' : 'Thanh toán'}
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
                          onClick={() => updateQuantity(item.id, getItemQuantity(item.id) - 1)}
                          disabled={item.stock === 0}
                        >
                          -
                        </button>
                        <span className="quantity">{getItemQuantity(item.id)}</span>
                        <button 
                          className="quantity-btn"
                          onClick={() => updateQuantity(item.id, getItemQuantity(item.id) + 1)}
                          disabled={item.stock === 0 || getItemQuantity(item.id) >= item.stock}
                        >
                          +
                        </button>
                        <button 
                          className="add-to-cart"
                          onClick={() => addToCart(item)}
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