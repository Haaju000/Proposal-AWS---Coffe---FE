import React, { useState } from 'react';
import Header from '../components/Header';
import '../css/Menu.css';

const Menu = () => {
  const [activeFilter, setActiveFilter] = useState('All');
  const [cart, setCart] = useState({});
  const [itemQuantities, setItemQuantities] = useState({});

  // Helper functions for cart management
  const getItemPrice = (priceString) => {
    return parseFloat(priceString.replace('$', ''));
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

  const menuData = {
    coffee: [
      {
        id: 1,
        name: 'Espresso',
        description: 'Cà phê đậm đặc, nguyên chất với hương vị đậm nét',
        price: '$3.50',
        category: 'Espresso',
        image: '☕'
      },
      {
        id: 2,
        name: 'Double Espresso',
        description: 'Gấp đôi cường độ, gấp đôi sự hài lòng',
        price: '$4.50',
        category: 'Espresso',
        image: '☕'
      },
      {
        id: 3,
        name: 'Americano',
        description: 'Espresso hòa với nước nóng, vị nhẹ và mượt',
        price: '$3.75',
        category: 'Espresso',
        image: '☕'
      },
      {
        id: 4,
        name: 'Latte',
        description: 'Espresso hòa kem sữa hấp, mịn và ngậy',
        price: '$4.50',
        category: 'Latte',
        image: '🥛'
      },
      {
        id: 5,
        name: 'Caramel Latte',
        description: 'Vị caramel ngọt dịu kết hợp cùng espresso và sữa',
        price: '$5.00',
        category: 'Latte',
        image: '🥛'
      },
      {
        id: 6,
        name: 'Vanilla Latte',
        description: 'Hương vanilla dịu nhẹ cùng sữa tươi đánh bọt',
        price: '$5.00',
        category: 'Latte',
        image: '🥛'
      },
      {
        id: 7,
        name: 'Cappuccino',
        description: 'Klassic Ý với lớp bọt sữa dày và vị cân bằng',
        price: '$4.25',
        category: 'Cappuccino',
        image: '☕'
      },
      {
        id: 8,
        name: 'Mocha Cappuccino',
        description: 'Cappuccino pha cùng socola, vị ngọt dịu và đậm đà',
        price: '$4.75',
        category: 'Cappuccino',
        image: '☕'
      }
    ],
    pastries: [
      {
        id: 9,
        name: 'Bánh sừng bò (Croissant)',
        description: 'Bánh bơ giòn, xốp, nướng hàng ngày',
        price: '$2.99',
        category: 'Pastries',
        image: '🥐'
      },
      {
        id: 10,
        name: 'Bánh muffin socola',
        description: 'Muffin socola đậm với vụn socola bên trong',
        price: '$3.50',
        category: 'Pastries',
        image: '🧁'
      },
      {
        id: 11,
        name: 'Bánh Danish hạnh nhân',
        description: 'Bánh ngọt với nhân kem hạnh nhân thơm ngon',
        price: '$3.75',
        category: 'Pastries',
        image: '🥐'
      }
    ]
  };

  const allItems = [...menuData.coffee, ...menuData.pastries];
  
  const filterItems = (categoryKey) => {
    if (categoryKey === 'All') return allItems;
    return allItems.filter(item => item.category === categoryKey);
  };

  const filteredItems = filterItems(activeFilter);

  const categories = [
    { key: 'All', label: 'Tất cả' },
    { key: 'Espresso', label: 'Espresso' },
    { key: 'Latte', label: 'Latte' },
    { key: 'Cappuccino', label: 'Cappuccino' },
    { key: 'Pastries', label: 'Bánh ngọt' }
  ];

  const activeLabel = categories.find(c => c.key === activeFilter)?.label || activeFilter;

  const categorySubtitle = (key) => {
    switch (key) {
      case 'All':
        return 'Khám phá toàn bộ thực đơn của chúng tôi';
      case 'Espresso':
        return 'Các đồ uống espresso đậm đà và mạnh mẽ';
      case 'Latte':
        return 'Đồ uống sữa với espresso, mềm mại và thơm';
      case 'Cappuccino':
        return 'Các món cổ điển kiểu Ý với lớp bọt sữa dày';
      case 'Pastries':
        return 'Bánh nướng tươi ngon, phù hợp dùng kèm cà phê';
      default:
        return '';
    }
  };

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
                    {category.key === 'Espresso' && '☕'}
                    {category.key === 'Latte' && '🥛'}
                    {category.key === 'Cappuccino' && '☕'}
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
            {cartItemCount > 0 && (
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
                      <div className="cart-item-info">
                        <span className="cart-item-emoji">{item.image}</span>
                        <div className="cart-item-details">
                          <p className="cart-item-name">{item.name}</p>
                          <p className="cart-item-price">{item.price} x {item.quantity}</p>
                        </div>
                      </div>
                      <div className="cart-item-controls">
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
                        <button 
                          className="cart-remove-btn"
                          onClick={() => removeFromCart(item.id)}
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="cart-total">
                  <div className="total-line">
                    <span className="total-label">Tổng:</span>
                    <span className="total-amount">${cartTotal.toFixed(2)}</span>
                  </div>
                </div>
                
                <button className="checkout-btn">
                  <span className="btn-icon">💳</span>
                  Thanh toán
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
                    <span className="item-emoji">{item.image}</span>
                  </div>
                  <div className="item-details">
                    <div className="item-header">
                      <h3 className="item-name">{item.name}</h3>
                      <button className="favorite-btn">♡</button>
                    </div>
                    <p className="item-description">{item.description}</p>
                    <div className="item-footer">
                      <span className="item-price">{item.price}</span>
                      <div className="item-actions">
                        <button 
                          className="quantity-btn"
                          onClick={() => updateQuantity(item.id, getItemQuantity(item.id) - 1)}
                        >
                          -
                        </button>
                        <span className="quantity">{getItemQuantity(item.id)}</span>
                        <button 
                          className="quantity-btn"
                          onClick={() => updateQuantity(item.id, getItemQuantity(item.id) + 1)}
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