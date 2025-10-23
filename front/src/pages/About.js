import React from 'react';
import Header from '../components/Header';
import '../css/About.css';

const About = () => {
  return (
    <div className="about-page">
      <Header />
      
      <main className="about-main">
        {/* Phần giới thiệu đầu trang */}
        <section className="about-hero">
          <div className="about-hero-container">
            <h1 className="about-hero-title">Câu chuyện của chúng tôi</h1>
            <p className="about-hero-subtitle">
              Hành trình bắt đầu từ tình yêu giản dị dành cho hương vị cà phê tuyệt vời
            </p>
          </div>
        </section>

        {/* Phần câu chuyện */}
        <section className="story-section">
          <div className="story-container">
            <div className="story-content">
              <div className="story-text">
                <h2>Nơi tất cả bắt đầu</h2>
                <p>
                  Được thành lập vào năm 2018, Cozy Brew khởi đầu là một quán cà phê nhỏ trong khu phố 
                  với giấc mơ lớn: tạo nên một không gian ấm áp, thân thiện nơi mọi người có thể 
                  thưởng thức cà phê hảo hạng và gắn kết cùng nhau.
                </p>
                <p>
                  Bắt đầu từ niềm đam mê của những người yêu cà phê, Cozy Brew đã trở thành 
                  một điểm đến quen thuộc của cộng đồng, nơi phục vụ những ly cà phê thủ công 
                  được tuyển chọn từ các nông trại tốt nhất trên thế giới.
                </p>
              </div>
              <div className="story-image">
                <div className="image-placeholder">
                  <span className="story-emoji">☕</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Giá trị cốt lõi */}
        <section className="values-section">
          <div className="values-container">
            <h2 className="values-title">Giá trị của chúng tôi</h2>
            <div className="values-grid">
              <div className="value-card">
                <div className="value-icon">🌱</div>
                <h3>Bền vững</h3>
                <p>Chúng tôi hợp tác với các nông trại áp dụng phương pháp trồng trọt bền vững và thương mại công bằng.</p>
              </div>
              <div className="value-card">
                <div className="value-icon">👥</div>
                <h3>Cộng đồng</h3>
                <p>Xây dựng kết nối và tạo nên không gian nơi mọi người luôn cảm thấy được chào đón.</p>
              </div>
              <div className="value-card">
                <div className="value-icon">⭐</div>
                <h3>Chất lượng</h3>
                <p>Mỗi tách cà phê được pha chế cẩn thận với nguyên liệu tốt nhất.</p>
              </div>
              <div className="value-card">
                <div className="value-icon">❤️</div>
                <h3>Đam mê</h3>
                <p>Tình yêu dành cho cà phê là động lực trong mọi việc chúng tôi làm — từ chọn hạt đến pha chế.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Đội ngũ */}
        <section className="team-section">
          <div className="team-container">
            <h2 className="team-title">Gặp gỡ đội ngũ của chúng tôi</h2>
            <div className="team-grid">
              <div className="team-member">
                <div className="member-image">
                  <span className="member-emoji">👨‍💼</span>
                </div>
                <h3>Alex Johnson</h3>
                <p className="member-role">Người sáng lập & Trưởng nhóm rang xay</p>
                <p>Người đam mê cà phê với hơn 15 năm kinh nghiệm trong lĩnh vực cà phê đặc sản.</p>
              </div>
              <div className="team-member">
                <div className="member-image">
                  <span className="member-emoji">👩‍💼</span>
                </div>
                <h3>Maria Santos</h3>
                <p className="member-role">Trưởng Barista</p>
                <p>Barista từng đạt giải thưởng, yêu thích nghệ thuật latte và giáo dục cà phê.</p>
              </div>
              <div className="team-member">
                <div className="member-image">
                  <span className="member-emoji">👨‍🍳</span>
                </div>
                <h3>David Chen</h3>
                <p className="member-role">Bếp trưởng bánh ngọt</p>
                <p>Người sáng tạo ra những món bánh tươi ngon hoàn hảo để thưởng thức cùng cà phê.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Sứ mệnh */}
        <section className="mission-section">
          <div className="mission-container">
            <div className="mission-content">
              <h2>Sứ mệnh của chúng tôi</h2>
              <p>
                Mang đến trải nghiệm cà phê tuyệt vời, gắn kết con người, 
                ủng hộ các phương pháp bền vững và tạo nên những kỷ niệm đáng nhớ — từng tách cà phê một.
              </p>
              <div className="mission-stats">
                <div className="stat">
                  <span className="stat-number">10,000+</span>
                  <span className="stat-label">Khách hàng hài lòng</span>
                </div>
                <div className="stat">
                  <span className="stat-number">50+</span>
                  <span className="stat-label">Loại cà phê</span>
                </div>
                <div className="stat">
                  <span className="stat-number">5</span>
                  <span className="stat-label">Năm hoạt động xuất sắc</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default About;