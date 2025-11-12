import React, { useState, useEffect } from 'react';
import PaymentButton from '../components/PaymentButton';
import orderService from '../services/orderService';
import '../css/Orders.css';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const userOrders = await orderService.getUserOrders();
      console.log('Loaded orders from API:', userOrders);
      console.log('Orders structure:', userOrders?.map(o => ({
        orderId: o?.orderId,
        status: o?.status,
        finalPrice: o?.finalPrice,
        items: o?.items?.length || 0
      })));
      setOrders(userOrders || []);
    } catch (error) {
      console.error('Load orders error:', error);
      
      // Handle specific errors
      if (error.message.includes('403') || error.message.includes('Forbidden')) {
        // User role doesn't have permission to access GET /Order (Admin only)
        console.log('User does not have admin permissions to view all orders');
        setOrders([]);
        // Could show a message here that user orders are not available
      } else if (error.message.includes('401') || error.message.includes('Unauthorized')) {
        // Token expired or invalid
        console.log('User not authorized - token may be expired');
        setOrders([]);
        // Could redirect to login here
      } else {
        // Other errors (network, server, etc.)
        console.log('API error, no orders available');
        setOrders([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = (orderId) => {
    console.log('Payment initiated for order:', orderId);
    // PaymentButton sẽ tự redirect, không cần làm gì thêm
  };

  const handlePaymentError = (error) => {
    alert(`Lỗi thanh toán: ${error}`);
  };

  if (loading) {
    return (
      <div className="orders-container">
        <div className="loading-container">
          <div className="coffee-loader">
            <div className="coffee-cup">☕</div>
            <p>Đang tải đơn hàng của bạn...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="orders-container">
      <div className="orders-header">
        <h1 className="orders-title">
          <span className="coffee-icon">☕</span>
          Đơn hàng của tôi
        </h1>
        <p className="orders-subtitle">Theo dõi hành trình cà phê của bạn</p>
      </div>
      
      {orders.length === 0 ? (
        <div className="empty-orders">
          <div className="empty-icon">📋</div>
          <h3>Chưa có đơn hàng nào</h3>
          <p>Hãy khám phá menu và đặt ly cà phê đầu tiên của bạn!</p>
          <button className="btn-explore" onClick={() => window.location.href = '/menu'}>
            Khám phá Menu
          </button>
        </div>
      ) : (
        <div className="orders-grid">
          {orders.map(order => (
            <div key={order.orderId || Math.random()} className="order-card">
              {/* Order Header */}
              <div className="order-header">
                <div className="order-info">
                  <h3 className="order-id">
                    #{order.orderId ? order.orderId.slice(-8).toUpperCase() : 'N/A'}
                  </h3>
                  <p className="order-date">
                    {order.createdAt ? new Date(order.createdAt).toLocaleDateString('vi-VN', {
                      day: '2-digit',
                      month: '2-digit', 
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    }) : 'N/A'}
                  </p>
                </div>
                <div className={`status-badge status-${order.status?.toLowerCase() || 'unknown'}`}>
                  <span className="status-dot"></span>
                  {getStatusText(order.status)}
                </div>
              </div>

              {/* Order Details */}
              <div className="order-details">
                {/* User ID */}
                {order.userId && (
                  <div className="detail-row">
                    <span className="detail-label">👤 Khách hàng:</span>
                    <span className="detail-value">{order.userId.slice(-8).toUpperCase()}</span>
                  </div>
                )}

                {/* Price Information */}
                <div className="price-section">
                  {order.totalPrice && order.totalPrice !== order.finalPrice && (
                    <div className="detail-row">
                      <span className="detail-label">💰 Tổng tiền gốc:</span>
                      <span className="detail-value original-price">
                        {order.totalPrice.toLocaleString('vi-VN')} VNĐ
                      </span>
                    </div>
                  )}
                  
                  {order.appliedVoucherCode && (
                    <div className="detail-row voucher-row">
                      <span className="detail-label">🎫 Mã giảm giá:</span>
                      <span className="detail-value voucher-code">{order.appliedVoucherCode}</span>
                    </div>
                  )}
                  
                  <div className="detail-row final-price-row">
                    <span className="detail-label">💳 Thành tiền:</span>
                    <span className="detail-value final-price">
                      {order.finalPrice ? order.finalPrice.toLocaleString('vi-VN') : '0'} VNĐ
                    </span>
                  </div>
                </div>

                {/* Completion Time */}
                {order.completedAt && (
                  <div className="detail-row">
                    <span className="detail-label">✅ Hoàn thành:</span>
                    <span className="detail-value">
                      {new Date(order.completedAt).toLocaleDateString('vi-VN', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                )}
              </div>

              {/* Items List */}
              <div className="items-section">
                <h4 className="items-title">🛍️ Chi tiết đơn hàng</h4>
                <div className="items-list">
                  {order.items && Array.isArray(order.items) && order.items.length > 0 ? 
                    order.items.map((item, index) => (
                      <div key={index} className="item-card">
                        <div className="item-info">
                          <div className="item-header">
                            <span className="item-name">
                              {item.productName || item.name || 'Sản phẩm'}
                            </span>
                            <span className="item-quantity">x{item.quantity || 1}</span>
                          </div>
                          
                          {item.unitPrice && (
                            <div className="item-price">
                              {item.unitPrice.toLocaleString('vi-VN')} VNĐ/món
                            </div>
                          )}
                          
                          {item.toppings && Array.isArray(item.toppings) && item.toppings.length > 0 && (
                            <div className="item-toppings">
                              <span className="toppings-label">Topping:</span>
                              {item.toppings.map((topping, tIndex) => (
                                <span key={tIndex} className="topping-tag">
                                  {topping.name || topping.toppingName || 'Topping'}
                                  {topping.price && ` (+${topping.price.toLocaleString('vi-VN')}₫)`}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )) : (
                      <div className="no-items">
                        <p>Không có thông tin chi tiết sản phẩm</p>
                      </div>
                    )
                  }
                </div>
              </div>

              {/* Payment Button for Pending Orders */}
              {order.status === 'Pending' && order.orderId && order.finalPrice && (
                <div className="payment-section">
                  <PaymentButton 
                    orderId={order.orderId}
                    amount={order.finalPrice}
                    onSuccess={() => handlePaymentSuccess(order.orderId)}
                    onError={handlePaymentError}
                    className="payment-btn-full"
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Helper functions
const getStatusText = (status) => {
  const statusMap = {
    'Pending': 'Chờ thanh toán',
    'Processing': 'Đang pha chế',
    'Completed': 'Hoàn thành',
    'Cancelled': 'Đã hủy'
  };
  return statusMap[status] || status;
};

export default Orders;