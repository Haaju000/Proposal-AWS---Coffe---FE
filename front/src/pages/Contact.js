import React, { useState } from 'react';
import Header from '../components/Header';
import '../css/Contact.css';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission here
    console.log('Form submitted:', formData);
    alert('Cảm ơn bạn đã gửi tin nhắn! Chúng tôi sẽ phản hồi sớm.');
    setFormData({
      name: '',
      email: '',
      phone: '',
      subject: '',
      message: ''
    });
  };

  return (
    <div className="contact-page">
      <Header />
      
      <main className="contact-main">
        {/* Hero Section */}
        <section className="contact-hero">
          <div className="contact-hero-container">
            <h1 className="contact-hero-title">Liên hệ</h1>
            <p className="contact-hero-subtitle">
              Chúng tôi rất mong nhận được phản hồi từ bạn. Gửi tin nhắn và chúng tôi sẽ phản hồi trong thời gian sớm nhất.
            </p>
          </div>
        </section>

        {/* Contact Content */}
        <section className="contact-content">
          <div className="contact-container">
            <div className="contact-grid">
              {/* Contact Form */}
              <div className="contact-form-section">
                <h2>Gửi tin nhắn</h2>
                <form onSubmit={handleSubmit} className="contact-form">
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="name">Họ và tên *</label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        placeholder="Họ và tên của bạn"
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="email">Email *</label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        placeholder="email.cuaban@vd.com"
                      />
                    </div>
                  </div>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="phone">Số điện thoại</label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="0123 456 789"
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="subject">Chủ đề *</label>
                      <select
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Chọn chủ đề</option>
                        <option value="general">Yêu cầu chung</option>
                        <option value="catering">Dịch vụ tiệc</option>
                        <option value="feedback">Phản hồi</option>
                        <option value="partnership">Hợp tác</option>
                        <option value="complaint">Khiếu nại</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="message">Tin nhắn *</label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows="6"
                      placeholder="Mô tả yêu cầu hoặc vấn đề của bạn..."
                    />
                  </div>
                  
                  <button type="submit" className="submit-btn">
                    Gửi
                  </button>
                </form>
              </div>

              {/* Contact Info */}
              <div className="contact-info-section">
                <h2>Đến quán của chúng tôi</h2>
                
                <div className="info-card">
                  <div className="info-icon">📍</div>
                  <div className="info-content">
                    <h3>Địa chỉ</h3>
                    <p>123 Coffee Street<br />Quận Trung tâm<br />Thành phố, Tỉnh 12345</p>
                  </div>
                </div>

                <div className="info-card">
                  <div className="info-icon">📞</div>
                  <div className="info-content">
                    <h3>Điện thoại</h3>
                    <p>(555) 123-4567</p>
                  </div>
                </div>

                <div className="info-card">
                  <div className="info-icon">📧</div>
                  <div className="info-content">
                    <h3>Email</h3>
                    <p>hello@cozybrew.com</p>
                  </div>
                </div>

                <div className="info-card">
                  <div className="info-icon">🕐</div>
                  <div className="info-content">
                    <h3>Giờ mở cửa</h3>
                    <div className="hours-list">
                      <div className="hours-item">
                        <span>Thứ Hai - Thứ Sáu</span>
                        <span>7:00 - 20:00</span>
                      </div>
                      <div className="hours-item">
                        <span>Thứ Bảy</span>
                        <span>8:00 - 21:00</span>
                      </div>
                      <div className="hours-item">
                        <span>Chủ Nhật</span>
                        <span>8:00 - 19:00</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Map placeholder */}
                <div className="map-section">
                  <h3>Tìm đường đến quán</h3>
                  <div className="map-placeholder">
                    <div className="map-content">
                      <span className="map-icon">🗺️</span>
                      <p>Bản đồ tương tác</p>
                      <p className="map-note">Nhấp để xem trên Google Maps</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="faq-section">
          <div className="faq-container">
            <h2>Câu hỏi thường gặp</h2>
            <div className="faq-grid">
              <div className="faq-item">
                <h3>Bạn có cung cấp dịch vụ tiệc không?</h3>
                <p>Có! Chúng tôi nhận phục vụ tiệc cho sự kiện doanh nghiệp, họp mặt và dịp đặc biệt. Liên hệ để biết gói dịch vụ tùy chỉnh.</p>
              </div>
              <div className="faq-item">
                <h3>Tôi có thể tổ chức sự kiện riêng tại quán không?</h3>
                <p>Có, chúng tôi có không gian cho sự kiện riêng. Vui lòng liên hệ để thảo luận yêu cầu và lịch trống.</p>
              </div>
              <div className="faq-item">
                <h3>Quán có WiFi và khu vực làm việc không?</h3>
                <p>Có, chúng tôi cung cấp WiFi miễn phí và khu vực ngồi thoải mái phù hợp cho làm việc từ xa hoặc học tập.</p>
              </div>
              <div className="faq-item">
                <h3>Quán đang tuyển dụng không?</h3>
                <p>Chúng tôi luôn tìm kiếm những thành viên đam mê! Kiểm tra trang tuyển dụng hoặc ghé quán để hỏi về các vị trí hiện có.</p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Contact;