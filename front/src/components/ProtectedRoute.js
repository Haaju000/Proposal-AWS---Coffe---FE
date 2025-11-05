import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { isAuthenticated, user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '1.2rem',
        color: '#666'
      }}>
        Loading...
      </div>
    );
  }

  // call the isAuthenticated function if provided
  if (!isAuthenticated || !isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  // Normalize role/username checks
  const role = user?.role ? String(user.role).toLowerCase() : undefined;
  const username = user?.username ? String(user.username).toLowerCase() : undefined;

  if (adminOnly && role !== 'admin' && username !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;