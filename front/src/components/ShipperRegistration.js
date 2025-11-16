import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import shipperRegistrationService from '../services/shipperRegistrationService';
import authService from '../services/authService';
import '../css/ShipperRegistration.css';

const ShipperRegistration = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitStatus, setSubmitStatus] = useState(null); // 'success', 'error', null

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const validation = shipperRegistrationService.validateApplicationData(formData);
    setErrors(validation.errors);
    return validation.isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // Check if user is logged in
    const token = authService.getIdToken();
    if (!token) {
      setErrors({ auth: 'Bạn cần đăng nhập để nộp đơn ứng tuyển.' });
      return;
    }

    setLoading(true);
    setSubmitStatus(null);
    setErrors({});

    try {
      const applicationData = shipperRegistrationService.formatApplicationData(formData);
      
      await shipperRegistrationService.submitApplication(applicationData);
      
      setSubmitStatus('success');
      
      // Reset form after successful submission
      setFormData({
        fullName: '',
        email: '',
      });
      
      // Auto close modal after 3 seconds
      setTimeout(() => {
        onClose();
        setSubmitStatus(null);
      }, 3000);
      
    } catch (error) {
      console.error('Error submitting shipper registration:', error);
      setSubmitStatus('error');
      setErrors({ 
        submit: error.message || 'Có lỗi xảy ra khi gửi đơn ứng tuyển. Vui lòng thử lại sau.' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSubmitStatus(null);
    setErrors({});
    onClose();
  };

  return (
    <div className="shipper-registration-overlay" onClick={handleClose}>
      <div className="shipper-registration-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="header-content">
            <div className="icon-badge">
              🚚
            </div>
            <div className="header-text">
              <h2>Gia nhập đội ngũ Shipper</h2>
              <p>Trở thành đối tác giao hàng của Cozy Brew</p>
            </div>
          </div>
          <button className="close-btn" onClick={handleClose}>
            ✕
          </button>
        </div>

        {/* Success Message */}
        {submitStatus === 'success' && (
          <div className="success-message">
            <div className="success-icon">✅</div>
            <h3>Đơn ứng tuyển đã được gửi thành công!</h3>
            <p>
              Cảm ơn bạn đã quan tâm đến vị trí Shipper tại Cozy Brew. 
              Chúng tôi sẽ xem xét đơn ứng tuyển của bạn và liên hệ lại trong vòng 24-48 giờ.
            </p>
            <div className="next-steps">
              <h4>Các bước tiếp theo:</h4>
              <ul>
                <li>🔍 Admin sẽ xem xét hồ sơ của bạn</li>
                <li>📞 Nếu phù hợp, chúng tôi sẽ liên hệ qua email để phỏng vấn</li>
                <li>✅ Sau khi được phê duyệt, bạn sẽ nhận được thông tin đăng nhập</li>
              </ul>
            </div>
          </div>
        )}

        {/* Error Message */}
        {submitStatus === 'error' && (
          <div className="error-message-block">
            <div className="error-icon">❌</div>
            <h3>Có lỗi xảy ra</h3>
            <p>{errors.submit}</p>
            <button 
              className="retry-btn" 
              onClick={() => setSubmitStatus(null)}
            >
              Thử lại
            </button>
          </div>
        )}

        {/* Registration Form */}
        {submitStatus !== 'success' && submitStatus !== 'error' && (
          <form onSubmit={handleSubmit} className="registration-form">
            {/* Authentication Error */}
            {errors.auth && (
              <div className="auth-error">
                <div className="auth-error-icon">🔒</div>
                <p>{errors.auth}</p>
                <small>Vui lòng đăng nhập trước khi nộp đơn ứng tuyển.</small>
              </div>
            )}

            <div className="form-section">
              <h3>📝 Thông tin ứng tuyển</h3>
              <p className="section-description">
                Vui lòng điền đầy đủ thông tin để chúng tôi có thể liên hệ với bạn. 
                Quá trình phê duyệt sẽ diễn ra trong vòng 24-48 giờ.
              </p>
              
              <div className="form-group">
                <label>Họ và tên <span className="required">*</span></label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => handleChange('fullName', e.target.value)}
                  placeholder="Nhập họ và tên đầy đủ"
                  className={errors.fullName ? 'error' : ''}
                  disabled={loading}
                />
                {errors.fullName && <span className="error-message">{errors.fullName}</span>}
              </div>

              <div className="form-group">
                <label>Email liên hệ <span className="required">*</span></label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  placeholder="example@email.com"
                  className={errors.email ? 'error' : ''}
                  disabled={loading}
                />
                {errors.email && <span className="error-message">{errors.email}</span>}
                <small className="form-hint">
                  Chúng tôi sẽ sử dụng email này để liên hệ về kết quả ứng tuyển
                </small>
              </div>
            </div>

            <div className="info-section">
              <h3>📋 Quy trình ứng tuyển</h3>
              <div className="process-steps">
                <div className="step">
                  <div className="step-number">1</div>
                  <div className="step-content">
                    <h4>Điền thông tin</h4>
                    <p>Nhập họ tên và email liên hệ</p>
                  </div>
                </div>
                <div className="step">
                  <div className="step-number">2</div>
                  <div className="step-content">
                    <h4>Đợi đơn duyệt</h4>
                    <p>Admin xem xét trong 24-48h</p>
                  </div>
                </div>
                <div className="step">
                  <div className="step-number">3</div>
                  <div className="step-content">
                    <h4>Kiểm tra email</h4>
                    <p>Nhận thông báo kết quả qua email</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="form-actions">
              <button type="button" onClick={handleClose} className="cancel-btn" disabled={loading}>
                Hủy bỏ
              </button>
              <button type="submit" disabled={loading} className="submit-btn">
                {loading ? (
                  <>
                    <span className="loading-spinner"></span>
                    Đang gửi...
                  </>
                ) : (
                  <>
                    🚀 Nộp đơn ứng tuyển
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default (props) => {
  const { isOpen } = props;
  if (!isOpen) return null;
  return ReactDOM.createPortal(
    <ShipperRegistration {...props} />,
    document.body
  );
};