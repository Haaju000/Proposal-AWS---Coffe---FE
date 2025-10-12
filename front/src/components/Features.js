import React from 'react';
import '../css/Features.css';

const Features = () => {
  const features = [
    {
      icon: '☕',
      title: 'Premium Beans',
      description: 'Hand-selected, ethically sourced beans'
    },
    {
      icon: '🏆',
      title: 'Award Winning',
      description: 'Recognized for excellence'
    },
    {
      icon: '🕐',
      title: 'Always Fresh',
      description: 'Roasted daily, brewed to perfection'
    },
    {
      icon: '❤️',
      title: 'Made with Love',
      description: 'Crafted by passionate baristas'
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