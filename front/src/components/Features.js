import React from 'react';
import '../css/Features.css';

const Features = () => {
  const features = [
    {
      icon: '☕',
      title: 'Hạt cà phê thượng hạng',
      description: 'Những hạt cà phê được tuyển chọn thủ công'
    },
    {
      icon: '🏆',
      title: 'Đạt nhiều giải thưởng',
      description: 'Được ghi nhận vì sự xuất sắc'
    },
    {
      icon: '🕐',
      title: 'Luôn giữ trọn vị tươi',
      description: 'Rang hằng ngày, pha chế tỉ mỉ cho hương vị hoàn hảo'
    },
    {
      icon: '❤️',
      title: 'Pha chế bằng cả tình yêu',
      description: 'Được tạo nên bởi những barista đầy đam mê.'
    }
  ];

  return (
    <section className="features">
      <div className="features-container">
        <div className="features-grid">
          {features.map((feature, index) => (
            <div key={index} className="feature-card">
              <div className="feature-icon">
                {feature.icon}
              </div>
              <h3 className="feature-title">{feature.title}</h3>
              <p className="feature-description">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;