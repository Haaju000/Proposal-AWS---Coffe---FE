import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import orderService from '../services/orderService';
import paymentService from '../services/paymentService';
import '../css/CheckoutModal.css';

const CheckoutModal = ({ isOpen, onClose, onOrderSuccess }) => {
  const { user } = useAuth();
  const { cartItems, cartTotal, clearCart, getItemPrice, getItemTotalPrice } = useCart();
  
  const [formData, setFormData] = useState({
    customerName: user?.username || '',
    customerEmail: user?.email || user?.username || '',
    phoneNumber: '',
    address: '',
    notes: ''
  });
  
  const [paymentMethod, setPaymentMethod] = useState('COD'); // 'COD' hoặc 'VNPAY'
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.customerName.trim()) {
      newErrors.customerName = 'Vui lòng nhập tên khách hàng';
    }
    
    if (!formData.customerEmail.trim()) {
      newErrors.customerEmail = 'Vui lòng nhập email';
    } else if (!/\S+@\S+\.\S+/.test(formData.customerEmail)) {
      newErrors.customerEmail = 'Email không hợp lệ';
    }
    
    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Vui lòng nhập số điện thoại';
    } else if (!/^[0-9]{10,11}$/.test(formData.phoneNumber.replace(/\s/g, ''))) {
      newErrors.phoneNumber = 'Số điện thoại không hợp lệ';
    }
    
    if (!formData.address.trim()) {
      newErrors.address = 'Vui lòng nhập địa chỉ giao hàng';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmitOrder = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      console.log('🛒 Starting checkout with form data:', formData);
      console.log('� Payment method:', paymentMethod);
      console.log('�📦 Cart items:', cartItems);

      // Validate cart items trước khi đặt hàng
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

      // Transform cart items to backend format
      const orderItems = cartItems.map(item => ({
        productId: String(item.originalId),
        productType: item.type === 'drink' ? 'Drink' : 'Cake',
        quantity: item.quantity,
        toppingIds: []
      }));

      // Create order request với thông tin khách hàng
      const orderRequest = {
        items: orderItems,
        customerInfo: {
          name: formData.customerName,
          email: formData.customerEmail,
          phone: formData.phoneNumber,
          address: formData.address,
          notes: formData.notes || ''
        }
      };

      console.log('📤 Order request:', orderRequest);

      if (paymentMethod === 'VNPAY') {
        // Xử lý thanh toán VNPay
        await handleVNPayPayment(orderRequest);
      } else {
        // Xử lý đặt hàng COD (Cash on Delivery)
        await handleCODOrder(orderRequest);
      }
      
    } catch (error) {
      console.error('❌ Order processing failed:', error);
      
      let errorMessage = 'Có lỗi xảy ra khi xử lý đơn hàng. Vui lòng thử lại.';
      
      if (error.message) {
        if (error.message.includes('Not enough stock')) {
          errorMessage = '❌ Một số sản phẩm đã hết hàng. Vui lòng kiểm tra lại giỏ hàng.';
        } else if (error.message.includes('Cannot identify user')) {
          errorMessage = '🔐 Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.';
        } else {
          errorMessage = error.message;
        }
      }
      
      alert(`🚫 Xử lý đơn hàng thất bại!\n\n${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  // Xử lý đặt hàng COD
  const handleCODOrder = async (orderRequest) => {
    // Call API
    const response = await orderService.createOrder(orderRequest);
    console.log('✅ COD Order created successfully:', response);
    
    // Extract order info
    const order = response.order || response;
    const orderId = order.id || order.orderId || 'N/A';
    const totalPrice = order.totalPrice || order.finalPrice || cartTotal;
    const status = order.status || 'Pending';
    
    // Success callback
    if (onOrderSuccess) {
      onOrderSuccess({
        orderId,
        totalPrice,
        status,
        customerInfo: formData,
        items: cartItems
      });
    }
    
    // Clear cart and close modal
    clearCart();
    onClose();
    
    // Show success notification
    alert(`🎉 Đặt hàng thành công!

📋 Mã đơn hàng: #${orderId}
👤 Khách hàng: ${formData.customerName}
📱 SĐT: ${formData.phoneNumber}
📍 Địa chỉ: ${formData.address}
💰 Tổng tiền: ₫${totalPrice.toLocaleString()}
📊 Trạng thái: ${status}
💵 Thanh toán: Thu tiền khi giao hàng (COD)

Cảm ơn bạn đã đặt hàng! Chúng tôi sẽ liên hệ sớm nhất.`);
  };

  // Xử lý thanh toán VNPay
  const handleVNPayPayment = async (orderRequest) => {
    try {
      // Bước 1: Tạo đơn hàng trước để có orderId
      console.log('📦 Creating order first for VNPay payment...');
      const orderResponse = await orderService.createOrder(orderRequest);
      console.log('✅ Order created for VNPay:', orderResponse);
      
      const order = orderResponse.order || orderResponse;
      const orderId = order.id || order.orderId;
      
      if (!orderId) {
        throw new Error('Không thể tạo mã đơn hàng');
      }
      
      // Bước 2: Tạo VNPay payment URL với orderId
      console.log('💳 Creating VNPay payment URL for order:', orderId);
      const returnUrl = `${window.location.origin}/payment-result`;
      
      const paymentResponse = await paymentService.createVNPayPayment(orderId, returnUrl);
      console.log('✅ VNPay payment response:', paymentResponse);
      
      // Lưu thông tin order để xử lý sau khi thanh toán
      const orderData = {
        orderId: orderId,
        orderRequest,
        cartItems,
        cartTotal,
        customerInfo: formData,
        paymentMethod: 'VNPAY',
        timestamp: new Date().toISOString()
      };
      
      localStorage.setItem('vnpayOrderData', JSON.stringify(orderData));
      
      // Clear cart và close modal trước khi redirect
      clearCart();
      onClose();
      
      // Redirect đến VNPay
      if (paymentResponse.paymentUrl) {
        console.log('🚀 Redirecting to VNPay...');
        paymentService.redirectToVNPay(paymentResponse.paymentUrl);
      } else {
        throw new Error('Không nhận được URL thanh toán từ VNPay');
      }
      
    } catch (error) {
      console.error('❌ VNPay payment failed:', error);
      throw new Error(`Lỗi tạo thanh toán VNPay: ${error.message}`);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="checkout-modal-overlay" onClick={onClose}>
      <div className="checkout-modal" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="checkout-header">
          <h2>🛒 Thông tin đặt hàng</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        {/* Order Summary */}
        <div className="order-summary">
          <h3>📦 Đơn hàng của bạn ({cartItems.length} món)</h3>
          <div className="order-items">
            {cartItems.map((item) => (
              <div key={item.id} className="checkout-cart-item">
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
                  <div className="checkout-item-toppings">
                    {item.selectedToppings.map((topping, index) => (
                      <div key={index} className="checkout-topping-item">
                        <span className="checkout-topping-name">+ {topping.name} x1</span>
                        <span className="checkout-topping-price">₫{getItemPrice(topping.price).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                )}
                
                
                {/* Dòng 3: Số lượng hiện tại */}
                <div className="item-line-3">
                  <span className="qty">Số lượng: {item.quantity}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="order-total">
            <strong>Tổng cộng: ₫{cartTotal.toLocaleString()}</strong>
          </div>
        </div>

        {/* Customer Form */}
        <div className="customer-form">
          <h3>👤 Thông tin khách hàng</h3>
          
          <div className="form-group">
            <label htmlFor="customerName">Họ và tên *</label>
            <input
              type="text"
              id="customerName"
              name="customerName"
              value={formData.customerName}
              onChange={handleInputChange}
              className={errors.customerName ? 'error' : ''}
              placeholder="Nhập họ và tên"
            />
            {errors.customerName && <span className="error-text">{errors.customerName}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="customerEmail">Email *</label>
            <input
              type="email"
              id="customerEmail"
              name="customerEmail"
              value={formData.customerEmail}
              onChange={handleInputChange}
              className={errors.customerEmail ? 'error' : ''}
              placeholder="Nhập email"
            />
            {errors.customerEmail && <span className="error-text">{errors.customerEmail}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="phoneNumber">Số điện thoại *</label>
            <input
              type="tel"
              id="phoneNumber"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleInputChange}
              className={errors.phoneNumber ? 'error' : ''}
              placeholder="Nhập số điện thoại"
            />
            {errors.phoneNumber && <span className="error-text">{errors.phoneNumber}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="address">Địa chỉ giao hàng *</label>
            <textarea
              id="address"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              className={errors.address ? 'error' : ''}
              placeholder="Nhập địa chỉ giao hàng chi tiết"
              rows="3"
            />
            {errors.address && <span className="error-text">{errors.address}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="notes">Ghi chú (tùy chọn)</label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              placeholder="Ghi chú thêm cho đơn hàng (tùy chọn)"
              rows="2"
            />
          </div>
        </div>

        {/* Payment Method Selection */}
        <div className="payment-method-section">
          <h3>💳 Phương thức thanh toán</h3>
          <div className="payment-methods">
            <div className="payment-method">
              <input
                type="radio"
                id="cod"
                name="paymentMethod"
                value="COD"
                checked={paymentMethod === 'COD'}
                onChange={(e) => setPaymentMethod(e.target.value)}
              />
              <label htmlFor="cod" className="payment-method-label">
                <div className="payment-method-icon">💵</div>
                <div className="payment-method-info">
                  <span className="payment-method-name">Thu tiền khi giao hàng (COD)</span>
                  <span className="payment-method-desc">Thanh toán bằng tiền mặt khi nhận hàng</span>
                </div>
              </label>
            </div>
            
            <div className="payment-method">
              <input
                type="radio"
                id="vnpay"
                name="paymentMethod"
                value="VNPAY"
                checked={paymentMethod === 'VNPAY'}
                onChange={(e) => setPaymentMethod(e.target.value)}
              />
              <label htmlFor="vnpay" className="payment-method-label">
                <div className="payment-method-icon">💳</div>
                <div className="payment-method-info">
                  <span className="payment-method-name">Thanh toán VNPay</span>
                  <span className="payment-method-desc">Thanh toán online qua VNPay (ATM, Visa, MasterCard)</span>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="checkout-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Hủy bỏ
          </button>
          <button 
            className="btn btn-primary"
            onClick={handleSubmitOrder}
            disabled={loading || cartItems.length === 0}
          >
            {loading ? '🔄 Đang xử lý...' : 
             paymentMethod === 'VNPAY' ? '💳 Thanh toán VNPay' : '🛒 Đặt hàng ngay'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CheckoutModal;