import React, { useState, useEffect } from 'react';
import PaymentButton from '../components/PaymentButton';
import orderService from '../services/orderService';
import drinkService from '../services/drinkService';
import cakeService from '../services/cakeService';
import '../css/Orders.css';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statistics, setStatistics] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all');
  const [error, setError] = useState(null);
  const [drinks, setDrinks] = useState([]);
  const [cakes, setCakes] = useState([]);

  useEffect(() => {
    loadOrders();
    loadProductData();
  }, []);

  const loadProductData = async () => {
    try {
      const [drinksData, cakesData] = await Promise.all([
        drinkService.getAllDrinks(),
        cakeService.getAllCakes()
      ]);
      setDrinks(drinksData || []);
      setCakes(cakesData || []);
      console.log('✅ Product data loaded for images:', { drinks: drinksData?.length, cakes: cakesData?.length });
    } catch (error) {
      console.error('❌ Error loading product data:', error);
      // Không set error vì đây không critical
    }
  };

  const loadOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // ✅ Sử dụng endpoint my-orders mới
      const response = await orderService.getMyOrderHistory();
      console.log('Loaded order history from API:', response);
      
      if (response && response.orders) {
        setOrders(response.orders);
        setStatistics(response.statistics);
        console.log('Order statistics:', response.statistics);
      } else {
        setOrders([]);
        setStatistics(null);
      }
      
    } catch (error) {
      console.error('Load orders error:', error);
      setError(error.message || 'Không thể tải lịch sử đơn hàng');
      
      // Handle specific errors
      if (error.message.includes('403') || error.message.includes('Forbidden')) {
        setError('Bạn không có quyền truy cập thông tin đơn hàng');
      } else if (error.message.includes('401') || error.message.includes('Unauthorized')) {
        setError('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
      }
      
      setOrders([]);
      setStatistics(null);
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

  // 🖼️ Helper function to get product image
  const getProductImage = (productId, productType) => {
    try {
      if (productType === 'Drink') {
        const drink = drinks.find(d => d.id === productId);
        return drink?.imageUrl || '☕';
      } else if (productType === 'Cake') {
        const cake = cakes.find(c => c.id === productId);
        return cake?.imageUrl || '🧁';
      }
      return '🍽️';
    } catch (error) {
      console.error('Error getting product image:', error);
      return productType === 'Drink' ? '☕' : '🧁';
    }
  };

  // 🖼️ Helper function to render product image
  const renderProductImage = (imageUrl, productName) => {
    if (imageUrl && imageUrl.startsWith('http')) {
      return <img src={imageUrl} alt={productName} className="product-image" />;
    } else {
      return <span className="product-emoji">{imageUrl}</span>;
    }
  };

  // 📏 Filter orders by status
  const getFilteredOrders = () => {
    if (activeFilter === 'all') return orders;
    return orders.filter(order => {
      switch (activeFilter) {
        case 'pending': return order.status === 'Pending';
        case 'processing': return ['Processing', 'Confirmed', 'Shipping'].includes(order.status);
        case 'completed': return ['Delivered', 'Completed'].includes(order.status);
        case 'cancelled': return order.status === 'Cancelled';
        default: return true;
      }
    });
  };

  // 🔄 Handle reorder action
  const handleReorder = (order) => {
    // Navigate to menu with reorder info
    window.location.href = `/menu?reorder=${order.orderId}`;
  };

  // ❌ Handle cancel order action
  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Bạn có chắc chắn muốn hủy đơn hàng này?')) return;
    
    try {
      // Call cancel API (need to implement in orderService)
      // await orderService.cancelOrder(orderId);
      alert('Tính năng hủy đơn hàng đang được phát triển');
      // loadOrders(); // Reload after cancel
    } catch (error) {
      console.error('Cancel order error:', error);
      alert(`Lỗi hủy đơn hàng: ${error.message}`);
    }
  };

  if (loading) {
    return (
      <div className="orders-container">
        <div className="loading-container">
          <div className="coffee-loader">
            <div className="coffee-cup">☕</div>
            <p>Đang tải lịch sử đơn hàng...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="orders-container">
        <div className="error-container">
          <div className="error-icon">❌</div>
          <h3>Lỗi tải dữ liệu</h3>
          <p>{error}</p>
          <button className="btn-retry" onClick={loadOrders}>
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  const filteredOrders = getFilteredOrders();

  return (
    <div className="orders-container">
      <div className="orders-header">
        <div className="orders-header-top">
          <button className="btn-back" onClick={() => window.history.back()}>
            ← Quay lại
          </button>
        </div>
        <h1 className="orders-title">
          <span className="coffee-icon">☕</span>
          Lịch sử đơn hàng
        </h1>
        <p className="orders-subtitle">Theo dõi hành trình cà phê của bạn</p>
      </div>

      {/* 📊 Statistics Dashboard */}
      {statistics && (
        <div className="order-stats">
          <div className="stats-grid">
            <div className="stat-card total">
              <div className="stat-icon">📋</div>
              <div className="stat-info">
                <div className="stat-number">{statistics.pendingOrders + statistics.processingOrders + statistics.confirmedOrders + statistics.shippingOrders + statistics.deliveredOrders + statistics.completedOrders + statistics.cancelledOrders}</div>
                <div className="stat-label">Tổng đơn hàng</div>
              </div>
            </div>
            
            <div className="stat-card completed">
              <div className="stat-icon">✅</div>
              <div className="stat-info">
                <div className="stat-number">{statistics.completedOrders}</div>
                <div className="stat-label">Hoàn thành</div>
              </div>
            </div>
            
            <div className="stat-card processing">
              <div className="stat-icon">⏳</div>
              <div className="stat-info">
                <div className="stat-number">{statistics.processingOrders + statistics.confirmedOrders + statistics.shippingOrders}</div>
                <div className="stat-label">Đang xử lý</div>
              </div>
            </div>
            
            <div className="stat-card spent">
              <div className="stat-icon">💰</div>
              <div className="stat-info">
                <div className="stat-number">{statistics.totalSpent?.toLocaleString('vi-VN') || '0'}₫</div>
                <div className="stat-label">Tổng chi tiêu</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 🗂 Status Filters */}
      <div className="order-filters">
        <button 
          className={`filter-btn ${activeFilter === 'all' ? 'active' : ''}`}
          onClick={() => setActiveFilter('all')}
        >
          Tất cả ({orders.length})
        </button>
        <button 
          className={`filter-btn ${activeFilter === 'pending' ? 'active' : ''}`}
          onClick={() => setActiveFilter('pending')}
        >
          Chờ thanh toán ({statistics?.pendingOrders || 0})
        </button>
        <button 
          className={`filter-btn ${activeFilter === 'processing' ? 'active' : ''}`}
          onClick={() => setActiveFilter('processing')}
        >
          Đang xử lý ({(statistics?.processingOrders || 0) + (statistics?.confirmedOrders || 0) + (statistics?.shippingOrders || 0)})
        </button>
        <button 
          className={`filter-btn ${activeFilter === 'completed' ? 'active' : ''}`}
          onClick={() => setActiveFilter('completed')}
        >
          Hoàn thành ({(statistics?.deliveredOrders || 0) + (statistics?.completedOrders || 0)})
        </button>
        <button 
          className={`filter-btn ${activeFilter === 'cancelled' ? 'active' : ''}`}
          onClick={() => setActiveFilter('cancelled')}
        >
          Đã hủy ({statistics?.cancelledOrders || 0})
        </button>
      </div>
      
      {filteredOrders.length === 0 ? (
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
                  {order.statusDisplay || getStatusText(order.status)}
                </div>
              </div>

              {/* Order Details */}
              <div className="order-details">
                {/* Delivery Info */}
                {order.deliveryAddress && (
                  <div className="detail-row">
                    <span className="detail-label">📍 Địa chỉ:</span>
                    <span className="detail-value">{order.deliveryAddress}</span>
                  </div>
                )}
                
                {order.deliveryPhone && (
                  <div className="detail-row">
                    <span className="detail-label">📞 Liên hệ:</span>
                    <span className="detail-value">{order.deliveryPhone}</span>
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
                      <span className="detail-label">🎫 Phiếu giảm giá:</span>
                      <span className="detail-value voucher-code">{order.appliedVoucherCode}</span>
                    </div>
                  )}
                  
                  {order.discountAmount > 0 && (
                    <div className="detail-row discount-row">
                      <span className="detail-label">🔥 Tiềt kiệm:</span>
                      <span className="detail-value discount-amount">-{order.discountAmount.toLocaleString('vi-VN')} VNĐ</span>
                    </div>
                  )}
                  
                  <div className="detail-row final-price-row">
                    <span className="detail-label">💳 Thành tiền:</span>
                    <span className="detail-value final-price">
                      {order.finalPrice ? order.finalPrice.toLocaleString('vi-VN') : '0'} VNĐ
                    </span>
                  </div>
                </div>

                {/* Timeline Information */}
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
                <h4 className="items-title">🛍️ Chi tiết đơn hàng ({order.itemCount} món)</h4>
                <div className="items-list">
                  {order.items && Array.isArray(order.items) && order.items.length > 0 ? 
                    order.items.map((item, index) => {
                      const productImage = getProductImage(item.productId, item.productType);
                      
                      return (
                        <div key={index} className="item-card-new">
                          {/* Product Image */}
                          <div className="item-image-container">
                            {renderProductImage(productImage, item.productName)}
                          </div>
                          
                          {/* Product Info */}
                          <div className="item-info-container">
                            <div className="item-main-info">
                              <div className="item-name-row">
                                <span className="item-name-new">
                                  {item.productName || item.name || 'Sản phẩm'}
                                </span>
                                <span className="item-quantity-badge">x{item.quantity || 1}</span>
                              </div>
                              
                              <div className="item-price-row">
                                <span className="item-unit-price">
                                  {item.unitPrice?.toLocaleString('vi-VN') || '0'}₫/món
                                </span>
                                <span className="item-total-price">
                                  = {item.totalPrice?.toLocaleString('vi-VN') || '0'}₫
                                </span>
                              </div>
                            </div>
                            
                            {/* Toppings */}
                            {item.toppings && Array.isArray(item.toppings) && item.toppings.length > 0 && (
                              <div className="item-toppings-new">
                                <span className="toppings-label">🍦 Topping:</span>
                                <div className="toppings-grid">
                                  {item.toppings.map((topping, tIndex) => (
                                    <div key={tIndex} className="topping-chip">
                                      <span className="topping-name">{topping.name || topping.toppingName || 'Topping'}</span>
                                      {topping.price && (
                                        <span className="topping-price">+{topping.price.toLocaleString('vi-VN')}₫</span>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    }) : (
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

              {/* 🎨 Action Buttons */}
              <div className="action-buttons">
                {order.canCancel && (
                  <button 
                    className="btn-action cancel" 
                    onClick={() => handleCancelOrder(order.orderId)}
                  >
                    ❌ Hủy đơn
                  </button>
                )}
                
                {order.canReorder && (
                  <button 
                    className="btn-action reorder" 
                    onClick={() => handleReorder(order)}
                  >
                    🔄 Đặt lại
                  </button>
                )}
                
                {order.canRate && (
                  <button 
                    className="btn-action rate" 
                    onClick={() => alert('Tính năng đánh giá đang phát triển!')}
                  >
                    ⭐ Đánh giá
                  </button>
                )}
              </div>
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