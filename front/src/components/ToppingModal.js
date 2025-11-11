import React from 'react';
import '../css/ToppingModal.css';

const ToppingModal = ({ 
  isOpen, 
  onClose, 
  selectedDrink, 
  toppings, 
  selectedToppings, 
  onToggleTopping, 
  onConfirm,
  getItemQuantity 
}) => {
  if (!isOpen || !selectedDrink) return null;

  const toppingPrice = selectedToppings.reduce((sum, topping) => sum + topping.price, 0);
  const totalPrice = selectedDrink.price + toppingPrice;
  const quantity = getItemQuantity(selectedDrink.id);

  return (
    <div className="topping-modal-overlay" onClick={onClose}>
      <div className="topping-modal" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="topping-header">
          <div className="drink-info">
            <div className="drink-image">
              {selectedDrink.image && selectedDrink.image.startsWith('http') ? (
                <img src={selectedDrink.image} alt={selectedDrink.name} />
              ) : (
                <span className="emoji">{selectedDrink.image}</span>
              )}
            </div>
            <div className="drink-details">
              <h2>{selectedDrink.name}</h2>
              <p>Chọn topping cho đồ uống của bạn</p>
            </div>
          </div>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        {/* Toppings List */}
        <div className="toppings-content">
          <h3>Toppings có sẵn ({toppings.length})</h3>
          <div className="toppings-grid">
            {toppings.map((topping) => {
              const isSelected = selectedToppings.find(t => t.id === topping.id);
              return (
                <div 
                  key={topping.id} 
                  className={`topping-item ${isSelected ? 'selected' : ''}`}
                  onClick={() => onToggleTopping(topping)}
                >
                  <div className="topping-image">
                    {topping.image && topping.image.startsWith('http') ? (
                      <img src={topping.image} alt={topping.name} />
                    ) : (
                      <span className="emoji">{topping.image}</span>
                    )}
                  </div>
                  <div className="topping-info">
                    <h4>{topping.name}</h4>
                    <p className="topping-price">+₫{topping.price.toLocaleString()}</p>
                  </div>
                  <div className="topping-checkbox">
                    {isSelected ? '✅' : '⚪'}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Order Summary */}
        <div className="topping-summary">
          <div className="summary-row">
            <span>{selectedDrink.name} x{quantity}</span>
            <span>₫{(selectedDrink.price * quantity).toLocaleString()}</span>
          </div>
          {selectedToppings.map((topping) => (
            <div key={`summary-${topping.id}`} className="summary-row topping-row">
              <span>+ {topping.name} x{quantity}</span>
              <span>₫{(topping.price * quantity).toLocaleString()}</span>
            </div>
          ))}
          <div className="summary-total">
            <span>Tổng cộng:</span>
            <span>₫{(totalPrice * quantity).toLocaleString()}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="topping-actions">
          <button className="btn btn-secondary" onClick={onClose}>
            Hủy bỏ
          </button>
          <button className="btn btn-primary" onClick={onConfirm}>
            Thêm vào giỏ • ₫{(totalPrice * quantity).toLocaleString()}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ToppingModal;