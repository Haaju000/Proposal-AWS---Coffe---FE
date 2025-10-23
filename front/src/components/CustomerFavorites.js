import React from 'react';
import '../css/CustomerFavorites.css';

const CustomerFavorites = () => {
  const products = [
    {
      id: 1,
      name: 'Espresso',
      price: '$3.50',
      image: '☕',
      description: 'Cà phê đậm đà'
    },
    {
      id: 2,
      name: 'Latte',
      price: '$4.50',
      image: '🥛',
      description: 'Sữa hấp kem mịn kết hợp espresso'
    },
    {
      id: 3,
      name: 'Cappuccino',
      price: '$4.25',
      image: '☕',
      description: 'Cân bằng hoàn hảo giữa cà phê và bọt sữa'
    },
    {
      id: 4,
      name: 'Bánh ngọt tươi',
      price: '$2.99',
      image: '🥐',
      description: 'Bánh sừng bò và muffin nướng hàng ngày'
    }
  ];

  return (
    <section className="customer-favorites">
      <div className="favorites-container">
        <div className="favorites-header">
          <h2 className="favorites-title">Món được yêu thích nhất</h2>
          <p className="favorites-subtitle">Thử các đồ uống và món ăn được yêu thích</p>
        </div>
        
        <div className="products-grid">
          {products.map((product) => (
            <div key={product.id} className="product-card">
              <div className="product-image">
                <span className="product-emoji">{product.image}</span>
                <div className="product-overlay">
                  <button className="add-to-cart-btn">Thêm vào giỏ</button>
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
          <button className="view-menu-btn">Xem toàn bộ thực đơn</button>
        </div>
      </div>
    </section>
  );
};

export default CustomerFavorites;