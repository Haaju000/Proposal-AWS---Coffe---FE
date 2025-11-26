import React, { useState, useRef, useEffect } from 'react';
import { useNotification } from '../contexts/NotificationContext';
import NotificationItem from './NotificationItem';
import '../css/NotificationDropdown.css';

const NotificationDropdown = () => {
  const {
    notifications,
    unreadCount,
    loading,
    error,
    fetchNotifications,
    markAllAsRead,
    clearError
  } = useNotification();

  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all'); // 'all' or 'unread'
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Fetch notifications when dropdown opens
  useEffect(() => {
    if (isOpen) {
      fetchNotifications(false); // Don't show loading spinner for dropdown opens
    }
  }, [isOpen, fetchNotifications]);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
    if (error) {
      clearError();
    }
  };

  const closeDropdown = () => {
    setIsOpen(false);
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
  };

  const handleRefresh = () => {
    fetchNotifications(true);
  };

  // Filter notifications based on active tab
  const filteredNotifications = activeTab === 'unread' 
    ? notifications.filter(n => !n.isRead)
    : notifications;

  const displayedNotifications = filteredNotifications.slice(0, 8); // Giới hạn 8 thông báo cho gọn gàng

  return (
    <div className="notification-dropdown" ref={dropdownRef}>
      {/* Modern Bell Icon with Badge */}
      <button 
        className={`notification-bell ${isOpen ? 'active' : ''} ${unreadCount > 0 ? 'has-notifications' : ''}`}
        onClick={toggleDropdown}
        title={`Thông báo (${unreadCount} chưa đọc)`}
      >
        <div className="bell-icon-wrapper">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path 
              d="M12 2C13.1 2 14 2.9 14 4V5.1C16.3 6.2 18 8.5 18 11.1V16L20 18V19H4V18L6 16V11.1C6 8.5 7.7 6.2 10 5.1V4C10 2.9 10.9 2 12 2M21 7V8H19V7H21M23 11V12H19V11H23M21 15V16H19V15H21Z" 
              fill="currentColor"
            />
            <path 
              d="M10.5 21C10.5 21.8 11.2 22.5 12 22.5S13.5 21.8 13.5 21" 
              stroke="currentColor" 
              strokeWidth="1.5" 
              strokeLinecap="round"
            />
          </svg>
          
          {/* Modern Badge */}
          {unreadCount > 0 && (
            <span className="notification-badge">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
          
          {/* Subtle pulse for new notifications */}
          {unreadCount > 0 && <div className="notification-pulse"></div>}
        </div>
      </button>

      {/* Modern Dropdown Content */}
      {isOpen && (
        <div className="notification-dropdown-content">
          {/* Sleek Header */}
          <div className="dropdown-header">
            <div className="header-left">
              <h3 className="header-title">Thông báo</h3>
              {unreadCount > 0 && (
                <span className="unread-indicator">
                  {unreadCount} mới
                </span>
              )}
            </div>
            
            <div className="header-actions">
              {unreadCount > 0 && (
                <button 
                  className="action-btn mark-all-btn" 
                  onClick={handleMarkAllAsRead}
                  title="Đánh dấu tất cả đã đọc"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path 
                      d="M20 6L9 17L4 12" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              )}
              
              <button 
                className="action-btn refresh-btn" 
                onClick={handleRefresh}
                disabled={loading}
                title="Làm mới"
              >
                <svg 
                  width="14" 
                  height="14" 
                  viewBox="0 0 24 24" 
                  fill="none"
                  className={loading ? 'spinning' : ''}
                >
                  <path 
                    d="M1 4V10H7" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  />
                  <path 
                    d="M23 20V14H17" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  />
                  <path 
                    d="M20.49 9C19.9828 7.56678 19.1209 6.28392 17.9845 5.27477C16.8482 4.26562 15.4745 3.56905 13.9917 3.24575C12.5089 2.92246 10.9652 2.98546 9.51894 3.42597C8.07267 3.86649 6.76757 4.67183 5.73 5.76L1 10M23 14L18.27 18.24C17.2324 19.3282 15.9273 20.1335 14.4811 20.574C13.0348 21.0145 11.4911 21.0775 10.0083 20.7543C8.52547 20.431 7.1518 19.7344 6.01547 18.7252C4.87913 17.7161 4.01717 16.4332 3.51 15" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Clean Tab Navigation */}
          <div className="notification-tabs">
            <button 
              className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`}
              onClick={() => setActiveTab('all')}
            >
              <span>Tất cả</span>
              <span className="tab-count">{notifications.length}</span>
            </button>
            <button 
              className={`tab-btn ${activeTab === 'unread' ? 'active' : ''}`}
              onClick={() => setActiveTab('unread')}
            >
              <span>Chưa đọc</span>
              {unreadCount > 0 && <span className="tab-count unread">{unreadCount}</span>}
            </button>
          </div>

          {/* Error State */}
          {error && (
            <div className="error-state">
              <div className="error-icon">🚨</div>
              <div className="error-content">
                <p className="error-title">Không thể tải thông báo</p>
                <p className="error-message">{error}</p>
                <button className="error-retry" onClick={handleRefresh}>
                  Thử lại
                </button>
              </div>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <span className="loading-text">Đang tải...</span>
            </div>
          )}

          {/* Modern Notifications List */}
          <div className="notifications-list">
            {!loading && !error && displayedNotifications.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">
                  {activeTab === 'unread' ? '🔔' : '📥'}
                </div>
                <div className="empty-content">
                  <h4 className="empty-title">
                    {activeTab === 'unread' 
                      ? 'Bạn đã đọc hết rồi!' 
                      : 'Chưa có thông báo'
                    }
                  </h4>
                  <p className="empty-subtitle">
                    {activeTab === 'unread' 
                      ? 'Không có thông báo chưa đọc nào cả' 
                      : 'Các thông báo sẽ hiển thị ở đây'
                    }
                  </p>
                </div>
              </div>
            ) : (
              <>
                {displayedNotifications.map((notification) => (
                  <NotificationItem
                    key={notification.notificationId}
                    notification={notification}
                    onClose={closeDropdown}
                  />
                ))}
                
                {/* Show more indicator */}
                {filteredNotifications.length > displayedNotifications.length && (
                  <div className="show-more-indicator">
                    <span>+{filteredNotifications.length - displayedNotifications.length} thông báo khác</span>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Clean Footer */}
          {!loading && !error && filteredNotifications.length > 0 && (
            <div className="dropdown-footer">
              <button 
                className="view-all-btn"
                onClick={() => {
                  closeDropdown();
                  window.location.href = '/notifications';
                }}
              >
                Xem tất cả thông báo
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;