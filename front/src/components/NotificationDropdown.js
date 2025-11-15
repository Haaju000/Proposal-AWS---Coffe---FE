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

  const displayedNotifications = filteredNotifications.slice(0, 20); // Limit to 20 for performance

  return (
    <div className="notification-dropdown" ref={dropdownRef}>
      {/* Bell Icon with Badge */}
      <button 
        className={`notification-bell ${isOpen ? 'active' : ''} ${unreadCount > 0 ? 'has-notifications' : ''}`}
        onClick={toggleDropdown}
        title={`Thông báo (${unreadCount} chưa đọc)`}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path 
            d="M18 8C18 6.4087 17.3679 4.88258 16.2426 3.75736C15.1174 2.63214 13.5913 2 12 2C10.4087 2 8.88258 2.63214 7.75736 3.75736C6.63214 4.88258 6 6.4087 6 8C6 15 3 17 3 17H21C21 17 18 15 18 8Z" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          />
          <path 
            d="M13.73 21C13.5542 21.3031 13.3019 21.5547 12.9982 21.7295C12.6946 21.9044 12.3504 21.9965 12 21.9965C11.6496 21.9965 11.3054 21.9044 11.0018 21.7295C10.6982 21.5547 10.4458 21.3031 10.27 21" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          />
        </svg>
        
        {/* Notification Badge */}
        {unreadCount > 0 && (
          <span className="notification-badge">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
        
        {/* Pulse animation for new notifications */}
        {unreadCount > 0 && <div className="notification-pulse"></div>}
      </button>

      {/* Dropdown Content */}
      {isOpen && (
        <div className="notification-dropdown-content">
          {/* Header */}
          <div className="dropdown-header">
            <div className="header-title">
              <h3>Thông báo</h3>
              <span className="notification-count">
                {unreadCount > 0 && `${unreadCount} chưa đọc`}
              </span>
            </div>
            
            <div className="header-actions">
              <button 
                className="header-btn refresh-btn" 
                onClick={handleRefresh}
                disabled={loading}
                title="Làm mới"
              >
                <svg 
                  width="16" 
                  height="16" 
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
              
              <button 
                className="header-btn close-btn" 
                onClick={closeDropdown}
                title="Đóng"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path 
                    d="M18 6L6 18M6 6L18 18" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="notification-tabs">
            <button 
              className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`}
              onClick={() => setActiveTab('all')}
            >
              Tất cả ({notifications.length})
            </button>
            <button 
              className={`tab-btn ${activeTab === 'unread' ? 'active' : ''}`}
              onClick={() => setActiveTab('unread')}
            >
              Chưa đọc ({unreadCount})
            </button>
          </div>

          {/* Action Bar */}
          {unreadCount > 0 && (
            <div className="action-bar">
              <button 
                className="action-bar-btn mark-all-read"
                onClick={handleMarkAllAsRead}
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
                Đánh dấu tất cả đã đọc
              </button>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="error-message">
              <span className="error-icon">⚠️</span>
              <span className="error-text">{error}</span>
              <button className="error-retry" onClick={handleRefresh}>
                Thử lại
              </button>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <span>Đang tải thông báo...</span>
            </div>
          )}

          {/* Notifications List */}
          <div className="notifications-list">
            {!loading && !error && displayedNotifications.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">🔔</div>
                <div className="empty-text">
                  {activeTab === 'unread' 
                    ? 'Không có thông báo chưa đọc' 
                    : 'Chưa có thông báo nào'
                  }
                </div>
              </div>
            ) : (
              displayedNotifications.map((notification) => (
                <NotificationItem
                  key={notification.notificationId}
                  notification={notification}
                  onClose={closeDropdown}
                />
              ))
            )}
          </div>

          {/* Footer */}
          {filteredNotifications.length > 20 && (
            <div className="dropdown-footer">
              <button 
                className="view-all-btn"
                onClick={() => {
                  closeDropdown();
                  // Navigate to full notifications page
                  window.location.href = '/notifications';
                }}
              >
                Xem tất cả thông báo ({filteredNotifications.length})
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;