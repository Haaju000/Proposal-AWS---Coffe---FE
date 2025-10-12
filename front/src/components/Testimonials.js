import React, { useState } from 'react';
import '../css/Testimonials.css';

const Testimonials = () => {
  const testimonials = [
    {
      id: 1,
      text: "The best coffee in town! The atmosphere is so cozy and welcoming.",
      author: "Sarah Johnson",
      rating: 5
    },
    {
      id: 2,
      text: "Amazing quality and service. My daily coffee ritual starts here.",
      author: "Mike Chen",
      rating: 5
    },
    {
      id: 3,
      text: "Love the fresh pastries and the friendly staff. Highly recommended!",
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
          <h2 className="testimonials-title">What Our Customers Say</h2>
          <p className="testimonials-subtitle">Join thousands of happy coffee lovers</p>
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
            aria-label="Previous testimonial"
          >
            ‹
          </button>
          <button 
            className="nav-button next-button" 
            onClick={nextTestimonial}
            aria-label="Next testimonial"
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
              aria-label={`Go to testimonial ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;