import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import orderService from '../services/orderService';
import paymentService from '../services/paymentService';
import loyaltyService from '../services/loyaltyService';
import '../css/CheckoutModal.css';
import '../css/VoucherSection.css';

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
  
  const [paymentMethod, setPaymentMethod] = useState('COD'); // 'COD', 'VNPAY', 'MOMO'
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false); // ✅ Prevent double submission
  
  // Voucher states
  const [availableVouchers, setAvailableVouchers] = useState([]);
  const [selectedVoucher, setSelectedVoucher] = useState(null);
  const [voucherDiscount, setVoucherDiscount] = useState(0);
  const [finalTotal, setFinalTotal] = useState(cartTotal);
  const [showVoucherSection, setShowVoucherSection] = useState(false);
  const [voucherLoading, setVoucherLoading] = useState(false);
  const [loyaltyPoints, setLoyaltyPoints] = useState(0);
  const [loyaltyLoading, setLoyaltyLoading] = useState(false);

  // Load available vouchers when modal opens
  useEffect(() => {
    if (isOpen && user) {
      loadAvailableVouchers();
    }
  }, [isOpen, user]);

  // Update final total when cart total or voucher changes
  useEffect(() => {
    calculateFinalTotal();
  }, [cartTotal, selectedVoucher]);

  const loadAvailableVouchers = async () => {
    try {
      setVoucherLoading(true);
      setLoyaltyLoading(true);
      
      // Load vouchers and loyalty points in parallel
      const [vouchers, pointsData] = await Promise.all([
        loyaltyService.getMyAvailableVouchers(),
        loyaltyService.getMyPoints().catch(() => ({ currentPoints: user?.rewardPoints || 0 }))
      ]);
      
      console.log('📊 Loaded vouchers and points:', { vouchers, pointsData });
      setAvailableVouchers(vouchers || []);
      setLoyaltyPoints(pointsData?.currentPoints ?? (user?.rewardPoints || 0));
      
      // 🎫 Auto-select voucher from Loyalty page navigation
      const preSelectedVoucher = sessionStorage.getItem('selectedVoucherForUse');
      if (preSelectedVoucher && vouchers) {
        try {
          const voucherFromStorage = JSON.parse(preSelectedVoucher);
          const matchingVoucher = vouchers.find(v => v.code === voucherFromStorage.code);
          if (matchingVoucher) {
            setSelectedVoucher(matchingVoucher);
            setShowVoucherSection(true); // Auto-expand voucher section
            console.log('🎯 Auto-selected voucher from Loyalty page:', matchingVoucher);
          }
          // Clear from sessionStorage after using
          sessionStorage.removeItem('selectedVoucherForUse');
        } catch (error) {
          console.warn('Could not parse selected voucher from storage:', error);
        }
      }
    } catch (error) {
      console.error('Error loading vouchers and points:', error);
      setAvailableVouchers([]);
      setLoyaltyPoints(user?.rewardPoints || 0);
    } finally {
      setVoucherLoading(false);
      setLoyaltyLoading(false);
    }
  };

  const calculateFinalTotal = () => {
    let total = cartTotal;
    let discount = 0;

    if (selectedVoucher) {
      discount = Math.round(cartTotal * selectedVoucher.discountValue);
      total = cartTotal - discount;
    }

    setVoucherDiscount(discount);
    setFinalTotal(Math.max(total, 0));
  };

  const handleVoucherSelect = (voucher) => {
    if (selectedVoucher?.code === voucher.code) {
      // Deselect if same voucher is clicked
      setSelectedVoucher(null);
    } else {
      setSelectedVoucher(voucher);
    }
  };

  // 🔍 Validate voucher trước khi submit order
  const validateSelectedVoucher = async () => {
    if (!selectedVoucher) return { isValid: true };
    
    try {
      const validation = await loyaltyService.validateVoucher(
        selectedVoucher.code, 
        cartTotal
      );
      
      if (!validation.isValid) {
        alert(`❌ Lỗi voucher: ${validation.message}`);
        setSelectedVoucher(null); // Clear invalid voucher
        return { isValid: false };
      }
      
      console.log('✅ Voucher validation successful:', validation);
      return { isValid: true, validation };
    } catch (error) {
      console.error('Voucher validation failed:', error);
      alert(`❌ Không thể kiểm tra voucher: ${error.message}`);
      setSelectedVoucher(null);
      return { isValid: false };
    }
  };

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
    if (!validateForm()) return;
    
    // ✅ Prevent double submission
    if (isSubmitting) {
      console.log('⚠️ Order submission already in progress, ignoring...');
      return;
    }
    
    // ✅ Validate cart không empty trước khi xử lý
    if (!cartItems || cartItems.length === 0) {
      alert('❌ Giỏ hàng trống! Vui lòng thêm sản phẩm vào giỏ hàng trước khi đặt hàng.');
      return;
    }
    
    // 🔍 Validate voucher if selected
    const voucherValidation = await validateSelectedVoucher();
    if (!voucherValidation.isValid) {
      return; // Stop submission if voucher invalid
    }
    
    console.log('🛍️ Starting order submission with cart items:', cartItems);
    setLoading(true);
    setIsSubmitting(true); // ✅ Mark as submitting
    
    try {
      // ...existing code...
      // ✅ Transform cart items to backend format với proper toppingIds
      console.log('📦 Transforming cart items for backend:', cartItems);
      
      let orderItems = cartItems.map(item => {
        // Use originalId (clean UUID from API) for backend
        let productId = item.originalId || item.productId;
        
        // Handle legacy ID format nếu có
        if (typeof productId === 'string' && productId.includes('-')) {
          const parts = productId.split('-');
          if (parts.length > 1 && (parts[0] === 'cake' || parts[0] === 'cakE' || parts[0] === 'drink' || parts[0] === 'toppings')) {
            productId = parts.slice(1).join('-');
          }
        }
        
        // Validate UUID
        if (typeof productId !== 'string' || !productId || productId.length < 30) {
          console.error('❌ Invalid product ID for item:', item);
          throw new Error(`Sản phẩm ${item.name} có ID UUID không hợp lệ: ${productId}`);
        }
        
        // ✅ Extract toppingIds từ selectedToppings
        const toppingIds = item.selectedToppings ? 
          item.selectedToppings.map(topping => {
            const toppingId = topping.originalId || topping.id;
            console.log('🧁 Processing topping:', { name: topping.name, id: toppingId });
            return toppingId;
          }).filter(id => id) : []; // Filter out undefined/null IDs
        
        const orderItem = {
          productId,
          productType: item.type === 'drink' ? 'Drink' : 'Cake',
          quantity: item.quantity,
          toppingIds
        };
        
        console.log('✅ Transformed order item:', orderItem);
        return orderItem;
      });
      
      // ✅ Validate không có duplicate productId
      const productIds = orderItems.map(item => item.productId);
      const uniqueProductIds = [...new Set(productIds)];
      
      if (productIds.length !== uniqueProductIds.length) {
        console.warn('⚠️ Detected duplicate product IDs in order:', productIds);
        // Keep unique items only
        const uniqueOrderItems = orderItems.filter((item, index, self) => 
          index === self.findIndex(t => 
            t.productId === item.productId && 
            JSON.stringify(t.toppingIds) === JSON.stringify(item.toppingIds)
          )
        );
        console.log('🔧 Deduplicated order items:', uniqueOrderItems);
        orderItems = uniqueOrderItems;
      }
      
      console.log('📦 Final order items for backend:', orderItems);
      // ✅ Create order request với unique identifier để tránh duplicate
      const uniqueClientId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const orderRequest = {
        items: orderItems,
        deliveryAddress: formData.address,
        deliveryPhone: formData.phoneNumber,
        deliveryNote: formData.notes || '',
        customerName: formData.customerName, // ✅ Add customer name
        customerEmail: formData.customerEmail, // ✅ Add customer email
        // Add unique identifier để backend có thể detect và prevent duplicate
        clientOrderId: uniqueClientId,
        requestTimestamp: new Date().toISOString(),
        paymentMethod: paymentMethod, // ✅ Đảm bảo payment method được gửi đến backend
        // ✅ Thêm voucher code nếu có
        voucherCode: selectedVoucher?.code || null,
        originalTotal: cartTotal,
        voucherDiscount: voucherDiscount,
        finalTotal: finalTotal
      };
      
      console.log('🚀 Final order request with unique client ID:', orderRequest);
      if (paymentMethod === 'VNPAY') {
        await handleVNPayPayment(orderRequest);
      } else if (paymentMethod === 'MOMO') {
        await handleMoMoPayment(orderRequest);
      } else {
        await handleCODOrder(orderRequest);
      }
    } catch (error) {
      let errorMessage = 'Có lỗi xảy ra khi xử lý đơn hàng. Vui lòng thử lại.';
      if (error.message) errorMessage = error.message;
      alert(`🚫 Xử lý đơn hàng thất bại!\n\n${errorMessage}`);
    } finally {
      setLoading(false);
      setIsSubmitting(false); // ✅ Reset submitting state
    }
  // hết hàm handleSubmitOrder
  };
  // Xử lý đặt hàng COD
  const handleCODOrder = async (orderRequest) => {
    console.log('🛒 Processing COD order with request:', orderRequest);
    
    try {
      // Call API
      const response = await orderService.createOrder(orderRequest);
      console.log('✅ COD Order created successfully:', response);
      
      // Extract order info với voucher fields
      const order = response.order || response;
      const orderId = order.id || order.orderId || 'N/A';
      const totalPrice = order.finalPrice || order.totalPrice || finalTotal; // ✅ Use finalPrice (after voucher)
      const status = order.status || 'Pending';
      
      // Voucher application info từ backend response
      const voucherApplied = response.voucherApplied || false;
      const appliedVoucherCode = response.appliedVoucherCode || selectedVoucher?.code || null;
      const discountAmount = response.discountAmount || voucherDiscount || 0;
      
      // Success callback
      if (onOrderSuccess) {
        onOrderSuccess({
          orderId,
          totalPrice,
          status,
          customerInfo: formData,
          items: cartItems,
          paymentMethod: 'COD',
          voucherApplied,
          appliedVoucherCode,
          discountAmount
        });
      }
      
      // ✅ Save order to localStorage with voucher info
      try {
        const orderHistory = JSON.parse(localStorage.getItem('orderHistory') || '[]');
        orderHistory.push({
          orderId,
          totalPrice: totalPrice,
          originalTotal: cartTotal,
          voucherCode: appliedVoucherCode || null,
          voucherDiscount: discountAmount,
          voucherApplied,
          status,
          paymentMethod: 'COD',
          customerName: formData.customerName,
          customerEmail: formData.customerEmail,
          createdAt: new Date().toISOString()
        });
        localStorage.setItem('orderHistory', JSON.stringify(orderHistory));
        console.log('✅ COD order saved to localStorage with voucher info');
      } catch (error) {
        console.warn('Warning: Could not save order to localStorage:', error);
      }
      
      // Clear cart and close modal
      clearCart();
      onClose();
      
      // Show success notification với voucher info
      const voucherInfo = voucherApplied && appliedVoucherCode ? 
        `\n🎫 Voucher: ${appliedVoucherCode} (-₫${discountAmount.toLocaleString()})` : '';
      
      alert(`🎉 Đặt hàng thành công!

📋 Mã đơn hàng: #${orderId}
👤 Khách hàng: ${formData.customerName}
📱 SĐT: ${formData.phoneNumber}
📍 Địa chỉ: ${formData.address}${voucherInfo}
💰 Tổng tiền: ₫${totalPrice.toLocaleString()}
📊 Trạng thái: ${status}
💵 Thanh toán: Thu tiền khi giao hàng (COD)

Cảm ơn bạn đã đặt hàng! Chúng tôi sẽ liên hệ sớm nhất.`);
      
    } catch (error) {
      console.error('❌ COD Order failed:', error);
      
      // Enhanced error logging for debugging
      if (error.response) {
        console.error('COD Error Response:', {
          status: error.response.status,
          data: error.response.data,
          headers: error.response.headers
        });
      }
      
      throw error; // Re-throw để handleSubmitOrder catch
    }
  };

  // Xử lý thanh toán VNPay
  const handleVNPayPayment = async (orderRequest) => {
    try {
      // ✅ Add small delay để tránh duplicate orderId collision
      await new Promise(resolve => setTimeout(resolve, 50));
      
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
      
      const paymentResponse = await paymentService.createVNPayPayment(orderId);
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

  // Xử lý thanh toán MoMo
  const handleMoMoPayment = async (orderRequest) => {
    try {
      // ✅ Add small delay để tránh duplicate orderId collision
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Bước 1: Tạo đơn hàng trước để có orderId
      console.log('📦 Creating order first for MoMo payment...');
      console.log('📦 Order request details:', JSON.stringify(orderRequest, null, 2));
      
      const orderResponse = await orderService.createOrder(orderRequest);
      console.log('✅ Order created for MoMo:', orderResponse);
      
      const order = orderResponse.order || orderResponse;
      const orderId = order.id || order.orderId;
      
      if (!orderId) {
        throw new Error('Không thể tạo mã đơn hàng');
      }
      
      // Bước 2: Tạo MoMo payment với orderId
      console.log('📱 Creating MoMo payment for order:', orderId);
      
      const paymentResponse = await paymentService.createMoMoPayment(orderId);
      console.log('✅ MoMo payment response:', paymentResponse);
      
      // Lưu thông tin order để xử lý sau khi thanh toán
      const orderData = {
        orderId: orderId,
        orderRequest,
        cartItems,
        cartTotal,
        customerInfo: formData,
        paymentMethod: 'MOMO',
        timestamp: new Date().toISOString()
      };
      
      localStorage.setItem('momoOrderData', JSON.stringify(orderData));
      
      // Clear cart và close modal trước khi redirect
      clearCart();
      onClose();
      
      // Redirect đến MoMo  
      if (paymentResponse.payUrl) {
        console.log('🚀 Redirecting to MoMo...');
        paymentService.redirectToMoMo(paymentResponse.payUrl);
      } else {
        throw new Error('Không nhận được URL thanh toán từ MoMo');
      }
      
    } catch (error) {
      console.error('❌ MoMo payment failed:', error);
      console.error('❌ MoMo error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      throw new Error(`Lỗi tạo thanh toán MoMo: ${error.message}`);
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
            <div className="total-breakdown">
              <div className="total-line">
                <span>Tổng tiền hàng:</span>
                <span>₫{cartTotal.toLocaleString()}</span>
              </div>
              {selectedVoucher && (
                <div className="total-line voucher-discount">
                  <span>Phiếu giảm giá ({selectedVoucher.code}):</span>
                  <span>-₫{voucherDiscount.toLocaleString()}</span>
                </div>
              )}
              <div className="total-line final-total">
                <strong>Tổng cộng: ₫{finalTotal.toLocaleString()}</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Voucher Section */}
        {user && (
          <div className="voucher-section">
            <div className="voucher-header" onClick={() => setShowVoucherSection(!showVoucherSection)}>
              <h3>
                🎟️ Voucher giảm giá 
                {!voucherLoading && (
                  <span className="voucher-count">({availableVouchers.length} khả dụng)</span>
                )}
              </h3>
              <button type="button" className={`voucher-toggle ${showVoucherSection ? 'expanded' : ''}`}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
            
            {showVoucherSection && (
              <div className="voucher-content">
                {voucherLoading ? (
                  <div className="voucher-loading">
                    <div className="loading-spinner"></div>
                    <span>Đang tải voucher và điểm thưởng...</span>
                  </div>
                ) : availableVouchers.length === 0 ? (
                  <div className="no-vouchers">
                    {/* Auto-reward notification cho user có ≥100 điểm */}
                    {loyaltyPoints >= 100 ? (
                      <div className="auto-reward-notice">
                        <div className="reward-icon">🎉</div>
                        <div className="reward-content">
                          <h4>Bạn sẽ nhận voucher tự động!</h4>
                          <p>Với <strong>{loyaltyPoints} điểm</strong> hiện có, bạn sẽ nhận voucher giảm giá 10% ngay sau khi hoàn thành đơn hàng này!</p>
                          <small className="reward-note">💫 Voucher sẽ tự động xuất hiện trong tài khoản của bạn</small>
                        </div>
                      </div>
                    ) : (
                      <div className="no-vouchers-content">
                        <div className="no-vouchers-icon">🎫</div>
                        <h4>Chưa có voucher khả dụng</h4>
                        <p>Bạn hiện có <strong>{loyaltyPoints} điểm</strong></p>
                        <div className="points-progress-mini">
                          <div className="progress-bar-mini">
                            <div 
                              className="progress-fill-mini" 
                              style={{ width: `${Math.min((loyaltyPoints % 100), 100)}%` }}
                            ></div>
                          </div>
                          <small>Còn {100 - (loyaltyPoints % 100)} điểm để nhận voucher tự động</small>
                        </div>
                        <div className="encouragement">
                          <small>💡 Mỗi đơn hàng này sẽ giúp bạn tích thêm điểm!</small>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    {/* Auto-reward notification khi có voucher và đủ điểm */}
                    {loyaltyPoints >= 100 && (
                      <div className="auto-reward-banner">
                        <span className="banner-icon">✨</span>
                        <span className="banner-text">
                          Bonus: Bạn sẽ nhận thêm voucher mới sau đơn hàng này!
                        </span>
                      </div>
                    )}
                    
                    <div className="vouchers-list">
                      {availableVouchers.map((voucher) => (
                        <div 
                          key={voucher.code} 
                          className={`voucher-item ${selectedVoucher?.code === voucher.code ? 'selected' : ''}`}
                          onClick={() => handleVoucherSelect(voucher)}
                        >
                          <div className="voucher-info">
                            <div className="voucher-discount">
                              Giảm {Math.round(voucher.discountValue * 100)}%
                            </div>
                            <div className="voucher-details">
                              <div className="voucher-code-section">
                                <span className="code-label">Mã voucher:</span>
                                <div className="code-display">
                                  <span className="code-value">{voucher.code}</span>
                                  <button 
                                    type="button"
                                    className="copy-code-btn"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      navigator.clipboard.writeText(voucher.code);
                                      // Tạm thời hiển thị copied feedback
                                      const btn = e.target;
                                      const originalText = btn.innerHTML;
                                      btn.innerHTML = '✓';
                                      btn.style.background = '#10B981';
                                      setTimeout(() => {
                                        btn.innerHTML = originalText;
                                        btn.style.background = '';
                                      }, 1500);
                                    }}
                                    title="Copy mã voucher"
                                  >
                                    📋
                                  </button>
                                </div>
                              </div>
                              <span className="voucher-expiry">
                                Hết hạn: {new Date(voucher.expirationDate).toLocaleDateString('vi-VN')}
                              </span>
                            </div>
                          </div>
                          <div className="voucher-action">
                            {selectedVoucher?.code === voucher.code ? (
                              <span className="selected-indicator">✓ Đã chọn</span>
                            ) : (
                              <button type="button" className="select-voucher-btn">
                                Chọn
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        )}

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

            <div className="payment-method">
              <input
                type="radio"
                id="momo"
                name="paymentMethod"
                value="MOMO"
                checked={paymentMethod === 'MOMO'}
                onChange={(e) => setPaymentMethod(e.target.value)}
              />
              <label htmlFor="momo" className="payment-method-label">
                <div className="payment-method-icon">📱</div>
                <div className="payment-method-info">
                  <span className="payment-method-name">Thanh toán MoMo</span>
                  <span className="payment-method-desc">Thanh toán qua ví MoMo (QR Code, Deep Link)</span>
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
             paymentMethod === 'VNPAY' ? '💳 Thanh toán VNPay' :
             paymentMethod === 'MOMO' ? '📱 Thanh toán MoMo' :
             '🛒 Đặt hàng ngay'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CheckoutModal;