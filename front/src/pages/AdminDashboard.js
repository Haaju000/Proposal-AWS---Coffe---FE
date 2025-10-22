import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import '../css/AdminDashboard.css';

const AdminDashboard = () => {
  const [activeSection, setActiveSection] = useState('overview');
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const menuItems = [
    {
      id: 'overview',
      label: 'Tổng quan',
      
      description: 'Dashboard tổng quan'
    },
    {
      id: 'products',
      label: 'Quản lý sản phẩm',
      
      description: 'Thêm, sửa, xóa sản phẩm'
    },
    {
      id: 'orders',
      label: 'Quản lý đơn hàng',
      
      description: 'Xem và xử lý đơn hàng'
    },
    {
      id: 'customers',
      label: 'Quản lý tài khoản shipper, khách hàng',
      
      description: 'Quản lý người dùng'
    },
    {
      id: 'promotions',
      label: 'Quản lý chương trình tích điểm & voucher',
      description: 'Khuyến mãi và tích điểm'
    }
  ];

  const renderContent = () => {
    switch (activeSection) {
      case 'overview':
        return <OverviewContent />;
      case 'products':
        return <ProductsContent />;
      case 'orders':
        return <OrdersContent />;
      case 'customers':
        return <CustomersContent />;
      case 'promotions':
        return <PromotionsContent />;
      default:
        return <OverviewContent />;
    }
  };

  return (
    <div className="admin-dashboard">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="sidebar-header">
          <div className="admin-logo">
            <span className="logo-icon">☕</span>
            <span className="logo-text">Admin Panel</span>
          </div>
          <div className="admin-info">
            <div className="admin-avatar">👤</div>
            <div className="admin-details">
              <p className="admin-name">Admin</p>
              <p className="admin-role">{user?.username || 'Administrator'}</p>
            </div>
          </div>
        </div>

        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <button
              key={item.id}
              className={`nav-item ${activeSection === item.id ? 'active' : ''}`}
              onClick={() => setActiveSection(item.id)}
            >
              <span className="nav-icon">{item.icon}</span>
              <div className="nav-content">
                <span className="nav-label">{item.label}</span>
                <span className="nav-description">{item.description}</span>
              </div>
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button className="logout-btn" onClick={handleLogout}>
            <span className="logout-icon">🚪</span>
            Đăng xuất
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        <header className="admin-header">
          <h1 className="page-title">
            {menuItems.find(item => item.id === activeSection)?.label}
          </h1>
          <div className="header-actions">
            <Link to="/" className="view-site-btn">
              <span className="btn-icon">🌐</span>
              Xem trang web
            </Link>
          </div>
        </header>

        <div className="admin-content">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

// Content Components
const OverviewContent = () => (
  <div className="overview-content">
    <div className="stats-grid">
      <div className="stat-card">
        <div className="stat-icon">📊</div>
        <div className="stat-info">
          <h3>Tổng doanh thu</h3>
          <p className="stat-value">₫2,450,000</p>
          <span className="stat-change positive">+12.5%</span>
        </div>
      </div>
      <div className="stat-card">
        <div className="stat-icon">📋</div>
        <div className="stat-info">
          <h3>Đơn hàng hôm nay</h3>
          <p className="stat-value">45</p>
          <span className="stat-change positive">+5</span>
        </div>
      </div>
      <div className="stat-card">
        <div className="stat-icon">☕</div>
        <div className="stat-info">
          <h3>Sản phẩm</h3>
          <p className="stat-value">28</p>
          <span className="stat-change">Hoạt động</span>
        </div>
      </div>
      <div className="stat-card">
        <div className="stat-icon">👥</div>
        <div className="stat-info">
          <h3>Khách hàng</h3>
          <p className="stat-value">234</p>
          <span className="stat-change positive">+8 mới</span>
        </div>
      </div>
    </div>

    <div className="recent-activities">
      <h3>Hoạt động gần đây</h3>
      <div className="activity-list">
        <div className="activity-item">
          <span className="activity-icon">📋</span>
          <div className="activity-info">
            <p>Đơn hàng #001 đã được tạo</p>
            <small>5 phút trước</small>
          </div>
        </div>
        <div className="activity-item">
          <span className="activity-icon">☕</span>
          <div className="activity-info">
            <p>Sản phẩm "Latte" đã được cập nhật</p>
            <small>10 phút trước</small>
          </div>
        </div>
        <div className="activity-item">
          <span className="activity-icon">👥</span>
          <div className="activity-info">
            <p>Khách hàng mới đăng ký</p>
            <small>15 phút trước</small>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const ProductsContent = () => (
  <div className="products-content">
    <div className="content-header">
      <h2>Quản lý sản phẩm</h2>
      <button className="add-btn">
        <span className="btn-icon">➕</span>
        Thêm sản phẩm mới
      </button>
    </div>
    <div className="products-grid">
      <div className="product-card">
        <div className="product-image">☕</div>
        <h3>Espresso</h3>
        <p className="product-price">₫65,000</p>
        <div className="product-actions">
          <button className="edit-btn">✏️ Sửa</button>
          <button className="delete-btn">🗑️ Xóa</button>
        </div>
      </div>
      <div className="product-card">
        <div className="product-image">🥛</div>
        <h3>Latte</h3>
        <p className="product-price">₫75,000</p>
        <div className="product-actions">
          <button className="edit-btn">✏️ Sửa</button>
          <button className="delete-btn">🗑️ Xóa</button>
        </div>
      </div>
    </div>
  </div>
);

const OrdersContent = () => (
  <div className="orders-content">
    <div className="content-header">
      <h2>Quản lý đơn hàng</h2>
      <div className="filter-tabs">
        <button className="tab active">Tất cả</button>
        <button className="tab">Chờ xử lý</button>
        <button className="tab">Đang giao</button>
        <button className="tab">Hoàn thành</button>
      </div>
    </div>
    <div className="orders-table">
      <table>
        <thead>
          <tr>
            <th>Mã đơn</th>
            <th>Khách hàng</th>
            <th>Sản phẩm</th>
            <th>Tổng tiền</th>
            <th>Trạng thái</th>
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>#001</td>
            <td>Nguyễn Văn A</td>
            <td>Latte x2, Espresso x1</td>
            <td>₫215,000</td>
            <td><span className="status pending">Chờ xử lý</span></td>
            <td>
              <button className="action-btn">👁️ Xem</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
);

const CustomersContent = () => (
  <div className="customers-content">
    <div className="content-header">
      <h2>Quản lý tài khoản</h2>
      <div className="user-tabs">
        <button className="tab active">Khách hàng</button>
        <button className="tab">Shipper</button>
      </div>
    </div>
    <div className="customers-table">
      <table>
        <thead>
          <tr>
            <th>Tên</th>
            <th>Email</th>
            <th>Số điện thoại</th>
            <th>Loại tài khoản</th>
            <th>Trạng thái</th>
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Nguyễn Văn A</td>
            <td>nguyenvana@email.com</td>
            <td>0123456789</td>
            <td>Khách hàng</td>
            <td><span className="status active">Hoạt động</span></td>
            <td>
              <button className="action-btn">✏️ Sửa</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
);

const PromotionsContent = () => (
  <div className="promotions-content">
    <div className="content-header">
      <h2>Chương trình khuyến mãi</h2>
      <button className="add-btn">
        <span className="btn-icon">➕</span>
        Tạo chương trình mới
      </button>
    </div>
    <div className="promotions-grid">
      <div className="promotion-card">
        <div className="promotion-header">
          <h3>Tích điểm thành viên</h3>
          <span className="promotion-status active">Đang chạy</span>
        </div>
        <p>Tích 1 điểm cho mỗi 10,000₫</p>
        <div className="promotion-actions">
          <button className="edit-btn">✏️ Chỉnh sửa</button>
          <button className="toggle-btn">⏸️ Tạm dừng</button>
        </div>
      </div>
      <div className="promotion-card">
        <div className="promotion-header">
          <h3>Voucher giảm giá</h3>
          <span className="promotion-status inactive">Chưa kích hoạt</span>
        </div>
        <p>Giảm 20% cho đơn hàng từ 200,000₫</p>
        <div className="promotion-actions">
          <button className="edit-btn">✏️ Chỉnh sửa</button>
          <button className="toggle-btn">▶️ Kích hoạt</button>
        </div>
      </div>
    </div>
  </div>
);

export default AdminDashboard;