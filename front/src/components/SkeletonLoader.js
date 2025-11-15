import React from 'react';
import '../css/SkeletonLoader.css';

const SkeletonLoader = ({ type = 'card', count = 6 }) => {
  if (type === 'card') {
    return (
      <div className="skeleton-grid">
        {Array.from({ length: count }, (_, i) => (
          <div key={i} className="skeleton-card">
            <div className="skeleton-image"></div>
            <div className="skeleton-content">
              <div className="skeleton-title"></div>
              <div className="skeleton-description"></div>
              <div className="skeleton-price"></div>
              <div className="skeleton-actions">
                <div className="skeleton-qty-selector"></div>
                <div className="skeleton-button"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (type === 'category') {
    return (
      <div className="skeleton-categories">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="skeleton-category-btn"></div>
        ))}
      </div>
    );
  }

  if (type === 'search') {
    return (
      <div className="skeleton-search">
        <div className="skeleton-search-box"></div>
      </div>
    );
  }

  return null;
};

export default SkeletonLoader;