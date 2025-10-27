import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const AdminRoute = ({ children }) => {
  const { user, isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <p>Đang tải...</p>
      </div>
    );
  }
  
  // Check if user is authenticated and is admin
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  // Check if user has admin role
  if (user?.role !== 'admin' && user?.username !== 'admin') {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

export default AdminRoute;