import React from 'react';
import '../css/LoyaltyProgram.css';

const LoyaltyProgram = () => {
  return (
    <section className="loyalty-program">
      <div className="loyalty-container">
        <div className="loyalty-content">
          <h2 className="loyalty-title">Tham gia chương trình khách hàng thân thiết của chúng tôi</h2>
          <p className="loyalty-description">
            Tích điểm với mỗi lần mua và nhận ngay những phần thưởng độc quyền
          </p>
          <button className="loyalty-button">Tìm hiểu thêm</button>
        </div>
      </div>
    </section>
  );
};

export default LoyaltyProgram;