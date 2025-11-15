import React from 'react';
import { useNotification } from '../contexts/NotificationContext';
import '../css/NotificationItem.css';

const NotificationItem = ({ notification, onClose }) => {
  const { markAsRead, deleteNotification, getNotificationIcon, formatNotificationTime } = useNotification();

  const handleMarkAsRead = async (e) => {
    e.stopPropagation();
    if (!notification.isRead) {
      await markAsRead(notification.notificationId);
    }
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    await deleteNotification(notification.notificationId);
  };

  const handleItemClick = () => {
    // Mark as read when clicked
    if (!notification.isRead) {
      markAsRead(notification.notificationId);
    }
    
    // Handle navigation based on notification type
    if (notification.orderId) {
      // Navigate to order details or orders page
      window.location.href = '/orders';
    }
    
    if (onClose) {
      onClose();
    }
  };

  const getNotificationTypeClass = () => {
    switch (notification.type) {
      case 'OrderConfirmed':
        return 'notification-success';
      case 'ShipperAccepted':
      case 'OrderShipping':
        return 'notification-info';
      case 'OrderDelivered':
      case 'PointsEarned':
        return 'notification-success';
      case 'OrderCancelled':
        return 'notification-danger';
      case 'Promotion':
        return 'notification-warning';
      default:
        return 'notification-default';
    }
  };

  return (
    <div 
      className={`notification-item ${!notification.isRead ? 'unread' : 'read'} ${getNotificationTypeClass()}`}
      onClick={handleItemClick}
    >
      {/* Unread indicator */}
      {!notification.isRead && <div className="unread-indicator"></div>}
      
      {/* Notification Icon */}
      <div className="notification-icon">
        <span className="icon-emoji">{getNotificationIcon(notification.type)}</span>
      </div>
      
      {/* Notification Content */}
      <div className="notification-content">
        <div className="notification-header">
          <h4 className="notification-title">{notification.title}</h4>
          <span className="notification-time">
            {formatNotificationTime(notification.createdAt)}
          </span>
        </div>
        
        <p className="notification-message">{notification.message}</p>
        
        {/* Additional data display */}
        {notification.data && (
          <div className="notification-data">
            {notification.data.orderId && (
              <span className="data-tag order-tag">
                📋 Đơn hàng: #{notification.data.orderId.substring(0, 8)}
              </span>
            )}
            {notification.data.finalPrice && (
              <span className="data-tag price-tag">
                💰 {notification.data.finalPrice.toLocaleString()}đ
              </span>
            )}
            {notification.data.points && (
              <span className="data-tag points-tag">
                ⭐ +{notification.data.points} điểm
              </span>
            )}
            {notification.data.shipperName && (
              <span className="data-tag shipper-tag">
                🚚 {notification.data.shipperName}
              </span>
            )}
          </div>
        )}
      </div>
      
      {/* Action buttons */}
      <div className="notification-actions">
        {!notification.isRead && (
          <button 
            className="action-btn read-btn" 
            onClick={handleMarkAsRead}
            title="Đánh dấu đã đọc"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        )}
        
        <button 
          className="action-btn delete-btn" 
          onClick={handleDelete}
          title="Xóa thông báo"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
    </div>
  );
};

export default NotificationItem;