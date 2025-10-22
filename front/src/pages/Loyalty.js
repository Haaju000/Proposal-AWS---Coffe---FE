import React from 'react';
import Header from '../components/Header';
import { useAuth } from '../contexts/AuthContext';
import '../css/Loyalty.css';

const Loyalty = () => {
  const { user } = useAuth();

  // Mock loyalty data
  const loyaltyData = {
    points: 1250,
    tier: 'Gold',
    nextTier: 'Platinum',
    pointsToNextTier: 750,
    lifetimePoints: 3420,
    memberSince: '2025-06-15'
  };

  const recentTransactions = [
    { date: '2025-10-20', description: 'Purchase at Cozy Brew Downtown', points: 125, type: 'earned' },
    { date: '2025-10-18', description: 'Free drink redeemed', points: -500, type: 'redeemed' },
    { date: '2025-10-15', description: 'Purchase at Cozy Brew Mall', points: 85, type: 'earned' },
    { date: '2025-10-12', description: 'Birthday bonus points', points: 200, type: 'bonus' }
  ];

  const rewards = [
    { id: 1, name: 'Free Coffee', points: 500, description: 'Any size coffee drink', available: true },
    { id: 2, name: 'Free Pastry', points: 300, description: 'Any pastry item', available: true },
    { id: 3, name: 'Free Sandwich', points: 800, description: 'Any sandwich from our menu', available: true },
    { id: 4, name: '20% Off Order', points: 1000, description: 'Discount on entire order', available: true },
    { id: 5, name: 'Free Meal Combo', points: 1500, description: 'Sandwich + drink + pastry', available: false }
  ];

  const getTierColor = (tier) => {
    switch (tier) {
      case 'Bronze': return '#CD7F32';
      case 'Silver': return '#C0C0C0';
      case 'Gold': return '#FFD700';
      case 'Platinum': return '#E5E4E2';
      default: return '#8B4513';
    }
  };

  const getProgressPercentage = () => {
    const totalNeeded = 2000; // Points needed for Platinum
    const currentProgress = loyaltyData.points;
    return Math.min((currentProgress / totalNeeded) * 100, 100);
  };

  return (
    <div className="loyalty-page">
      <Header />
      
      <main className="loyalty-main">
        <div className="loyalty-container">
          <div className="loyalty-header">
            <h1 className="loyalty-title">Loyalty Program</h1>
            <p className="loyalty-subtitle">Earn points with every purchase and unlock amazing rewards</p>
          </div>

          <div className="loyalty-content">
            {/* Points Summary */}
            <div className="points-card">
              <div className="points-header">
                <div className="tier-badge" style={{ backgroundColor: getTierColor(loyaltyData.tier) }}>
                  <span>{loyaltyData.tier}</span>
                </div>
                <div className="points-info">
                  <h2 className="current-points">{loyaltyData.points.toLocaleString()}</h2>
                  <p className="points-label">Available Points</p>
                </div>
              </div>

              <div className="tier-progress">
                <div className="progress-info">
                  <span>Progress to {loyaltyData.nextTier}</span>
                  <span>{loyaltyData.pointsToNextTier} points to go</span>
                </div>
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${getProgressPercentage()}%` }}
                  ></div>
                </div>
              </div>

              <div className="loyalty-stats">
                <div className="stat-item">
                  <span className="stat-value">{loyaltyData.lifetimePoints.toLocaleString()}</span>
                  <span className="stat-label">Lifetime Points</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value">
                    {new Date(loyaltyData.memberSince).toLocaleDateString('en-US', { 
                      month: 'short', 
                      year: 'numeric' 
                    })}
                  </span>
                  <span className="stat-label">Member Since</span>
                </div>
              </div>
            </div>

            {/* Available Rewards */}
            <div className="rewards-section">
              <h2 className="section-title">Available Rewards</h2>
              <div className="rewards-grid">
                {rewards.map(reward => (
                  <div key={reward.id} className={`reward-card ${!reward.available ? 'unavailable' : ''}`}>
                    <div className="reward-icon">
                      {reward.name.includes('Coffee') && '☕'}
                      {reward.name.includes('Pastry') && '🥐'}
                      {reward.name.includes('Sandwich') && '🥪'}
                      {reward.name.includes('Off') && '💰'}
                      {reward.name.includes('Combo') && '🍽️'}
                    </div>
                    <div className="reward-info">
                      <h3 className="reward-name">{reward.name}</h3>
                      <p className="reward-description">{reward.description}</p>
                      <div className="reward-points">{reward.points} points</div>
                    </div>
                    <button 
                      className={`redeem-btn ${loyaltyData.points >= reward.points && reward.available ? 'active' : 'disabled'}`}
                      disabled={loyaltyData.points < reward.points || !reward.available}
                    >
                      {loyaltyData.points >= reward.points && reward.available ? 'Redeem' : 'Not Available'}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Transactions */}
            <div className="transactions-section">
              <h2 className="section-title">Recent Activity</h2>
              <div className="transactions-list">
                {recentTransactions.map((transaction, index) => (
                  <div key={index} className="transaction-item">
                    <div className="transaction-date">
                      {new Date(transaction.date).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </div>
                    <div className="transaction-details">
                      <span className="transaction-description">{transaction.description}</span>
                      <span className={`transaction-points ${transaction.type}`}>
                        {transaction.points > 0 ? '+' : ''}{transaction.points} points
                      </span>
                    </div>
                    <div className={`transaction-type ${transaction.type}`}>
                      {transaction.type === 'earned' && '💰'}
                      {transaction.type === 'redeemed' && '🎁'}
                      {transaction.type === 'bonus' && '⭐'}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* How It Works */}
            <div className="how-it-works">
              <h2 className="section-title">How It Works</h2>
              <div className="steps-grid">
                <div className="step-card">
                  <div className="step-number">1</div>
                  <h3>Make Purchases</h3>
                  <p>Earn 10 points for every $1 spent at any Cozy Brew location</p>
                </div>
                <div className="step-card">
                  <div className="step-number">2</div>
                  <h3>Collect Points</h3>
                  <p>Points are automatically added to your account after each purchase</p>
                </div>
                <div className="step-card">
                  <div className="step-number">3</div>
                  <h3>Redeem Rewards</h3>
                  <p>Use your points to get free drinks, food, and exclusive discounts</p>
                </div>
                <div className="step-card">
                  <div className="step-number">4</div>
                  <h3>Level Up</h3>
                  <p>Reach higher tiers for better rewards and exclusive perks</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Loyalty;