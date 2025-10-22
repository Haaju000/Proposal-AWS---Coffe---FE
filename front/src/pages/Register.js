import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/Header';
import '../css/Auth.css';

const Register = () => {
  const navigate = useNavigate();
  const { register, login } = useAuth();
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    password: '',
    confirmPassword: '',
    phone: '',
    acceptTerms: false,
    newsletter: true
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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
    
    // Basic validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match!');
      setIsLoading(false);
      return;
    }
    
    if (!formData.acceptTerms) {
      setError('Please accept the Terms of Service and Privacy Policy!');
      setIsLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long!');
      setIsLoading(false);
      return;
    }

    try {
      console.log('Registration attempt:', formData);
      
      // Prepare data for backend
      const registrationData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        username: formData.username,
        password: formData.password,
        phone: formData.phone,
        newsletter: formData.newsletter
      };

      await register(registrationData);
      console.log('Registration successful, redirecting to home...');
      
      // Auto login after successful registration
      try {
        const userData = await login(formData.username, formData.password);
        console.log('Auto login successful:', userData);
        navigate('/'); // Redirect to home page as logged in user
      } catch (loginError) {
        console.log('Auto login failed, redirecting to login page');
        navigate('/login');
      }
    } catch (error) {
      console.error('Registration error:', error);
      setError(error.message || 'Registration failed. Please try again.');
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
                <h1>Join Our Community!</h1>
                <p>Create an account to unlock exclusive benefits, track your orders, and be part of our coffee-loving community.</p>
                <div className="brand-features">
                  <div className="feature-item">
                    <span className="feature-icon">🎁</span>
                    <span>Welcome bonus</span>
                  </div>
                  <div className="feature-item">
                    <span className="feature-icon">🏆</span>
                    <span>Loyalty program</span>
                  </div>
                  <div className="feature-item">
                    <span className="feature-icon">📱</span>
                    <span>Mobile ordering</span>
                  </div>
                  <div className="feature-item">
                    <span className="feature-icon">🔔</span>
                    <span>Exclusive offers</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right side - Register form */}
            <div className="auth-form-section">
              <div className="auth-form-container">
                <h2>Create Account</h2>
                <p className="auth-subtitle">Fill in your information to get started</p>
                
                <form onSubmit={handleSubmit} className="auth-form">
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="firstName">First Name</label>
                      <input
                        type="text"
                        id="firstName"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        required
                        placeholder="Enter your first name"
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="lastName">Last Name</label>
                      <input
                        type="text"
                        id="lastName"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        required
                        placeholder="Enter your last name"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="username">Username</label>
                    <input
                      type="text"
                      id="username"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      required
                      placeholder="Choose a unique username"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="phone">Phone Number (Optional)</label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="Enter your phone number"
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
                        placeholder="Create a strong password"
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

                  <div className="form-group">
                    <label htmlFor="confirmPassword">Confirm Password</label>
                    <div className="password-input-wrapper">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        id="confirmPassword"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        required
                        placeholder="Confirm your password"
                      />
                      <button
                        type="button"
                        className="password-toggle"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
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
                        required
                      />
                      <span className="checkmark"></span>
                      I agree to the <a href="#terms" className="terms-link">Terms of Service</a> and <a href="#privacy" className="terms-link">Privacy Policy</a>
                    </label>
                    
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        name="newsletter"
                        checked={formData.newsletter}
                        onChange={handleChange}
                      />
                      <span className="checkmark"></span>
                      Subscribe to newsletter for special offers and updates
                    </label>
                  </div>

                  {error && (
                    <div className="error-message">
                      {error}
                    </div>
                  )}

                  <button type="submit" className="auth-submit-btn" disabled={isLoading}>
                    {isLoading ? 'Creating Account...' : 'Create Account'}
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
                  Already have an account? 
                  <Link 
                    to="/login"
                    className="switch-link"
                  >
                    Sign in here
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Terms of Service Modal */}
      <div 
        id="terms" 
        className="modal" 
        onClick={(e) => {
          if (e.target.id === 'terms') {
            window.location.hash = '';
          }
        }}
      >
        <div className="modal-content">
          <div className="modal-header">
            <h2>Terms of Service</h2>
            <a href="#" className="close-btn">&times;</a>
          </div>
          <div className="modal-body">
            <div className="terms-content">
              <h3>1. Acceptance of Terms</h3>
              <p>By accessing and using Cozy Brew's services, you accept and agree to be bound by the terms and provision of this agreement.</p>

              <h3>2. Account Registration</h3>
              <p>To access certain features of our service, you must register for an account. You agree to:</p>
              <ul>
                <li>Provide accurate, current, and complete information</li>
                <li>Maintain and update your account information</li>
                <li>Keep your login credentials secure</li>
                <li>Accept responsibility for all activities under your account</li>
              </ul>

              <h3>3. Service Usage</h3>
              <p>Our coffee ordering and loyalty services are provided for personal, non-commercial use. You agree not to:</p>
              <ul>
                <li>Use our services for any unlawful purpose</li>
                <li>Attempt to gain unauthorized access to our systems</li>
                <li>Interfere with the proper functioning of our services</li>
                <li>Share your account with others</li>
              </ul>

              <h3>4. Orders and Payments</h3>
              <p>When placing orders through our platform:</p>
              <ul>
                <li>All orders are subject to availability</li>
                <li>Prices are subject to change without notice</li>
                <li>Payment must be completed before order processing</li>
                <li>We reserve the right to cancel orders for any reason</li>
              </ul>

              <h3>5. Loyalty Program</h3>
              <p>Our loyalty program is subject to specific terms and conditions:</p>
              <ul>
                <li>Points have no cash value</li>
                <li>Points expire after 12 months of inactivity</li>
                <li>Program benefits may change with notice</li>
                <li>Account closure results in point forfeiture</li>
              </ul>

              <h3>6. Limitation of Liability</h3>
              <p>Cozy Brew shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of our services.</p>

              <h3>7. Contact Information</h3>
              <p>For questions about these Terms of Service, please contact us at legal@cozybrew.com</p>

              <p className="last-updated">Last updated: October 22, 2025</p>
            </div>
          </div>
        </div>
      </div>

      {/* Privacy Policy Modal */}
      <div 
        id="privacy" 
        className="modal"
        onClick={(e) => {
          if (e.target.id === 'privacy') {
            window.location.hash = '';
          }
        }}
      >
        <div className="modal-content">
          <div className="modal-header">
            <h2>Privacy Policy</h2>
            <a href="#" className="close-btn">&times;</a>
          </div>
          <div className="modal-body">
            <div className="privacy-content">
              <h3>1. Information We Collect</h3>
              <p>We collect information you provide directly to us, such as:</p>
              <ul>
                <li>Account information (name, username, phone)</li>
                <li>Order history and preferences</li>
                <li>Payment information (securely processed)</li>
                <li>Communication records with customer service</li>
              </ul>

              <h3>2. How We Use Your Information</h3>
              <p>We use your information to:</p>
              <ul>
                <li>Process and fulfill your orders</li>
                <li>Manage your loyalty program account</li>
                <li>Send important service notifications</li>
                <li>Provide customer support</li>
                <li>Improve our services and user experience</li>
                <li>Send promotional offers (with your consent)</li>
              </ul>

              <h3>3. Information Sharing</h3>
              <p>We do not sell, trade, or share your personal information with third parties except:</p>
              <ul>
                <li>With your explicit consent</li>
                <li>To comply with legal obligations</li>
                <li>With service providers who assist our operations</li>
                <li>To protect our rights and safety</li>
              </ul>

              <h3>4. Data Security</h3>
              <p>We implement appropriate security measures to protect your personal information:</p>
              <ul>
                <li>Encryption of sensitive data</li>
                <li>Secure payment processing</li>
                <li>Regular security assessments</li>
                <li>Access controls and authentication</li>
              </ul>

              <h3>5. Cookies and Tracking</h3>
              <p>We use cookies and similar technologies to:</p>
              <ul>
                <li>Remember your preferences</li>
                <li>Analyze site usage and improve performance</li>
                <li>Provide personalized content</li>
                <li>Enable essential site functionality</li>
              </ul>

              <h3>6. Your Rights</h3>
              <p>You have the right to:</p>
              <ul>
                <li>Access your personal information</li>
                <li>Correct inaccurate information</li>
                <li>Delete your account and data</li>
                <li>Opt-out of marketing communications</li>
                <li>Data portability where applicable</li>
              </ul>

              <h3>7. Children's Privacy</h3>
              <p>Our services are not intended for children under 13. We do not knowingly collect personal information from children under 13.</p>

              <h3>8. Changes to This Policy</h3>
              <p>We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new policy on this page.</p>

              <h3>9. Contact Us</h3>
              <p>If you have questions about this Privacy Policy, please contact us at:</p>
              <ul>
                <li>Phone: (555) 123-BREW</li>
                <li>Address: 123 Coffee Street, Brew City, BC 12345</li>
                <li>Website: www.cozybrew.com</li>
              </ul>

              <p className="last-updated">Last updated: October 22, 2025</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;