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
    alert('Thank you for your message! We\'ll get back to you soon.');
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
            <h1 className="contact-hero-title">Get In Touch</h1>
            <p className="contact-hero-subtitle">
              We'd love to hear from you. Send us a message and we'll respond as soon as possible.
            </p>
          </div>
        </section>

        {/* Contact Content */}
        <section className="contact-content">
          <div className="contact-container">
            <div className="contact-grid">
              {/* Contact Form */}
              <div className="contact-form-section">
                <h2>Send us a Message</h2>
                <form onSubmit={handleSubmit} className="contact-form">
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="name">Full Name *</label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        placeholder="Your full name"
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="email">Email Address *</label>
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
                  </div>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="phone">Phone Number</label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="(555) 123-4567"
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="subject">Subject *</label>
                      <select
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Select a subject</option>
                        <option value="general">General Inquiry</option>
                        <option value="catering">Catering Services</option>
                        <option value="feedback">Feedback</option>
                        <option value="partnership">Partnership</option>
                        <option value="complaint">Complaint</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="message">Message *</label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows="6"
                      placeholder="Tell us how we can help you..."
                    />
                  </div>
                  
                  <button type="submit" className="submit-btn">
                    Send Message
                  </button>
                </form>
              </div>

              {/* Contact Info */}
              <div className="contact-info-section">
                <h2>Visit Our Café</h2>
                
                <div className="info-card">
                  <div className="info-icon">📍</div>
                  <div className="info-content">
                    <h3>Address</h3>
                    <p>123 Coffee Street<br />Downtown District<br />City, State 12345</p>
                  </div>
                </div>

                <div className="info-card">
                  <div className="info-icon">📞</div>
                  <div className="info-content">
                    <h3>Phone</h3>
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
                    <h3>Opening Hours</h3>
                    <div className="hours-list">
                      <div className="hours-item">
                        <span>Monday - Friday</span>
                        <span>7:00 AM - 8:00 PM</span>
                      </div>
                      <div className="hours-item">
                        <span>Saturday</span>
                        <span>8:00 AM - 9:00 PM</span>
                      </div>
                      <div className="hours-item">
                        <span>Sunday</span>
                        <span>8:00 AM - 7:00 PM</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Map placeholder */}
                <div className="map-section">
                  <h3>Find Us</h3>
                  <div className="map-placeholder">
                    <div className="map-content">
                      <span className="map-icon">🗺️</span>
                      <p>Interactive Map</p>
                      <p className="map-note">Click to view in Google Maps</p>
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
            <h2>Frequently Asked Questions</h2>
            <div className="faq-grid">
              <div className="faq-item">
                <h3>Do you offer catering services?</h3>
                <p>Yes! We provide catering for corporate events, meetings, and special occasions. Contact us for custom packages.</p>
              </div>
              <div className="faq-item">
                <h3>Can I host private events at your café?</h3>
                <p>Absolutely! We have space available for private events. Please contact us to discuss your requirements and availability.</p>
              </div>
              <div className="faq-item">
                <h3>Do you have WiFi and workspace areas?</h3>
                <p>Yes, we offer free WiFi and have comfortable seating areas perfect for remote work or studying.</p>
              </div>
              <div className="faq-item">
                <h3>Are you hiring?</h3>
                <p>We're always looking for passionate team members! Check our careers page or stop by to inquire about current openings.</p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Contact;