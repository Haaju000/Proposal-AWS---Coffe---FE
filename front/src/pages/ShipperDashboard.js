import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/Header';
import '../css/ShipperDashboard.css';

const ShipperDashboard = () => {
  const { user } = useAuth();
  const [deliveryStats, setDeliveryStats] = useState({
    totalDeliveries: 156,
    completedToday: 8,
    pendingOrders: 5,
    totalEarnings: 2450000
  });

  const [recentOrders, setRecentOrders] = useState([
    {
      id: '#ORD-001',
      customerName: 'Nguyễn Văn A',
      address: '123 Lê Lợi, Q1, TP.HCM',
      status: 'Đang giao',
      time: '10:30 AM',
      amount: 125000,
      distance: '2.5km'
    },
    {
      id: '#ORD-002', 
      customerName: 'Trần Thị B',
      address: '456 Nguyễn Huệ, Q1, TP.HCM',
      status: 'Chờ lấy hàng',
      time: '11:15 AM',
      amount: 89000,
      distance: '1.8km'
    },
    {
      id: '#ORD-003',
      customerName: 'Lê Văn C', 
      address: '789 Pasteur, Q3, TP.HCM',
      status: 'Hoàn thành',
      time: '09:45 AM',
      amount: 156000,
      distance: '3.2km'
    }
  ]);

  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'new_order',
      message: 'Bạn có đơn hàng mới cần giao tại Q1',
      time: '5 phút trước',
      isRead: false
    },
    {
      id: 2,
      type: 'payment',
      message: 'Bạn đã nhận được 125,000₫ từ đơn #ORD-001',
      time: '15 phút trước',
      isRead: false
    }
  ]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Chào buổi sáng';
    if (hour < 18) return 'Chào buổi chiều';
    return 'Chào buổi tối';
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'Đang giao': return 'status-delivering';
      case 'Chờ lấy hàng': return 'status-pending';
      case 'Hoàn thành': return 'status-completed';
      default: return '';
    }
  };

  return (
    <div className="shipper-dashboard">
      <Header />
      
      <main className="shipper-main">
        {/* Welcome Section */}
        <section className="welcome-section">
          <div className="welcome-content">
            <div className="welcome-text">
              <h1>{getGreeting()}, {user?.username?.split('@')[0] || 'Shipper'}!</h1>
              <p>Hôm nay là ngày tuyệt vời để giao hàng. Bạn đã sẵn sàng chưa?</p>
            </div>
            <div className="welcome-avatar">
              <div className="avatar-circle">
                🚴‍♂️
              </div>
              <div className="status-indicator online"></div>
            </div>
          </div>
        </section>

        <div className="dashboard-container">
          {/* Stats Overview */}
          <section className="stats-section">
            <div className="stats-grid">
              <div className="stat-card primary">
                <div className="stat-icon">📦</div>
                <div className="stat-content">
                  <h3>{deliveryStats.totalDeliveries}</h3>
                  <p>Tổng đơn giao</p>
                </div>
                <div className="stat-trend up">+12%</div>
              </div>
              
              <div className="stat-card success">
                <div className="stat-icon">✅</div>
                <div className="stat-content">
                  <h3>{deliveryStats.completedToday}</h3>
                  <p>Hoàn thành hôm nay</p>
                </div>
                <div className="stat-trend up">+5</div>
              </div>
              
              <div className="stat-card warning">
                <div className="stat-icon">⏳</div>
                <div className="stat-content">
                  <h3>{deliveryStats.pendingOrders}</h3>
                  <p>Đang chờ giao</p>
                </div>
                <div className="stat-trend neutral">-2</div>
              </div>
              
              <div className="stat-card earnings">
                <div className="stat-icon">💰</div>
                <div className="stat-content">
                  <h3>{deliveryStats.totalEarnings.toLocaleString()}₫</h3>
                  <p>Thu nhập tháng này</p>
                </div>
                <div className="stat-trend up">+8%</div>
              </div>
            </div>
          </section>

          {/* Main Content Grid */}
          <div className="content-grid">
            {/* Recent Orders */}
            <section className="orders-section">
              <div className="section-header">
                <h2>📋 Đơn hàng gần đây</h2>
                <button className="btn-secondary">Xem tất cả</button>
              </div>
              
              <div className="orders-list">
                {recentOrders.map((order) => (
                  <div key={order.id} className="order-card">
                    <div className="order-header">
                      <div className="order-id">{order.id}</div>
                      <span className={`order-status ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </div>
                    
                    <div className="order-customer">
                      <div className="customer-info">
                        <h4>{order.customerName}</h4>
                        <p>📍 {order.address}</p>
                      </div>
                    </div>
                    
                    <div className="order-details">
                      <div className="detail-item">
                        <span className="detail-label">Thời gian:</span>
                        <span className="detail-value">{order.time}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Khoảng cách:</span>
                        <span className="detail-value">{order.distance}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Giá trị:</span>
                        <span className="detail-value amount">{order.amount.toLocaleString()}₫</span>
                      </div>
                    </div>
                    
                    <div className="order-actions">
                      {order.status === 'Chờ lấy hàng' && (
                        <button className="btn-primary">Nhận đơn</button>
                      )}
                      {order.status === 'Đang giao' && (
                        <button className="btn-success">Hoàn thành</button>
                      )}
                      {order.status === 'Hoàn thành' && (
                        <button className="btn-ghost">Xem chi tiết</button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Notifications & Quick Actions */}
            <section className="sidebar-section">
              {/* Notifications */}
              <div className="notifications-card">
                <div className="section-header">
                  <h3>🔔 Thông báo</h3>
                  <span className="notification-count">{notifications.filter(n => !n.isRead).length}</span>
                </div>
                
                <div className="notifications-list">
                  {notifications.map((notification) => (
                    <div key={notification.id} className={`notification-item ${!notification.isRead ? 'unread' : ''}`}>
                      <div className="notification-content">
                        <p>{notification.message}</p>
                        <span className="notification-time">{notification.time}</span>
                      </div>
                      {!notification.isRead && <div className="unread-dot"></div>}
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="quick-actions-card">
                <h3>⚡ Thao tác nhanh</h3>
                <div className="quick-actions-grid">
                  <button className="quick-action-btn">
                    <span className="action-icon">🗺️</span>
                    <span>Xem bản đồ</span>
                  </button>
                  <button className="quick-action-btn">
                    <span className="action-icon">📞</span>
                    <span>Hỗ trợ</span>
                  </button>
                  <button className="quick-action-btn">
                    <span className="action-icon">⚙️</span>
                    <span>Cài đặt</span>
                  </button>
                  <button className="quick-action-btn">
                    <span className="action-icon">📊</span>
                    <span>Báo cáo</span>
                  </button>
                </div>
              </div>

              {/* Performance Card */}
              <div className="performance-card">
                <h3>🏆 Hiệu suất tuần này</h3>
                <div className="performance-metrics">
                  <div className="metric-item">
                    <div className="metric-circle">
                      <span>4.8</span>
                    </div>
                    <p>Đánh giá trung bình</p>
                  </div>
                  <div className="metric-item">
                    <div className="metric-circle">
                      <span>98%</span>
                    </div>
                    <p>Tỉ lệ giao thành công</p>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ShipperDashboard;