import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/Header';
import '../css/Auth.css';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    rememberMe: false
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      console.log('Login attempt:', formData);
      const userData = await login(formData.username, formData.password);
      console.log('Login successful, redirecting...');
      
      // Check if user is admin and redirect accordingly
      if (userData && userData.username === 'admin') {
        navigate('/admin'); // Redirect admin to dashboard
      } else {
        navigate('/'); // Redirect regular users to home page
      }
    } catch (error) {
      console.error('Login error:', error);
      setError(error.message || 'Đăng nhập thất bại. Vui lòng kiểm tra thông tin và thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <Header />
      
      <main className="auth-main">
        <div className="auth-container">
          <div className="auth-content">
            {/* Left side - Brand info */}
            <div className="auth-brand">
              <div className="brand-content">
                <div className="brand-logo">
                  <span className="logo-icon">☕</span>
                  <span className="logo-text">Cozy Brew</span>
                </div>
                <h1>Chào mừng trở lại!</h1>
                <p>Đăng nhập vào tài khoản để truy cập tính năng độc quyền, theo dõi đơn hàng và nhận gợi ý cá nhân hóa.</p>
                <div className="brand-features">
                  <div className="feature-item">
                    <span className="feature-icon">🎯</span>
                    <span>Gợi ý cá nhân</span>
                  </div>
                  <div className="feature-item">
                    <span className="feature-icon">📦</span>
                    <span>Theo dõi đơn hàng</span>
                  </div>
                  <div className="feature-item">
                    <span className="feature-icon">⭐</span>
                    <span>Ưu đãi tích điểm</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right side - Login form */}
            <div className="auth-form-section">
              <div className="auth-form-container">
                <h2>Đăng nhập</h2>
                <p className="auth-subtitle">Nhập thông tin để truy cập tài khoản</p>
                
                <form onSubmit={handleSubmit} className="auth-form">
                  <div className="form-group">
                    <label htmlFor="username">Tên đăng nhập</label>
                    <input
                      type="text"
                      id="username"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      required
                      placeholder="Nhập tên đăng nhập"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="password">Mật khẩu</label>
                    <div className="password-input-wrapper">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        placeholder="Nhập mật khẩu"
                      />
                      <button
                        type="button"
                        className="password-toggle"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? '👁️' : '👁️‍🗨️'}
                      </button>
                    </div>
                  </div>

                  <div className="form-options">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        name="rememberMe"
                        checked={formData.rememberMe}
                        onChange={handleChange}
                      />
                      <span className="checkmark"></span>
                      Ghi nhớ đăng nhập
                    </label>
                    <a href="#forgot" className="forgot-link">Quên mật khẩu?</a>
                  </div>

                  {error && (
                    <div className="error-message">
                      {error}
                    </div>
                  )}

                  <button type="submit" className="auth-submit-btn" disabled={isLoading}>
                    {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
                  </button>
                </form>

                <div className="auth-divider">
                  <span>hoặc</span>
                </div>

                <div className="social-login">
                  <button className="social-btn google-btn">
                    <span className="social-icon">G</span>
                    Tiếp tục với Google
                  </button>
                  <button className="social-btn facebook-btn">
                    <span className="social-icon">f</span>
                    Tiếp tục với Facebook
                  </button>
                </div>

                <p className="auth-switch">
                  Chưa có tài khoản? 
                  <Link 
                    to="/register"
                    className="switch-link"
                  >
                    Đăng ký tại đây
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Login;