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
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const initializeAuth = () => {
      try {
        const currentUser = authService.getCurrentUser();
        const authenticated = authService.isAuthenticated();
        
        console.log('Initializing auth:', { currentUser, authenticated });
        
        setUser(currentUser);
        setIsAuthenticated(authenticated);
      } catch (error) {
        console.error('Error initializing auth:', error);
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (username, password) => {
    try {
      setLoading(true);
      const response = await authService.login(username, password);
      
      const userData = response.user || { username };
      setUser(userData);
      setIsAuthenticated(true);
      
      console.log('Login successful:', userData);
      return userData; // Return user data instead of response
    } catch (error) {
      console.error('Login failed:', error);
      setUser(null);
      setIsAuthenticated(false);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setIsAuthenticated(false);
    console.log('User logged out');
  };

  const register = async (userData) => {
    try {
      setLoading(true);
      const response = await authService.register(userData);
      console.log('Registration successful:', response);
      return response;
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    login,
    logout,
    register,
    isAuthenticated,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};