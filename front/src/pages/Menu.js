import React, { useState } from 'react';
import Header from '../components/Header';
import '../css/Menu.css';

const Menu = () => {
  const [activeFilter, setActiveFilter] = useState('All');

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
          {/* Menu Header */}
          <div className="menu-header">
            <h1 className="menu-title">Our Menu</h1>
            <p className="menu-subtitle">
              Explore our carefully crafted selection of artisan coffee and fresh pastries
            </p>
          </div>

          {/* Filter Tabs */}
          <div className="menu-filters">
            {categories.map((category) => (
              <button
                key={category}
                className={`filter-btn ${activeFilter === category ? 'active' : ''}`}
                onClick={() => setActiveFilter(category)}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Menu Grid */}
          <div className="menu-grid">
            {filteredItems.map((item) => (
              <div key={item.id} className="menu-item">
                <div className="item-image">
                  <span className="item-emoji">{item.image}</span>
                  <div className="item-overlay">
                    <button className="add-to-cart-btn">
                      <span className="cart-icon">+</span>
                      Add to Cart
                    </button>
                  </div>
                </div>
                <div className="item-content">
                  <h3 className="item-name">{item.name}</h3>
                  <p className="item-description">{item.description}</p>
                  <div className="item-footer">
                    <span className="item-price">{item.price}</span>
                    <button className="quick-add-btn">
                      <span className="cart-icon">+</span>
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Section */}
          <div className="order-section">
            <div className="order-content">
              <h2 className="order-title">Ready to Order?</h2>
              <p className="order-subtitle">View your selections and proceed to checkout</p>
              <button className="view-cart-btn">
                <span className="cart-icon">🛒</span>
                View Cart
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Menu;