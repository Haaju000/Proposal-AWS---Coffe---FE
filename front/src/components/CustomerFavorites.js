import React from 'react';
import '../css/CustomerFavorites.css';

const CustomerFavorites = () => {
  const products = [
    {
      id: 1,
      name: 'Espresso',
      price: '$3.50',
      image: '☕', // Placeholder - in real app would be image URL
      description: 'Rich and bold coffee shot'
    },
    {
      id: 2,
      name: 'Latte',
      price: '$4.50',
      image: '🥛', // Placeholder - in real app would be image URL
      description: 'Creamy steamed milk with espresso'
    },
    {
      id: 3,
      name: 'Cappuccino',
      price: '$4.25',
      image: '☕', // Placeholder - in real app would be image URL
      description: 'Perfect balance of coffee and foam'
    },
    {
      id: 4,
      name: 'Fresh Pastries',
      price: '$2.99',
      image: '🥐', // Placeholder - in real app would be image URL
      description: 'Daily baked croissants and muffins'
    }
  ];

  return (
    <section className="customer-favorites">
      <div className="favorites-container">
        <div className="favorites-header">
          <h2 className="favorites-title">Customer Favorites</h2>
          <p className="favorites-subtitle">Try our most loved drinks and treats</p>
        </div>
        
        <div className="products-grid">
          {products.map((product) => (
            <div key={product.id} className="product-card">
              <div className="product-image">
                <span className="product-emoji">{product.image}</span>
                <div className="product-overlay">
                  <button className="add-to-cart-btn">Add to Cart</button>
                </div>
              </div>
              <div className="product-info">
                <h3 className="product-name">{product.name}</h3>
                <p className="product-description">{product.description}</p>
                <div className="product-price">{product.price}</div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="favorites-footer">
          <button className="view-menu-btn">View Full Menu</button>
        </div>
      </div>
    </section>
  );
};

export default CustomerFavorites;