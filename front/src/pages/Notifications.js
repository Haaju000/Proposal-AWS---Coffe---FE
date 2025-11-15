import React, { useEffect, useState } from 'react';
import { useNotification } from '../contexts/NotificationContext';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/Header';
import Footer from '../components/Footer';
import NotificationItem from '../components/NotificationItem';
import '../css/Notifications.css';

const Notifications = () => {
  const { user } = useAuth();
  const {
    notifications,
    unreadCount,
    loading,
    error,
    fetchNotifications,
    markAllAsRead,
    clearError
  } = useNotification();

  const [filter, setFilter] = useState('all'); // 'all', 'unread', 'read'
  const [sortBy, setSortBy] = useState('newest'); // 'newest', 'oldest'

  useEffect(() => {
    // Fetch notifications when component mounts
    fetchNotifications(true);
  }, [fetchNotifications]);

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
  };

  const handleRefresh = () => {
    fetchNotifications(true);
    if (error) clearError();
  };

  // Filter notifications
  const filteredNotifications = notifications.filter(notification => {
    switch (filter) {
      case 'unread':
        return !notification.isRead;
      case 'read':
        return notification.isRead;
      default:
        return true;
    }
  });

  // Sort notifications
  const sortedNotifications = [...filteredNotifications].sort((a, b) => {
    const aDate = new Date(a.createdAt);
    const bDate = new Date(b.createdAt);
    
    return sortBy === 'newest' ? bDate - aDate : aDate - bDate;
  });

  return (
    <div className="notifications-page">
      <Header />
      
      <main className="notifications-main">
        <div className="notifications-container">
          {/* Page Header */}
          <div className="page-header">
            <div className="header-content">
              <div className="header-title-section">
                <h1 className="page-title">
                  <span className="title-icon">🔔</span>
                  Thông báo
                </h1>
                <p className="page-subtitle">
                  Quản lý tất cả thông báo của bạn
                </p>
              </div>
              
              <div className="header-stats">
                <div className="stat-item">
                  <span className="stat-number">{notifications.length}</span>
                  <span className="stat-label">Tổng cộng</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number unread">{unreadCount}</span>
                  <span className="stat-label">Chưa đọc</span>
                </div>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="notifications-controls">
            <div className="controls-left">
              {/* Filter buttons */}
              <div className="filter-buttons">
                <button 
                  className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                  onClick={() => setFilter('all')}
                >
                  Tất cả ({notifications.length})
                </button>
                <button 
                  className={`filter-btn ${filter === 'unread' ? 'active' : ''}`}
                  onClick={() => setFilter('unread')}
                >
                  Chưa đọc ({unreadCount})
                </button>
                <button 
                  className={`filter-btn ${filter === 'read' ? 'active' : ''}`}
                  onClick={() => setFilter('read')}
                >
                  Đã đọc ({notifications.length - unreadCount})
                </button>
              </div>

              {/* Sort dropdown */}
              <select 
                className="sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="newest">Mới nhất trước</option>
                <option value="oldest">Cũ nhất trước</option>
              </select>
            </div>

            <div className="controls-right">
              {unreadCount > 0 && (
                <button 
                  className="control-btn mark-all-btn"
                  onClick={handleMarkAllAsRead}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Đánh dấu tất cả đã đọc
                </button>
              )}
              
              <button 
                className="control-btn refresh-btn"
                onClick={handleRefresh}
                disabled={loading}
              >
                <svg 
                  width="16" 
                  height="16" 
                  viewBox="0 0 24 24" 
                  fill="none"
                  className={loading ? 'spinning' : ''}
                >
                  <path d="M1 4V10H7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M23 20V14H17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M20.49 9C19.9828 7.56678 19.1209 6.28392 17.9845 5.27477C16.8482 4.26562 15.4745 3.56905 13.9917 3.24575C12.5089 2.92246 10.9652 2.98546 9.51894 3.42597C8.07267 3.86649 6.76757 4.67183 5.73 5.76L1 10M23 14L18.27 18.24C17.2324 19.3282 15.9273 20.1335 14.4811 20.574C13.0348 21.0145 11.4911 21.0775 10.0083 20.7543C8.52547 20.431 7.1518 19.7344 6.01547 18.7252C4.87913 17.7161 4.01717 16.4332 3.51 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Làm mới
              </button>
            </div>
          </div>

          {/* Error State */}
          {error && (
            <div className="error-banner">
              <div className="error-content">
                <span className="error-icon">⚠️</span>
                <div className="error-text">
                  <strong>Có lỗi xảy ra:</strong> {error}
                </div>
                <button className="error-retry" onClick={handleRefresh}>
                  Thử lại
                </button>
              </div>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="loading-banner">
              <div className="loading-spinner"></div>
              <span>Đang tải thông báo...</span>
            </div>
          )}

          {/* Notifications List */}
          <div className="notifications-content">
            {!loading && !error && sortedNotifications.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">
                  {filter === 'unread' ? '✅' : filter === 'read' ? '📭' : '🔔'}
                </div>
                <h3 className="empty-title">
                  {filter === 'unread' 
                    ? 'Không có thông báo chưa đọc'
                    : filter === 'read'
                    ? 'Không có thông báo đã đọc'
                    : 'Chưa có thông báo nào'
                  }
                </h3>
                <p className="empty-description">
                  {filter === 'unread'
                    ? 'Bạn đã đọc tất cả thông báo. Tuyệt vời!'
                    : filter === 'read'
                    ? 'Bạn chưa đọc thông báo nào.'
                    : 'Các thông báo về đơn hàng và khuyến mãi sẽ xuất hiện tại đây.'
                  }
                </p>
                
                {filter !== 'all' && (
                  <button 
                    className="empty-action-btn"
                    onClick={() => setFilter('all')}
                  >
                    Xem tất cả thông báo
                  </button>
                )}
              </div>
            ) : (
              <div className="notifications-list">
                {sortedNotifications.map((notification) => (
                  <NotificationItem
                    key={notification.notificationId}
                    notification={notification}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Load More (if needed for pagination) */}
          {sortedNotifications.length >= 50 && (
            <div className="load-more">
              <button className="load-more-btn" onClick={() => fetchNotifications(false)}>
                Tải thêm thông báo
              </button>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Notifications;