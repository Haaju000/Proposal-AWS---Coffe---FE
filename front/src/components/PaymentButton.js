import React, { useState } from 'react';
import paymentService from '../services/paymentService';
import orderService from '../services/orderService';

const PaymentButton = ({
    // Menu flow props
    cartItems,
    cartTotal,
    isAuthenticated,
    onOrderSuccess,
    // Orders flow props
    orderId,
    amount,
    onSuccess,
    onError,
    // Common props
    disabled = false,
    className = "",
    style = {}
}) => {
    const [loading, setLoading] = useState(false);

    const handleVNPayPayment = async () => {
  const isMenuFlow = cartItems && cartTotal !== undefined;
  const isOrdersFlow = orderId && amount !== undefined;

  if (isMenuFlow) {
    if (!isAuthenticated) {
      alert('Vui lòng đăng nhập để đặt hàng');
      return;
    }

    if (!cartItems || cartItems.length === 0) {
      alert('Giỏ hàng trống!');
      return;
    }

    let orderData = null; // Declare outside try block
    
    try {
      setLoading(true);
      
      console.log('=== Creating order from cart ===');
      console.log('Cart items:', cartItems);
      
      // ✅ Validate cart items structure
      if (!Array.isArray(cartItems)) {
        throw new Error('Cart items is not an array');
      }
      
      orderData = {
        items: cartItems.map((item, index) => {
          console.log(`\n--- Processing cart item ${index + 1} ---`);
          console.log('Cart item:', item);
          
          // ✅ Validate item structure
          if (!item || !item.id) {
            throw new Error(`Cart item ${index + 1} is invalid`);
          }
          
          // ✅ Sử dụng productId đã được normalize từ CartContext
          const productId = item.productId || item.originalId || item.id;
          
          if (!productId) {
            throw new Error(`Cannot determine productId for item: ${item.name}`);
          }
          
          // ✅ Determine productType
          let productType = 'Cake'; // Default
          if (item.type) {
            productType = item.type.charAt(0).toUpperCase() + item.type.slice(1).toLowerCase();
          } else if (item.category) {
            productType = item.category.charAt(0).toUpperCase() + item.category.slice(1).toLowerCase();
          }
          
          // ✅ Process toppings - check multiple possible structures
          let toppingIds = [];
          if (Array.isArray(item.toppings)) {
            toppingIds = item.toppings.map(topping => topping.id || topping.originalId).filter(id => id);
          } else if (Array.isArray(item.selectedToppings)) {
            toppingIds = item.selectedToppings.map(topping => topping.id || topping.originalId).filter(id => id);
          } else if (Array.isArray(item.toppingIds)) {
            toppingIds = item.toppingIds.filter(id => id);
          }
          
          const processedItem = {
            productId: productId,        // ✅ Clean ID: "drink-001", "cake-001"
            productType: productType,    // ✅ "Drink" hoặc "Cake"
            quantity: Number(item.quantity) || 1,
            toppingIds: toppingIds
          };
          
          console.log('Processed item for API:', processedItem);
          return processedItem;
        })
      };

      console.log('\n=== Final order data for API ===');
      console.log(JSON.stringify(orderData, null, 2));
      
      // ✅ Enhanced validation
      if (!orderData.items || orderData.items.length === 0) {
        throw new Error('Giỏ hàng không có sản phẩm nào');
      }
      
      // Validate productIds
      for (const item of orderData.items) {
        if (!item.productId) {
          console.error('Missing productId:', item);
          throw new Error('Sản phẩm thiếu ID');
        }
        
        if (item.productId.length < 3) {
          console.error('Invalid productId format:', item);
          throw new Error(`ID sản phẩm không hợp lệ: ${item.productId}`);
        }
      }
      
      // Create order
      console.log('🚀 Calling orderService.createOrder...');
      const orderResponse = await orderService.createOrder(orderData);
      console.log('✅ Order response:', orderResponse);
      
      // Extract orderId from response
      let newOrderId;
      if (orderResponse.order?.orderId) {
        newOrderId = orderResponse.order.orderId;
      } else if (orderResponse.orderId) {
        newOrderId = orderResponse.orderId;
      } else {
        console.error('No orderId in response:', orderResponse);
        throw new Error('Backend không trả về orderId');
      }

      console.log('✅ Order created with ID:', newOrderId);

      // Create VNPay payment
      const paymentRequest = {
        orderId: newOrderId,
        returnUrl: `${window.location.origin}/payment-result`
      };
      
      console.log('🚀 Creating VNPay payment:', paymentRequest);
      
      const paymentResponse = await paymentService.createVNPayPayment(paymentRequest);
      
      if (paymentResponse.success && paymentResponse.paymentUrl) {
        console.log('✅ VNPay URL created:', paymentResponse.paymentUrl);
        
        // Save for later
        localStorage.setItem('pendingPaymentOrderId', newOrderId);
        localStorage.setItem('pendingPaymentAmount', cartTotal.toString());
        
        // ✅ Save to order history for getUserOrders
        const orderHistory = JSON.parse(localStorage.getItem('orderHistory') || '[]');
        const orderHistoryItem = {
          orderId: newOrderId,
          finalPrice: cartTotal,
          createdAt: new Date().toISOString(),
          status: 'Pending' // Will be updated after payment
        };
        
        // Add to beginning of array (newest first)
        orderHistory.unshift(orderHistoryItem);
        
        // Keep only last 50 orders to prevent localStorage bloat
        if (orderHistory.length > 50) {
          orderHistory.splice(50);
        }
        
        localStorage.setItem('orderHistory', JSON.stringify(orderHistory));
        console.log('✅ Order saved to history:', orderHistoryItem);
        
        // ✅ Call onOrderSuccess với đầy đủ data
        if (onOrderSuccess) {
          try {
            onOrderSuccess({
              orderId: newOrderId,
              id: newOrderId, // Fallback
              totalPrice: cartTotal,
              finalPrice: orderResponse.order?.finalPrice || cartTotal,
              status: orderResponse.order?.status || 'Pending',
              items: cartItems, // ✅ Pass full cart items
              customerInfo: {
                email: localStorage.getItem('userEmail') || '',
                phone: localStorage.getItem('userPhone') || '',
                address: localStorage.getItem('userAddress') || ''
              },
              orderResponse: orderResponse // For debugging
            });
          } catch (callbackError) {
            console.error('❌ Error in onOrderSuccess callback:', callbackError);
            // Don't throw - continue with redirect
          }
        }
        
        // Redirect to VNPay
        window.location.href = paymentResponse.paymentUrl;
        
      } else {
        throw new Error(paymentResponse.message || 'Không thể tạo URL thanh toán');
      }
      
    } catch (error) {
      console.error('❌ Payment initiation error:', error);
      
      // Show detailed error in console for debugging
      console.group('❌ Payment Error Details');
      console.error('Original error:', error);
      console.error('Cart items:', cartItems);
      
        console.error('Order data:', orderData);
      
      console.groupEnd();
      
      let errorMessage = 'Có lỗi xảy ra khi tạo thanh toán';
      
      // Specific error handling
      if (error.message.includes('401') || error.message.includes('Unauthorized')) {
        errorMessage = 'Vui lòng đăng nhập lại';
      } else if (error.message.includes('400') || error.message.includes('Bad Request')) {
        errorMessage = 'Dữ liệu không hợp lệ. Vui lòng kiểm tra giỏ hàng';
      } else if (error.message.includes('not found')) {
        errorMessage = 'Một số sản phẩm không còn tồn tại';
      } else if (error.message.includes('stock')) {
        errorMessage = 'Một số sản phẩm đã hết hàng';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      alert(`Lỗi: ${errorMessage}`);
    } finally {
      setLoading(false);
    }

        } else if (isOrdersFlow) {
            // Orders flow - thanh toán order có sẵn
            try {
                setLoading(true);

                const paymentRequest = {
                    orderId: orderId,
                    returnUrl: `${window.location.origin}/payment-result`
                };

                const response = await paymentService.createVNPayPayment(paymentRequest);

                if (response.success && response.paymentUrl) {
                    localStorage.setItem('pendingPaymentOrderId', orderId);
                    localStorage.setItem('pendingPaymentAmount', amount.toString());
                    window.location.href = response.paymentUrl;
                    onSuccess?.(response);
                } else {
                    throw new Error(response.message || 'Không thể tạo URL thanh toán');
                }

            } catch (error) {
                console.error('Payment error:', error);
                onError?.(error.message);
            } finally {
                setLoading(false);
            }
        }
    };

    // Rest of component...
    const defaultStyle = {
        backgroundColor: '#1976d2',
        color: 'white',
        padding: '12px 24px',
        border: 'none',
        borderRadius: '8px',
        fontSize: '16px',
        fontWeight: 'bold',
        cursor: (loading || disabled) ? 'not-allowed' : 'pointer',
        opacity: (loading || disabled) ? 0.6 : 1,
        minWidth: '200px',
        transition: 'all 0.3s ease',
        ...style
    };

    return (
        <>
            <button
                onClick={handleVNPayPayment}
                disabled={loading || disabled || (cartItems && cartItems.length === 0)}
                className={`vnpay-payment-button ${className}`}
                style={defaultStyle}
                onMouseOver={(e) => !loading && !disabled && (e.target.style.backgroundColor = '#1565c0')}
                onMouseOut={(e) => !loading && !disabled && (e.target.style.backgroundColor = '#1976d2')}
            >
                {loading ? (
                    <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{
                            marginRight: '8px',
                            width: '16px',
                            height: '16px',
                            border: '2px solid #ffffff',
                            borderTop: '2px solid transparent',
                            borderRadius: '50%',
                            animation: 'spin 1s linear infinite'
                        }}></span>
                        Đang xử lý...
                    </span>
                ) : (
                    `💳 THANH TOÁN ${cartTotal ? cartTotal.toLocaleString('vi-VN') + ' VNĐ' :
                        amount ? amount.toLocaleString('vi-VN') + ' VNĐ' : ''
                    }`
                )}
            </button>

            <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
        </>
    );
};

export default PaymentButton;