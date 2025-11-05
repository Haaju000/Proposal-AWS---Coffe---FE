import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const AdminRoute = ({ children }) => {
  // useAuth provides `isLoading` (boolean) and `isAuthenticated` (function)
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
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

  // Ensure we call the isAuthenticated function
  if (!isAuthenticated || !isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  // Normalize role comparison so both 'Admin' and 'admin' match
  const role = user?.role ? String(user.role).toLowerCase() : undefined;
  const username = user?.username ? String(user.username).toLowerCase() : undefined;

  if (role !== 'admin' && username !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default AdminRoute;