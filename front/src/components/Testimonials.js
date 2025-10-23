import React, { useState } from 'react';
import '../css/Testimonials.css';

const Testimonials = () => {
  const testimonials = [
    {
      id: 1,
      text: "Cà phê tuyệt nhất trong thành phố! Không gian ấm cúng và thân thiện.",
      author: "Sarah Johnson",
      rating: 5
    },
    {
      id: 2,
      text: "Chất lượng và dịch vụ tuyệt vời. Thói quen cà phê hàng ngày của tôi bắt đầu ở đây.",
      author: "Mike Chen",
      rating: 5
    },
    {
      id: 3,
      text: "Yêu các món bánh tươi và nhân viên thân thiện. Rất đáng để thử!",
      author: "Emma Davis",
      rating: 5
    }
  ];

  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  const nextTestimonial = () => {
    setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <section className="testimonials">
      <div className="testimonials-container">
        <div className="testimonials-header">
          <h2 className="testimonials-title">Khách hàng nói gì về chúng tôi</h2>
          <p className="testimonials-subtitle">Tham gia cùng hàng nghìn người yêu cà phê</p>
        </div>
        
        <div className="testimonial-card">
          <div className="testimonial-rating">
            {[...Array(testimonials[currentTestimonial].rating)].map((_, i) => (
              <span key={i} className="star">★</span>
            ))}
          </div>
          
          <blockquote className="testimonial-text">
            "{testimonials[currentTestimonial].text}"
          </blockquote>
          
          <div className="testimonial-author">
            — {testimonials[currentTestimonial].author}
          </div>
        </div>
        
        <div className="testimonial-navigation">
          <button 
            className="nav-button prev-button" 
            onClick={prevTestimonial}
            aria-label="Bài đánh giá trước"
          >
            ‹
          </button>
          <button 
            className="nav-button next-button" 
            onClick={nextTestimonial}
            aria-label="Bài đánh giá tiếp theo"
          >
            ›
          </button>
        </div>
        
        <div className="testimonial-dots">
          {testimonials.map((_, index) => (
            <button
              key={index}
              className={`dot ${index === currentTestimonial ? 'active' : ''}`}
              onClick={() => setCurrentTestimonial(index)}
              aria-label={`Chuyển đến đánh giá ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;