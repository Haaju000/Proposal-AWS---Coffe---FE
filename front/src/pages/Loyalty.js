import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import loyaltyService from '../services/loyaltyService';
import Header from '../components/Header';
import Footer from '../components/Footer';
import '../css/Loyalty.css';

const Loyalty = () => {
  const { user } = useAuth();
  const [loyaltyData, setLoyaltyData] = useState(null);
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('available');

  useEffect(() => {
    fetchLoyaltyData();
  }, []);

  const fetchLoyaltyData = async () => {
    try {
      setLoading(true);
      const [pointsData, vouchersData] = await Promise.all([
        loyaltyService.getMyPoints(),
        loyaltyService.getMyVouchers()
      ]);
      
      // Log để debug
      console.log('Points data:', pointsData);
      console.log('Vouchers data:', vouchersData);
      
      setLoyaltyData(pointsData);
      setVouchers(vouchersData);
    } catch (error) {
      console.error('Error fetching loyalty data:', error);
      // Set default data nếu lỗi
      setLoyaltyData({
        availableVouchers: 0,
        usedVouchers: 0,
        expiredVouchers: 0,
        currentPoints: user?.rewardPoints || 0
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Lọc voucher theo trạng thái
  const availableVouchers = vouchers.filter(v => !v.isUsed && new Date(v.expirationDate) > new Date());
  const usedVouchers = vouchers.filter(v => v.isUsed);
  const expiredVouchers = vouchers.filter(v => !v.isUsed && new Date(v.expirationDate) <= new Date());

  const getVouchersByTab = () => {
    switch (activeTab) {
      case 'available': return availableVouchers;
      case 'used': return usedVouchers;
      case 'expired': return expiredVouchers;
      default: return availableVouchers;
    }
  };

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    // Có thể thêm notification ở đây
  };

  if (loading) {
    return (
      <div className="loyalty-page">
        <Header />
        <div className="loyalty-loading-container">
          <div className="loyalty-loading">
            <div className="loading-spinner-large"></div>
            <h3>Đang tải thông tin loyalty...</h3>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="loyalty-page">
      <Header />
      
      <main className="loyalty-main">
        {/* Hero Section */}
        <section className="loyalty-hero">
          <div className="loyalty-hero-bg"></div>
          <div className="loyalty-container">
            <div className="loyalty-hero-content">
              <h1 className="loyalty-title">Chương trình khách hàng thân thiết</h1>
              <p className="loyalty-subtitle">Tích điểm với mỗi lần mua và nhận voucher giảm giá hấp dẫn</p>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="loyalty-stats-section">
          <div className="loyalty-container">
            <div className="loyalty-user-card">
              <div className="user-card-header">
                <div className="user-avatar-xl">
                  <span className="user-initials-xl">
                    {user?.firstName ? 
                      (user.firstName.charAt(0) + (user.lastName ? user.lastName.charAt(0) : '')).toUpperCase() :
                      user?.username?.charAt(0).toUpperCase()
                    }
                  </span>
                </div>
                <div className="user-details-xl">
                  <h2 className="user-name-xl">
                    {user?.firstName && user?.lastName ? 
                      `${user.firstName} ${user.lastName}` : 
                      user?.username
                    }
                  </h2>
                  <p className="user-status">Khách hàng thân thiết</p>
                  
                  {/* Hiển thị điểm thưởng */}
                  {(loyaltyData || user?.rewardPoints !== undefined) && (
                    <div className="user-loyalty-points">
                      <div className="points-display">
                        <div className="points-icon">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                            <path d="M12 2L15.09 8.26L22 9L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9L8.91 8.26L12 2Z" fill="#8B4513"/>
                          </svg>
                        </div>
                        <div className="points-info">
                          <span className="points-number">
                            {loyaltyData?.currentPoints !== undefined ? loyaltyData.currentPoints : (user?.rewardPoints || 0)}
                          </span>
                          <span className="points-label">điểm thưởng</span>
                        </div>
                      </div>
                      <div className="points-progress">
                        <div className="progress-bar-container">
                          <div 
                            className="progress-bar-fill"
                            style={{
                              width: `${Math.min(((loyaltyData?.currentPoints !== undefined ? loyaltyData.currentPoints : (user?.rewardPoints || 0)) % 100), 100)}%`
                            }}
                          ></div>
                        </div>
                        <span className="progress-text">
                          {(loyaltyData?.currentPoints !== undefined ? loyaltyData.currentPoints : (user?.rewardPoints || 0)) >= 100 ? 
                            'Đã đủ điểm để đổi voucher!' : 
                            `Còn ${100 - ((loyaltyData?.currentPoints !== undefined ? loyaltyData.currentPoints : (user?.rewardPoints || 0)) % 100)} điểm để nhận voucher`
                          }
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              
            </div>
          </div>
        </section>

        {/* Vouchers Section */}
        <section className="loyalty-vouchers-section">
          <div className="loyalty-container">
            <div className="vouchers-header">
              <h2>Voucher của bạn</h2>
              <div className="voucher-tabs">
                <button 
                  className={`tab-btn ${activeTab === 'available' ? 'active' : ''}`}
                  onClick={() => setActiveTab('available')}
                >
                  Khả dụng ({availableVouchers.length})
                </button>
                <button 
                  className={`tab-btn ${activeTab === 'used' ? 'active' : ''}`}
                  onClick={() => setActiveTab('used')}
                >
                  Đã dùng ({usedVouchers.length})
                </button>
                <button 
                  className={`tab-btn ${activeTab === 'expired' ? 'active' : ''}`}
                  onClick={() => setActiveTab('expired')}
                >
                  Hết hạn ({expiredVouchers.length})
                </button>
              </div>
            </div>

            <div className="vouchers-content">
              {getVouchersByTab().length === 0 ? (
                <div className="vouchers-empty">
                  <div className="empty-icon">
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
                      <path d="M12 2L15.09 8.26L22 9L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9L8.91 8.26L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <h3>
                    {activeTab === 'available' && 'Chưa có voucher khả dụng'}
                    {activeTab === 'used' && 'Chưa sử dụng voucher nào'}
                    {activeTab === 'expired' && 'Không có voucher hết hạn'}
                  </h3>
                  <p>
                    {activeTab === 'available' && 'Tiếp tục mua sắm để tích điểm và nhận voucher!'}
                    {activeTab === 'used' && 'Sử dụng voucher để nhận ưu đãi tuyệt vời!'}
                    {activeTab === 'expired' && 'Hãy sử dụng voucher trước khi hết hạn!'}
                  </p>
                </div>
              ) : (
                <div className="vouchers-grid">
                  {getVouchersByTab().map((voucher, index) => (
                    <div key={index} className={`voucher-card ${activeTab}`}>
                      <div className="voucher-card-header">
                        <div className="voucher-type-icon">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                            <path d="M12 2L15.09 8.26L22 9L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9L8.91 8.26L12 2Z" fill="currentColor"/>
                          </svg>
                        </div>
                        <span className="voucher-status-badge">
                          {activeTab === 'available' && 'Khả dụng'}
                          {activeTab === 'used' && 'Đã dùng'}
                          {activeTab === 'expired' && 'Hết hạn'}
                        </span>
                      </div>
                      
                      <div className="voucher-card-body">
                        <div className="voucher-value">
                          Giảm {Math.round(voucher.discountValue * 100)}%
                        </div>
                        <div className="voucher-code">
                          <span>Mã: {voucher.code}</span>
                          {activeTab === 'available' && (
                            <button 
                              className="copy-btn"
                              onClick={() => handleCopyCode(voucher.code)}
                              title="Copy mã voucher"
                            >
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                <path d="M16 4H18C19.1 4 20 4.9 20 6V18C20 19.1 19.1 20 18 20H6C4.9 20 4 19.1 4 18V6C4 4.9 4.9 4 6 4H8M16 4V2M8 4V2M8 4H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            </button>
                          )}
                        </div>
                        <div className="voucher-expiry">
                          {activeTab === 'expired' ? 'Đã hết hạn' : 'Hết hạn'}: {formatDate(voucher.expirationDate)}
                        </div>
                      </div>
                      
                      {activeTab === 'available' && (
                        <div className="voucher-card-footer">
                          <button className="use-voucher-btn">
                            Sử dụng ngay
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="loyalty-how-section">
          <div className="loyalty-container">
            <div className="how-header">
              <h2>Cách thức hoạt động</h2>
              <p>Chương trình loyalty points đơn giản và dễ sử dụng</p>
            </div>
            
            <div className="how-steps">
              <div className="step-card">
                <div className="step-number">1</div>
                <div className="step-content">
                  <h3>Mua sắm</h3>
                  <p>Mỗi 10.000 VNĐ = 1 điểm thưởng</p>
                </div>
              </div>
              
              <div className="step-card">
                <div className="step-number">2</div>
                <div className="step-content">
                  <h3>Tích điểm</h3>
                  <p>Tích đủ 100 điểm để nhận voucher giảm giá 10%</p>
                </div>
              </div>
              
              <div className="step-card">
                <div className="step-number">3</div>
                <div className="step-content">
                  <h3>Sử dụng voucher</h3>
                  <p>Áp dụng voucher cho đơn hàng tiếp theo của bạn</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Loyalty;
