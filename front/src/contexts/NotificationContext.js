import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import notificationService from '../services/notificationService';
import { useAuth } from './AuthContext';

const NotificationContext = createContext();

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  
  // States
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastFetchTime, setLastFetchTime] = useState(null);

  // Auto-refresh interval (5 minutes)
  const REFRESH_INTERVAL = 5 * 60 * 1000;

  /**
   * Fetch notifications from API
   */
  const fetchNotifications = useCallback(async (showLoading = true) => {
    if (!isAuthenticated || !user) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    try {
      if (showLoading) setLoading(true);
      setError(null);

      const data = await notificationService.getNotifications(50);
      
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
      setLastFetchTime(new Date());
      
      console.log(`[NotificationContext] Fetched ${data.notifications?.length || 0} notifications, ${data.unreadCount || 0} unread`);
      
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setError(error.message);
    } finally {
      if (showLoading) setLoading(false);
    }
  }, [isAuthenticated, user]);

  /**
   * Fetch only unread count (for badge updates)
   */
  const fetchUnreadCount = useCallback(async () => {
    if (!isAuthenticated || !user) {
      setUnreadCount(0);
      return;
    }

    try {
      const count = await notificationService.getUnreadCount();
      setUnreadCount(count);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  }, [isAuthenticated, user]);

  /**
   * Mark notification as read
   */
  const markAsRead = useCallback(async (notificationId) => {
    try {
      await notificationService.markAsRead(notificationId);
      
      // Update local state
      setNotifications(prev => 
        prev.map(notification => 
          notification.notificationId === notificationId
            ? { ...notification, isRead: true, readAt: new Date().toISOString() }
            : notification
        )
      );
      
      // Update unread count
      setUnreadCount(prev => Math.max(0, prev - 1));
      
      console.log(`[NotificationContext] Marked notification ${notificationId} as read`);
      
    } catch (error) {
      console.error('Error marking notification as read:', error);
      setError(error.message);
    }
  }, []);

  /**
   * Mark all notifications as read
   */
  const markAllAsRead = useCallback(async () => {
    try {
      await notificationService.markAllAsRead();
      
      // Update local state
      setNotifications(prev => 
        prev.map(notification => ({
          ...notification,
          isRead: true,
          readAt: new Date().toISOString()
        }))
      );
      
      setUnreadCount(0);
      
      console.log('[NotificationContext] Marked all notifications as read');
      
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      setError(error.message);
    }
  }, []);

  /**
   * Delete notification
   */
  const deleteNotification = useCallback(async (notificationId) => {
    try {
      await notificationService.deleteNotification(notificationId);
      
      // Update local state
      const deletedNotification = notifications.find(n => n.notificationId === notificationId);
      if (deletedNotification && !deletedNotification.isRead) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      
      setNotifications(prev => 
        prev.filter(notification => notification.notificationId !== notificationId)
      );
      
      console.log(`[NotificationContext] Deleted notification ${notificationId}`);
      
    } catch (error) {
      console.error('Error deleting notification:', error);
      setError(error.message);
    }
  }, [notifications]);

  /**
   * Refresh notifications manually
   */
  const refreshNotifications = useCallback(() => {
    fetchNotifications(true);
  }, [fetchNotifications]);

  /**
   * Add new notification to the list (for real-time updates)
   */
  const addNotification = useCallback((newNotification) => {
    setNotifications(prev => [newNotification, ...prev]);
    if (!newNotification.isRead) {
      setUnreadCount(prev => prev + 1);
    }
    console.log('[NotificationContext] Added new notification:', newNotification.title);
  }, []);

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Auto-fetch notifications when user logs in
  useEffect(() => {
    if (isAuthenticated && user) {
      fetchNotifications(true);
    } else {
      // Clear state when user logs out
      setNotifications([]);
      setUnreadCount(0);
      setError(null);
      setLastFetchTime(null);
    }
  }, [isAuthenticated, user, fetchNotifications]);

  // Auto-refresh notifications periodically
  useEffect(() => {
    if (!isAuthenticated || !user) return;

    const interval = setInterval(() => {
      // Only fetch unread count for background updates to save bandwidth
      fetchUnreadCount();
    }, REFRESH_INTERVAL);

    return () => clearInterval(interval);
  }, [isAuthenticated, user, fetchUnreadCount]);

  // Auto-refresh when window becomes visible (user switches back to tab)
  useEffect(() => {
    if (!isAuthenticated || !user) return;

    const handleVisibilityChange = () => {
      if (!document.hidden && lastFetchTime) {
        const timeSinceLastFetch = Date.now() - lastFetchTime.getTime();
        // Refresh if it's been more than 2 minutes
        if (timeSinceLastFetch > 2 * 60 * 1000) {
          fetchUnreadCount();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isAuthenticated, user, lastFetchTime, fetchUnreadCount]);

  const value = {
    // State
    notifications,
    unreadCount,
    loading,
    error,
    lastFetchTime,
    
    // Actions
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refreshNotifications,
    addNotification,
    clearError,
    
    // Helpers
    getNotificationIcon: notificationService.getNotificationIcon,
    getNotificationColor: notificationService.getNotificationColor,
    formatNotificationTime: notificationService.formatNotificationTime
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};