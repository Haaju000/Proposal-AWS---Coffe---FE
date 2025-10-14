import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import '../css/Auth.css';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });

  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle login here
    console.log('Login attempt:', formData);
    alert('Login functionality would be implemented here!');
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
                <h1>Welcome Back!</h1>
                <p>Sign in to your account to access exclusive features, track your orders, and enjoy personalized recommendations.</p>
                <div className="brand-features">
                  <div className="feature-item">
                    <span className="feature-icon">🎯</span>
                    <span>Personalized recommendations</span>
                  </div>
                  <div className="feature-item">
                    <span className="feature-icon">📦</span>
                    <span>Order tracking</span>
                  </div>
                  <div className="feature-item">
                    <span className="feature-icon">⭐</span>
                    <span>Loyalty rewards</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right side - Login form */}
            <div className="auth-form-section">
              <div className="auth-form-container">
                <h2>Sign In</h2>
                <p className="auth-subtitle">Enter your credentials to access your account</p>
                
                <form onSubmit={handleSubmit} className="auth-form">
                  <div className="form-group">
                    <label htmlFor="email">Email Address</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      placeholder="your.email@example.com"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="password">Password</label>
                    <div className="password-input-wrapper">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        placeholder="Enter your password"
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
                      Remember me
                    </label>
                    <a href="#forgot" className="forgot-link">Forgot password?</a>
                  </div>

                  <button type="submit" className="auth-submit-btn">
                    Sign In
                  </button>
                </form>

                <div className="auth-divider">
                  <span>or</span>
                </div>

                <div className="social-login">
                  <button className="social-btn google-btn">
                    <span className="social-icon">G</span>
                    Continue with Google
                  </button>
                  <button className="social-btn facebook-btn">
                    <span className="social-icon">f</span>
                    Continue with Facebook
                  </button>
                </div>

                <p className="auth-switch">
                  Don't have an account? 
                  <Link 
                    to="/register"
                    className="switch-link"
                  >
                    Sign up here
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