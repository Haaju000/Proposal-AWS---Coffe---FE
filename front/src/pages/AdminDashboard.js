import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import cakeService from '../services/cakeService';
import drinkService from '../services/drinkService';
import orderService from '../services/orderService';
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
  FiGlobe
} from 'react-icons/fi';

// Material Design Icons cho bánh
import { MdCake } from 'react-icons/md';

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
      id: 'promotions',
      label: 'Khuyến mãi & Voucher',
      icon: <FiTrendingUp size={20} />,
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

const ProductsContent = () => {
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
      const [drinksResponse, cakesResponse] = await Promise.all([
        drinkService.getAllDrinks(),
        cakeService.getAllCakes()
      ]);
      
      const allProducts = [
        ...drinksResponse.map(item => ({ ...item, type: 'drink' })),
        ...cakesResponse.map(item => ({ ...item, type: 'cake' }))
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

  const handleDeleteProduct = async (productId, productType) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (productType === 'drink') {
        await drinkService.deleteDrink(productId, token);
      } else {
        await cakeService.deleteCake(productId, token);
      }
      
      alert('Xóa sản phẩm thành công!');
      fetchProducts(); // Refresh the list
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Có lỗi khi xóa sản phẩm');
    }
  };

  const filteredProducts = products.filter(product => 
    activeTab === 'drinks' ? product.type === 'drink' : product.type === 'cake'
  );

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
                    e.target.parentNode.innerHTML = `<div class="no-image">${product.type === 'drink' ? '☕' : '🧁'} Image Error</div>`;
                  }}
                />
              ) : (
                <div className="no-image">
                  {product.type === 'drink' ? '☕' : '🧁'} No Image
                </div>
              )}
            </div>
            
            <div className="product-info">
              <h4>{product.name}</h4>
              <div className="product-details">
                <p className="product-type">
                  <span className={`type-badge type-badge-${product.type}`}>
                    {product.type === 'drink' ? '🥤 Đồ uống' : '🧁 Bánh'}
                  </span>
                </p>
                
                {/* Price display - khác nhau cho drink và cake */}
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
                    <span className="category-badge">📂 {product.category}</span>
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
const ProductFormModal = ({ product, isEditing, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: product?.name || '',
    price: product?.price || product?.basePrice || '',
    stock: product?.stock || '',
    type: product?.type || 'drink',
    // For drinks only
    basePrice: product?.basePrice || '',
    category: product?.category || 'Default',
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
      const token = localStorage.getItem('token');
      let productData;

      if (formData.type === 'drink') {
        productData = {
          name: formData.name.trim(),
          basePrice: parseFloat(formData.basePrice),
          stock: parseInt(formData.stock),
          category: formData.category.trim() || 'Default',
          imageUrl: formData.imageUrl.trim() || null
        };
      } else {
        productData = {
          name: formData.name.trim(), 
          price: parseFloat(formData.price),
          stock: parseInt(formData.stock),
          imageUrl: formData.imageUrl.trim() || null
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
        } else {
          const response = await cakeService.updateCake(product.id, productData, token);
          console.log('✅ Update cake response:', response);
        }
        alert('Cập nhật sản phẩm thành công!');
      } else {
        // Create new product
        if (formData.type === 'drink') {
          const response = await drinkService.createDrink(productData, token);
          console.log('✅ Create drink response:', response);
        } else {
          const response = await cakeService.createCake(productData, token);
          console.log('✅ Create cake response:', response);
        }
        alert('Thêm sản phẩm thành công!');
      }

      onSuccess();
    } catch (error) {
      console.error('Error saving product:', error);
      if (error.response?.data?.message) {
        alert('Lỗi: ' + error.response.data.message);
      } else {
        alert('Có lỗi khi lưu sản phẩm');
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

const OrdersContent = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeStatus, setActiveStatus] = useState('all');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      // Note: You might need to create an admin-specific endpoint to get all orders
      const response = await orderService.getUserOrders(token);
      setOrders(response);
      setError(null);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Không thể tải danh sách đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      await orderService.updateOrderStatus(orderId, newStatus, token);
      alert('Cập nhật trạng thái đơn hàng thành công!');
      fetchOrders(); // Refresh the list
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('Có lỗi khi cập nhật trạng thái đơn hàng');
    }
  };

  const getStatusClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending': return 'pending';
      case 'processing': return 'processing';
      case 'completed': return 'completed';
      case 'cancelled': return 'cancelled';
      default: return 'pending';
    }
  };

  const getStatusText = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending': return 'Chờ xử lý';
      case 'processing': return 'Đang xử lý';
      case 'completed': return 'Hoàn thành';
      case 'cancelled': return 'Đã hủy';
      default: return status;
    }
  };

  const filteredOrders = activeStatus === 'all' 
    ? orders 
    : orders.filter(order => order.status?.toLowerCase() === activeStatus);

  if (loading) {
    return <div className="loading">Đang tải đơn hàng...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="orders-content">
      <div className="content-header">
        <h2>Quản lý đơn hàng</h2>
        <div className="filter-tabs">
          <button 
            className={`tab ${activeStatus === 'all' ? 'active' : ''}`}
            onClick={() => setActiveStatus('all')}
          >
            Tất cả ({orders.length})
          </button>
          <button 
            className={`tab ${activeStatus === 'pending' ? 'active' : ''}`}
            onClick={() => setActiveStatus('pending')}
          >
            Chờ xử lý ({orders.filter(o => o.status?.toLowerCase() === 'pending').length})
          </button>
          <button 
            className={`tab ${activeStatus === 'processing' ? 'active' : ''}`}
            onClick={() => setActiveStatus('processing')}
          >
            Đang xử lý ({orders.filter(o => o.status?.toLowerCase() === 'processing').length})
          </button>
          <button 
            className={`tab ${activeStatus === 'completed' ? 'active' : ''}`}
            onClick={() => setActiveStatus('completed')}
          >
            Hoàn thành ({orders.filter(o => o.status?.toLowerCase() === 'completed').length})
          </button>
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
              <th>Ngày tạo</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map((order) => (
              <tr key={order.id}>
                <td>#{order.id}</td>
                <td>{order.customerName || 'N/A'}</td>
                <td>
                  <div className="order-items">
                    {order.items?.map((item, index) => (
                      <div key={index} className="order-item">
                        {item.name} x{item.quantity}
                      </div>
                    )) || 'N/A'}
                  </div>
                </td>
                <td>₫{order.totalAmount?.toLocaleString()}</td>
                <td>
                  <span className={`status ${getStatusClass(order.status)}`}>
                    {getStatusText(order.status)}
                  </span>
                </td>
                <td>{new Date(order.createdAt).toLocaleDateString('vi-VN')}</td>
                <td>
                  <div className="order-actions">
                    <select
                      value={order.status}
                      onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                      className="status-select"
                    >
                      <option value="Pending">Chờ xử lý</option>
                      <option value="Processing">Đang xử lý</option>
                      <option value="Completed">Hoàn thành</option>
                      <option value="Cancelled">Đã hủy</option>
                    </select>
                    <button className="action-btn view-btn">
                      👁️ Xem
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {filteredOrders.length === 0 && (
          <div className="no-data">
            <p>Không có đơn hàng nào</p>
          </div>
        )}
      </div>
    </div>
  );
};

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