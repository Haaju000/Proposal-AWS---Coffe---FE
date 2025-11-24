import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import Header from '../components/Header';
import CheckoutModal from '../components/CheckoutModal';
import ToppingModal from '../components/ToppingModal';
import MenuItemCard from '../components/MenuItemCard';
import SkeletonLoader from '../components/SkeletonLoader';
import cakeService from '../services/cakeService';
import drinkService from '../services/drinkService';
import toppingService from '../services/toppingService';
import orderService from '../services/orderService';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import '../css/Menu.css';

const Menu = () => {
  const location = useLocation();
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('name'); // 'name', 'price-low', 'price-high', 'popular'
  const [drinks, setDrinks] = useState([]);
  const [cakes, setCakes] = useState([]);
  const [toppings, setToppings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [toppingModalOpen, setToppingModalOpen] = useState(false);
  const [selectedDrinkForTopping, setSelectedDrinkForTopping] = useState(null);
  const [selectedToppings, setSelectedToppings] = useState([]);
  const [loyaltyMessage, setLoyaltyMessage] = useState(null);
  
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
    getItemTotalPrice,
    isItemInCart,
    getItemInCart
  } = useCart();

  // Fetch data from API
  useEffect(() => {
    const fetchMenuData = async () => {
      try {
        setLoading(true);
        const [drinksResponse, cakesResponse, toppingsResponse] = await Promise.all([
          drinkService.getAllDrinks(),
          cakeService.getAllCakes(),
          toppingService.getAllToppings()
        ]);
        
        setDrinks(drinksResponse);
        setCakes(cakesResponse);
        setToppings(toppingsResponse);
      } catch (error) {
        console.error('Error fetching menu data:', error);
        setError('Không thể tải dữ liệu menu');
      } finally {
        setLoading(false);
      }
    };

    fetchMenuData();
  }, []);

  // 🎫 Check for voucher message from Loyalty page navigation
  useEffect(() => {
    if (location.state?.fromLoyalty && location.state?.message) {
      setLoyaltyMessage(location.state.message);
      
      // Auto-hide message after 8 seconds
      const timer = setTimeout(() => {
        setLoyaltyMessage(null);
      }, 8000);
      
      return () => clearTimeout(timer);
    }
  }, [location.state]);

  // Helper function for quantity selector
  const [itemQuantities, setItemQuantities] = useState({});

  const getItemQuantity = (itemId) => {
    return itemQuantities[itemId] || 1;
  };

  const updateItemQuantity = useCallback((itemId, newQuantity) => {
    if (newQuantity < 1) newQuantity = 1;
    setItemQuantities(prev => ({
      ...prev,
      [itemId]: newQuantity
    }));
  }, []);

  const handleAddToCart = useCallback((item, toppings = []) => {
    const quantity = getItemQuantity(item.id);
    
    // Create unique ID for items with different topping combinations
    const toppingIds = toppings.map(t => t.originalId).sort().join(',');
    const uniqueId = toppings.length > 0 ? `${item.id}_${toppingIds}` : item.id;
    
    // Create enhanced item with toppings
    const itemWithToppings = {
      ...item,
      id: uniqueId, // Use unique ID for cart identification
      originalId: item.id, // Keep original product ID for API
      selectedToppings: toppings,
      toppingIds: toppings.map(t => t.originalId),
      // Calculate total price including toppings
      totalPrice: item.price + toppings.reduce((sum, topping) => sum + topping.price, 0)
    };
    
    // Add to cart with specified quantity
    for (let i = 0; i < quantity; i++) {
      addToCart(itemWithToppings);
    }
    // Reset quantity to 1 after adding
    setItemQuantities(prev => ({
      ...prev,
      [item.id]: 1
    }));
  }, [itemQuantities, addToCart]);

  const handleDrinkWithToppings = useCallback(() => {
    if (selectedDrinkForTopping) {
      handleAddToCart(selectedDrinkForTopping, selectedToppings);
      setToppingModalOpen(false);
      setSelectedDrinkForTopping(null);
      setSelectedToppings([]);
    }
  }, [selectedDrinkForTopping, selectedToppings, handleAddToCart]);

  const toggleTopping = useCallback((topping) => {
    setSelectedToppings(prev => {
      const exists = prev.find(t => t.id === topping.id);
      if (exists) {
        return prev.filter(t => t.id !== topping.id);
      } else {
        return [...prev, topping];
      }
    });
  }, []);

  // Handlers for MenuItemCard
  const handleToppingSelect = useCallback((item) => {
    setSelectedDrinkForTopping(item);
    setToppingModalOpen(true);
  }, []);

  const handleOrderSuccess = useCallback((orderInfo) => {
    console.log('🎉 Order placed successfully:', orderInfo);
    setCheckoutModalOpen(false);
    
    try {
      // Save order to localStorage với better error handling
      const existingOrders = JSON.parse(localStorage.getItem('orderHistory') || '[]');
      const newOrder = {
        orderId: orderInfo.orderId || `ORDER_${Date.now()}`,
        items: [...cartItems],
        total: cartTotal,
        status: orderInfo.status || 'Pending',
        date: new Date().toISOString(),
        customerInfo: orderInfo.customerInfo || {}
      };
      
      const updatedOrders = [newOrder, ...existingOrders];
      localStorage.setItem('orderHistory', JSON.stringify(updatedOrders));
      console.log('✅ Order saved to localStorage:', newOrder);
      
      // Clear form state
      clearCart();
      setItemQuantities({});
      
    } catch (error) {
      console.error('❌ Error in handleOrderSuccess:', error);
      console.error('OrderInfo received:', orderInfo);
      
      // Still clear cart even if saving fails
      clearCart();
      setItemQuantities({});
    }
  }, [cartItems, cartTotal, clearCart]);

  // Transform API data to menu format
  const transformedDrinks = useMemo(() => 
    drinks.map(drink => ({
      id: drink.id, // Giữ nguyên UUID từ API
      name: drink.name || 'Đồ uống',
      description: drink.category ? `${drink.category} - Đồ uống thơm ngon` : 'Đồ uống thơm ngon',
      price: drink.basePrice || 0, // Drinks sử dụng basePrice theo backend model
      category: drink.category || 'Default',
      image: drink.imageUrl || '☕',
      type: 'drink',
      stock: drink.stock || 0,
      originalId: drink.id // Cũng là UUID từ API
    }))
  , [drinks]);

  const transformedCakes = useMemo(() => 
    cakes.map(cake => ({
      id: cake.id, // Giữ nguyên UUID từ API
      name: cake.name || 'Bánh ngọt',
      description: 'Bánh ngọt thơm ngon, được làm thủ công', // Backend không có description field
      price: cake.price || 0, // Cakes sử dụng price theo backend model
      category: 'Pastries',
      image: cake.imageUrl || '🧁',
      type: 'cake',
      stock: cake.stock || 0,
      originalId: cake.id // Cũng là UUID từ API
    }))
  , [cakes]);

  const transformedToppings = useMemo(() => 
    toppings.map(topping => ({
      id: topping.id, // Giữ nguyên UUID từ API
      name: topping.name || 'Topping',
      description: 'Topping thêm hương vị đặc biệt cho đồ uống của bạn',
      price: topping.price || 0, // Toppings sử dụng price theo backend model
      category: 'Toppings',
      image: topping.imageUrl || '🌟',
      type: 'topping',
      stock: topping.stock || 0,
      originalId: topping.id // Cũng là UUID từ API
    }))
  , [toppings]);

  const allItems = useMemo(() => [
    ...transformedDrinks, 
    ...transformedCakes, 
    ...transformedToppings
  ], [transformedDrinks, transformedCakes, transformedToppings]);
  
  const filteredItems = useMemo(() => {
    let items = allItems;
    
    // Filter by category
    if (activeFilter !== 'All') {
      if (activeFilter === 'Drink') {
        items = items.filter(item => item.type === 'drink');
      } else if (activeFilter === 'Pastries') {
        items = items.filter(item => item.type === 'cake');
      } else if (activeFilter === 'Toppings') {
        items = items.filter(item => item.type === 'topping');
      } else {
        items = items.filter(item => item.category === activeFilter);
      }
    }
    
    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      items = items.filter(item => 
        item.name.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query)
      );
    }
    
    // Sort items
    items.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name, 'vi', { sensitivity: 'base' });
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'popular':
          // Sort by stock descending (assuming higher stock = more popular)
          return b.stock - a.stock;
        default:
          return 0;
      }
    });
    
    return items;
  }, [allItems, activeFilter, searchQuery, sortBy]);

  const categories = [
    { key: 'All', label: 'Tất cả', icon: '🍽️' },
    { key: 'Drink', label: 'Đồ uống', icon: '☕' },
    { key: 'Pastries', label: 'Bánh ngọt', icon: '🧁' },
    { key: 'Toppings', label: 'Topping', icon: '🌟' }
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
      case 'Toppings':
        return 'Toppings đa dạng để tùy chỉnh đồ uống yêu thích';
      default:
        return '';
    }
  };

  // Validate cart items trước khi đặt hàng - UPDATED WITH BACKEND API
  const validateCartItems = async () => {
    try {
      console.log('🔍 Validating cart items with backend API...');
      
      const validationPromises = cartItems.map(async (item) => {
        // Chuẩn bị data theo OrderItem model từ backend
        const orderItemValidation = {
          ProductId: String(item.originalId), // UUID từ backend
          ProductName: item.name, // Sẽ được override bởi backend
          ProductType: item.type === 'drink' ? 'Drink' : 'Cake', // Đúng case như backend
          Quantity: item.quantity,
          UnitPrice: item.price, // Sẽ được override bởi backend
          Toppings: item.selectedToppings ? item.selectedToppings.map(topping => ({
            ToppingId: String(topping.originalId), // UUID từ backend
            Name: topping.name, // Sẽ được override bởi backend  
            Price: topping.price // Sẽ được override bởi backend
          })) : [],
          TotalPrice: 0 // Sẽ được tính bởi backend
        };
        
        try {
          const validatedItem = await orderService.validateOrderItem(orderItemValidation);
          
          console.log(`✅ Item validated: ${item.name}`, validatedItem);
          
          return { 
            originalItem: item,
            validatedItem: validatedItem,
            valid: true, 
            error: null
          };
        } catch (error) {
          console.error(`❌ Validation failed for ${item.name}:`, error.message);
          
          return { 
            originalItem: item,
            validatedItem: null,
            valid: false, 
            error: error.message
          };
        }
      });
      
      const validationResults = await Promise.all(validationPromises);
      const invalidItems = validationResults.filter(result => !result.valid);
      
      if (invalidItems.length > 0) {
        const errorMessages = invalidItems.map(result => 
          `• ${result.originalItem.name}: ${result.error}`
        ).join('\n');
        
        throw new Error(`Một số sản phẩm không hợp lệ:\n${errorMessages}`);
      }
      
      console.log('✅ All cart items validated successfully');
      
      // Return both original and validated data for checkout
      return validationResults.map(result => ({
        original: result.originalItem,
        validated: result.validatedItem
      }));
      
    } catch (error) {
      console.error('❌ Cart validation failed:', error);
      throw error;
    }
  };

  // Open checkout modal - UPDATED WITH VALIDATION
  const handleCheckout = async () => {
    if (!isAuthenticated) {
      alert('Vui lòng đăng nhập để đặt hàng');
      return;
    }

    if (cartItems.length === 0) {
      alert('Giỏ hàng trống!');
      return;
    }

    try {
      console.log('🔄 Starting checkout validation...');
      
      // Show loading state
      const checkoutBtn = document.querySelector('.checkout-btn');
      const originalText = checkoutBtn?.textContent;
      if (checkoutBtn) {
        checkoutBtn.textContent = '🔍 Đang kiểm tra...';
        checkoutBtn.disabled = true;
      }

      // Validate all cart items
      const validationResults = await validateCartItems();
      
      console.log('✅ Validation completed, opening checkout modal...');
      
      // Store validated data for checkout modal to use
      window.validatedCartItems = validationResults;
      
      setCheckoutModalOpen(true);
      
    } catch (error) {
      console.error('❌ Checkout validation failed:', error);
      
      // Show user-friendly error message
      const errorMsg = error.message.includes('\n') 
        ? error.message 
        : `Lỗi kiểm tra sản phẩm: ${error.message}`;
        
      alert(errorMsg);
      
    } finally {
      // Reset checkout button
      const checkoutBtn = document.querySelector('.checkout-btn');
      if (checkoutBtn && isAuthenticated) {
        checkoutBtn.textContent = '💳 Tiến hành thanh toán';
        checkoutBtn.disabled = cartItems.length === 0;
      }
    }
  };



  if (loading) {
    return (
      <div className="menu-page">
        <Header />
        <main className="menu-main">
          <div className="menu-container">
            <aside className="menu-sidebar">
              <div className="sidebar-header">
                <h2 className="sidebar-title">Thực đơn</h2>
              </div>
              <SkeletonLoader type="search" />
              <SkeletonLoader type="category" />
            </aside>
            <div className="menu-content">
              <div className="category-header">
                <h1 className="category-title">Đang tải...</h1>
                <p className="category-subtitle">Vui lòng chờ trong giây lát</p>
              </div>
              <SkeletonLoader type="card" count={6} />
            </div>
          </div>
        </main>
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
      
      {/* 🎫 Loyalty Voucher Notification Banner */}
      {loyaltyMessage && (
        <div className="loyalty-notification-banner">
          <div className="banner-content">
            <span className="banner-icon">🎫</span>
            <span className="banner-message">{loyaltyMessage}</span>
            <button 
              className="banner-close"
              onClick={() => setLoyaltyMessage(null)}
              aria-label="Đóng thông báo"
            >
              ✕
            </button>
          </div>
        </div>
      )}
      
      <main className="menu-main">
        <div className="menu-container">{/* Sidebar */}
          <aside className="menu-sidebar">
            <div className="sidebar-header">
              <h2 className="sidebar-title">Thực đơn</h2>
            </div>
            
            {/* Search Box */}
            <div className="search-section">
              <div className="search-box">
                <input
                  type="text"
                  placeholder="🔍 Tìm kiếm món ăn..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="search-input"
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="search-clear"
                  >
                    ✕
                  </button>
                )}
              </div>
              {searchQuery && (
                <div className="search-results-info">
                  Tìm thấy {filteredItems.length} kết quả cho "{searchQuery}"
                </div>
              )}
            </div>
            
            {/* Sort Options */}
            <div className="sort-section">
              <label htmlFor="sort-select" className="sort-label">Sắp xếp theo:</label>
              <select 
                id="sort-select"
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value)}
                className="sort-select"
              >
                <option value="name">Tên A-Z</option>
                <option value="price-low">Giá thấp → cao</option>
                <option value="price-high">Giá cao → thấp</option>
                <option value="popular">Phổ biến</option>
              </select>
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
                    {category.key === 'Toppings' && '🍮'}
                  </span>
                  {category.label}
                </button>
              ))}
            </nav>



            {/* New Cart Design */}
            {cartItemCount > 0 && (
              <div className="new-cart">
                {/* Cart Header */}
                <div className="cart-header">
                  <h3 className="cart-title">Đơn hàng của bạn</h3>
                  <span className="cart-count">{cartItemCount} món</span>
                </div>
                
                {cartItems.map((item) => (
                  <div key={item.id} className="new-cart-item">
                    {/* Dòng 1: Hình ảnh - Tên sản phẩm */}
                    <div className="item-line-1">
                      <div className="item-img">
                        {item.image && item.image.startsWith('http') ? (
                          <img src={item.image} alt={item.name} className="img" />
                        ) : (
                          <span className="emoji">{item.image}</span>
                        )}
                      </div>
                      <span className="name">{item.name}</span>
                    </div>
                    
                    {/* Hiển thị toppings nếu có */}
                    {item.selectedToppings && item.selectedToppings.length > 0 && (
                      <div className="item-toppings">
                        {item.selectedToppings.map((topping, index) => (
                          <div key={index} className="topping-item">
                            <span className="topping-name">+ {topping.name} x1</span>
                            <span className="topping-price">₫{getItemPrice(topping.price).toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {/* Dòng 2: Giá tiền */}
                    <div className="item-line-2">
                      <span className="price">₫{getItemTotalPrice(item).toLocaleString()}</span>
                    </div>
                    
                    {/* Dòng 3: Số lượng hiện tại + nút giảm */}
                    <div className="item-line-3">
                      <span className="qty">Số lượng hiện tại: {item.quantity}</span>
                      <button 
                        className="minus-btn"
                        onClick={() => {
                          if (item.quantity === 1) {
                            removeFromCart(item.id);
                          } else {
                            updateCartQuantity(item.id, item.quantity - 1);
                          }
                        }}
                      >
                        -
                      </button>
                    </div>
                  </div>
                ))}
                
                {/* Tổng tiền */}
                <div className="cart-summary">
                  <div className="total-line">
                    <span className="total-text">Tổng cộng:</span>
                    <span className="total-price">₫{cartTotal.toLocaleString()}</span>
                  </div>
                </div>
                
                {/* Checkout Button */}
                <button 
                  className="checkout-btn"
                  onClick={handleCheckout}
                  disabled={cartItems.length === 0 || !isAuthenticated}
                >
                  {!isAuthenticated ? '🔐 Đăng nhập để đặt hàng' :
                   cartItems.length === 0 ? '🛒 Giỏ hàng trống' :
                   '💳 Tiến hành thanh toán'}
                </button>
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
                <div 
                  key={item.id} 
                  className={`menu-item-card ${item.stock === 0 ? 'out-of-stock' : item.stock <= 5 ? 'low-stock' : ''}`}
                >
                  <div className="item-image">
                    {item.image && item.image.startsWith('http') ? (
                      <img src={item.image} alt={item.name} className="product-img" />
                    ) : (
                      <span className="item-emoji">{item.image}</span>
                    )}
                    {item.stock <= 5 && item.stock > 0 && (
                      <div className="stock-warning">Còn ít!</div>
                    )}
                    
                  </div>
                  <div className="item-details">
                    <div className="item-header">
                      <h3 className="item-name">{item.name}</h3>
                      
                    </div>
                    <p className="item-description">{item.description}</p>
                    <div className="item-stock-info">
                      <span className={`stock-label ${item.stock === 0 ? 'out-of-stock-text' : item.stock <= 5 ? 'low-stock-text' : ''}`}>
                        {item.stock === -1 ? '' : `Kho: ${item.stock}`}
                      </span>
                    </div>
                    <div className="item-footer">
                      <span className="item-price">₫{getItemPrice(item.price).toLocaleString()}</span>
                      <div className="item-actions">
                        <button 
                          className="quantity-btn"
                          onClick={() => updateItemQuantity(item.id, getItemQuantity(item.id) - 1)}
                          disabled={item.stock === 0 || getItemQuantity(item.id) === 0}
                          title={item.stock === 0 ? 'Sản phẩm hết hàng' : 'Giảm số lượng'}
                        >
                          -
                        </button>
                        <span className="quantity">{getItemQuantity(item.id)}</span>
                        <button 
                          className="quantity-btn"
                          onClick={() => updateItemQuantity(item.id, getItemQuantity(item.id) + 1)}
                          disabled={item.stock === 0 || getItemQuantity(item.id) >= item.stock}
                          title={item.stock === 0 ? 'Sản phẩm hết hàng' : 
                                 getItemQuantity(item.id) >= item.stock ? 'Đã đạt tối đa kho' : 'Tăng số lượng'}
                        >
                          +
                        </button>
                        <button 
                          className={`add-to-cart ${item.stock === 0 ? 'disabled' : ''}`}
                          onClick={() => {
                            if (item.stock === 0) return;
                            if (item.type === 'drink') {
                              setSelectedDrinkForTopping(item);
                              setToppingModalOpen(true);
                            } else {
                              handleAddToCart(item);
                            }
                          }}
                          disabled={item.stock === 0}
                          title={item.stock === 0 ? 'Sản phẩm hết hàng' : 
                                 item.type === 'drink' ? 'Chọn topping cho đồ uống' : 'Thêm vào giỏ hàng'}
                        >
                          {item.stock === 0 ? 'Hết hàng' :
                           item.type === 'drink' ? 'Chọn topping' : 'Thêm vào giỏ'}
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

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={checkoutModalOpen}
        onClose={() => setCheckoutModalOpen(false)}
        onOrderSuccess={handleOrderSuccess}
      />

      {/* Topping Selection Modal */}
      <ToppingModal
        isOpen={toppingModalOpen}
        onClose={() => {
          setToppingModalOpen(false);
          setSelectedDrinkForTopping(null);
          setSelectedToppings([]);
        }}
        selectedDrink={selectedDrinkForTopping}
        toppings={transformedToppings}
        selectedToppings={selectedToppings}
        onToggleTopping={toggleTopping}
        onConfirm={handleDrinkWithToppings}
        getItemQuantity={getItemQuantity}
      />
    </div>
  );
};

export default Menu;