import React, { memo } from 'react';

const MenuItemCard = memo(({ 
  item, 
  itemQuantity, 
  onAddToCart, 
  onToppingSelect, 
  onQuantityChange,
  getItemPrice 
}) => {
  const isOutOfStock = item.stock <= 0;
  const isDrink = item.type === 'drink';

  return (
    <div className={`menu-card ${isOutOfStock ? 'out-of-stock' : ''}`}>
      <div className="card-image">
        {item.image && item.image.startsWith('http') ? (
          <img src={item.image} alt={item.name} />
        ) : (
          <span className="emoji-image">{item.image}</span>
        )}
        {isOutOfStock && <div className="out-of-stock-overlay">Hết hàng</div>}
      </div>

      <div className="card-content">
        <div className="card-header">
          <h3 className="card-title">{item.name}</h3>
          <span className="card-price">₫{getItemPrice(item.price).toLocaleString()}</span>
        </div>
        
        <p className="card-description">{item.description}</p>
        
        {item.stock > 0 && item.stock <= 5 && (
          <div className="low-stock-warning">
            Chỉ còn {item.stock} sản phẩm
          </div>
        )}

        {!isOutOfStock && (
          <div className="card-actions">
            <div className="quantity-selector">
              <button 
                type="button"
                className="qty-btn minus"
                onClick={() => onQuantityChange(item.id, Math.max(1, itemQuantity - 1))}
                disabled={itemQuantity <= 1}
              >
                -
              </button>
              <span className="qty-display">{itemQuantity}</span>
              <button 
                type="button"
                className="qty-btn plus"
                onClick={() => onQuantityChange(item.id, itemQuantity + 1)}
              >
                +
              </button>
            </div>

            <div className="add-to-cart-section">
              {isDrink ? (
                <div className="drink-actions">
                  <button 
                    className="add-btn secondary"
                    onClick={() => onAddToCart(item)}
                  >
                    Thêm ngay
                  </button>
                  <button 
                    className="add-btn primary"
                    onClick={() => onToppingSelect(item)}
                  >
                    + Topping
                  </button>
                </div>
              ) : (
                <button 
                  className="add-btn primary full-width"
                  onClick={() => onAddToCart(item)}
                >
                  Thêm vào giỏ
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

MenuItemCard.displayName = 'MenuItemCard';

export default MenuItemCard;