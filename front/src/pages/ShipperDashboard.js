import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import authService from '../services/authService';
import shipperAPI from '../services/shipperAPI'; // Sử dụng file service mới
import '../css/ShipperDashboard.css';
import '../css/ShipperProfile.css'; // Import CSS mới cho Profile
import '../css/ShipperNotifications.css'; // Import CSS cho notification system
import '../css/OrderDetailModal.css'; // Import CSS cho Order Detail Modal

const ShipperDashboard = () => {
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // State for dashboard data
  const [statistics, setStatistics] = useState({
    totalOrders: 0,
    completedOrders: 0,
    shippingOrders: 0,
    totalEarnings: 0,
    todayOrders: 0
  });
  
  const [availableOrders, setAvailableOrders] = useState([]);
  const [orderHistory, setOrderHistory] = useState([]);
  const [profile, setProfile] = useState({});
  const [deliveryHistory, setDeliveryHistory] = useState([]);
  
  // Order detail modal state
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderDetail, setShowOrderDetail] = useState(false);
  const [orderDetailLoading, setOrderDetailLoading] = useState(false);
  
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    vehicleType: '',
    vehiclePlate: '',
    idCard: '', // CMND/CCCD từ model
    bankAccount: '',
    bankName: '',
    totalEarnings: 0,
    totalDeliveries: 0,
    rating: 5.0,
    totalRatings: 0,
    isActive: true,
    createdAt: null,
    lastActiveAt: null
  });

  // Load initial data
  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Load statistics for dashboard
      const stats = await shipperAPI.getStatistics();
      setStatistics(stats);
      
      // Load recent orders for dashboard
      const orders = await shipperAPI.getOrderHistory();
      setOrderHistory(orders.slice(0, 3)); // Show only 3 recent orders
      
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const loadAvailableOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const orders = await shipperAPI.getAvailableOrders();
      setAvailableOrders(orders);
    } catch (error) {
      console.error('Error loading available orders:', error);
      setError('Không thể tải đơn hàng khả dụng. Backend có thể chưa chạy hoặc chưa có endpoint này.');
    } finally {
      setLoading(false);
    }
  };

  const loadOrderHistory = async () => {
    try {
      setLoading(true);
      const orders = await shipperAPI.getOrderHistory();
      setOrderHistory(orders);
    } catch (error) {
      console.error('Error loading order history:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const loadDeliveryHistory = async () => {
    try {
      setLoading(true);
      const history = await shipperAPI.getDeliveryHistory();
      setDeliveryHistory(history);
    } catch (error) {
      console.error('Error loading delivery history:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Chỉ lấy profile từ shipperAPI
      const profileData = await shipperAPI.getProfile();
      console.log('📋 Profile data loaded:', profileData);
      
      // Nếu profileData có isProfileComplete === false (template profile từ 404)
      if (profileData && profileData.isProfileComplete === false) {
        console.log('📝 Profile template loaded - user can create new profile');
        setProfile({});
        setProfileForm({
          fullName: '',
          email: '',
          phone: '',
          vehicleType: '',
          vehiclePlate: '',
          bankAccount: '',
          bankName: ''
        });
        return; // Exit early
      }
      
      // Ensure profile is an object even if null/undefined
      const safeProfileData = profileData || {};
      setProfile(safeProfileData);
      
      // Auto-populate form với dữ liệu từ profile
      setProfileForm({
        fullName: safeProfileData.fullName || '',
        email: safeProfileData.email || '',
        phone: safeProfileData.phone || '',
        vehicleType: safeProfileData.vehicleType || '',
        vehiclePlate: safeProfileData.vehiclePlate || '',
        bankAccount: safeProfileData.bankAccount || '',
        bankName: safeProfileData.bankName || ''
      });
    } catch (error) {
      console.error('❌ Error loading profile:', error);
      setError('Không thể tải thông tin profile');
      
      // Khởi tạo form với giá trị rỗng nếu không load được profile
      setProfile({});
      setProfileForm({
        fullName: '',
        email: '',
        phone: '',
        vehicleType: '',
        vehiclePlate: '',
        bankAccount: '',
        bankName: ''
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      // Chỉ gửi các field mà backend hỗ trợ (UpdateProfileRequest)
      const updateData = {
        fullName: profileForm.fullName,
        phone: profileForm.phone,
        vehicleType: profileForm.vehicleType,
        vehiclePlate: profileForm.vehiclePlate,
        bankAccount: profileForm.bankAccount,
        bankName: profileForm.bankName
      };
      
      console.log('📤 Sending profile update:', updateData);
      const response = await shipperAPI.updateProfile(updateData);
      
      // Cập nhật state với dữ liệu từ backend
      setProfile(response.profile);
      setEditingProfile(false);
      showNotification('Thành công', 'Cập nhật hồ sơ thành công!', 'success');
      
      // Tải lại profile để đồng bộ data
      await loadProfile();
    } catch (error) {
      console.error('Error updating profile:', error);
      showNotification('Lỗi', 'Lỗi khi cập nhật hồ sơ: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleProfileFormChange = (field, value) => {
    setProfileForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle inline profile editing
  const handleSaveInlineProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      // Validate required fields
      if (!profileForm.fullName || !profileForm.phone) {
        showNotification('Lỗi', 'Họ tên và số điện thoại là bắt buộc', 'error');
        setLoading(false);
        return;
      }

      console.log('🔄 Updating profile with data:', profileForm);
      const result = await shipperAPI.updateProfile(profileForm);
      console.log('✅ Profile update result:', result);
      
      // Update profile state immediately with form data since API returns success message only
      setProfile(profileForm);
      setEditingProfile(false);
      showNotification('Thành công', 'Cập nhật hồ sơ thành công', 'success');
      
      // Fetch fresh data from server to ensure consistency
      setTimeout(async () => {
        try {
          await loadProfile();
          console.log('🔄 Profile reloaded from server');
        } catch (error) {
          console.warn('⚠️ Failed to reload profile:', error);
        }
      }, 1000);
    } catch (error) {
      console.error('❌ Error updating profile:', error);
      showNotification('Lỗi', `Lỗi khi cập nhật: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelInlineEdit = () => {
    // Reset form to current profile data
    setProfileForm({
      fullName: profile?.fullName || user?.fullName || '',
      email: profile?.email || user?.email || '',
      phone: profile?.phone || '',
      vehicleType: profile?.vehicleType || '',
      vehiclePlate: profile?.vehiclePlate || '',
      bankAccount: profile?.bankAccount || '',
      bankName: profile?.bankName || ''
    });
    setEditingProfile(false);
  };

  // Handle order actions
  const handleAcceptOrder = async (orderId) => {
    try {
      setLoading(true);
      await shipperAPI.acceptOrder(orderId);
      
      // Reload data
      if (activeSection === 'available-orders') {
        await loadAvailableOrders();
      } else {
        await loadDashboardData();
      }
      
      // Show success message
      showNotification('Thành công', 'Đơn hàng đã được nhận thành công!', 'success');
    } catch (error) {
      console.error('Error accepting order:', error);
      showNotification('Lỗi', 'Lỗi khi nhận đơn hàng: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteOrder = async (orderId) => {
    try {
      setLoading(true);
      await shipperAPI.completeDelivery(orderId);
      
      // Reload data
      await loadDashboardData();
      if (activeSection === 'order-history') {
        await loadOrderHistory();
      }
      
      // Show success message
      showNotification('Thành công', 'Đơn hàng đã được hoàn thành!', 'success');
    } catch (error) {
      console.error('Error completing order:', error);
      showNotification('Lỗi', 'Lỗi khi hoàn thành đơn hàng: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCalculateFee = async (orderId) => {
    try {
      const calculation = await shipperAPI.calculateShippingFee(orderId);
      showNotification(
        'Phí ship tính toán', 
        `Phí ship: ${calculation.shippingFee.toLocaleString()}₫ • Khoảng cách: ${calculation.distanceKm}km • Thời gian dự kiến: ${calculation.estimatedTime} phút`, 
        'info',
        6000
      );
    } catch (error) {
      console.error('Error calculating fee:', error);
      showNotification('Lỗi', 'Lỗi khi tính phí ship: ' + error.message, 'error');
    }
  };

  // Handle view order detail
  const handleViewOrderDetail = async (order) => {
    try {
      setOrderDetailLoading(true);
      setSelectedOrder(null);
      setShowOrderDetail(true);
      
      console.log('🔍 Fetching detailed order info for:', order.orderId);
      console.log('📋 Basic order data:', order);
      
      // Get detailed order info from API
      const detailedOrder = await shipperAPI.getOrderDetail(order.orderId);
      console.log('✅ Detailed order data:', detailedOrder);
      console.log('💰 Pricing fields check:', {
        totalAmount: detailedOrder.totalAmount,
        totalPrice: detailedOrder.totalPrice,
        finalPrice: detailedOrder.finalPrice,
        discountAmount: detailedOrder.discountAmount,
        voucherDiscount: detailedOrder.voucherDiscount,
        subtotal: detailedOrder.subtotal
      });
      
      setSelectedOrder(detailedOrder);
    } catch (error) {
      console.error('❌ Error fetching order detail:', error);
      showNotification('Lỗi', 'Không thể tải thông tin chi tiết đơn hàng: ' + error.message, 'error');
      setShowOrderDetail(false);
    } finally {
      setOrderDetailLoading(false);
    }
  };

  // Close order detail modal
  const handleCloseOrderDetail = () => {
    setShowOrderDetail(false);
    setSelectedOrder(null);
  };

  // Load data when section changes
  useEffect(() => {
    switch (activeSection) {
      case 'available-orders':
        loadAvailableOrders();
        break;
      case 'order-history':
        loadOrderHistory();
        break;
      case 'statistics':
        loadDeliveryHistory();
        break;
      case 'profile':
      case 'edit-profile':
        loadProfile();
        break;
      default:
        // Dashboard is already loaded
        break;
    }
  }, [activeSection]);

  // Notification system state
  const [notifications, setNotifications] = useState([]);

  // Notification system functions
  const showNotification = (title, message, type = 'info', duration = 4000) => {
    const notification = {
      id: Date.now() + Math.random(),
      title,
      message,
      type, // 'success', 'error', 'warning', 'info'
      removing: false
    };
    
    setNotifications(prev => [...prev, notification]);
    
    setTimeout(() => removeNotification(notification.id), duration);
  };

  const removeNotification = (id) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, removing: true }
          : notification
      )
    );
    
    setTimeout(() => {
      setNotifications(prev => prev.filter(notification => notification.id !== id));
    }, 300);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Chào buổi sáng';
    if (hour < 18) return 'Chào buổi chiều';
    return 'Chào buổi tối';
  };

  // Helper functions - use from shipperAPI
  const formatCurrency = shipperAPI.formatCurrency;
  const formatDate = shipperAPI.formatDate;

  // Helper function to get vehicle type display text
  const getVehicleTypeText = (vehicleType) => {
    const vehicleTypes = {
      'motorbike': '🛵 Xe máy',
      'bicycle': '🚲 Xe đạp',
      'electric-bike': '⚡ Xe điện',
      'car': '🚗 Xe hơi'
    };
    return vehicleTypes[vehicleType] || vehicleType;
  };

  // Generate random Vietnamese license plate
  const generateRandomPlate = () => {
    // Mã tỉnh Việt Nam (một số ví dụ)
    const provinceCodes = ['29', '30', '31', '32', '33', '34', '43', '50', '51', '59', '60', '61', '62', '63', '64', '65', '66', '67', '68', '69', '70', '71', '72', '73', '74', '75', '76', '77', '78', '79', '80', '81', '82', '83', '84', '85', '86', '87', '88', '89', '90', '91', '92', '93', '94', '95', '96', '97', '98', '99'];
    
    // Chọn mã tỉnh ngẫu nhiên
    const provinceCode = provinceCodes[Math.floor(Math.random() * provinceCodes.length)];
    
    // Chữ cái (A-Z, trừ một số chữ đặc biệt)
    const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'K', 'L', 'M', 'N', 'P', 'S', 'T', 'U', 'V', 'X', 'Y', 'Z'];
    const letter = letters[Math.floor(Math.random() * letters.length)];
    
    // Số thứ tự (1-9)
    const letterNumber = Math.floor(Math.random() * 9) + 1;
    
    // Số cuối (100-999)
    const lastNumbers = String(Math.floor(Math.random() * 900) + 100);
    
    // Định dạng: XX-Y# ###.##
    const plateNumber = `${provinceCode}-${letter}${letterNumber} ${lastNumbers.substring(0, 3)}.${Math.floor(Math.random() * 90) + 10}`;
    
    handleProfileFormChange('vehiclePlate', plateNumber);
  };

  const sidebarItems = [
    {
      id: 'dashboard',
      icon: '🏠',
      label: 'Tổng quan',
      description: 'Dashboard tổng quan'
    },
    {
      id: 'available-orders',
      icon: '📦',
      label: 'Đơn hàng khả dụng',
      description: 'Danh sách đơn có thể nhận'
    },
    {
      id: 'order-history',
      icon: '📋',
      label: 'Lịch sử đơn hàng',
      description: 'Đơn hàng đã giao'
    },
    {
      id: 'statistics',
      icon: '📊',
      label: 'Thống kê',
      description: 'Báo cáo hiệu suất'
    },
    {
      id: 'profile',
      icon: '👤',
      label: 'Hồ sơ',
      description: 'Thông tin cá nhân'
    }
  ];

  const renderContent = () => {
    switch(activeSection) {
      case 'dashboard':
        return renderDashboard();
      case 'available-orders':
        return renderAvailableOrders();
      case 'order-history':
        return renderOrderHistory();
      case 'statistics':
        return renderStatistics();
      case 'profile':
        return renderProfile();
      case 'edit-profile':
        return renderEditProfile();
      default:
        return renderDashboard();
    }
  };

  const renderDashboard = () => (
    <div className="shipper-dashboard-content">
      {loading && <div className="shipper-loading">Đang tải dữ liệu...</div>}
      {error && (
        <div className="shipper-error">
          <strong>⚠️ Lỗi:</strong> {error}
          <br />
          <small>💡 Kiểm tra: Backend có chạy trên port 5144 không? API endpoints có được implement chưa?</small>
        </div>
      )}

      {/* Debug Info - chỉ hiển thị khi có lỗi để debug */}
      {error && (
        <div style={{ 
          background: '#f0f0f0', 
          border: '1px solid #ccc', 
          padding: '10px', 
          margin: '10px 0',
          fontSize: '12px',
          borderRadius: '4px'
        }}>
          <strong>🔍 Debug Info:</strong><br />
          User: {user?.username || 'N/A'} | Role: {user?.role || 'N/A'}<br />
          Auth Type: {user?.authType || 'N/A'}<br />
          Token: {authService.getToken() ? '✅ Present' : '❌ Missing'}<br />
          Is Shipper: {authService.isShipper() ? 'Yes' : 'No'}
        </div>
      )}
      
      {/* Stats Overview */}
      <section className="shipper-stats-section">
        <div className="shipper-stats-grid">
          <div className="shipper-stat-card primary">
            <div className="shipper-stat-icon">📦</div>
            <div className="shipper-stat-content">
              <h3>{statistics.totalOrders}</h3>
              <p>Tổng đơn giao</p>
            </div>
            <div className="shipper-stat-trend up">+{statistics.totalOrders > 0 ? '12%' : '0%'}</div>
          </div>
          
          <div className="shipper-stat-card success">
            <div className="shipper-stat-icon">✅</div>
            <div className="shipper-stat-content">
              <h3>{statistics.todayOrders}</h3>
              <p>Hoàn thành hôm nay</p>
            </div>
            <div className="shipper-stat-trend up">+{statistics.todayOrders}</div>
          </div>
          
          <div className="shipper-stat-card warning">
            <div className="shipper-stat-icon">⏳</div>
            <div className="shipper-stat-content">
              <h3>{statistics.shippingOrders}</h3>
              <p>Đang chờ giao</p>
            </div>
            <div className="shipper-stat-trend neutral">{statistics.shippingOrders}</div>
          </div>
          
          <div className="shipper-stat-card earnings">
            <div className="shipper-stat-icon">💰</div>
            <div className="shipper-stat-content">
              <h3>{formatCurrency(statistics.totalEarnings)}₫</h3>
              <p>Thu nhập tháng này</p>
            </div>
            <div className="shipper-stat-trend up">+8%</div>
          </div>
        </div>
      </section>

      {/* Recent Orders */}
      <section className="shipper-recent-orders">
        <div className="shipper-section-header">
          <h2>📋 Đơn hàng gần đây</h2>
          <button className="shipper-btn-secondary" onClick={() => setActiveSection('order-history')}>
            Xem tất cả
          </button>
        </div>
        
        <div className="shipper-orders-list">
          {orderHistory.length === 0 ? (
            <div className="shipper-no-orders">Chưa có đơn hàng nào</div>
          ) : (
            orderHistory.map((order) => (
              <div key={order.orderId} className="shipper-order-card">
                <div className="shipper-order-header">
                  <div className="shipper-order-id">#{order.orderId}</div>
                <span className={`shipper-order-status ${shipperAPI.getOrderStatusClass(order.status)}`}>
                  {shipperAPI.getOrderStatusText(order.status)}
                  </span>
                </div>
                
                <div className="shipper-order-customer">
                  <div className="shipper-customer-info">
                    <h4>{order.customerName || 'Khách hàng'}</h4>
                    <p>📍 {order.deliveryAddress || 'Địa chỉ không có'}</p>
                  </div>
                </div>
                
                <div className="shipper-order-details">
                  <div className="shipper-detail-item">
                    <span className="shipper-detail-label">Thời gian:</span>
                    <span className="shipper-detail-value">{formatDate(order.shippingAt || order.createdAt)}</span>
                  </div>
                  <div className="shipper-detail-item">
                    <span className="shipper-detail-label">Khoảng cách:</span>
                    <span className="shipper-detail-value">{order.distanceKm ? order.distanceKm + 'km' : 'N/A'}</span>
                  </div>
                  <div className="shipper-detail-item">
                    <span className="shipper-detail-label">Phí ship:</span>
                    <span className="shipper-detail-value amount">{formatCurrency(order.shippingFee)}₫</span>
                  </div>
                </div>
                
                <div className="shipper-order-actions">
                  {order.status?.toLowerCase() === 'confirmed' && (
                    <button 
                      className="shipper-btn-primary"
                      onClick={() => handleAcceptOrder(order.orderId)}
                      disabled={loading}
                    >
                      Nhận đơn
                    </button>
                  )}
                  {order.status?.toLowerCase() === 'shipping' && (
                    <button 
                      className="shipper-btn-success"
                      onClick={() => handleCompleteOrder(order.orderId)}
                      disabled={loading}
                    >
                      Hoàn thành
                    </button>
                  )}
                  {(order.status?.toLowerCase() === 'delivered' || order.status?.toLowerCase() === 'completed') && (
                    <button className="shipper-btn-ghost">Xem chi tiết</button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );

  const renderAvailableOrders = () => (
    <div className="shipper-available-orders-content">
      <div className="shipper-content-header">
        <h2>📦 Đơn hàng khả dụng</h2>
        <p>Danh sách các đơn hàng bạn có thể nhận và giao</p>
      </div>
      
      {loading && <div className="shipper-loading">Đang tải dữ liệu...</div>}
      {error && <div className="shipper-error">Lỗi: {error}</div>}
      
      <div className="shipper-orders-list">
        {availableOrders.length === 0 ? (
          <div className="shipper-no-orders">Hiện tại không có đơn hàng khả dụng</div>
        ) : (
          availableOrders.map((order) => (
            <div key={order.orderId} className="shipper-order-card">
              <div className="shipper-order-header">
                <div className="shipper-order-id">#{order.orderId}</div>
                <span className="shipper-order-status status-pending">Có thể nhận</span>
              </div>
              
              <div className="shipper-order-customer">
                <div className="shipper-customer-info">
                  <h4>{order.customerName || 'Khách hàng'}</h4>
                  <p>📍 {order.deliveryAddress}</p>
                  <p>📞 {order.deliveryPhone}</p>
                </div>
              </div>
              
              <div className="shipper-order-details">
                <div className="shipper-detail-item">
                  <span className="shipper-detail-label">Tổng tiền:</span>
                  <span className="shipper-detail-value amount">{formatCurrency(order.finalPrice || order.totalPrices)}₫</span>
                </div>
                <div className="shipper-detail-item">
                    <span className="shipper-detail-label">Voucher:</span>
                    <span className="shipper-detail-value voucher-code">{order.voucherCode}</span>
                  </div>
                <div className="shipper-detail-item">
                  <span className="shipper-detail-label">Ghi chú:</span>
                  <span className="shipper-detail-value">{order.deliveryNote || 'Không có'}</span>
                </div>
                <div className="shipper-detail-item">
                  <span className="shipper-detail-label">Thời gian đặt:</span>
                  <span className="shipper-detail-value">{formatDate(order.createdAt)}</span>
                </div>
              </div>
              
              <div className="shipper-order-actions">
                <button 
                  className="shipper-btn-info"
                  onClick={() => handleViewOrderDetail(order)}
                  disabled={loading}
                >
                  📋 Xem chi tiết
                </button>
                <button 
                  className="shipper-btn-ghost"
                  onClick={() => handleCalculateFee(order.orderId)}
                  disabled={loading}
                >
                  Tính phí ship
                </button>
                <button 
                  className="shipper-btn-primary"
                  onClick={() => handleAcceptOrder(order.orderId)}
                  disabled={loading}
                >
                  Nhận đơn
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  const renderOrderHistory = () => (
    <div className="shipper-order-history-content">
      <div className="shipper-content-header">
        <h2>📋 Lịch sử đơn hàng</h2>
        <p>Xem lại các đơn hàng bạn đã giao</p>
      </div>
      
      {loading && <div className="shipper-loading">Đang tải dữ liệu...</div>}
      {error && <div className="shipper-error">Lỗi: {error}</div>}
      
      <div className="shipper-orders-list">
        {orderHistory.length === 0 ? (
          <div className="shipper-no-orders">Chưa có lịch sử đơn hàng</div>
        ) : (
          orderHistory.map((order) => (
            <div key={order.orderId} className="shipper-order-card">
              <div className="shipper-order-header">
                <div className="shipper-order-id">#{order.orderId}</div>
                <span className={`shipper-order-status ${shipperAPI.getOrderStatusClass(order.status)}`}>
                  {shipperAPI.getOrderStatusText(order.status)}
                </span>
              </div>
              
              <div className="shipper-order-customer">
                <div className="shipper-customer-info">
                  <h4>{order.customerName || 'Khách hàng'}</h4>
                  <p>📍 {order.deliveryAddress}</p>
                </div>
              </div>
              
              <div className="shipper-order-details">
                <div className="shipper-detail-item">
                  <span className="shipper-detail-label">Phí ship:</span>
                  <span className="shipper-detail-value amount">{formatCurrency(order.shippingFee)}₫</span>
                </div>
                <div className="shipper-detail-item">
                  <span className="shipper-detail-label">Khoảng cách:</span>
                  <span className="shipper-detail-value">{order.distanceKm ? order.distanceKm + 'km' : 'N/A'}</span>
                </div>
                <div className="shipper-detail-item">
                  <span className="shipper-detail-label">Thời gian giao:</span>
                  <span className="shipper-detail-value">{formatDate(order.deliveredAt || order.shippingAt)}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  const renderStatistics = () => (
    <div className="shipper-statistics-content">
      <div className="shipper-content-header">
        <h2>📊 Thống kê hiệu suất</h2>
        <p>Báo cáo và phân tích hiệu suất giao hàng của bạn</p>
      </div>
      
      {loading && <div className="shipper-loading">Đang tải dữ liệu...</div>}
      {error && <div className="shipper-error">Lỗi: {error}</div>}
      
      <div className="shipper-stats-detail-grid">
        <div className="shipper-stat-detail-card">
          <h3>Tổng số đơn hàng</h3>
          <div className="shipper-stat-number">{statistics.totalOrders}</div>
        </div>
        <div className="shipper-stat-detail-card">
          <h3>Đơn hàng hoàn thành</h3>
          <div className="shipper-stat-number">{statistics.completedOrders}</div>
        </div>
        <div className="shipper-stat-detail-card">
          <h3>Đơn hàng đang giao</h3>
          <div className="shipper-stat-number">{statistics.shippingOrders}</div>
        </div>
        <div className="shipper-stat-detail-card">
          <h3>Tổng thu nhập</h3>
          <div className="shipper-stat-number">{formatCurrency(statistics.totalEarnings)}₫</div>
        </div>
      </div>
      
      {/* Delivery History */}
      <div className="shipper-delivery-history">
        <h3>Lịch sử giao hàng chi tiết</h3>
        <div className="shipper-history-list">
          {deliveryHistory.length === 0 ? (
            <div className="shipper-no-data">Chưa có lịch sử giao hàng</div>
          ) : (
            deliveryHistory.map((item, index) => (
              <div key={index} className="shipper-history-item">
                <div className="shipper-history-date">{formatDate(item.acceptedAt)}</div>
                <div className="shipper-history-details">
                  <p>Đơn hàng #{item.orderId}</p>
                  <p>Thu nhập: {formatCurrency(item.shippingFee)}₫</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );

  const renderProfile = () => {
    return (
      <div className="shipper-profile-content">
        
        
        {loading && <div className="shipper-loading">Đang tải dữ liệu...</div>}
        {error && <div className="shipper-error">Lỗi: {error}</div>}
        
        {/* Hiển thị thông báo khi chưa có profile và không trong chế độ chỉnh sửa */}
        {!loading && !error && (!profile || Object.keys(profile).length === 0) && !editingProfile && (
          <div className="shipper-profile-notice">
            <h3>Chưa có hồ sơ cá nhân</h3>
            <p>Hãy tạo hồ sơ để bắt đầu nhận đơn hàng giao hàng!</p>
            <button 
              className="shipper-btn-primary"
              onClick={() => {
                // Initialize empty form for new profile
                setProfileForm({
                  fullName: user?.fullName || '',
                  email: user?.email || '',
                  phone: '',
                  vehicleType: '',
                  vehiclePlate: '',
                  bankAccount: '',
                  bankName: ''
                });
                setEditingProfile(true);
              }}
            >
              Tạo hồ sơ ngay
            </button>
          </div>
        )}
        
        {/* Profile Container - hiển thị khi có data hoặc đang trong chế độ chỉnh sửa */}
        {!loading && (profile && Object.keys(profile).length > 0 || editingProfile) && (
          <div className="shipper-profile-container">
            {/* Profile Header */}
            <div className="shipper-profile-header">
              <div className="shipper-profile-avatar">
                {(profile?.fullName || profileForm?.fullName || user?.fullName || 'S').charAt(0).toUpperCase()}
              </div>
              <h1 className="shipper-profile-name">
                {editingProfile && profileForm?.fullName 
                  ? profileForm.fullName 
                  : (profile?.fullName || user?.fullName || (editingProfile ? 'Tạo hồ sơ mới' : 'Chưa cập nhật họ tên'))
                }
              </h1>
              <p className="shipper-profile-title">Nhân viên giao hàng Coffee Shop</p>
              
              <div className="shipper-profile-contact">
                {(profile?.phone || profileForm?.phone) && (
                  <div className="shipper-contact-item">
                    <span className="shipper-contact-label">Điện thoại</span>
                    <span className="shipper-contact-value">{profile?.phone || profileForm?.phone}</span>
                  </div>
                )}
              </div>
              
              <div className="shipper-profile-actions">
                {!editingProfile ? (
                  <button 
                    className="shipper-edit-btn"
                    onClick={() => {
                      // Initialize form with current profile data
                      setProfileForm({
                        fullName: profile?.fullName || user?.fullName || '',
                        email: profile?.email || user?.email || '',
                        phone: profile?.phone || '',
                        vehicleType: profile?.vehicleType || '',
                        vehiclePlate: profile?.vehiclePlate || '',
                        bankAccount: profile?.bankAccount || '',
                        bankName: profile?.bankName || ''
                      });
                      setEditingProfile(true);
                    }}
                  >
                    ✏️ Chỉnh sửa hồ sơ
                  </button>
                ) : (
                  <div className="shipper-inline-actions">
                    <button 
                      className="shipper-save-btn"
                      onClick={handleSaveInlineProfile}
                      disabled={loading}
                    >
                      ✅ {loading ? 'Đang lưu...' : 'Lưu'}
                    </button>
                    <button 
                      className="shipper-cancel-btn"
                      onClick={handleCancelInlineEdit}
                    >
                      ❌ Hủy
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Profile Body */}
            <div className="shipper-profile-body">
              {/* Thông tin cá nhân */}
              <div className="shipper-profile-section">
                <h3 className="shipper-section-title">Thông tin cá nhân</h3>
                <div className="shipper-info-list">
                  <div className="shipper-info-row">
                    <span className="shipper-info-label">Họ và tên</span>
                    {!editingProfile ? (
                      <span className={`shipper-info-value ${!profile?.fullName ? 'empty' : ''}`}>
                        {profile?.fullName || 'Chưa cập nhật'}
                      </span>
                    ) : (
                      <input
                        type="text"
                        className="shipper-inline-input"
                        value={profileForm.fullName || ''}
                        onChange={(e) => handleProfileFormChange('fullName', e.target.value)}
                        placeholder="Nhập họ và tên"
                      />
                    )}
                  </div>
                  <div className="shipper-info-row">
                    <span className="shipper-info-label">Số điện thoại</span>
                    {!editingProfile ? (
                      <span className={`shipper-info-value ${!profile?.phone ? 'empty' : ''}`}>
                        {profile?.phone || 'Chưa cập nhật'}
                      </span>
                    ) : (
                      <input
                        type="tel"
                        className="shipper-inline-input"
                        value={profileForm.phone || ''}
                        onChange={(e) => handleProfileFormChange('phone', e.target.value)}
                        placeholder="Nhập số điện thoại"
                      />
                    )}
                  </div>
                  <div className="shipper-info-row">
                    <span className="shipper-info-label">Email</span>
                    {!editingProfile ? (
                      <span className={`shipper-info-value ${!profile?.email ? 'empty' : ''}`}>
                        {profile?.email || 'Chưa cập nhật'}
                      </span>
                    ) : (
                      <input
                        type="email"
                        className="shipper-inline-input"
                        value={profileForm.email || ''}
                        onChange={(e) => handleProfileFormChange('email', e.target.value)}
                        placeholder="Nhập email"
                      />
                    )}
                  </div>
                </div>
              </div>

              {/* Thông tin phương tiện */}
              <div className="shipper-profile-section">
                <h3 className="shipper-section-title">Thông tin phương tiện</h3>
                <div className="shipper-info-list">
                  <div className="shipper-info-row">
                    <span className="shipper-info-label">Loại xe</span>
                    {!editingProfile ? (
                      <span className={`shipper-info-value ${!profile?.vehicleType ? 'empty' : ''}`}>
                        {profile?.vehicleType ? getVehicleTypeText(profile.vehicleType) : 'Chưa cập nhật'}
                      </span>
                    ) : (
                      <select
                        className="shipper-inline-select"
                        value={profileForm.vehicleType || ''}
                        onChange={(e) => handleProfileFormChange('vehicleType', e.target.value)}
                      >
                        <option value="">Chọn loại xe</option>
                        <option value="motorbike">🛵 Xe máy</option>
                        <option value="bicycle">🚲 Xe đạp</option>
                        <option value="electric-bike">⚡ Xe điện</option>
                        <option value="car">🚗 Xe hơi</option>
                      </select>
                    )}
                  </div>
                  <div className="shipper-info-row">
                    <span className="shipper-info-label">Biển số xe</span>
                    {!editingProfile ? (
                      <span className={`shipper-info-value ${!profile?.vehiclePlate ? 'empty' : ''}`}>
                        {profile?.vehiclePlate || 'Chưa cập nhật'}
                      </span>
                    ) : (
                      <div className="shipper-plate-input-group">
                        <input
                          type="text"
                          className="shipper-inline-input"
                          value={profileForm.vehiclePlate || ''}
                          onChange={(e) => handleProfileFormChange('vehiclePlate', e.target.value)}
                          placeholder="VD: 29-A1 123.45"
                        />
                        <button
                          type="button"
                          className="shipper-random-plate-btn"
                          onClick={generateRandomPlate}
                          title="Tạo biển số ngẫu nhiên"
                        >
                          🎲
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Thông tin ngân hàng */}
              <div className="shipper-profile-section">
                <h3 className="shipper-section-title">Thông tin ngân hàng</h3>
                <div className="shipper-info-list">
                  <div className="shipper-info-row">
                    <span className="shipper-info-label">Số tài khoản</span>
                    {!editingProfile ? (
                      <span className={`shipper-info-value ${!profile?.bankAccount ? 'empty' : ''}`}>
                        {profile?.bankAccount || 'Chưa cập nhật'}
                      </span>
                    ) : (
                      <input
                        type="text"
                        className="shipper-inline-input"
                        value={profileForm.bankAccount || ''}
                        onChange={(e) => handleProfileFormChange('bankAccount', e.target.value)}
                        placeholder="Nhập số tài khoản"
                      />
                    )}
                  </div>
                  <div className="shipper-info-row">
                    <span className="shipper-info-label">Tên ngân hàng</span>
                    {!editingProfile ? (
                      <span className={`shipper-info-value ${!profile?.bankName ? 'empty' : ''}`}>
                        {profile?.bankName || 'Chưa cập nhật'}
                      </span>
                    ) : (
                      <select
                        className="shipper-inline-select"
                        value={profileForm.bankName || ''}
                        onChange={(e) => handleProfileFormChange('bankName', e.target.value)}
                      >
                        <option value="">Chọn ngân hàng</option>
                        <option value="Vietcombank">Vietcombank</option>
                        <option value="Techcombank">Techcombank</option>
                        <option value="VietinBank">VietinBank</option>
                        <option value="BIDV">BIDV</option>
                        <option value="Sacombank">Sacombank</option>
                        <option value="ACB">ACB</option>
                        <option value="VPBank">VPBank</option>
                        <option value="MBBank">MBBank</option>
                        <option value="TPBank">TPBank</option>
                        <option value="Other">Khác</option>
                      </select>
                    )}
                  </div>
                </div>
              </div>

              {/* Thống kê hiệu suất */}
              <div className="shipper-profile-section">
                <h3 className="shipper-section-title">Hiệu suất làm việc</h3>
                <div className="shipper-stats-grid">
                  <div className="shipper-stat-card">
                    <div className="shipper-stat-value">{statistics.totalOrders}</div>
                    <div className="shipper-stat-label">Tổng đơn hàng</div>
                  </div>
                  <div className="shipper-stat-card">
                    <div className="shipper-stat-value">{statistics.completedOrders}</div>
                    <div className="shipper-stat-label">Đã hoàn thành</div>
                  </div>
                  <div className="shipper-stat-card">
                    <div className="shipper-stat-value">{formatCurrency(statistics.totalEarnings)}₫</div>
                    <div className="shipper-stat-label">Tổng thu nhập</div>
                  </div>
                  <div className="shipper-stat-card">
                    <div className="shipper-stat-value">
                      {statistics.totalOrders > 0 ? 
                        Math.round((statistics.completedOrders / statistics.totalOrders) * 100) : 0}%
                    </div>
                    <div className="shipper-stat-label">Tỷ lệ hoàn thành</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };
    

  const renderEditProfile = () => {
    const registrationInfo = user || {};
    
    return (
      <div className="shipper-edit-profile-content">
        <div className="shipper-content-header">
          <h2>{profile && Object.keys(profile).length > 0 ? 'Chỉnh sửa hồ sơ' : 'Tạo hồ sơ mới'}</h2>
          <p>Cập nhật thông tin hồ sơ của bạn</p>
          <button 
            type="button"
            className="shipper-btn-secondary"
            onClick={() => setActiveSection('profile')}
          >
            Trở lại
          </button>
        </div>
        
        {loading && <div className="shipper-loading">Đang xử lý...</div>}
        {error && <div className="shipper-error">Lỗi: {error}</div>}
        
        <form onSubmit={handleUpdateProfile} className="shipper-profile-form">
          {/* Thông tin cá nhân */}
          <div className="shipper-form-section">
            <h3 className="shipper-form-section-title">
              <span className="shipper-cv-icon">👤</span>
              Thông tin cá nhân
            </h3>
            <div className="shipper-form-grid">
              <div className="shipper-form-group">
                <label htmlFor="fullName">
                  Họ và tên <span className="shipper-required">*</span>
                  {registrationInfo?.fullName && (
                    <small className="shipper-form-hint">
                      (Từ đăng ký: {registrationInfo.fullName})
                    </small>
                  )}
                </label>
                <input
                  type="text"
                  id="fullName"
                  value={profileForm.fullName}
                  onChange={(e) => handleProfileFormChange('fullName', e.target.value)}
                  placeholder={registrationInfo?.fullName || "Nhập họ và tên"}
                  required
                />
              </div>
              
              <div className="shipper-form-group">
                <label htmlFor="email">
                  Email <span className="shipper-required">*</span>
                  {(registrationInfo?.email || user?.email) && (
                    <small className="shipper-form-hint">
                      (Từ tài khoản: {registrationInfo?.email || user?.email})
                    </small>
                  )}
                </label>
                <input
                  type="email"
                  id="email"
                  value={profileForm.email}
                  onChange={(e) => handleProfileFormChange('email', e.target.value)}
                  placeholder={registrationInfo?.email || user?.email || "Nhập email"}
                  required
                />
              </div>
              
              <div className="shipper-form-group">
                <label htmlFor="phone">Số điện thoại <span className="shipper-required">*</span></label>
                <input
                  type="tel"
                  id="phone"
                  value={profileForm.phone}
                  onChange={(e) => handleProfileFormChange('phone', e.target.value)}
                  placeholder="Nhập số điện thoại (VD: 0901234567)"
                  pattern="[0-9]{10,11}"
                  required
                />
              </div>
              
              <div className="shipper-form-group">
                <label htmlFor="address">Địa chỉ hiện tại</label>
                <textarea
                  id="address"
                  value={profileForm.address}
                  onChange={(e) => handleProfileFormChange('address', e.target.value)}
                  placeholder="Nhập địa chỉ hiện tại của bạn"
                  rows={2}
                />
              </div>
            </div>
          </div>

          {/* Thông tin phương tiện */}
          <div className="shipper-form-section">
            <h3 className="shipper-form-section-title">
              <span className="shipper-cv-icon">🚗</span>
              Thông tin phương tiện
            </h3>
            <div className="shipper-form-grid">
              <div className="shipper-form-group">
                <label htmlFor="vehicleType">Loại xe <span className="shipper-required">*</span></label>
                <select
                  id="vehicleType"
                  value={profileForm.vehicleType}
                  onChange={(e) => handleProfileFormChange('vehicleType', e.target.value)}
                  required
                >
                  <option value="">Chọn loại xe</option>
                  <option value="motorbike">🛵 Xe máy</option>
                  <option value="bicycle">🚲 Xe đạp</option>
                  <option value="electric-bike">⚡ Xe điện</option>
                  <option value="car">🚗 Xe hơi</option>
                </select>
              </div>
              
              <div className="shipper-form-group">
                <label htmlFor="vehiclePlate">Biển số xe</label>
                <input
                  type="text"
                  id="vehiclePlate"
                  value={profileForm.vehiclePlate}
                  onChange={(e) => handleProfileFormChange('vehiclePlate', e.target.value)}
                  placeholder="VD: 29-A1 123.45"
                />
              </div>
              
              <div className="shipper-form-group">
                <label htmlFor="driverLicense">Giấy phép lái xe</label>
                <input
                  type="text"
                  id="driverLicense"
                  value={profileForm.driverLicense}
                  onChange={(e) => handleProfileFormChange('driverLicense', e.target.value)}
                  placeholder="Số giấy phép lái xe"
                />
              </div>
              
              <div className="shipper-form-group">
                <label htmlFor="vehicleColor">Màu xe</label>
                <input
                  type="text"
                  id="vehicleColor"
                  value={profileForm.vehicleColor}
                  onChange={(e) => handleProfileFormChange('vehicleColor', e.target.value)}
                  placeholder="VD: Đỏ, Xanh, Trắng..."
                />
              </div>
            </div>
          </div>

          {/* Thông tin ngân hàng */}
          <div className="shipper-form-section">
            <h3 className="shipper-form-section-title">
              <span className="shipper-cv-icon">🏦</span>
              Thông tin ngân hàng
            </h3>
            <div className="shipper-form-grid">
              <div className="shipper-form-group">
                <label htmlFor="bankAccount">Số tài khoản</label>
                <input
                  type="text"
                  id="bankAccount"
                  value={profileForm.bankAccount}
                  onChange={(e) => handleProfileFormChange('bankAccount', e.target.value)}
                  placeholder="Nhập số tài khoản ngân hàng"
                />
              </div>
              
              <div className="shipper-form-group">
                <label htmlFor="bankName">Tên ngân hàng</label>
                <select
                  id="bankName"
                  value={profileForm.bankName}
                  onChange={(e) => handleProfileFormChange('bankName', e.target.value)}
                >
                  <option value="">Chọn ngân hàng</option>
                  <option value="Vietcombank">Vietcombank</option>
                  <option value="Techcombank">Techcombank</option>
                  <option value="VietinBank">VietinBank</option>
                  <option value="BIDV">BIDV</option>
                  <option value="Sacombank">Sacombank</option>
                  <option value="ACB">ACB</option>
                  <option value="VPBank">VPBank</option>
                  <option value="MBBank">MBBank</option>
                  <option value="TPBank">TPBank</option>
                  <option value="Other">Khác</option>
                </select>
              </div>
              
              <div className="shipper-form-group">
                <label htmlFor="bankAccountName">Tên chủ tài khoản</label>
                <input
                  type="text"
                  id="bankAccountName"
                  value={profileForm.bankAccountName}
                  onChange={(e) => handleProfileFormChange('bankAccountName', e.target.value)}
                  placeholder="Tên chủ tài khoản như trong sổ tiết kiệm"
                />
              </div>
            </div>
          </div>

          {/* Thông tin làm việc */}
          <div className="shipper-form-section">
            <h3 className="shipper-form-section-title">
              <span className="shipper-cv-icon">⏰</span>
              Thông tin làm việc
            </h3>
            <div className="shipper-form-grid">
              <div className="shipper-form-group">
                <label htmlFor="workingHours">Giờ làm việc ưa thích</label>
                <select
                  id="workingHours"
                  value={profileForm.workingHours}
                  onChange={(e) => handleProfileFormChange('workingHours', e.target.value)}
                >
                  <option value="">Chọn ca làm việc</option>
                  <option value="morning">🌅 Ca sáng (6:00 - 12:00)</option>
                  <option value="afternoon">☀️ Ca chiều (12:00 - 18:00)</option>
                  <option value="evening">🌆 Ca tối (18:00 - 22:00)</option>
                  <option value="flexible">🔄 Linh hoạt</option>
                </select>
              </div>
              
              <div className="shipper-form-group">
                <label htmlFor="workingArea">Khu vực làm việc</label>
                <textarea
                  id="workingArea"
                  value={profileForm.workingArea}
                  onChange={(e) => handleProfileFormChange('workingArea', e.target.value)}
                  placeholder="Các quận/huyện bạn muốn giao hàng (VD: Quận 1, Quận 3, Quận Bình Thạnh...)"
                  rows={2}
                />
              </div>
            </div>
          </div>
          
          <div className="shipper-form-actions">
            <button 
              type="button" 
              className="shipper-btn-secondary"
              onClick={() => setActiveSection('profile')}
            >
              ← Hủy
            </button>
            <button 
              type="submit" 
              className="shipper-btn-primary"
              disabled={loading}
            >
              {loading ? '💾 Đang lưu...' : `💾 ${profile ? 'Cập nhật CV' : 'Tạo CV mới'}`}
            </button>
          </div>
        </form>
      </div>
    );
  };

  // Main component render
  return (
    <div className="shipper-dashboard">
      {/* Sidebar */}
      <aside className="shipper-sidebar">
        {/* Sidebar Header */}
        <div className="shipper-sidebar-header">
          <div className="shipper-logo">
            <div className="shipper-logo-icon">☕</div>
            <div className="shipper-logo-text">Coffee Shipper</div>
          </div>
          
          <div className="shipper-info">
            <div className="shipper-avatar">
              🚴‍♂️
            </div>
            <div className="shipper-details">
              <div className="shipper-name">{user?.username?.split('@')[0] || 'Shipper'}</div>
              <div className="shipper-role">Nhân viên giao hàng</div>
            </div>
          </div>
        </div>

        {/* Sidebar Navigation */}
        <nav className="shipper-sidebar-nav">
          {sidebarItems.map((item) => (
            <div
              key={item.id}
              className={`shipper-nav-item ${activeSection === item.id ? 'active' : ''}`}
              onClick={() => setActiveSection(item.id)}
            >
              <div className="shipper-nav-icon">{item.icon}</div>
              <div className="shipper-nav-content">
                <div className="shipper-nav-label">{item.label}</div>
                <div className="shipper-nav-description">{item.description}</div>
              </div>
            </div>
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div className="shipper-sidebar-footer">
          <button 
            className="shipper-logout-btn"
            onClick={() => authService.logout()}
          >
            <span>🚪</span>
            Đăng xuất
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="shipper-main">
        <div className="shipper-header">
          <h1 className="shipper-page-title">
            {sidebarItems.find(item => item.id === activeSection)?.label || 'Tổng quan'}
          </h1>
          <div className="shipper-header-actions">
            <div className="shipper-greeting">
              {getGreeting()}, {user?.username?.split('@')[0] || 'Shipper'}!
            </div>
          </div>
        </div>

        <div className="shipper-content">
          {renderContent()}
        </div>
      </main>
      
      {/* Notification Container */}
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

      {/* Order Detail Modal */}
      {showOrderDetail && (
        <OrderDetailModal 
          order={selectedOrder}
          loading={orderDetailLoading}
          onClose={handleCloseOrderDetail}
          onAcceptOrder={handleAcceptOrder}
          onCalculateFee={handleCalculateFee}
          formatCurrency={formatCurrency}
          formatDate={formatDate}
        />
      )}
    </div>
  );
};

// OrderDetailModal Component
const OrderDetailModal = ({ order, loading, onClose, onAcceptOrder, onCalculateFee, formatCurrency, formatDate }) => {
  if (!order && !loading) return null;

  return (
    <div className="order-detail-overlay" onClick={onClose}>
      <div className="order-detail-modal" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="order-detail-header">
          <h2>📋 Chi tiết đơn hàng</h2>
          <button className="order-detail-close-btn" onClick={onClose}>✕</button>
        </div>

        {/* Modal Content */}
        <div className="order-detail-content">
          {loading ? (
            <div className="modal-loading">
              <div className="loading-spinner"></div>
              <p>Đang tải thông tin chi tiết...</p>
            </div>
          ) : order ? (
            <>
              {/* Order Info */}
              <div className="order-info-section">
                <div className="order-header-info">
                  <div className="order-id">
                    <span className="label">Mã đơn hàng:</span>
                    <span className="value">#{order.orderId?.slice(0,8).toUpperCase()}</span>
                  </div>
                  <div className="order-status">
                    <span className={`status-badge ${shipperAPI.getOrderStatusClass(order.status)}`}>
                      {shipperAPI.getOrderStatusText(order.status)}
                    </span>
                  </div>
                </div>
                <div className="order-time">
                  <span className="label">Thời gian đặt:</span>
                  <span className="value">{formatDate(order.createdAt)}</span>
                </div>
              </div>

              {/* Customer Info */}
              <div className="customer-info-section">
                <h3>👤 Thông tin khách hàng</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <span className="label">Tên khách hàng:</span>
                    <span className="value">{order.customerName || 'Không có tên'}</span>
                  </div>
                  <div className="info-item">
                    <span className="label">Số điện thoại:</span>
                    <span className="value phone">{order.deliveryPhone || 'Không có SĐT'}</span>
                  </div>
                  <div className="info-item full-width">
                    <span className="label">Địa chỉ giao hàng:</span>
                    <span className="value address">{order.deliveryAddress || 'Không có địa chỉ'}</span>
                  </div>
                  {order.deliveryNote && (
                    <div className="info-item full-width">
                      <span className="label">Ghi chú:</span>
                      <span className="value note">{order.deliveryNote}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Order Items */}
              <div className="order-items-section">
                <h3>🛒 Sản phẩm đặt hàng</h3>
                <div className="items-list">
                  {order.items && order.items.length > 0 ? (
                    order.items.map((item, index) => (
                      <div key={index} className="order-item">
                        <div className="item-main">
                          <div className="item-name">{item.productName || item.name}</div>
                          <div className="item-type">
                            <span className={`type-badge ${item.productType || 'default'}`}>
                              {item.productType === 'cake' ? '🎂 Bánh' : 
                               item.productType === 'drink' ? '☕ Đồ uống' : 
                               '📦 Sản phẩm'}
                            </span>
                          </div>
                        </div>
                        <div className="item-details">
                          <div className="item-quantity">
                            Số lượng: <strong>{item.quantity}</strong>
                          </div>
                          <div className="item-price">
                            Đơn giá: <strong>₫{formatCurrency(item.unitPrice)}</strong>
                          </div>
                          <div className="item-total">
                            Thành tiền: <strong>₫{formatCurrency(item.totalPrice)}</strong>
                          </div>
                        </div>
                        {item.toppings && item.toppings.length > 0 && (
                          <div className="item-toppings">
                            <span className="toppings-label">Toppings:</span>
                            {item.toppings.map((topping, idx) => (
                              <span key={idx} className="topping-item">
                                {topping.name} (+₫{formatCurrency(topping.price)})
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="no-items">Không có sản phẩm nào</div>
                  )}
                </div>
              </div>

              {/* Pricing Summary */}
              <div className="pricing-section">
                <h3>💰 Tổng kết đơn hàng</h3>
                <div className="pricing-breakdown">
                  <div className="price-line">
                    <span>Tổng tiền hàng:</span>
                    <span>₫{formatCurrency(order.totalAmount || order.totalPrice)}</span>
                  </div>
                  {order.discountAmount > 0 && (
                    <div className="price-line discount">
                      <span>Giảm giá:</span>
                      <span>-₫{formatCurrency(order.discountAmount)}</span>
                    </div>
                  )}
                  {order.appliedVoucherCode && (
                    <div className="price-line voucher">
                      <span>Voucher ({order.appliedVoucherCode}):</span>
                      <span>-₫{formatCurrency(order.voucherDiscount || 0)}</span>
                    </div>
                  )}
                  <div className="price-line final">
                    <span><strong>Tổng thanh toán:</strong></span>
                    <span><strong>₫{formatCurrency(order.finalPrice || order.totalAmount)}</strong></span>
                  </div>
                  <div className="payment-method">
                    <span>Phương thức thanh toán:</span>
                    <span className="payment-badge">
                      {order.paymentMethod === 'COD' ? '💵 Thu tiền khi giao' : 
                       order.paymentMethod === 'VNPAY' ? '💳 VNPay' : 
                       order.paymentMethod === 'MOMO' ? '📱 MoMo' : 
                       '💵 COD'}
                    </span>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="modal-error">
              <p>⚠️ Không thể tải thông tin đơn hàng</p>
            </div>
          )}
        </div>

        {/* Modal Actions */}
        {!loading && order && (
          <div className="order-detail-actions">
            <button 
              className="btn btn-secondary"
              onClick={onClose}
            >
              Đóng
            </button>
            <button 
              className="btn btn-info"
              onClick={() => {
                onCalculateFee(order.orderId);
              }}
            >
              💰 Tính phí ship
            </button>
            <button 
              className="btn btn-primary"
              onClick={() => {
                onAcceptOrder(order.orderId);
                onClose();
              }}
            >
              ✅ Nhận đơn hàng
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShipperDashboard;