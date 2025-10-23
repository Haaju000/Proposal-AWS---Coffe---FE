import React from 'react';
import '../css/Hero.css';

const Hero = () => {
  return (
    <section className="hero">
      <div className="hero-background">
        <div className="hero-overlay"></div>
      </div>
      
      <div className="hero-content">
        <div className="hero-container">
          <div className="hero-text">
            <h1 className="hero-title">
              Where Every Cup
              <br />
              Tells a Story
            </h1>
            <p className="hero-description">
              Thưởng thức hương vị cà phê thủ công thượng hạng trong không gian
              <br />
              ấm áp và thân thiện
            </p>
            <button className="hero-button">
              <span className="button-icon">☕</span>
              Đặt hàng ngay
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;