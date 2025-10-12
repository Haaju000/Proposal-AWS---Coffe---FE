import React from 'react';
import '../css/LoyaltyProgram.css';

const LoyaltyProgram = () => {
  return (
    <section className="loyalty-program">
      <div className="loyalty-container">
        <div className="loyalty-content">
          <h2 className="loyalty-title">Join Our Loyalty Program</h2>
          <p className="loyalty-description">
            Earn points with every purchase and get exclusive rewards
          </p>
          <button className="loyalty-button">Learn More</button>
        </div>
      </div>
    </section>
  );
};

export default LoyaltyProgram;