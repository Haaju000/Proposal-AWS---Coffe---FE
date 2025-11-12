import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import CheckoutModal from '../components/CheckoutModal';
import ToppingModal from '../components/ToppingModal';
import cakeService from '../services/cakeService';
import drinkService from '../services/drinkService';
import toppingService from '../services/toppingService';
import orderService from '../services/orderService';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import '../css/Menu.css';

const Menu = () => {
  const [activeFilter, setActiveFilter] = useState('All');
  const [drinks, setDrinks] = useState([]);
  const [cakes, setCakes] = useState([]);
  const [toppings, setToppings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [toppingModalOpen, setToppingModalOpen] = useState(false);
  const [selectedDrinkForTopping, setSelectedDrinkForTopping] = useState(null);
  const [selectedToppings, setSelectedToppings] = useState([]);
  
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

  const handleAddToCart = (item, toppings = []) => {
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
  };

  const handleDrinkWithToppings = () => {
    if (selectedDrinkForTopping) {
      handleAddToCart(selectedDrinkForTopping, selectedToppings);
      setToppingModalOpen(false);
      setSelectedDrinkForTopping(null);
      setSelectedToppings([]);
    }
  };

  const toggleTopping = (topping) => {
    setSelectedToppings(prev => {
      const exists = prev.find(t => t.id === topping.id);
      if (exists) {
        return prev.filter(t => t.id !== topping.id);
      } else {
        return [...prev, topping];
      }
    });
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

  const transformedToppings = toppings.map(topping => ({
    id: `topping_${topping.id}`,
    name: topping.name || 'Topping',
    description: 'Topping thêm hương vị đặc biệt cho đồ uống của bạn',
    price: topping.price || 0, // Toppings sử dụng price theo backend model
    category: 'Toppings',
    image: topping.imageUrl || '🌟',
    type: 'topping',
    stock: topping.stock || 0,
    originalId: topping.id
  }));

  const allItems = [...transformedDrinks, ...transformedCakes, ...transformedToppings];
  
  const filterItems = (categoryKey) => {
    if (categoryKey === 'All') return allItems;
    if (categoryKey === 'Drink') {
      return allItems.filter(item => item.type === 'drink');
    }
    if (categoryKey === 'Pastries') {
      return allItems.filter(item => item.type === 'cake');
    }
    if (categoryKey === 'Toppings') {
      return allItems.filter(item => item.type === 'topping');
    }
    return allItems.filter(item => item.category === categoryKey);
  };

  const filteredItems = filterItems(activeFilter);

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

  // Open checkout modal
  const handleCheckout = () => {
    if (!isAuthenticated) {
      alert('Vui lòng đăng nhập để đặt hàng');
      return;
    }

    if (cartItems.length === 0) {
      alert('Giỏ hàng trống!');
      return;
    }

    setCheckoutModalOpen(true);
  };

  // Handle successful order
  const handleOrderSuccess = (orderInfo) => {
    console.log('✅ Order completed successfully:', orderInfo);
    
    // Save order to history
    const orderHistory = JSON.parse(localStorage.getItem('orderHistory') || '[]');
    orderHistory.unshift({
      id: orderInfo.orderId,
      totalPrice: orderInfo.totalPrice,
      status: orderInfo.status,
      items: orderInfo.items.length,
      customerInfo: orderInfo.customerInfo,
      createdAt: new Date().toISOString()
    });
    localStorage.setItem('orderHistory', JSON.stringify(orderHistory.slice(0, 10)));
    
    // Reset item quantities
    setItemQuantities({});
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
                
                {/* Nút thanh toán */}
                <button 
                  className="pay-btn" 
                  onClick={handleCheckout}
                  disabled={cartItems.length === 0}
                >
                  THANH TOÁN
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
                          onClick={() => {
                            if (item.type === 'drink') {
                              setSelectedDrinkForTopping(item);
                              setToppingModalOpen(true);
                            } else {
                              handleAddToCart(item);
                            }
                          }}
                        >
                          {item.type === 'drink' ? 'Chọn topping' : 'Thêm vào giỏ'}
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