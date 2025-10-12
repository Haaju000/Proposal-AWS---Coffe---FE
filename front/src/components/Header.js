import React from 'react';
import '../css/Header.css';

const Header = () => {
  return (
    <header className="header">
      <div className="header-container">
        <div className="logo">
          <span className="logo-icon">☕</span>
          <span className="logo-text">Cozy Brew</span>
        </div>
        
        <nav className="navigation">
          <a href="#home" className="nav-link active">Home</a>
          <a href="#menu" className="nav-link">Menu</a>
          <a href="#about" className="nav-link">About</a>
          <a href="#contact" className="nav-link">Contact</a>
        </nav>
        
        <div className="header-actions">
          <div className="cart-icon">
            <span className="cart-count">0</span>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M3 3H5L5.4 5M7 13H17L21 5H5.4M7 13L5.4 5M7 13L4.7 15.3C4.3 15.7 4.6 16.5 5.1 16.5H17M17 13V16.5M9 19.5C9.8 19.5 10.5 20.2 10.5 21S9.8 22.5 9 22.5 7.5 21.8 7.5 21 8.2 19.5 9 19.5ZM20 19.5C20.8 19.5 21.5 20.2 21.5 21S20.8 22.5 20 22.5 18.5 21.8 18.5 21 19.2 19.5 20 19.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className="user-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M20 21V19C20 17.9 19.1 17 18 17H6C4.9 17 4 17.9 4 19V21M16 7C16 9.2 14.2 11 12 11S8 9.2 8 7 9.8 3 12 3 16 4.8 16 7Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;