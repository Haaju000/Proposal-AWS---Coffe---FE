  const renderProfile = () => {
    return (
      <div className="shipper-profile-content">
        <div className="shipper-content-header">
          <h2>Hồ sơ cá nhân</h2>
          <p>Thông tin chi tiết về hồ sơ shipper của bạn</p>
        </div>
        
        {loading && <div className="shipper-loading">Đang tải dữ liệu...</div>}
        {error && <div className="shipper-error">Lỗi: {error}</div>}
        
        {/* Hiển thị thông báo khi chưa có profile */}
        {!loading && !error && (!profile || Object.keys(profile).length === 0) && (
          <div className="shipper-profile-notice">
            <h3>Chưa có hồ sơ cá nhân</h3>
            <p>Hãy tạo hồ sơ để bắt đầu nhận đơn hàng giao hàng!</p>
            <button 
              className="shipper-btn-primary"
              onClick={() => setActiveSection('edit-profile')}
            >
              Tạo hồ sơ ngay
            </button>
          </div>
        )}
        
        {/* Profile Container - chỉ hiển thị khi có data */}
        {!loading && profile && Object.keys(profile).length > 0 && (
          <div className="shipper-profile-container">
            {/* Profile Header */}
            <div className="shipper-profile-header">
              <div className="shipper-profile-avatar">
                {(profile.fullName || 'S').charAt(0).toUpperCase()}
              </div>
              <h1 className="shipper-profile-name">
                {profile.fullName || 'Chưa cập nhật họ tên'}
              </h1>
              <p className="shipper-profile-title">Nhân viên giao hàng Coffee Shop</p>
              
              <div className="shipper-profile-contact">
                {profile.phone && (
                  <div className="shipper-contact-item">
                    <span className="shipper-contact-label">Điện thoại</span>
                    <span className="shipper-contact-value">{profile.phone}</span>
                  </div>
                )}
                <div className="shipper-contact-item">
                  <span className="shipper-contact-label">Tham gia</span>
                  <span className="shipper-contact-value">
                    {user?.createdAt ? formatDate(user.createdAt) : 'N/A'}
                  </span>
                </div>
              </div>
              
              <div className="shipper-profile-actions">
                <button 
                  className="shipper-edit-btn"
                  onClick={() => setActiveSection('edit-profile')}
                >
                  Chỉnh sửa hồ sơ
                </button>
              </div>
            </div>

            {/* Profile Body */}
            <div className="shipper-profile-body">
              {/* Thông tin cá nhân */}
              <div className="shipper-profile-section">
                <h3 className="shipper-section-title">Thông tin cá nhân</h3>
                <div className="shipper-info-grid">
                  <div className="shipper-info-item">
                    <span className="shipper-info-label">Họ và tên</span>
                    <span className={`shipper-info-value ${!profile.fullName ? 'empty' : ''}`}>
                      {profile.fullName || 'Chưa cập nhật'}
                    </span>
                  </div>
                  <div className="shipper-info-item">
                    <span className="shipper-info-label">Số điện thoại</span>
                    <span className={`shipper-info-value ${!profile.phone ? 'empty' : ''}`}>
                      {profile.phone || 'Chưa cập nhật'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Thông tin phương tiện */}
              <div className="shipper-profile-section">
                <h3 className="shipper-section-title">Thông tin phương tiện</h3>
                <div className="shipper-info-grid">
                  <div className="shipper-info-item">
                    <span className="shipper-info-label">Loại xe</span>
                    <span className={`shipper-info-value ${!profile.vehicleType ? 'empty' : ''}`}>
                      {profile.vehicleType || 'Chưa cập nhật'}
                    </span>
                  </div>
                  <div className="shipper-info-item">
                    <span className="shipper-info-label">Biển số xe</span>
                    <span className={`shipper-info-value ${!profile.vehiclePlate ? 'empty' : ''}`}>
                      {profile.vehiclePlate || 'Chưa cập nhật'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Thông tin ngân hàng */}
              <div className="shipper-profile-section">
                <h3 className="shipper-section-title">Thông tin ngân hàng</h3>
                <div className="shipper-info-grid">
                  <div className="shipper-info-item">
                    <span className="shipper-info-label">Số tài khoản</span>
                    <span className={`shipper-info-value ${!profile.bankAccount ? 'empty' : ''}`}>
                      {profile.bankAccount || 'Chưa cập nhật'}
                    </span>
                  </div>
                  <div className="shipper-info-item">
                    <span className="shipper-info-label">Tên ngân hàng</span>
                    <span className={`shipper-info-value ${!profile.bankName ? 'empty' : ''}`}>
                      {profile.bankName || 'Chưa cập nhật'}
                    </span>
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
    return (
      <div className="shipper-profile-content">
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
            <h3 className="shipper-form-section-title">Thông tin cá nhân</h3>
            <div className="shipper-form-grid">
              <div className="shipper-form-group">
                <label htmlFor="fullName">
                  Họ và tên <span className="shipper-required">*</span>
                </label>
                <input
                  type="text"
                  id="fullName"
                  value={profileForm.fullName}
                  onChange={(e) => handleProfileFormChange('fullName', e.target.value)}
                  placeholder="Nhập họ và tên"
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
            </div>
          </div>

          {/* Thông tin phương tiện */}
          <div className="shipper-form-section">
            <h3 className="shipper-form-section-title">Thông tin phương tiện</h3>
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
                  <option value="motorbike">Xe máy</option>
                  <option value="bicycle">Xe đạp</option>
                  <option value="electric-bike">Xe điện</option>
                  <option value="car">Xe hơi</option>
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
            </div>
          </div>

          {/* Thông tin ngân hàng */}
          <div className="shipper-form-section">
            <h3 className="shipper-form-section-title">Thông tin ngân hàng</h3>
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
            </div>
          </div>
          
          <div className="shipper-form-actions">
            <button 
              type="button" 
              className="shipper-btn-secondary"
              onClick={() => setActiveSection('profile')}
            >
              Hủy
            </button>
            <button 
              type="submit" 
              className="shipper-btn-primary"
              disabled={loading}
            >
              {loading ? 'Đang lưu...' : `${profile && Object.keys(profile).length > 0 ? 'Cập nhật hồ sơ' : 'Tạo hồ sơ mới'}`}
            </button>
          </div>
        </form>
      </div>
    );
  };