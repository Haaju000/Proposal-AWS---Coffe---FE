import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import Header from '../components/Header';
import Footer from '../components/Footer';
import '../css/Auth.css';

const Register = () => {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    // Clear messages khi user thay đổi input
    if (error) setError('');
    if (success) setSuccess('');
  };

  const validateForm = () => {
    if (!formData.username.trim()) {
      throw { message: 'Vui lòng nhập tên đăng nhập.' };
    }
    if (formData.username.length < 3) {
      throw { message: 'Tên đăng nhập phải có ít nhất 3 ký tự.' };
    }
    if (!formData.password) {
      throw { message: 'Vui lòng nhập mật khẩu.' };
    }
    if (formData.password.length < 8) {
      throw { message: 'Mật khẩu phải có ít nhất 8 ký tự.' };
    }
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/.test(formData.password)) {
      throw { message: 'Mật khẩu phải chứa ít nhất: 1 chữ hoa, 1 chữ thường, 1 số và 1 ký tự đặc biệt.' };
    }
    if (formData.password !== formData.confirmPassword) {
      throw { message: 'Mật khẩu xác nhận không khớp.' };
    }
    if (!formData.acceptTerms) {
      throw { message: 'Vui lòng chấp nhận điều khoản dịch vụ.' };
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      // Validate form
      validateForm();

      // Call authService register
      const result = await authService.register(
        formData.username.trim(),
        formData.password,
        'User' // Mặc định là User
      );

      if (result.success) {
        setSuccess(result.message);
        
        // Redirect to confirmation page after 2 seconds
        setTimeout(() => {
          navigate('/confirm', { 
            state: { 
              username: result.username || formData.username.trim(),
              fromRegister: true 
            } 
          });
        }, 2000);
      }
    } catch (error) {
      console.error('Register error:', error);
      setError(error.message || 'Đăng ký thất bại. Vui lòng thử lại.');
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
                <h1>Tham gia cùng chúng tôi!</h1>
                <p>Tạo tài khoản để bắt đầu đặt hàng và trải nghiệm dịch vụ coffee tuyệt vời của chúng tôi.</p>
                <div className="brand-features">
                  <div className="feature-item">
                    <span className="feature-icon">☕</span>
                    <span>Đặt hàng dễ dàng</span>
                  </div>
                  <div className="feature-item">
                    <span className="feature-icon">🎯</span>
                    <span>Theo dõi đơn hàng</span>
                  </div>
                  <div className="feature-item">
                    <span className="feature-icon">💎</span>
                    <span>Ưu đãi đặc biệt</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Form Section */}
            <div className="auth-form-section">
              <div className="auth-form-container">
                <h2>Đăng ký tài khoản</h2>
                <p className="auth-subtitle">Tạo tài khoản để trải nghiệm dịch vụ coffee tuyệt vời</p>

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

                {success && (
                  <div style={{
                    background: '#F0FDF4',
                    border: '1px solid #BBF7D0',
                    color: '#166534',
                    padding: '1rem',
                    borderRadius: '8px',
                    marginBottom: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    <span>✅</span>
                    {success}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="auth-form">
                  <div className="form-group">
                    <label htmlFor="username">Tên đăng nhập *</label>
                    <input
                      type="text"
                      id="username"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      placeholder="Nhập tên đăng nhập"
                      disabled={isLoading}
                      autoComplete="username"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="password">Mật khẩu *</label>
                    <div className="password-input-wrapper">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Nhập mật khẩu (ít nhất 8 ký tự)"
                        disabled={isLoading}
                        autoComplete="new-password"
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
                    <small style={{ fontSize: '0.85rem', color: '#6B7280', marginTop: '0.25rem', display: 'block' }}>
                      Mật khẩu phải chứa: chữ hoa, chữ thường, số và ký tự đặc biệt
                    </small>
                  </div>

                  <div className="form-group">
                    <label htmlFor="confirmPassword">Xác nhận mật khẩu *</label>
                    <div className="password-input-wrapper">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        id="confirmPassword"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        placeholder="Nhập lại mật khẩu"
                        disabled={isLoading}
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        className="password-toggle"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        disabled={isLoading}
                      >
                        {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                      </button>
                    </div>
                  </div>

                  <div className="form-checkboxes">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        name="acceptTerms"
                        checked={formData.acceptTerms}
                        onChange={handleChange}
                        disabled={isLoading}
                      />
                      Tôi đồng ý với 
                      <a href="#terms" className="terms-link"> Điều khoản dịch vụ</a>
                      <span style={{ color: '#EF4444' }}> *</span>
                    </label>
                  </div>

                  <button 
                    type="submit" 
                    className="auth-submit-btn" 
                    disabled={isLoading || !formData.acceptTerms}
                  >
                    {isLoading ? 'Đang đăng ký...' : 'Tạo tài khoản'}
                  </button>
                </form>

                <div className="auth-switch">
                  Đã có tài khoản?
                  <Link to="/login" className="switch-link">
                    Đăng nhập ngay
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

export default Register;