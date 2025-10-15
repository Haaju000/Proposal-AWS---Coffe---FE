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
        description: 'Rich, bold, and perfectly extracted shot of pure coffee',
        price: '$3.50',
        category: 'Espresso',
        image: '☕'
      },
      {
        id: 2,
        name: 'Double Espresso',
        description: 'Double the intensity, double the satisfaction',
        price: '$4.50',
        category: 'Espresso',
        image: '☕'
      },
      {
        id: 3,
        name: 'Americano',
        description: 'Smooth espresso with hot water for a lighter taste',
        price: '$3.75',
        category: 'Espresso',
        image: '☕'
      },
      {
        id: 4,
        name: 'Latte',
        description: 'Creamy steamed milk with espresso and beautiful latte art',
        price: '$4.50',
        category: 'Latte',
        image: '🥛'
      },
      {
        id: 5,
        name: 'Caramel Latte',
        description: 'Sweet caramel flavor combined with rich espresso and steamed milk',
        price: '$5.00',
        category: 'Latte',
        image: '🥛'
      },
      {
        id: 6,
        name: 'Vanilla Latte',
        description: 'Smooth vanilla flavor with perfectly steamed milk',
        price: '$5.00',
        category: 'Latte',
        image: '🥛'
      },
      {
        id: 7,
        name: 'Cappuccino',
        description: 'Traditional Italian favorite with thick foam',
        price: '$4.25',
        category: 'Cappuccino',
        image: '☕'
      },
      {
        id: 8,
        name: 'Mocha Cappuccino',
        description: 'Cappuccino with rich chocolate and thick foam',
        price: '$4.75',
        category: 'Cappuccino',
        image: '☕'
      }
    ],
    pastries: [
      {
        id: 9,
        name: 'Croissant',
        description: 'Buttery, flaky French pastry baked fresh daily',
        price: '$2.99',
        category: 'Pastries',
        image: '🥐'
      },
      {
        id: 10,
        name: 'Chocolate Muffin',
        description: 'Rich chocolate muffin with chocolate chips',
        price: '$3.50',
        category: 'Pastries',
        image: '🧁'
      },
      {
        id: 11,
        name: 'Almond Danish',
        description: 'Sweet pastry with almond cream filling',
        price: '$3.75',
        category: 'Pastries',
        image: '🥐'
      }
    ]
  };

  const allItems = [...menuData.coffee, ...menuData.pastries];
  
  const filterItems = (category) => {
    if (category === 'All') return allItems;
    return allItems.filter(item => item.category === category);
  };

  const filteredItems = filterItems(activeFilter);

  const categories = ['All', 'Espresso', 'Latte', 'Cappuccino', 'Pastries'];

  return (
    <div className="menu-page">
      <Header />
      
      <main className="menu-main">
        <div className="menu-container">
          {/* Sidebar */}
          <aside className="menu-sidebar">
            <div className="sidebar-header">
              <h2 className="sidebar-title">Our Menu</h2>
            </div>
            
            {/* Category Navigation */}
            <nav className="menu-categories">
              {categories.map((category) => (
                <button
                  key={category}
                  className={`category-btn ${activeFilter === category ? 'active' : ''}`}
                  onClick={() => setActiveFilter(category)}
                >
                  <span className="category-icon">
                    {category === 'All' && '🍽️'}
                    {category === 'Espresso' && '☕'}
                    {category === 'Latte' && '🥛'}
                    {category === 'Cappuccino' && '☕'}
                    {category === 'Pastries' && '🥐'}
                  </span>
                  {category}
                </button>
              ))}
            </nav>

            {/* Online Ordering Options */}
            <div className="sidebar-actions">
              <button className="action-btn primary">
                <span className="btn-icon">🛒</span>
                Order Online
              </button>
              <button className="action-btn secondary">
                <span className="btn-icon">📋</span>
                Make a Reservation
              </button>
            </div>

            {/* Cart Summary */}
            {cartItemCount > 0 && (
              <div className="cart-summary">
                <div className="cart-header">
                  <h3 className="cart-title">
                    <span className="cart-icon">🛒</span>
                    Your Order ({cartItemCount} {cartItemCount === 1 ? 'item' : 'items'})
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
                    <span className="total-label">Total:</span>
                    <span className="total-amount">${cartTotal.toFixed(2)}</span>
                  </div>
                </div>
                
                <button className="checkout-btn">
                  <span className="btn-icon">💳</span>
                  Proceed to Checkout
                </button>
              </div>
            )}

          </aside>

          {/* Main Content Area */}
          <div className="menu-content">
            {/* Category Header */}
            <div className="category-header">
              <h1 className="category-title">{activeFilter}</h1>
              <p className="category-subtitle">
                {activeFilter === 'All' ? 'Explore our complete menu selection' : 
                 activeFilter === 'Espresso' ? 'Bold and rich espresso-based drinks' :
                 activeFilter === 'Latte' ? 'Creamy milk-based coffee beverages' :
                 activeFilter === 'Cappuccino' ? 'Traditional Italian coffee classics' :
                 'Fresh baked pastries and treats'}
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
                          Add to Cart
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