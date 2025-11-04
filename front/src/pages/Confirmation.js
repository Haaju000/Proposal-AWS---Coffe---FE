import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { authService } from '../services/authService';
import Header from '../components/Header';
import Footer from '../components/Footer';
import '../css/Auth.css';

const Confirmation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const username = location.state?.username || '';
  const fromRegister = location.state?.fromRegister || false;
  const fromLogin = location.state?.fromLogin || false;

  const [formData, setFormData] = useState({
    username: username,
    confirmationCode: ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  // Redirect nếu không có username
  useEffect(() => {
    if (!username) {
      navigate('/register', { replace: true });
    }
  }, [username, navigate]);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => {
        setResendCooldown(resendCooldown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear messages khi user thay đổi input
    if (error) setError('');
    if (success) setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      if (!formData.confirmationCode.trim()) {
        throw { message: 'Vui lòng nhập mã xác thực.' };
      }

      const result = await authService.confirmSignUp(
        formData.username,
        formData.confirmationCode.trim()
      );

      if (result.success) {
        setSuccess(result.message);
        
        // Redirect to login after successful confirmation
        setTimeout(() => {
          navigate('/login', { 
            state: { 
              message: 'Tài khoản đã được xác thực thành công! Vui lòng đăng nhập.',
              username: formData.username
            } 
          });
        }, 2000);
      }
    } catch (error) {
      console.error('Confirmation error:', error);
      setError(error.message || 'Xác thực thất bại. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    setIsResending(true);
    setError('');
    setSuccess('');

    try {
      const result = await authService.resendConfirmationCode(formData.username);
      
      if (result.success) {
        setSuccess(result.message);
        setResendCooldown(60); // 60 seconds cooldown
      }
    } catch (error) {
      console.error('Resend error:', error);
      setError(error.message || 'Không thể gửi lại mã xác thực.');
    } finally {
      setIsResending(false);
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
                  📧 Coffee Admin
                </div>
                <h1>Xác thực tài khoản</h1>
                <p>Vui lòng kiểm tra email và nhập mã xác thực để hoàn tất quá trình đăng ký tài khoản của bạn.</p>
                <div className="brand-features">
                  <div className="feature-item">
                    <span className="feature-icon">🔐</span>
                    <span>Bảo mật cao</span>
                  </div>
                  <div className="feature-item">
                    <span className="feature-icon">�</span>
                    <span>Dễ dàng sử dụng</span>
                  </div>
                  <div className="feature-item">
                    <span className="feature-icon">⚡</span>
                    <span>Xác thực nhanh</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Form Section */}
            <div className="auth-form-section">
              <div className="auth-form-container">
                <h2>Xác thực tài khoản</h2>
                <p className="auth-subtitle">
                  Mã xác thực đã được gửi đến email của tài khoản <strong>{formData.username}</strong>
                </p>

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
                    <label htmlFor="username">Tên đăng nhập</label>
                    <input
                      type="text"
                      id="username"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      disabled={true}
                      style={{
                        background: '#F9FAFB',
                        color: '#6B7280',
                        cursor: 'not-allowed'
                      }}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="confirmationCode">Mã xác thực *</label>
                    <input
                      type="text"
                      id="confirmationCode"
                      name="confirmationCode"
                      value={formData.confirmationCode}
                      onChange={handleChange}
                      placeholder="Nhập mã xác thực từ email"
                      disabled={isLoading}
                      autoComplete="one-time-code"
                      maxLength="6"
                    />
                    <small style={{ fontSize: '0.85rem', color: '#6B7280', marginTop: '0.25rem', display: 'block' }}>
                      Mã xác thực gồm 6 chữ số được gửi đến email của bạn
                    </small>
                  </div>

                  <button 
                    type="submit" 
                    className="auth-submit-btn" 
                    disabled={isLoading || !formData.confirmationCode.trim()}
                  >
                    {isLoading ? 'Đang xác thực...' : 'Xác thực tài khoản'}
                  </button>
                </form>

                <div style={{ marginTop: '1rem' }}>
                  <button
                    type="button"
                    onClick={handleResendCode}
                    disabled={isResending || resendCooldown > 0}
                    style={{
                      width: '100%',
                      padding: '0.875rem',
                      background: '#F3F4F6',
                      color: '#374151',
                      border: '2px solid #E5E7EB',
                      borderRadius: '8px',
                      fontSize: '0.95rem',
                      fontWeight: '500',
                      cursor: isResending || resendCooldown > 0 ? 'not-allowed' : 'pointer',
                      transition: 'all 0.3s ease',
                      opacity: isResending || resendCooldown > 0 ? 0.6 : 1
                    }}
                    onMouseOver={(e) => {
                      if (!isResending && resendCooldown === 0) {
                        e.target.style.background = '#E5E7EB';
                        e.target.style.borderColor = '#8B4513';
                        e.target.style.color = '#8B4513';
                      }
                    }}
                    onMouseOut={(e) => {
                      if (!isResending && resendCooldown === 0) {
                        e.target.style.background = '#F3F4F6';
                        e.target.style.borderColor = '#E5E7EB';
                        e.target.style.color = '#374151';
                      }
                    }}
                  >
                    {isResending ? 'Đang gửi...' : resendCooldown > 0 ? `Gửi lại sau ${resendCooldown}s` : 'Gửi lại mã xác thực'}
                  </button>
                </div>

                <div className="auth-switch">
                  <Link to="/login" className="switch-link">
                    ← Quay lại đăng nhập
                  </Link>
                  {' | '}
                  <Link to="/register" className="switch-link">
                    Đăng ký tài khoản khác
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

export default Confirmation;