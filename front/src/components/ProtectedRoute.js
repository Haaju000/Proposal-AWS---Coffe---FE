import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ children, adminOnly = false, shipperOnly = false }) => {
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

  console.log('🛡️ ProtectedRoute check:', { 
    user, 
    role, 
    username, 
    adminOnly, 
    shipperOnly,
    originalRole: user?.role 
  });

  if (adminOnly && role !== 'admin' && username !== 'admin') {
    console.log('❌ Admin access denied, redirecting to home');
    return <Navigate to="/" replace />;
  }

  if (shipperOnly && role !== 'shipper') {
    console.log('❌ Shipper access denied, redirecting to home. Expected: shipper, Got:', role);
    return <Navigate to="/" replace />;
  }

  console.log('✅ ProtectedRoute access granted');

  return children;
};

export default ProtectedRoute;