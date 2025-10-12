import React, { useState } from 'react';
import '../css/Footer.css';

const Footer = () => {
  const [email, setEmail] = useState('');

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      alert('Thank you for subscribing!');
      setEmail('');
    }
  };

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-content">
          <div className="footer-section">
            <div className="footer-logo">
              <span className="logo-icon">☕</span>
              <span className="logo-text">Cozy Brew</span>
            </div>
            <p className="footer-description">
              Crafting moments of warmth, one cup at a time.
            </p>
          </div>
          
          <div className="footer-section">
            <h3 className="footer-title">Quick Links</h3>
            <ul className="footer-links">
              <li><a href="#menu">Menu</a></li>
              <li><a href="#about">About Us</a></li>
              <li><a href="#contact">Contact</a></li>
              <li><a href="#careers">Careers</a></li>
            </ul>
          </div>
          
          <div className="footer-section">
            <h3 className="footer-title">Opening Hours</h3>
            <div className="opening-hours">
              <div className="hours-item">
                <span className="day">Monday - Friday:</span>
                <span className="time">7am - 8pm</span>
              </div>
              <div className="hours-item">
                <span className="day">Saturday:</span>
                <span className="time">8am - 9pm</span>
              </div>
              <div className="hours-item">
                <span className="day">Sunday:</span>
                <span className="time">8am - 7pm</span>
              </div>
            </div>
          </div>
          
          <div className="footer-section">
            <h3 className="footer-title">Stay Connected</h3>
            <form className="newsletter-form" onSubmit={handleSubscribe}>
              <input
                type="email"
                placeholder="Your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="newsletter-input"
                required
              />
              <button type="submit" className="newsletter-button">
                Subscribe
              </button>
            </form>
            
            <div className="social-links">
              <a className="social-link" aria-label="Instagram">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4c0 3.2-2.6 5.8-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8C2 4.6 4.6 2 7.8 2z" stroke="currentColor" strokeWidth="2"/>
                  <path d="m15 11-3 3-3-3" stroke="currentColor" strokeWidth="2"/>
                  <path d="M12 8v6" stroke="currentColor" strokeWidth="2"/>
                </svg>
              </a>
              
              <a  className="social-link" aria-label="Facebook">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" stroke="currentColor" strokeWidth="2"/>
                </svg>
              </a>
              
              
              
              <a  className="social-link" aria-label="Email">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke="currentColor" strokeWidth="2"/>
                  <polyline points="22,6 12,13 2,6" stroke="currentColor" strokeWidth="2"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p className="copyright">
            © 2024 Cozy Brew. All rights reserved. Made with ❤️ and ☕
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;