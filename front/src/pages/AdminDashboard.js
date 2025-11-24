import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import cakeService from '../services/cakeService';
import drinkService from '../services/drinkService';
import toppingService from '../services/toppingService';
import orderService from '../services/orderService';
import customerService from '../services/customerService';
import shipperService from '../services/shipperService';
import '../css/AdminDashboard-new.css';

// React Icons
import { 
  FiHome, 
  FiPackage, 
  FiShoppingBag, 
  FiUsers, 
  FiTrendingUp, 
  FiSettings, 
  FiLogOut,
  FiPlus,
  FiSearch,
  FiFilter,
  FiEdit3,
  FiTrash2,
  FiCoffee,
  FiBox, // Icon cho bánh
  FiEye,
  FiGlobe,
  FiStar, // Icon cho topping
  FiTruck, // Icon cho shipper
  FiCheck,
  FiX,
  FiLock,
  FiKey,
  FiClock, // Icon cho chờ phê duyệt
  
} from 'react-icons/fi';

// Material Design Icons cho bánh và topping
import { MdCake } from 'react-icons/md';

const AdminDashboard = () => {
  const [activeSection, setActiveSection] = useState('overview');
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  // Notification system state
  const [notifications, setNotifications] = useState([]);
  
  // Confirmation modal state
  const [confirmModal, setConfirmModal] = useState(null);

  // Shared data states for overview
  const [sharedData, setSharedData] = useState({
    products: [],
    orders: [],
    customers: [],
    shippers: [],
    pendingShippers: []
  });

  // Load shared data on component mount
  useEffect(() => {
    const loadSharedData = async () => {
      try {
        const [
          allShippers,
          pendingShippers,
          allCustomers
        ] = await Promise.all([
          shipperService.getAllShippers().catch(() => []),
          shipperService.getPendingShippers().catch(() => []),
          customerService.getAllCustomers().catch(() => [])
        ]);

        // Load products từ cả drinks và cakes
        const [drinks, cakes, toppings] = await Promise.all([
          drinkService.getAllDrinks().catch(() => []),
          cakeService.getAllCakes().catch(() => []),
          toppingService.getAllToppings().catch(() => [])
        ]);

        // Load orders
        const orders = await orderService.getAllOrders().catch(() => []);

        setSharedData({
          products: [...drinks, ...cakes, ...toppings],
          orders: orders,
          customers: allCustomers,
          shippers: allShippers,
          pendingShippers: pendingShippers
        });
      } catch (error) {
        console.log('Could not load shared data:', error);
      }
    };

    loadSharedData();
  }, []);

  // Notification system functions
  const showNotification = (title, message, type = 'info', duration = 4000) => {
    const id = Date.now() + Math.random();
    const notification = { id, title, message, type };
    
    setNotifications(prev => [...prev, notification]);
    
    // Auto remove after duration
    setTimeout(() => {
      removeNotification(id);
    }, duration);
  };

  const removeNotification = (id) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id 
          ? { ...notif, removing: true }
          : notif
      )
    );
    
    // Remove from state after animation
    setTimeout(() => {
      setNotifications(prev => prev.filter(notif => notif.id !== id));
    }, 300);
  };

  // Confirmation modal functions
  const showConfirmModal = (title, message, onConfirm, type = 'danger') => {
    setConfirmModal({ title, message, onConfirm, type });
  };

  const hideConfirmModal = () => {
    setConfirmModal(null);
  };

  // Handle ESC key to close modal
  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === 'Escape' && confirmModal) {
        hideConfirmModal();
      }
    };

    if (confirmModal) {
      document.addEventListener('keydown', handleEscKey);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey);
      document.body.style.overflow = 'unset';
    };
  }, [confirmModal]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    {
      id: 'overview',
      label: 'Tổng quan',
      icon: <FiHome size={20} />,
      description: 'Dashboard tổng quan'
    },
    {
      id: 'products',
      label: 'Quản lý sản phẩm',
      icon: <FiPackage size={20} />,
      description: 'Thêm, sửa, xóa sản phẩm'
    },
    {
      id: 'orders',
      label: 'Quản lý đơn hàng',
      icon: <FiShoppingBag size={20} />,
      description: 'Xem và xử lý đơn hàng'
    },
    {
      id: 'customers',
      label: 'Quản lý tài khoản',
      icon: <FiUsers size={20} />,
      description: 'Quản lý người dùng'
    },
    {
      id: 'shippers',
      label: 'Quản lý Shipper',
      icon: <FiTruck size={20} />,
      description: 'Phê duyệt và quản lý shipper'
    },
    {
      id: 'promotions',
      label: 'Khuyến mãi & Voucher',
      icon: <FiTrendingUp size={20} />,
      description: 'Khuyến mãi và tích điểm'
    }
  ];

  const renderContent = () => {
    switch (activeSection) {
      case 'overview':
        return (
          <OverviewContent 
            allProducts={sharedData.products}
            allOrders={sharedData.orders}
            allCustomers={sharedData.customers}
            allShippers={sharedData.shippers}
            pendingShippers={sharedData.pendingShippers}
          />
        );
      case 'products':
        return <ProductsContent showNotification={showNotification} showConfirmModal={showConfirmModal} />;
      case 'orders':
        return <OrdersContent showNotification={showNotification} />;
      case 'customers':
        return <CustomersContent showNotification={showNotification} showConfirmModal={showConfirmModal} />;
      case 'shippers':
        return <ShippersContent showNotification={showNotification} showConfirmModal={showConfirmModal} />;
      case 'promotions':
        return <PromotionsContent />;
      default:
        return (
          <OverviewContent 
            allProducts={sharedData.products}
            allOrders={sharedData.orders}
            allCustomers={sharedData.customers}
            allShippers={sharedData.shippers}
            pendingShippers={sharedData.pendingShippers}
          />
        );
    }
  };

  return (
    <div className="admin-dashboard">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="sidebar-header">
          <div className="admin-logo">
            <FiCoffee className="logo-icon" size={24} />
            <span className="logo-text">Coffee Admin</span>
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
            <FiLogOut className="logout-icon" size={18} />
            <span>Đăng xuất</span>
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
              <FiGlobe className="btn-icon" size={18} />
              <span>Xem trang web</span>
            </Link>
          </div>
        </header>

        <div className="admin-content">
          {renderContent()}
        </div>
      </main>
      
      {/* Notification System */}
      <div className="notification-container">
        {notifications.map(notification => (
          <div
            key={notification.id}
            className={`notification ${notification.type} ${notification.removing ? 'removing' : ''}`}
          >
            <div className="notification-icon">
              {notification.type === 'success' && '✓'}
              {notification.type === 'error' && '✕'}
              {notification.type === 'warning' && '⚠'}
              {notification.type === 'info' && 'i'}
            </div>
            <div className="notification-content">
              <div className="notification-title">{notification.title}</div>
              <div className="notification-message">{notification.message}</div>
            </div>
            <button
              className="notification-close"
              onClick={() => removeNotification(notification.id)}
            >
              ×
            </button>
            <div className="notification-progress">
              <div className="notification-progress-bar"></div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Confirmation Modal */}
      {confirmModal && (
        <div className="confirm-modal-overlay" onClick={hideConfirmModal}>
          <div className={`confirm-modal ${confirmModal.type === 'success' ? 'confirm-modal-success' : 'confirm-modal-danger'}`} onClick={(e) => e.stopPropagation()}>
            <div className="confirm-modal-header">
              <div className={`confirm-modal-icon ${confirmModal.type === 'success' ? 'confirm-icon-success' : 'confirm-icon-danger'}`}>
                {confirmModal.type === 'success' ? '✓' : '⚠'}
              </div>
              <h3 className="confirm-modal-title">{confirmModal.title}</h3>
            </div>
            <p className="confirm-modal-message">{confirmModal.message}</p>
            <div className="confirm-modal-actions">
              <button 
                className="confirm-btn confirm-btn-cancel"
                onClick={hideConfirmModal}
              >
                Hủy bỏ
              </button>
              <button 
                className={`confirm-btn ${confirmModal.type === 'success' ? 'confirm-btn-success' : 'confirm-btn-delete'}`}
                onClick={() => {
                  confirmModal.onConfirm();
                  hideConfirmModal();
                }}
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Content Components
const OverviewContent = ({ 
  allProducts = [], 
  allOrders = [], 
  allCustomers = [], 
  allShippers = [], 
  pendingShippers = [] 
}) => {
  const [overviewStats, setOverviewStats] = useState({
    totalRevenue: 0,
    todayOrders: 0,
    totalProducts: 0,
    totalCustomers: 0,
    totalShippers: 0,
    pendingShippers: 0,
    completedOrders: 0,
    activeOrders: 0,
    avgOrderValue: 0,
    topProduct: 'N/A'
  });

  useEffect(() => {
    // Tính toán stats từ dữ liệu thực
    const calculateStats = () => {
      const today = new Date().toDateString();
      
      // Lọc đơn hàng hôm nay
      const todayOrders = allOrders.filter(order => 
        new Date(order.createdAt || order.orderDate || Date.now()).toDateString() === today
      );
      
      // Tính tổng doanh thu từ đơn hàng hoàn thành
      const completedOrders = allOrders.filter(order => 
        order.status === 'completed' || order.status === 'delivered'
      );
      
      const totalRevenue = completedOrders.reduce((sum, order) => 
        sum + (order.totalAmount || order.total || 0), 0
      );
      
      // Tính đơn hàng đang xử lý
      const activeOrders = allOrders.filter(order => 
        order.status === 'pending' || order.status === 'processing' || order.status === 'confirmed'
      ).length;
      
      // Tính giá trị đơn hàng trung bình
      const avgOrderValue = completedOrders.length > 0 
        ? totalRevenue / completedOrders.length 
        : 0;
      
      // Tìm sản phẩm phổ biến nhất (giả sử)
      const topProduct = allProducts.length > 0 
        ? allProducts[0]?.name || 'N/A' 
        : 'N/A';

      setOverviewStats({
        totalRevenue,
        todayOrders: todayOrders.length,
        totalProducts: allProducts.length,
        totalCustomers: allCustomers.length,
        totalShippers: allShippers.length,
        pendingShippers: pendingShippers.length,
        completedOrders: completedOrders.length,
        activeOrders,
        avgOrderValue,
        topProduct
      });
    };

    calculateStats();
  }, [allProducts, allOrders, allCustomers, allShippers, pendingShippers]);

  return (
    <div className="overview-content">
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-info">
            <h3>Tổng doanh thu</h3>
            <p className="stat-value">₫{overviewStats.totalRevenue.toLocaleString('vi-VN')}</p>
            <span className="stat-change positive">
              {overviewStats.completedOrders} đơn hoàn thành
            </span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📋</div>
          <div className="stat-info">
            <h3>Đơn hàng hôm nay</h3>
            <p className="stat-value">{overviewStats.todayOrders}</p>
            <span className="stat-change positive">
              {overviewStats.activeOrders} đang xử lý
            </span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">☕</div>
          <div className="stat-info">
            <h3>Sản phẩm</h3>
            <p className="stat-value">{overviewStats.totalProducts}</p>
            <span className="stat-change">
              Phổ biến: {overviewStats.topProduct}
            </span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-info">
            <h3>Khách hàng</h3>
            <p className="stat-value">{overviewStats.totalCustomers}</p>
            <span className="stat-change positive">
              TB: ₫{Math.round(overviewStats.avgOrderValue).toLocaleString('vi-VN')}
            </span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🚚</div>
          <div className="stat-info">
            <h3>Shipper</h3>
            <p className="stat-value">{overviewStats.totalShippers}</p>
            <span className={`stat-change ${overviewStats.pendingShippers > 0 ? 'warning' : ''}`}>
              {overviewStats.pendingShippers > 0 
                ? `${overviewStats.pendingShippers} chờ duyệt` 
                : 'Tất cả hoạt động'
              }
            </span>
          </div>
        </div>
      </div>

      <div className="recent-activities">
        <h3>Hoạt động gần đây</h3>
        <div className="activity-list">
          {/* Hiển thị đơn hàng gần đây */}
          {allOrders.slice(0, 3).map((order, index) => (
            <div key={`order-${index}`} className="activity-item">
              <span className="activity-icon">📋</span>
              <div className="activity-info">
                <p>Đơn hàng #{order.id || order.orderNumber || `00${index + 1}`} được tạo</p>
                <small>
                  Giá trị: ₫{(order.totalAmount || order.total || 0).toLocaleString('vi-VN')} - 
                  Trạng thái: {order.status === 'pending' ? 'Chờ xử lý' : 
                            order.status === 'completed' ? 'Hoàn thành' : 
                            order.status === 'processing' ? 'Đang xử lý' : order.status}
                </small>
              </div>
            </div>
          ))}
          
          {/* Hiển thị sản phẩm được cập nhật gần đây */}
          {allProducts.slice(0, 2).map((product, index) => (
            <div key={`product-${index}`} className="activity-item">
              <span className="activity-icon">☕</span>
              <div className="activity-info">
                <p>Sản phẩm "{product.name}" được cập nhật</p>
                <small>
                  Giá: ₫{(product.price || 0).toLocaleString('vi-VN')} - 
                  Loại: {product.type === 'drink' ? 'Đồ uống' : 'Bánh'}
                </small>
              </div>
            </div>
          ))}
          
          {/* Hiển thị khách hàng mới */}
          {allCustomers.slice(-2).map((customer, index) => (
            <div key={`customer-${index}`} className="activity-item">
              <span className="activity-icon">👥</span>
              <div className="activity-info">
                <p>Khách hàng mới: {customer.name || customer.username}</p>
                <small>Email: {customer.email}</small>
              </div>
            </div>
          ))}
          
          {/* Hiển thị shipper chờ duyệt nếu có */}
          {pendingShippers.slice(0, 1).map((shipper, index) => (
            <div key={`shipper-${index}`} className="activity-item">
              <span className="activity-icon">🚚</span>
              <div className="activity-info">
                <p>Shipper "{shipper.name}" chờ phê duyệt</p>
                <small>SĐT: {shipper.phone} - Khu vực: {shipper.area}</small>
              </div>
            </div>
          ))}
          
          {/* Fallback nếu không có dữ liệu */}
          {allOrders.length === 0 && allProducts.length === 0 && allCustomers.length === 0 && (
            <div className="activity-item">
              <span className="activity-icon">📝</span>
              <div className="activity-info">
                <p>Chưa có hoạt động nào</p>
                <small>Dữ liệu sẽ hiển thị khi có thông tin từ hệ thống</small>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const ProductsContent = ({ showNotification, showConfirmModal }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [activeTab, setActiveTab] = useState('drinks'); // 'drinks' or 'cakes'

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const [drinksResponse, cakesResponse, toppingsResponse] = await Promise.all([
        drinkService.getAllDrinks(),
        cakeService.getAllCakes(),
        toppingService.getAllToppings()
      ]);
      
      const allProducts = [
        ...drinksResponse.map(item => ({ ...item, type: 'drink' })),
        ...cakesResponse.map(item => ({ ...item, type: 'cake' })),
        ...toppingsResponse.map(item => ({ ...item, type: 'topping' }))
      ];
      
      // Debug log để kiểm tra imageUrl
      console.log('🔍 All products:', allProducts);
      console.log('🖼️ Products with images:', allProducts.filter(p => p.imageUrl));
      allProducts.forEach(p => {
        if (p.imageUrl) {
          console.log(`📷 ${p.name}: ${p.imageUrl}`);
        }
      });
      
      setProducts(allProducts);
      setError(null);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Không thể tải danh sách sản phẩm');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = (productId, productType) => {
    // Find product name for better UX
    const product = products.find(p => p.id === productId && p.type === productType);
    const productName = product ? product.name : 'sản phẩm này';
    
    showConfirmModal(
      'Xác nhận xóa sản phẩm',
      `Bạn có chắc chắn muốn xóa "${productName}"? Hành động này không thể hoàn tác.`,
      async () => {
        try {
          const token = localStorage.getItem('id_token');
          if (productType === 'drink') {
            await drinkService.deleteDrink(productId, token);
          } else if (productType === 'cake') {
            await cakeService.deleteCake(productId, token);
          } else if (productType === 'topping') {
            await toppingService.deleteTopping(productId, token);
          }
          
          showNotification('Thành công!', 'Sản phẩm đã được xóa khỏi hệ thống', 'success');
          fetchProducts(); // Refresh the list
        } catch (error) {
          console.error('Error deleting product:', error);
          showNotification('Lỗi!', 'Không thể xóa sản phẩm. Vui lòng thử lại sau', 'error');
        }
      }
    );
  };

  const filteredProducts = products.filter(product => {
    if (activeTab === 'drinks') return product.type === 'drink';
    if (activeTab === 'cakes') return product.type === 'cake';
    if (activeTab === 'toppings') return product.type === 'topping';
    return false;
  });

  if (loading) {
    return <div className="loading">Đang tải sản phẩm...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="products-content">
      <div className="content-header">
        <h2>Quản lý sản phẩm</h2>
        <button 
          className="add-btn"
          onClick={() => setShowAddForm(true)}
        >
          <FiPlus className="btn-icon" size={18} />
          <span>Thêm sản phẩm mới</span>
        </button>
      </div>

      {/* Product Type Tabs */}
      <div className="product-tabs">
        <button 
          className={`tab ${activeTab === 'drinks' ? 'active' : ''}`}
          onClick={() => setActiveTab('drinks')}
        >
          <FiCoffee size={18} />
          <span>Đồ uống ({products.filter(p => p.type === 'drink').length})</span>
        </button>
        <button 
          className={`tab ${activeTab === 'cakes' ? 'active' : ''}`}
          onClick={() => setActiveTab('cakes')}
        >
          <MdCake size={18} />
          <span>Bánh ({products.filter(p => p.type === 'cake').length})</span>
        </button>
        <button 
          className={`tab ${activeTab === 'toppings' ? 'active' : ''}`}
          onClick={() => setActiveTab('toppings')}
        >
          <FiStar size={18} />
          <span>Topping ({products.filter(p => p.type === 'topping').length})</span>
        </button>
      </div>

      {/* Products Grid */}
      <div className="products-grid">
        {filteredProducts.map((product) => (
          <div key={`${product.type}-${product.id}`} className="product-card">
            <div className="product-image">
              {product.imageUrl ? (
                <img 
                  src={product.imageUrl} 
                  alt={product.name}
                  onLoad={() => console.log(`✅ Image loaded: ${product.name}`)}
                  onError={(e) => {
                    console.error(`❌ Image failed: ${product.name} - ${product.imageUrl}`);
                    e.target.style.display = 'none';
                    e.target.parentNode.innerHTML = `<div class="no-image">Image not available</div>`;
                  }}
                />
              ) : (
                <div className="no-image">
                  No Image
                </div>
              )}
            </div>
            
            <div className="product-info">
              <h4>{product.name}</h4>
              <div className="product-details">
                <p className="product-type">
                  <span className={`type-badge type-badge-${product.type}`}>
                    {product.type === 'drink' ? 'Đồ uống' : product.type === 'cake' ? 'Bánh' : 'Topping'}
                  </span>
                </p>
                
                {/* Price display - khác nhau cho từng loại */}
                {product.type === 'drink' ? (
                  <p className="price">
                    <strong>Giá cơ bản: {product.basePrice?.toLocaleString('vi-VN') || '0'} VNĐ</strong>
                  </p>
                ) : (
                  <p className="price">
                    <strong>Giá: {product.price?.toLocaleString('vi-VN') || '0'} VNĐ</strong>
                  </p>
                )}
                
                <p className="stock">
                  Kho: <span className={product.stock <= 5 ? 'low-stock' : ''}>{product.stock}</span>
                </p>
                
                {/* Category chỉ hiển thị cho drinks */}
                {product.type === 'drink' && product.category && (
                  <p className="category">
                    <span className="category-badge">{product.category}</span>
                  </p>
                )}
              </div>
            </div>
            
            <div className="product-actions">
              <button 
                className="edit-btn"
                onClick={() => setEditingProduct(product)}
                title="Chỉnh sửa"
              >
                <FiEdit3 size={16} />
                <span>Sửa</span>
              </button>
              <button 
                className="delete-btn"
                onClick={() => handleDeleteProduct(product.id, product.type)}
                title="Xóa"
              >
                <FiTrash2 size={16} />
                <span>Xóa</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Product Modal */}
      {(showAddForm || editingProduct) && (
        <ProductFormModal
          product={editingProduct}
          isEditing={!!editingProduct}
          showNotification={showNotification}
          onClose={() => {
            setShowAddForm(false);
            setEditingProduct(null);
          }}
          onSuccess={() => {
            fetchProducts();
            setShowAddForm(false);
            setEditingProduct(null);
          }}
        />
      )}
    </div>
  );
};

// Product Form Modal Component
const ProductFormModal = ({ product, isEditing, onClose, onSuccess, showNotification }) => {
  const [formData, setFormData] = useState({
    name: product?.name || '',
    price: product?.price || product?.basePrice || '',
    stock: product?.stock || '',
    type: product?.type || 'drink',
    // For drinks only
    basePrice: product?.basePrice || '',
    category: product?.category || 'Coffee',
    // Common optional field
    imageUrl: product?.imageUrl || ''
  });
  
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Validation functions
  const validateForm = () => {
    const newErrors = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Tên sản phẩm là bắt buộc';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Tên sản phẩm phải có ít nhất 2 ký tự';
    }

    // Price validation
    const priceField = formData.type === 'drink' ? 'basePrice' : 'price';
    const priceValue = formData.type === 'drink' ? formData.basePrice : formData.price;
    
    if (!priceValue) {
      newErrors[priceField] = 'Giá là bắt buộc';
    } else if (isNaN(priceValue) || parseFloat(priceValue) <= 0) {
      newErrors[priceField] = 'Giá phải là số dương';
    } else if (parseFloat(priceValue) > 10000000) {
      newErrors[priceField] = 'Giá không được vượt quá 10,000,000 VNĐ';
    }

    // Stock validation
    if (formData.stock === '' || formData.stock === null) {
      newErrors.stock = 'Số lượng kho là bắt buộc';
    } else if (isNaN(formData.stock) || parseInt(formData.stock) < 0) {
      newErrors.stock = 'Số lượng kho phải là số không âm';
    }

    // Category validation for drinks (có default value nên không cần required)
    if (formData.type === 'drink' && !formData.category.trim()) {
      formData.category = 'Default'; // Set default nếu empty
    }

    // ImageUrl validation
    if (formData.imageUrl && formData.imageUrl.trim()) {
      const urlPattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
      if (!urlPattern.test(formData.imageUrl.trim())) {
        newErrors.imageUrl = 'URL hình ảnh không hợp lệ';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('id_token'); // Sử dụng id_token từ Cognito
      console.log('🔑 Token being used:', token ? 'Token exists' : 'No token found');
      console.log('🔑 Token length:', token ? token.length : 0);
      
      // Debug: In tất cả keys trong localStorage
      console.log('📱 All localStorage keys:', Object.keys(localStorage));
      console.log('📱 Access token exists:', !!localStorage.getItem('access_token'));
      console.log('📱 ID token exists:', !!localStorage.getItem('id_token'));
      
      if (!token) {
        showNotification('Lỗi xác thực!', 'Bạn cần đăng nhập để thực hiện hành động này', 'error');
        return;
      }

      let productData;

      if (formData.type === 'drink') {
        productData = {
          name: formData.name.trim(),
          basePrice: parseFloat(formData.basePrice),
          stock: parseInt(formData.stock),
          category: formData.category.trim() || 'Coffee',
          imageUrl: formData.imageUrl.trim() || ""
        };
      } else if (formData.type === 'cake') {
        productData = {
          name: formData.name.trim(), 
          price: parseFloat(formData.price),
          stock: parseInt(formData.stock),
          imageUrl: formData.imageUrl.trim() || ""
        };
      } else if (formData.type === 'topping') {
        productData = {
          name: formData.name.trim(), 
          price: parseFloat(formData.price),
          stock: parseInt(formData.stock),
          imageUrl: formData.imageUrl.trim() || ""
        };
      }

      // Debug log để kiểm tra dữ liệu gửi
      console.log('📤 Sending product data:', productData);
      console.log('🖼️ ImageUrl being sent:', productData.imageUrl);

      if (isEditing) {
        // Update existing product
        if (formData.type === 'drink') {
          const response = await drinkService.updateDrink(product.id, productData, token);
          console.log('✅ Update drink response:', response);
        } else if (formData.type === 'cake') {
          const response = await cakeService.updateCake(product.id, productData, token);
          console.log('✅ Update cake response:', response);
        } else if (formData.type === 'topping') {
          const response = await toppingService.updateTopping(product.id, productData, token);
          console.log('✅ Update topping response:', response);
        }
        showNotification('Thành công!', 'Sản phẩm đã được cập nhật', 'success');
      } else {
        // Create new product
        if (formData.type === 'drink') {
          const response = await drinkService.createDrink(productData, token);
          console.log('✅ Create drink response:', response);
        } else if (formData.type === 'cake') {
          const response = await cakeService.createCake(productData, token);
          console.log('✅ Create cake response:', response);
        } else if (formData.type === 'topping') {
          const response = await toppingService.createTopping(productData, token);
          console.log('✅ Create topping response:', response);
        }
        showNotification('Thành công!', 'Sản phẩm mới đã được thêm vào hệ thống', 'success');
      }

      onSuccess();
    } catch (error) {
      console.error('Error saving product:', error);
      if (error.response?.data?.message) {
        showNotification('Lỗi!', error.response.data.message, 'error');
      } else {
        showNotification('Lỗi!', 'Có lỗi khi lưu sản phẩm. Vui lòng thử lại sau', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>{isEditing ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <form onSubmit={handleSubmit} className="product-form">
          {/* Product Type */}
          <div className="form-group">
            <label>Loại sản phẩm: <span className="required">*</span></label>
            <select
              value={formData.type}
              onChange={(e) => handleInputChange('type', e.target.value)}
              disabled={isEditing}
              required
              className={errors.type ? 'error' : ''}
            >
              <option value="drink">Đồ uống</option>
              <option value="cake">Bánh</option>
              <option value="topping">Topping</option>
            </select>
            {errors.type && <span className="error-message">{errors.type}</span>}
          </div>

          {/* Product Name */}
          <div className="form-group">
            <label>Tên sản phẩm: <span className="required">*</span></label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Nhập tên sản phẩm"
              required
              className={errors.name ? 'error' : ''}
            />
            {errors.name && <span className="error-message">{errors.name}</span>}
          </div>

          {/* Price Fields - khác nhau cho Drink và Cake */}
          {formData.type === 'drink' ? (
            <div className="form-group">
              <label>Giá cơ bản (VNĐ): <span className="required">*</span></label>
              <input
                type="number"
                value={formData.basePrice}
                onChange={(e) => handleInputChange('basePrice', e.target.value)}
                min="0"
                step="1000"
                placeholder="50000"
                required
                className={errors.basePrice ? 'error' : ''}
              />
              {errors.basePrice && <span className="error-message">{errors.basePrice}</span>}
            </div>
          ) : (
            <div className="form-group">
              <label>Giá (VNĐ): <span className="required">*</span></label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => handleInputChange('price', e.target.value)}
                min="0"
                step="1000"
                placeholder="50000"
                required
                className={errors.price ? 'error' : ''}
              />
              {errors.price && <span className="error-message">{errors.price}</span>}
            </div>
          )}

          {/* Stock */}
          <div className="form-group">
            <label>Số lượng trong kho: <span className="required">*</span></label>
            <input
              type="number"
              value={formData.stock}
              onChange={(e) => handleInputChange('stock', e.target.value)}
              min="0"
              placeholder="10"
              required
              className={errors.stock ? 'error' : ''}
            />
            {errors.stock && <span className="error-message">{errors.stock}</span>}
          </div>

          {/* Category (for drinks only) */}
          {formData.type === 'drink' && (
            <div className="form-group">
              <label>Danh mục:</label>
              <select
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                className={errors.category ? 'error' : ''}
              >
                <option value="Default">Default</option>
                <option value="Coffee">Coffee (Cà phê)</option>
                <option value="Tea">Tea (Trà)</option>
                <option value="Smoothie">Smoothie (Sinh tố)</option>
                <option value="Juice">Juice (Nước ép)</option>
                <option value="Soda">Soda (Nước ngọt)</option>
                <option value="Milk Tea">Milk Tea (Trà sữa)</option>
                <option value="Iced Drink">Iced Drink (Đồ uống đá)</option>
                <option value="Hot Drink">Hot Drink (Đồ uống nóng)</option>
              </select>
              {errors.category && <span className="error-message">{errors.category}</span>}
              <small className="form-hint">Phân loại chi tiết cho đồ uống</small>
            </div>
          )}

          {/* Image URL */}
          <div className="form-group">
            <label>URL hình ảnh:</label>
            <input
              type="url"
              value={formData.imageUrl}
              onChange={(e) => handleInputChange('imageUrl', e.target.value)}
              placeholder="https://example.com/image.jpg"
              className={errors.imageUrl ? 'error' : ''}
            />
            {errors.imageUrl && <span className="error-message">{errors.imageUrl}</span>}
          </div>

          <div className="form-actions">
            <button type="button" onClick={onClose} className="cancel-btn">
              Hủy
            </button>
            <button type="submit" disabled={loading} className="save-btn">
              {loading ? 'Đang lưu...' : (isEditing ? 'Cập nhật' : 'Thêm mới')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const OrdersContent = ({ showNotification }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeStatus, setActiveStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [updating, setUpdating] = useState({});
  const [userCache, setUserCache] = useState({}); // Cache user info để tránh call API nhiều lần

  // Fetch user info từ userId (với caching)
  const fetchUserInfo = async (userId) => {
    if (!userId) return null;
    
    // Check cache first
    if (userCache[userId]) {
      return userCache[userId];
    }
    
    try {
      console.log(`👤 Fetching user info for: ${userId}`);
      const userInfo = await customerService.getCustomerById(userId);
      
      // Cache the result
      setUserCache(prev => ({
        ...prev,
        [userId]: userInfo
      }));
      
      console.log(`✅ User info fetched:`, userInfo);
      return userInfo;
    } catch (error) {
      console.error(`❌ Error fetching user ${userId}:`, error);
      // Cache empty result to avoid repeated API calls
      setUserCache(prev => ({
        ...prev,
        [userId]: null
      }));
      return null;
    }
  };

  // Fetch user info cho tất cả orders
  const fetchUsersForOrders = async (orders) => {
    const userIds = [...new Set(orders.map(order => order.userId).filter(id => id))];
    console.log(`👥 Fetching user info for ${userIds.length} unique users:`, userIds);
    
    // Fetch user info for all unique userIds
    await Promise.all(
      userIds.map(userId => fetchUserInfo(userId))
    );
  };

  // Get user display info (từ cache hoặc fallback)
  const getUserDisplayInfo = (order) => {
    // Priority 1: Customer info từ checkout form
    if (order.customerName && order.customerEmail) {
      return {
        name: order.customerName,
        email: order.customerEmail,
        phone: order.deliveryPhone
      };
    }
    
    // Priority 2: User info từ database
    if (order.userId && userCache[order.userId]) {
      const user = userCache[order.userId];
      return {
        name: user.username || user.email,
        email: user.email,
        phone: user.phoneNumber || order.deliveryPhone
      };
    }
    
    // Priority 3: Fallback to userId
    return {
      name: order.userId || 'Không có tên',
      email: order.userId || 'Không có email',
      phone: order.deliveryPhone || 'Không có SĐT'
    };
  };

  // Helper function to get status text in Vietnamese
  const getStatusText = (status) => {
    const statusMap = {
      'pending': 'Chờ thanh toán',
      'processing': 'Đang xử lý', 
      'confirmed': 'Đã xác nhận',
      'shipping': 'Đang giao hàng',
      'delivered': 'Đã giao',
      'completed': 'Hoàn thành',
      'all': 'Tất cả'
    };
    return statusMap[status?.toLowerCase()] || status || 'Không xác định';
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      console.log('🚀 Fetching all orders for admin...');
      // ✅ Use getAllOrders for admin (GET /api/Order)
      const response = await orderService.getAllOrders();
      console.log('✅ Admin orders loaded:', response);
      
      // 🔍 Debug: Log sample order to check data structure
      if (response && response.length > 0) {
        console.log('📋 Sample order data structure:', {
          orderId: response[0].orderId,
          customerName: response[0].customerName,
          customerEmail: response[0].customerEmail,
          userId: response[0].userId,
          deliveryPhone: response[0].deliveryPhone,
          hasCustomerInfo: !!(response[0].customerName && response[0].customerEmail)
        });
      }
      
      setOrders(response || []);
      
      // 👥 Fetch user info for all orders
      await fetchUsersForOrders(response || []);
      
      setError(null);
    } catch (err) {
      console.error('❌ Error fetching admin orders:', err);
      setError('Không thể tải danh sách đơn hàng. Kiểm tra quyền Admin.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      setUpdating(prev => ({ ...prev, [orderId]: true }));
      console.log(`🔄 Updating order ${orderId} to status: ${newStatus}`);
      
      // ✅ Use correct API endpoint based on action
      if (newStatus === 'Confirmed') {
        // Use specific confirm API for shipper workflow
        await orderService.confirmOrder(orderId);
        console.log('✅ Order confirmed via /Admin/orders/{id}/confirm - now available for shipper');
      } else {
        // Use generic status update for other statuses
        await orderService.updateOrderStatus(orderId, newStatus);
        console.log(`✅ Order status updated to: ${newStatus}`);
      }
      
      showNotification('Thành công!', `Đơn hàng đã được chuyển sang "${getStatusText(newStatus)}"`, 'success');
      
      // ✅ Update local state immediately for better UX
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.orderId === orderId 
            ? { 
                ...order, 
                status: newStatus, 
                confirmedAt: newStatus === 'Confirmed' ? new Date().toISOString() : order.confirmedAt,
                completedAt: newStatus === 'Completed' ? new Date().toISOString() : order.completedAt 
              }
            : order
        )
      );
      
      console.log('✅ Order status updated successfully');
    } catch (error) {
      console.error('❌ Failed to update order status:', error);
      showNotification('Lỗi!', `Không thể cập nhật đơn hàng: ${error.message}`, 'error');
    } finally {
      setUpdating(prev => ({ ...prev, [orderId]: false }));
    }
  };

  // Computed properties với sắp xếp ưu tiên
  const orderCounts = {
    all: orders.length,
    pending: orders.filter(o => o.status?.toLowerCase() === 'pending').length,
    processing: orders.filter(o => o.status?.toLowerCase() === 'processing').length,
    confirmed: orders.filter(o => o.status?.toLowerCase() === 'confirmed').length,
    shipping: orders.filter(o => o.status?.toLowerCase() === 'shipping').length,
    delivered: orders.filter(o => o.status?.toLowerCase() === 'delivered').length,
    completed: orders.filter(o => o.status?.toLowerCase() === 'completed').length
  };

  // Sắp xếp đơn hàng: ưu tiên processing, confirmed, completed, cuối cùng pending
  const getSortPriority = (status) => {
    const priorities = {
      'processing': 1, // Cao nhất - cần admin xác nhận
      'confirmed': 2,  // Chờ shipper nhận
      'shipping': 3,   // Đang giao hàng
      'delivered': 4,  // Cần admin hoàn thành
      'completed': 5,  // Đã xong
      'pending': 6     // Thấp nhất - chờ thanh toán
    };
    return priorities[status?.toLowerCase()] || 7;
  };

  const filteredOrders = orders
    .filter(order => {
      const matchesStatus = activeStatus === 'all' || order.status?.toLowerCase() === activeStatus;
      const matchesSearch = searchTerm === '' || 
        order.orderId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.userId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.appliedVoucherCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.items?.some(item => 
          item.productName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.name?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      return matchesStatus && matchesSearch;
    })
    .sort((a, b) => {
      // Ưu tiên sắp xếp theo status trước
      const statusDiff = getSortPriority(a.status) - getSortPriority(b.status);
      if (statusDiff !== 0) return statusDiff;
      
      // Sau đó sắp xếp theo thời gian (mới nhất trước)
      const aDate = new Date(a.createdAt || 0);
      const bDate = new Date(b.createdAt || 0);
      return bDate - aDate;
    });

  if (loading) {
    return (
      <div className="orders-content">
        <div className="loading-container">
          <div className="coffee-loading">☕</div>
          <p>Đang tải danh sách đơn hàng...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="orders-content">
        <div className="error-container">
          <div className="error-icon">⚠️</div>
          <h3>Không thể tải đơn hàng</h3>
          <p>{error}</p>
          <button onClick={fetchOrders} className="retry-btn">
            🔄 Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="orders-content">
      {/* Header với search và refresh */}
      <div className="content-header">
        <div className="header-title">
          <FiShoppingBag size={24} />
          <h2>Quản lý đơn hàng</h2>
          <span className="total-orders">({orders.length} đơn hàng)</span>
        </div>
        
        <div className="header-actions">
          <div className="search-box">
            <FiSearch size={16} />
            <input
              type="text"
              placeholder="Tìm kiếm theo mã đơn hàng, tên khách hàng..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          <button onClick={fetchOrders} className="refresh-btn">
            <FiGlobe size={16} />
            Làm mới
          </button>
        </div>
      </div>

      {/* Status Filter Tabs - Coffee theme */}
      <div className="status-filter-tabs">
        <button 
          className={`status-tab ${activeStatus === 'all' ? 'active' : ''}`}
          onClick={() => setActiveStatus('all')}
        >
          <span className="tab-label">Tất cả</span>
          <span className="tab-count">{orderCounts.all}</span>
        </button>
        <button 
          className={`status-tab processing ${activeStatus === 'processing' ? 'active' : ''}`}
          onClick={() => setActiveStatus('processing')}
        >
          <span className="tab-label">Đang xử lý</span>
          <span className="tab-count">{orderCounts.processing}</span>
        </button>
        <button 
          className={`status-tab confirmed ${activeStatus === 'confirmed' ? 'active' : ''}`}
          onClick={() => setActiveStatus('confirmed')}
        >
          <span className="tab-label">Đã xác nhận</span>
          <span className="tab-count">{orderCounts.confirmed}</span>
        </button>
        <button 
          className={`status-tab shipping ${activeStatus === 'shipping' ? 'active' : ''}`}
          onClick={() => setActiveStatus('shipping')}
        >
          <span className="tab-label">Đang giao hàng</span>
          <span className="tab-count">{orderCounts.shipping}</span>
        </button>
        <button 
          className={`status-tab delivered ${activeStatus === 'delivered' ? 'active' : ''}`}
          onClick={() => setActiveStatus('delivered')}
        >
          <span className="tab-label">Chờ hoàn thành</span>
          <span className="tab-count">{orderCounts.delivered}</span>
        </button>
        <button 
          className={`status-tab completed ${activeStatus === 'completed' ? 'active' : ''}`}
          onClick={() => setActiveStatus('completed')}
        >
          <span className="tab-label">Hoàn thành</span>
          <span className="tab-count">{orderCounts.completed}</span>
        </button>
        <button 
          className={`status-tab pending ${activeStatus === 'pending' ? 'active' : ''}`}
          onClick={() => setActiveStatus('pending')}
        >
          <span className="tab-label">Chờ thanh toán</span>
          <span className="tab-count">{orderCounts.pending}</span>
        </button>
      </div>

      {/* ✅ Orders Table - Professional Layout */}
      <div className="orders-table-container">
        {filteredOrders.length === 0 ? (
          <div className="no-orders">
            <div className="no-orders-icon">📋</div>
            <h3>Không có đơn hàng nào</h3>
            <p>
              {searchTerm ? `Không tìm thấy đơn hàng với từ khóa "${searchTerm}"` : 
               activeStatus === 'all' ? 'Chưa có đơn hàng nào trong hệ thống' :
               `Không có đơn hàng nào ở trạng thái "${getStatusText(activeStatus)}"`}
            </p>
          </div>
        ) : (
          <table className="orders-table">
            <thead>
              <tr>
                <th className="col-order-id">Mã đơn hàng</th>
                <th className="col-status">Trạng thái</th>
                <th className="col-customer">Khách hàng</th>
                <th className="col-products">Sản phẩm</th>
                <th className="col-total">Tổng tiền</th>
                <th className="col-payment">Thanh toán</th>
                <th className="col-address">Địa chỉ</th>
                <th className="col-notes">Ghi chú</th>
                <th className="col-actions">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <tr key={order.orderId} className="order-row">
                  {/* Mã đơn hàng & Thời gian */}
                  <td className="order-id-cell">
                    <div className="order-id-info">
                      <span className="order-id">
                        #{order.orderId ? order.orderId.slice(0,8).toUpperCase() : 'N/A'}
                      </span>
                      <span className="order-date">
                        {order.createdAt ? new Date(order.createdAt).toLocaleDateString('vi-VN', {
                          day: '2-digit',
                          month: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit'
                        }) : 'N/A'}
                      </span>
                    </div>
                  </td>

                  {/* Trạng thái - Di chuyển lên đầu */}
                  <td className="status-cell">
                    <span className={`status-badge status-${order.status?.toLowerCase() || 'unknown'}`}>
                      {getStatusText(order.status)}
                    </span>
                    {order.status?.toLowerCase() === 'completed' && order.completedAt && (
                      <span className="completion-time">
                        {new Date(order.completedAt).toLocaleDateString('vi-VN', {
                          day: '2-digit',
                          month: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    )}
                  </td>

                  {/* Thông tin khách hàng - Ưu tiên customerName/customerEmail, sau đó user database */}
                  <td className="customer-cell">
                    <div className="customer-info">
                      {(() => {
                        const userInfo = getUserDisplayInfo(order);
                        return (
                          <>
                            {userInfo.name && (
                              <span className="customer-name">
                                {userInfo.name}
                              </span>
                            )}
                            {userInfo.email && (
                              <span className="customer-email">
                                {userInfo.email}
                              </span>
                            )}
                            {userInfo.phone && (
                              <span className="customer-phone">
                                {userInfo.phone}
                              </span>
                            )}
                          </>
                        );
                      })()}
                    </div>
                  </td>

                  {/* Sản phẩm */}
                  <td className="products-cell">
                    <div className="products-info">
                      {order.items && order.items.length > 0 ? (
                        <>
                          <span className="products-count">
                            {order.items.length} sản phẩm
                          </span>
                          <div className="products-list">
                            {order.items.map((item, idx) => (
                              <div key={idx} className="product-item">
                                <span className="product-name">
                                  {item.productName || item.name}
                                </span>
                                <span className="product-quantity">x{item.quantity}</span>
                              </div>
                            ))}
                          </div>
                        </>
                      ) : (
                        <span className="no-products">Không có sản phẩm</span>
                      )}
                    </div>
                  </td>

                  {/* Tổng tiền */}
                  <td className="total-cell">
                    <div className="price-info">
                      <span className="final-price">
                        {order.finalPrice ? order.finalPrice.toLocaleString('vi-VN') : '0'}₫
                      </span>
                      {order.totalPrice && order.totalPrice !== order.finalPrice && (
                        <span className="original-price">
                          {order.totalPrice.toLocaleString('vi-VN')}₫
                        </span>
                      )}
                      {order.appliedVoucherCode && (
                        <span className="voucher-applied">Voucher: {order.appliedVoucherCode}</span>
                      )}
                    </div>
                  </td>

                  {/* Phương thức thanh toán */}
                  <td className="payment-cell">
                    <span className="payment-method">
                      {order.paymentMethod === 'COD' ? 'Thu tiền khi giao' : 
                       order.paymentMethod === 'VNPAY' ? 'VNPay' : 
                       order.paymentMethod === 'MOMO' ? 'MoMo' : 
                       order.paymentMethod || 'COD'}
                    </span>
                  </td>

                  {/* Địa chỉ giao hàng */}
                  <td className="address-cell">
                    <div className="address-info">
                      <span className="delivery-address">
                        {order.deliveryAddress || 'Không có địa chỉ'}
                      </span>
                    </div>
                  </td>

                  {/* Ghi chú - Cột mới */}
                  <td className="notes-cell">
                    <div className="notes-info">
                      <span className="delivery-note">
                        {order.deliveryNote || ''}
                      </span>
                    </div>
                  </td>

                  {/* Thao tác */}
                  <td className="actions-cell">
                    {order.status?.toLowerCase() === 'processing' && (
                      <button
                        className="action-btn confirm-btn"
                        onClick={() => handleUpdateOrderStatus(order.orderId, 'Confirmed')}
                        disabled={updating[order.orderId]}
                        title="Xác nhận đơn hàng để shipper có thể nhận"
                      >
                        {updating[order.orderId] ? 'Đang xử lý...' : '✅ Xác nhận cho Shipper'}
                      </button>
                    )}

                    {order.status?.toLowerCase() === 'confirmed' && (
                      <span className="confirmed-note">
                        ✅ Đã xác nhận - Chờ Shipper nhận
                      </span>
                    )}

                    {order.status?.toLowerCase() === 'shipping' && (
                      <span className="shipping-note">
                        🚚 Đang giao hàng
                      </span>
                    )}

                    {order.status?.toLowerCase() === 'delivered' && (
                      <button
                        className="action-btn complete-btn"
                        onClick={() => handleUpdateOrderStatus(order.orderId, 'Completed')}
                        disabled={updating[order.orderId]}
                        title="Hoàn thành đơn hàng và tặng điểm loyalty"
                      >
                        {updating[order.orderId] ? 'Đang xử lý...' : '🎉 Hoàn thành & Tặng điểm'}
                      </button>
                    )}
                    
                    {order.status?.toLowerCase() === 'pending' && (
                      <span className="pending-note">Chờ thanh toán</span>
                    )}
                    
                    {order.status?.toLowerCase() === 'completed' && (
                      <span className="completed-note">✅ Đã hoàn thành</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

const CustomersContent = ({ showNotification, showConfirmModal }) => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async (showSuccessNotification = false) => {
    try {
      setLoading(true);
      const data = await customerService.getAllCustomers();
      setCustomers(data);
      if (showSuccessNotification) {
        showNotification('Thành công', 'Tải danh sách khách hàng thành công', 'success');
      }
    } catch (error) {
      showNotification('Lỗi', 'Không thể tải danh sách khách hàng', 'error');
      console.error('Error loading customers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewCustomer = (customer) => {
    console.log('🔍 Viewing customer:', customer);
    // Sử dụng data đã có thay vì gọi API mới
    setSelectedCustomer(customer);
    setViewModalOpen(true);
    console.log('Modal state updated:', { viewModalOpen: true, customer });
  };

  const handleDeleteCustomer = (customer) => {
    showConfirmModal(
      'Xóa tài khoản khách hàng',
      `Bạn có chắc chắn muốn xóa tài khoản "${customer.username || customer.email}"? Hành động này không thể hoàn tác.`,
      async () => {
        try {
          await customerService.deleteCustomer(customer.userId);
          showNotification('Thành công', 'Xóa tài khoản khách hàng thành công', 'success');
          loadCustomers(false); // Refresh list without duplicate notification
        } catch (error) {
          showNotification('Lỗi', 'Không thể xóa tài khoản khách hàng', 'error');
        }
      }
    );
  };

  const handleToggleCustomerStatus = async (customer) => {
    const newStatus = !customer.isActive;
    const actionText = newStatus ? 'kích hoạt' : 'vô hiệu hóa';
    
    showConfirmModal(
      `${newStatus ? 'Kích hoạt' : 'Vô hiệu hóa'} tài khoản`,
      `Bạn có chắc chắn muốn ${actionText} tài khoản "${customer.username || customer.email}"?`,
      async () => {
        try {
          await customerService.updateCustomerStatus(customer.userId, newStatus ? 'active' : 'inactive');
          showNotification('Thành công', `${actionText.charAt(0).toUpperCase() + actionText.slice(1)} tài khoản thành công`, 'success');
          loadCustomers(false); // Refresh list without duplicate notification
        } catch (error) {
          showNotification('Lỗi', `Không thể ${actionText} tài khoản`, 'error');
        }
      }
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('vi-VN');
    } catch (error) {
      return 'N/A';
    }
  };

  const getStatusBadge = (status) => {
    const statusClass = status === 'active' ? 'status-active' : 'status-inactive';
    const statusText = status === 'active' ? 'Hoạt động' : 'Vô hiệu hóa';
    return <span className={`status-badge ${statusClass}`}>{statusText}</span>;
  };

  return (
    <div className="customers-content">
      <div className="content-header">
        <h2>Quản lý tài khoản khách hàng</h2>
        <button 
          className="btn btn-primary"
          onClick={() => loadCustomers(true)}
          disabled={loading}
        >
          <FiSearch className="btn-icon" />
          {loading ? 'Đang tải...' : 'Làm mới'}
        </button>
      </div>

      {loading ? (
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Đang tải danh sách khách hàng...</p>
        </div>
      ) : (
        <div className="customers-table-container">
          <table className="customers-table">
            <thead>
              <tr>
                <th>Tên khách hàng</th>
                <th>Email</th>
                <th>Số điện thoại</th>
                <th>Điểm tích lũy</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {customers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="no-data">
                    Không có khách hàng nào
                  </td>
                </tr>
              ) : (
                customers.map((customer) => (
                  <tr key={customer.userId}>
                    <td>{customer.username || 'N/A'}</td>
                    <td>{customer.email || customer.username}</td>
                    <td>{customer.phoneNumber || 'Chưa cập nhật'}</td>
                    <td>
                      <span className="reward-points">
                        {customer.rewardPoints || 0} điểm
                      </span>
                    </td>
                    <td>{getStatusBadge(customer.isActive ? 'active' : 'inactive')}</td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="btn btn-sm btn-info"
                          onClick={() => handleViewCustomer(customer)}
                          title="Xem chi tiết"
                        >
                          <FiEye size={14} />
                        </button>
                        <button
                          className={`btn btn-sm ${customer.isActive ? 'btn-warning' : 'btn-success'}`}
                          onClick={() => handleToggleCustomerStatus(customer)}
                          title={customer.isActive ? 'Vô hiệu hóa' : 'Kích hoạt'}
                        >
                          {customer.isActive ? '🔒' : '🔓'}
                        </button>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleDeleteCustomer(customer)}
                          title="Xóa tài khoản"
                        >
                          <FiTrash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Customer Detail Modal */}
      {viewModalOpen && selectedCustomer && (
        <div className="modal-overlay" onClick={() => setViewModalOpen(false)}>
          <div className="customer-detail-modal" onClick={(e) => e.stopPropagation()}>
            <div className="customer-modal-header">
              <div className="customer-avatar">
                <FiUsers size={32} />
              </div>
              <div className="customer-title">
                <h2>{selectedCustomer.username || 'Khách hàng'}</h2>
                <p className="customer-role">{selectedCustomer.role || 'User'}</p>
              </div>
              <button 
                className="modal-close-btn"
                onClick={() => setViewModalOpen(false)}
              >
                ✕
              </button>
            </div>
            
            <div className="customer-modal-body">
              <div className="customer-stats">
                <div className="stat-card">
                  <div className="stat-icon">
                    <FiStar className="star-icon" />
                  </div>
                  <div className="stat-content">
                    <h4>{selectedCustomer.rewardPoints || 0}</h4>
                    <p>Điểm tích lũy</p>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon voucher">
                    <FiGlobe className="voucher-icon" />
                  </div>
                  <div className="stat-content">
                    <h4>{selectedCustomer.voucherCount || 0}</h4>
                    <p>Voucher</p>
                  </div>
                </div>
              </div>

              <div className="customer-details">
                <div className="detail-section">
                  <h3>Thông tin liên hệ</h3>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <label>Email</label>
                      <span>{selectedCustomer.email || selectedCustomer.username}</span>
                    </div>
                    <div className="detail-item">
                      <label>Số điện thoại</label>
                      <span>{selectedCustomer.phoneNumber || 'Chưa cập nhật'}</span>
                    </div>
                    <div className="detail-item">
                      <label>Địa chỉ</label>
                      <span>{selectedCustomer.address || 'Chưa cập nhật'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="customer-modal-footer">
              <button 
                className={`btn ${selectedCustomer.isActive ? 'btn-warning' : 'btn-success'}`}
                onClick={() => {
                  handleToggleCustomerStatus(selectedCustomer);
                  setViewModalOpen(false);
                }}
              >
                {selectedCustomer.isActive ? '🔒 Vô hiệu hóa' : '🔓 Kích hoạt'}
              </button>
              <button 
                className="btn btn-danger"
                onClick={() => {
                  handleDeleteCustomer(selectedCustomer);
                  setViewModalOpen(false);
                }}
              >
                <FiTrash2 size={16} /> Xóa tài khoản
              </button>
              <button 
                className="btn btn-secondary"
                onClick={() => setViewModalOpen(false)}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const ShippersContent = ({ showNotification, showConfirmModal }) => {
  const [shippers, setShippers] = useState([]);
  const [pendingShippers, setPendingShippers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  
  // Modal lý do từ chối
  const [rejectModal, setRejectModal] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => {
    loadShippersData();
  }, []);

  const loadShippersData = async (showSuccessNotification = false) => {
    try {
      setLoading(true);
      const [allShippersData, pendingShippersData] = await Promise.all([
        shipperService.getAllShippers(),
        shipperService.getPendingShippers()
      ]);
      
      // 🔍 Debug: Log sample shipper data structure
      console.log('🔍 Debug all shippers sample:', allShippersData?.[0]);
      console.log('🔍 Debug pending shippers sample:', pendingShippersData?.[0]);
      
      setShippers(allShippersData);
      setPendingShippers(pendingShippersData);
      
      if (showSuccessNotification) {
        showNotification('Thành công', 'Tải danh sách shipper thành công', 'success');
      }
    } catch (error) {
      showNotification('Lỗi', 'Không thể tải danh sách shipper', 'error');
      console.error('Error loading shippers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveShipper = (shipper) => {
    showConfirmModal(
      'Phê duyệt Shipper',
      `Bạn có chắc chắn muốn phê duyệt tài khoản shipper "${shipper.fullName || shipper.username}"?`,
      async () => {
        try {
          // ✅ Backend trả về shipperId thay vì userId
          const userId = shipper.shipperId || shipper.userId || shipper.id;
          await shipperService.approveShipper(userId);
          showNotification('Thành công', 'Phê duyệt shipper thành công', 'success');
          loadShippersData(false);
        } catch (error) {
          showNotification('Lỗi', 'Không thể phê duyệt shipper', 'error');
        }
      },
      'success'
    );
  };

  const handleRejectShipper = (shipper) => {
    setRejectModal(shipper);
    setRejectReason('');
  };

  const confirmRejectShipper = async () => {
    if (!rejectReason.trim()) {
      showNotification('Lỗi', 'Vui lòng nhập lý do từ chối', 'error');
      return;
    }

    try {
      // ✅ Backend trả về shipperId thay vì userId
      const userId = rejectModal.shipperId || rejectModal.userId || rejectModal.id;
      console.log('🔄 Rejecting shipper:', userId, 'with reason:', rejectReason);
      const result = await shipperService.rejectShipper(userId, rejectReason);
      console.log('✅ Reject result:', result);
      
      showNotification('Thành công', 'Từ chối shipper thành công', 'success');
      setRejectModal(null);
      setRejectReason('');
      
      // Delay một chút trước khi reload để đảm bảo backend đã cập nhật
      setTimeout(() => {
        loadShippersData(false);
      }, 500);
    } catch (error) {
      console.error('❌ Reject error:', error);
      showNotification('Lỗi', 'Không thể từ chối shipper', 'error');
    }
  };

  const cancelRejectShipper = () => {
    setRejectModal(null);
    setRejectReason('');
  };

  const handleResetPassword = (shipper) => {
    // ✅ Validate userId - Backend trả về shipperId
    const userId = shipper.shipperId || shipper.userId || shipper.id;
    if (!userId) {
      console.error('❌ No valid userId found for shipper:', shipper);
      showNotification('Lỗi', 'Không tìm thấy ID shipper hợp lệ', 'error');
      return;
    }

    showConfirmModal(
      'Reset mật khẩu Shipper',
      `Bạn có chắc chắn muốn reset mật khẩu cho shipper "${shipper.fullName || shipper.username || shipper.email}"? Mật khẩu mới sẽ được gửi qua email.`,
      async () => {
        try {
          console.log('🔑 Resetting password for userId:', userId);
          await shipperService.resetShipperPassword(userId);
          showNotification('Thành công', 'Reset mật khẩu shipper thành công', 'success');
        } catch (error) {
          console.error('❌ Reset password error:', error);
          showNotification('Lỗi', `Không thể reset mật khẩu shipper: ${error.message}`, 'error');
        }
      }
    );
  };

  const handleLockShipper = (shipper) => {
    // 🔍 Debug: Check shipper data structure
    console.log('🔍 Debug shipper data:', {
      shipper,
      userId: shipper.userId,
      shipperId: shipper.shipperId, // ✅ Backend trả về shipperId
      id: shipper.id,
      status: shipper.status,
      isLocked: shipper.isLocked
    });

    // ✅ Validate userId - Backend trả về shipperId
    const userId = shipper.shipperId || shipper.userId || shipper.id;
    if (!userId) {
      console.error('❌ No valid userId found for shipper:', shipper);
      showNotification('Lỗi', 'Không tìm thấy ID shipper hợp lệ', 'error');
      return;
    }

    const isLocked = shipper.status?.toLowerCase() === 'locked' || shipper.isLocked || !shipper.isActive;
    const action = isLocked ? 'mở khóa' : 'khóa';
    const actionTitle = isLocked ? 'Mở khóa' : 'Khóa';
    
    showConfirmModal(
      `${actionTitle} tài khoản Shipper`,
      `Bạn có chắc chắn muốn ${action} tài khoản shipper "${shipper.fullName || shipper.username || shipper.email}"? ${
        isLocked 
          ? 'Shipper sẽ có thể đăng nhập lại sau khi được mở khóa.' 
          : 'Shipper sẽ không thể đăng nhập sau khi bị khóa.'
      }`,
      async () => {
        try {
          console.log(`🔄 ${actionTitle}ing shipper with userId:`, userId);
          
          if (isLocked) {
            await shipperService.unlockShipper(userId);
            showNotification('Thành công', 'Mở khóa tài khoản shipper thành công', 'success');
          } else {
            await shipperService.lockShipper(userId);
            showNotification('Thành công', 'Khóa tài khoản shipper thành công', 'success');
          }
          loadShippersData(false); // Refresh danh sách sau khi thay đổi
        } catch (error) {
          console.error('❌ Lock/Unlock error:', error);
          showNotification('Lỗi', `Không thể ${action} tài khoản shipper: ${error.message}`, 'error');
        }
      },
      'danger'
    );
  };

  const getDisplayShippers = () => {
    switch (activeTab) {
      case 'pending':
        return pendingShippers;
      case 'all':
      default:
        return shippers;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('vi-VN');
    } catch (error) {
      return 'N/A';
    }
  };

  const getStatusBadge = (status) => {
    const statusClass = shipperService.getStatusClass(status);
    const statusText = shipperService.getStatusText(status);
    return <span className={`status-badge ${statusClass}`}>{statusText}</span>;
  };

  return (
    <div className="shippers-content">
      <div className="content-header">
        <h2>Quản lý Shipper</h2>
        <button 
          className="btn btn-primary"
          onClick={() => loadShippersData(true)}
          disabled={loading}
        >
          <FiSearch className="btn-icon" />
          {loading ? 'Đang tải...' : 'Làm mới'}
        </button>
      </div>

      {/* Shipper Tabs */}
      <div className="shipper-tabs">
        <button 
          className={`tab ${activeTab === 'all' ? 'active' : ''}`}
          onClick={() => setActiveTab('all')}
        >
          <FiUsers size={18} />
          <span>Tất cả ({shippers.length})</span>
        </button>
        <button 
          className={`tab ${activeTab === 'pending' ? 'active' : ''}`}
          onClick={() => setActiveTab('pending')}
        >
          <FiClock size={18} />
          <span>Chờ phê duyệt ({pendingShippers.length})</span>
        </button>

      </div>

      {loading ? (
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Đang tải danh sách shipper...</p>
        </div>
      ) : (
        <div className="shippers-table-container">
          <table className="shippers-table">
            <thead>
              <tr>
                <th>Họ tên</th>
                <th>Email</th>
                <th>Số điện thoại</th>
                <th>Loại xe</th>
                <th>Biển số xe</th>
                <th>Số tài khoản</th>
                <th>Ngân hàng</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {getDisplayShippers().length === 0 ? (
                <tr>
                  <td colSpan="8" className="no-data">
                    Không có shipper nào
                  </td>
                </tr>
              ) : (
                getDisplayShippers().map((shipper) => (
                  <tr key={shipper.shipperId || shipper.userId || shipper.id}>
                    <td>
                      <div className="shipper-info">
                        <FiTruck className="shipper-icon" />
                        {shipper.fullName || 'N/A'}
                      </div>
                    </td>
                    <td>{shipper.email || 'Chưa cập nhật'}</td>
                    <td>{shipper.phone || 'Chưa cập nhật'}</td>
                    <td>
                      <span className="vehicle-type">
                        {shipper.vehicleType || 'Xe máy'}
                      </span>
                    </td>
                    <td>{shipper.vehiclePlate || 'Chưa cập nhật'}</td>
                    <td>{shipper.bankAccount || 'Chưa cập nhật'}</td>
                    <td>{shipper.bankName || 'Chưa cập nhật'}</td>
                    <td>
                      <div className="action-buttons">
                        {/* Actions for "Chờ phê duyệt" tab */}
                        {activeTab === 'pending' && (
                          <>
                            <button
                              className="btn btn-sm btn-success approve-btn"
                              onClick={() => handleApproveShipper(shipper)}
                              title="Phê duyệt shipper"
                            >
                              <FiCheck size={14} />
                              <span>Duyệt</span>
                            </button>
                            <button
                              className="btn btn-sm btn-danger deny-btn"
                              onClick={() => handleRejectShipper(shipper)}
                              title="Từ chối shipper"
                            >
                              <FiX size={14} />
                              <span>Từ chối</span>
                            </button>
                          </>
                        )}
                        
                        {/* Actions for "Tất cả" tab */}
                        {activeTab === 'all' && (
                          <>
                            {(() => {
                              // ✅ Backend trả về isActive field để check lock status
                              const isLocked = !shipper.isActive || shipper.status?.toLowerCase() === 'locked';
                              return (
                                <button
                                  className={`btn btn-sm ${isLocked ? 'btn-success unlock-btn' : 'btn-warning lock-btn'}`}
                                  onClick={() => handleLockShipper(shipper)}
                                  title={isLocked ? 'Mở khóa tài khoản shipper' : 'Khóa tài khoản shipper'}
                                >
                                  {isLocked ? (
                                    <>
                                      <FiCheck size={14} />
                                      <span>Mở khóa</span>
                                    </>
                                  ) : (
                                    <>
                                      <FiLock size={14} />
                                      <span>Khóa</span>
                                    </>
                                  )}
                                </button>
                              );
                            })()}
                            <button
                              className="btn btn-sm btn-info reset-btn"
                              onClick={() => handleResetPassword(shipper)}
                              title="Reset mật khẩu shipper"
                            >
                              <FiKey size={14} />
                              <span>Reset</span>
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal lý do từ chối */}
      {rejectModal && (
        <div className="confirm-modal-overlay" onClick={cancelRejectShipper}>
          <div className="reject-reason-modal" onClick={(e) => e.stopPropagation()}>
            <div className="reject-modal-header">
              <div className="reject-modal-icon">
                <FiX size={24} />
              </div>
              <h3 className="reject-modal-title">Từ chối Shipper</h3>
            </div>
            <div className="reject-modal-body">
              <p className="reject-modal-message">
                Từ chối tài khoản shipper: <strong>{rejectModal.fullName || rejectModal.username}</strong>
              </p>
              <div className="reject-reason-field">
                <label htmlFor="rejectReason">Lý do từ chối *</label>
                <textarea
                  id="rejectReason"
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Nhập lý do từ chối (bắt buộc)..."
                  rows={4}
                  maxLength={500}
                />
                <div className="character-count">
                  {rejectReason.length}/500 ký tự
                </div>
              </div>
            </div>
            <div className="reject-modal-actions">
              <button 
                className="confirm-btn confirm-btn-cancel"
                onClick={cancelRejectShipper}
              >
                Hủy bỏ
              </button>
              <button 
                className="confirm-btn confirm-btn-delete"
                onClick={confirmRejectShipper}
                disabled={!rejectReason.trim()}
              >
                Từ chối
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

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