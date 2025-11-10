import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import { useAuth } from '../contexts/AuthContext';
import orderService from '../services/orderService';
import '../css/Orders.css';

const Orders = () => {
  const { user, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState('all');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isAuthenticated) {
      fetchOrders();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      
      // Lấy order history từ localStorage trước (nhanh hơn)
      const orderHistory = JSON.parse(localStorage.getItem('orderHistory') || '[]');
      if (orderHistory.length > 0) {
        setOrders(orderHistory);
      }
      
      // TODO: Sau đó fetch từ API (khi có user orders endpoint)
      // const apiOrders = await orderService.getUserOrders();
      // setOrders(apiOrders);
      
      setLoading(false);
    } catch (error) {
      console.error('❌ Error fetching orders:', error);
      setError('Không thể tải danh sách đơn hàng');
      setLoading(false);
    }
  };

  // Mock order data
  const mockOrders = [
    {
      id: 'ORD-001',
      date: '2025-10-20',
      status: 'delivered',
      total: 25.50,
      items: [
        { name: 'Caramel Macchiato', quantity: 2, price: 8.50 },
        { name: 'Chocolate Croissant', quantity: 1, price: 8.50 }
      ]
    },
    {
      id: 'ORD-002',
      date: '2025-10-18',
      status: 'delivered',
      total: 15.75,
      items: [
        { name: 'Americano', quantity: 1, price: 6.25 },
        { name: 'Blueberry Muffin', quantity: 1, price: 9.50 }
      ]
    },
    {
      id: 'ORD-003',
      date: '2025-10-15',
      status: 'cancelled',
      total: 32.00,
      items: [
        { name: 'Cappuccino', quantity: 3, price: 7.50 },
        { name: 'Avocado Toast', quantity: 1, price: 9.50 }
      ]
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered': return 'success';
      case 'processing': return 'warning';
      case 'cancelled': return 'danger';
      default: return 'default';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'delivered': return 'Delivered';
      case 'processing': return 'Processing';
      case 'cancelled': return 'Cancelled';
      default: return status;
    }
  };

  const filteredOrders = mockOrders.filter(order => {
    if (activeTab === 'all') return true;
    return order.status === activeTab;
  });

  return (
    <div className="orders-page">
      <Header />
      
      <main className="orders-main">
        <div className="orders-container">
          <div className="orders-header">
            <h1 className="orders-title">Order History</h1>
            <p className="orders-subtitle">Track and manage all your coffee orders</p>
          </div>

          <div className="orders-tabs">
            <button 
              className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`}
              onClick={() => setActiveTab('all')}
            >
              All Orders
            </button>
            <button 
              className={`tab-btn ${activeTab === 'delivered' ? 'active' : ''}`}
              onClick={() => setActiveTab('delivered')}
            >
              Delivered
            </button>
            <button 
              className={`tab-btn ${activeTab === 'processing' ? 'active' : ''}`}
              onClick={() => setActiveTab('processing')}
            >
              Processing
            </button>
            <button 
              className={`tab-btn ${activeTab === 'cancelled' ? 'active' : ''}`}
              onClick={() => setActiveTab('cancelled')}
            >
              Cancelled
            </button>
          </div>

          <div className="orders-content">
            {filteredOrders.length > 0 ? (
              <div className="orders-list">
                {filteredOrders.map(order => (
                  <div key={order.id} className="order-card">
                    <div className="order-header">
                      <div className="order-info">
                        <h3 className="order-id">Order #{order.id}</h3>
                        <p className="order-date">{new Date(order.date).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}</p>
                      </div>
                      <div className="order-status">
                        <span className={`status-badge ${getStatusColor(order.status)}`}>
                          {getStatusText(order.status)}
                        </span>
                        <div className="order-total">${order.total.toFixed(2)}</div>
                      </div>
                    </div>

                    <div className="order-items">
                      {order.items.map((item, index) => (
                        <div key={index} className="order-item">
                          <div className="item-info">
                            <span className="item-name">{item.name}</span>
                            <span className="item-quantity">x{item.quantity}</span>
                          </div>
                          <span className="item-price">${item.price.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>

                    <div className="order-actions">
                      <button className="action-btn secondary">View Details</button>
                      {order.status === 'delivered' && (
                        <button className="action-btn primary">Reorder</button>
                      )}
                      {order.status === 'processing' && (
                        <button className="action-btn danger">Cancel Order</button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-icon">
                  <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
                    <path d="M16 4H18C19.1 4 20 4.9 20 6V18C20 19.1 19.1 20 18 20H6C4.9 20 4 19.1 4 18V6C4 4.9 4.9 4 6 4H8M16 4V2M8 4V2M8 4H16M8 10H16M8 14H13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <h3>No orders found</h3>
                <p>You haven't placed any orders yet. Start browsing our menu!</p>
                <button className="empty-action-btn">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Browse Menu
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Orders;