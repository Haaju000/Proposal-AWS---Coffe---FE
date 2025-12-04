import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import authService from '../services/authService';
import Header from '../components/Header';
import Footer from '../components/Footer';
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
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    // Clear error khi user bắt đầu nhập
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Validate input
      if (!formData.username.trim()) {
        throw { message: 'Vui lòng nhập tên đăng nhập.' };
      }
      if (!formData.password.trim()) {
        throw { message: 'Vui lòng nhập mật khẩu.' };
      }

      console.log('Starting login process...'); // Debug log

      // Call login (handles both Local Auth and Cognito)
      const result = await authService.login(
        formData.username.trim(),
        formData.password
      );

      console.log('Login result:', result); // Debug log

      if (result.success) {
        console.log('Login successful, updating context...'); // Debug log
        
        // Update auth context FIRST
        await login(result.user, result.tokens);
        
        console.log('Context updated, preparing navigation...'); // Debug log
        
        // Get user role for navigation
        const userRole = result.user?.role;
        console.log('User role:', userRole); // Debug log
        
        // ✅ SỬA: Increase delay và sử dụng replace navigation với error handling
        setTimeout(() => {
          try {
            console.log('Navigating to appropriate route...'); // Debug log
            
            if (userRole === 'Admin') {
              console.log('Navigating to admin dashboard');
              navigate('/admin', { replace: true });
            } else if (userRole === 'Shipper') {
              console.log('Navigating to shipper dashboard');
              navigate('/shipper', { replace: true });
            } else {
              console.log('Navigating to home page');
              navigate('/', { replace: true });
            }
          } catch (navError) {
            console.error('Navigation error:', navError);
            // Fallback: force reload to appropriate page
            if (userRole === 'Admin') {
              window.location.replace('/admin');
            } else if (userRole === 'Shipper') {
              window.location.replace('/shipper');
            } else {
              window.location.replace('/');
            }
          }
        }, 500); // Tăng delay lên 500ms
      }
    } catch (error) {
      console.error('Login error:', error);
      setError(error.message || 'Đăng nhập thất bại. Vui lòng thử lại.');
      
      // Nếu user chưa confirm, redirect đến confirmation page
      if (error.message && error.message.includes('chưa được xác thực')) {
        setTimeout(() => {
          navigate('/confirm', { 
            state: { 
              username: formData.username.trim(),
              fromLogin: true 
            } 
          });
        }, 2000);
      }
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
            {/* Brand Section */}
            <div className="auth-brand">
              <div className="brand-content">
                <div className="brand-logo">
                  ☕ Coffee Admin
                </div>
                <h1>Chào mừng trở lại!</h1>
                <p>Đăng nhập để quản lý hệ thống coffee shop của bạn với các tính năng mạnh mẽ và giao diện thân thiện.</p>
                <div className="brand-features">
                  <div className="feature-item">
                    <span className="feature-icon">📊</span>
                    <span>Quản lý bán hàng</span>
                  </div>
                  <div className="feature-item">
                    <span className="feature-icon">👥</span>
                    <span>Quản lý khách hàng</span>
                  </div>
                  <div className="feature-item">
                    <span className="feature-icon">📈</span>
                    <span>Báo cáo thống kê</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Form Section */}
            <div className="auth-form-section">
              <div className="auth-form-container">
                <h2>Đăng nhập</h2>
                <p className="auth-subtitle">Nhập thông tin đăng nhập của bạn</p>

                {error && (
                  <div style={{
                    background: '#FEF2F2',
                    border: '1px solid #FECACA',
                    color: '#DC2626',
                    padding: '1rem',
                    borderRadius: '8px',
                    marginBottom: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    <span>⚠️</span>
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="auth-form">
                  <div className="form-group">
                    <label htmlFor="username">Tên đăng nhập</label>
                    <input
                      type="text"
                      id="username"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      placeholder="Nhập tên đăng nhập của bạn"
                      disabled={isLoading}
                      autoComplete="username"
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
                        placeholder="Nhập mật khẩu của bạn"
                        disabled={isLoading}
                        autoComplete="current-password"
                      />
                      <button
                        type="button"
                        className="password-toggle"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={isLoading}
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
                        disabled={isLoading}
                      />
                      Ghi nhớ đăng nhập
                    </label>
                    <Link to="/forgot-password" className="forgot-link">
                      Quên mật khẩu?
                    </Link>
                  </div>

                  <button 
                    type="submit" 
                    className="auth-submit-btn" 
                    disabled={isLoading}
                  >
                    {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
                  </button>
                </form>

                <div className="auth-switch">
                  Chưa có tài khoản?
                  <Link to="/register" className="switch-link">
                    Đăng ký ngay
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Login;