import React, { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/authService';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check authentication on app load
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = authService.getCurrentUser();
        console.log('AuthContext checkAuth - currentUser:', currentUser); // Debug log
        
        if (currentUser && authService.isAuthenticated()) {
          console.log('User authenticated, setting user state'); // Debug log
          setUser(currentUser);
        } else {
          console.log('No valid authentication found'); // Debug log
          setUser(null);
          
          // ✅ CHỈ clear storage, KHÔNG auto-logout (để tránh redirect loop)
          if (currentUser && !authService.isAuthenticated()) {
            console.log('Invalid token detected, clearing storage only');
            localStorage.removeItem('access_token');
            localStorage.removeItem('id_token');
            localStorage.removeItem('refresh_token');
            localStorage.removeItem('local_token');
            localStorage.removeItem('user');
          }
        }
      } catch (error) {
        console.error('Auth check error:', error);
        setUser(null);
        // ✅ CHỈ clear storage, KHÔNG gọi authService.logout()
        localStorage.removeItem('access_token');
        localStorage.removeItem('id_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('local_token');
        localStorage.removeItem('user');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Login function - updated for Cognito tokens
  const login = async (userData, tokens) => {
    setUser(userData);
    // Tokens are already saved in authService.login()
  };

  // Register function - không auto login
  const register = async (userData) => {
    // Không set user vì cần confirm trước
    return userData;
  };

  // Logout function
  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
    }
  };

  const value = {
    user,
    isLoading,
    login,
    register,
    logout,
    isAuthenticated: () => authService.isAuthenticated(),
    isAdmin: () => authService.isAdmin(),
    isShipper: () => authService.isShipper()
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};