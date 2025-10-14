import React from 'react';
import Header from '../components/Header';
import '../css/About.css';

const About = () => {
  return (
    <div className="about-page">
      <Header />
      
      <main className="about-main">
        {/* Hero Section */}
        <section className="about-hero">
          <div className="about-hero-container">
            <h1 className="about-hero-title">Our Story</h1>
            <p className="about-hero-subtitle">
              A journey that started with a simple love for great coffee
            </p>
          </div>
        </section>

        {/* Story Section */}
        <section className="story-section">
          <div className="story-container">
            <div className="story-content">
              <div className="story-text">
                <h2>Where It All Began</h2>
                <p>
                  Founded in 2018, Cozy Brew started as a small neighborhood coffee shop with 
                  a big dream: to create a warm, welcoming space where people could enjoy 
                  exceptional coffee and genuine connections.
                </p>
                <p>
                  What began as a passion project by coffee enthusiasts has grown into a 
                  beloved community hub, serving artisan coffee sourced from the finest 
                  farms around the world.
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

        {/* Values Section */}
        <section className="values-section">
          <div className="values-container">
            <h2 className="values-title">Our Values</h2>
            <div className="values-grid">
              <div className="value-card">
                <div className="value-icon">🌱</div>
                <h3>Sustainability</h3>
                <p>We partner with farms that practice sustainable growing methods and fair trade.</p>
              </div>
              <div className="value-card">
                <div className="value-icon">👥</div>
                <h3>Community</h3>
                <p>Building connections and creating a space where everyone feels welcome.</p>
              </div>
              <div className="value-card">
                <div className="value-icon">⭐</div>
                <h3>Quality</h3>
                <p>Every cup is crafted with precision and care, using only the finest ingredients.</p>
              </div>
              <div className="value-card">
                <div className="value-icon">❤️</div>
                <h3>Passion</h3>
                <p>Our love for coffee drives everything we do, from sourcing to brewing.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="team-section">
          <div className="team-container">
            <h2 className="team-title">Meet Our Team</h2>
            <div className="team-grid">
              <div className="team-member">
                <div className="member-image">
                  <span className="member-emoji">👨‍💼</span>
                </div>
                <h3>Alex Johnson</h3>
                <p className="member-role">Founder & Head Roaster</p>
                <p>Coffee enthusiast with 15 years of experience in specialty coffee.</p>
              </div>
              <div className="team-member">
                <div className="member-image">
                  <span className="member-emoji">👩‍💼</span>
                </div>
                <h3>Maria Santos</h3>
                <p className="member-role">Head Barista</p>
                <p>Award-winning barista passionate about latte art and coffee education.</p>
              </div>
              <div className="team-member">
                <div className="member-image">
                  <span className="member-emoji">👨‍🍳</span>
                </div>
                <h3>David Chen</h3>
                <p className="member-role">Pastry Chef</p>
                <p>Creating fresh, delicious pastries that pair perfectly with our coffee.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Mission Section */}
        <section className="mission-section">
          <div className="mission-container">
            <div className="mission-content">
              <h2>Our Mission</h2>
              <p>
                To provide an exceptional coffee experience that brings people together, 
                supports sustainable practices, and creates lasting memories one cup at a time.
              </p>
              <div className="mission-stats">
                <div className="stat">
                  <span className="stat-number">10,000+</span>
                  <span className="stat-label">Happy Customers</span>
                </div>
                <div className="stat">
                  <span className="stat-number">50+</span>
                  <span className="stat-label">Coffee Varieties</span>
                </div>
                <div className="stat">
                  <span className="stat-number">5</span>
                  <span className="stat-label">Years of Excellence</span>
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