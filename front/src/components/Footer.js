import React, { useState } from 'react';
import '../css/Footer.css';

const Footer = () => {
  const [email, setEmail] = useState('');

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      alert('Cảm ơn bạn đã đăng ký nhận tin!');
      setEmail('');
    }
  };

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-content">
          <div className="footer-section">
            <div className="footer-logo">
              <img src={require('../assets/images/coffee-cup.png')} alt="Cozy Brew Logo" className="logo-icon" style={{width: '32px', height: '32px', verticalAlign: 'middle'}} />
              <span className="logo-text">Cozy Brew</span>
            </div>
            <p className="footer-description">
              Tạo nên những khoảnh khắc ấm áp, từng tách cà phê.
            </p>
          </div>
          
          <div className="footer-section">
            <h3 className="footer-title">Liên kết nhanh</h3>
            <ul className="footer-links">
              <li><a href="#menu">Thực đơn</a></li>
              <li><a href="#about">Giới thiệu</a></li>
              <li><a href="#contact">Liên hệ</a></li>
              <li><a href="#careers">Tuyển dụng</a></li>
            </ul>
          </div>
          
          <div className="footer-section">
            <h3 className="footer-title">Giờ mở cửa</h3>
            <div className="opening-hours">
              <div className="hours-item">
                <span className="day">Thứ Hai - Thứ Sáu:</span>
                <span className="time">7:00 - 20:00</span>
              </div>
              <div className="hours-item">
                <span className="day">Thứ Bảy:</span>
                <span className="time">8:00 - 21:00</span>
              </div>
              <div className="hours-item">
                <span className="day">Chủ Nhật:</span>
                <span className="time">8:00 - 19:00</span>
              </div>
            </div>
          </div>
          
          <div className="footer-section">
            <h3 className="footer-title">Kết nối với chúng tôi</h3>
            <form className="newsletter-form" onSubmit={handleSubscribe}>
              <input
                type="email"
                placeholder="Email của bạn"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="newsletter-input"
                required
              />
              <button type="submit" className="newsletter-button">
                Đăng ký
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
            © 2024 Cozy Brew. Bảo lưu mọi quyền. Được tạo bằng ❤️ và ☕
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;