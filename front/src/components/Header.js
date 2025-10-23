import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import '../css/Header.css';

const Header = () => {
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  
  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname === path;
  };

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
  };

  const toggleUserMenu = () => {
    setShowUserMenu(!showUserMenu);
  };

  // Close menu when clicking outside
  const handleMenuBlur = () => {
    setTimeout(() => setShowUserMenu(false), 150);
  };

  return (
    <header className="header">
      <div className="header-container">
        <Link to="/" className="logo">
          <span className="logo-icon">☕</span>
          <span className="logo-text">Cozy Brew</span>
        </Link>
        
        <nav className="navigation">
          <Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`}>Trang chủ</Link>
          <Link to="/menu" className={`nav-link ${isActive('/menu') ? 'active' : ''}`}>Thực đơn</Link>
          <Link to="/about" className={`nav-link ${isActive('/about') ? 'active' : ''}`}>Giới thiệu</Link>
          <Link to="/contact" className={`nav-link ${isActive('/contact') ? 'active' : ''}`}>Liên hệ</Link>
        </nav>
        
        <div className="header-actions">
          <div className="cart-icon">
            <span className="cart-count">0</span>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M3 3H5L5.4 5M7 13H17L21 5H5.4M7 13L5.4 5M7 13L4.7 15.3C4.3 15.7 4.6 16.5 5.1 16.5H17M17 13V16.5M9 19.5C9.8 19.5 10.5 20.2 10.5 21S9.8 22.5 9 22.5 7.5 21.8 7.5 21 8.2 19.5 9 19.5ZM20 19.5C20.8 19.5 21.5 20.2 21.5 21S20.8 22.5 20 22.5 18.5 21.8 18.5 21 19.2 19.5 20 19.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          
          {isAuthenticated && user ? (
            <div className="user-menu" onBlur={handleMenuBlur}>
              <button 
                className="user-button"
                onClick={toggleUserMenu}
                aria-expanded={showUserMenu}
              >
                <div className="user-avatar">
                  <span className="user-initials">
                    {user.firstName ? 
                      (user.firstName.charAt(0) + (user.lastName ? user.lastName.charAt(0) : '')).toUpperCase() :
                      user.username?.charAt(0).toUpperCase()
                    }
                  </span>
                </div>
                <span className="user-username">{user.username}</span>
                <svg 
                  className={`dropdown-arrow ${showUserMenu ? 'rotated' : ''}`} 
                  width="12" 
                  height="12" 
                  viewBox="0 0 24 24" 
                  fill="none"
                >
                  <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              
              {showUserMenu && (
                <div className="user-dropdown">
                  <div className="dropdown-header">
                    <div className="user-info">
                      <div className="user-avatar-large">
                        <span className="user-initials-large">
                          {user.firstName ? 
                            (user.firstName.charAt(0) + (user.lastName ? user.lastName.charAt(0) : '')).toUpperCase() :
                            user.username?.charAt(0).toUpperCase()
                          }
                        </span>
                      </div>
                      <div className="user-details">
                        <div className="user-name">
                          {user.firstName && user.lastName ? 
                            `${user.firstName} ${user.lastName}` : 
                            user.username
                          }
                        </div>
                        <div className="user-role">Customer</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="dropdown-menu">
                    <Link to="/profile" className="dropdown-item" onClick={() => setShowUserMenu(false)}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M20 21V19C20 17.9 19.1 17 18 17H6C4.9 17 4 17.9 4 19V21M16 7C16 9.2 14.2 11 12 11S8 9.2 8 7 9.8 3 12 3 16 4.8 16 7Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <span>Personal Information</span>
                    </Link>
                    
                    <Link to="/orders" className="dropdown-item" onClick={() => setShowUserMenu(false)}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M16 4H18C19.1 4 20 4.9 20 6V18C20 19.1 19.1 20 18 20H6C4.9 20 4 19.1 4 18V6C4 4.9 4.9 4 6 4H8M16 4V2M8 4V2M8 4H16M8 10H16M8 14H13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <span>Order History</span>
                    </Link>
                    
                    <Link to="/loyalty" className="dropdown-item" onClick={() => setShowUserMenu(false)}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <span>Loyalty Points</span>
                    </Link>
                    
                    <div className="dropdown-divider"></div>
                    
                    <button className="dropdown-item logout-item" onClick={handleLogout}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9M16 17L21 12L16 7M21 12H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="user-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M20 21V19C20 17.9 19.1 17 18 17H6C4.9 17 4 17.9 4 19V21M16 7C16 9.2 14.2 11 12 11S8 9.2 8 7 9.8 3 12 3 16 4.8 16 7Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;