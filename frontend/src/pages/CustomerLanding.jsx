import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './CustomerLanding.css';

function CustomerLanding() {
  const navigate = useNavigate();
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnimating, setIsAnimating] = useState(false);

  const handleOptionSelect = (option) => {
    setSelectedOption(option);
    setIsAnimating(true);
    
    // Animate selection and navigate
    setTimeout(() => {
      if (option === 'manual') {
        navigate('/customer/manual-buy');
      } else if (option === 'smart') {
        navigate('/customer/smart-buy');
      }
    }, 800);
  };

  return (
    <div className="customer-landing">
      <div className="landing-container">
        <div className="landing-header">
          <div className="welcome-icon">🛒</div>
          <h1>Welcome to Vendee</h1>
          <p>How would you like to shop today?</p>
        </div>

        <div className="options-container">
          <div 
            className={`option-card ${selectedOption === 'manual' ? 'selected' : ''} ${isAnimating ? 'animate' : ''}`}
            onClick={() => handleOptionSelect('manual')}
          >
            <div className="option-icon">🔍</div>
            <h2>Manual Buy</h2>
            <p>Browse vendors, compare prices, and make your own choices</p>
            <div className="option-features">
              <span>📍 Map View</span>
              <span>💰 Price Comparison</span>
              <span>📱 Direct Contact</span>
            </div>
            <div className="selection-indicator">
              {selectedOption === 'manual' ? '✓ Selected' : 'Click to Select'}
            </div>
          </div>

          <div 
            className={`option-card ${selectedOption === 'smart' ? 'selected' : ''} ${isAnimating ? 'animate' : ''}`}
            onClick={() => handleOptionSelect('smart')}
          >
            <div className="option-icon">🤖</div>
            <h2>Smart Buy</h2>
            <p>Let our AI agent find the best vendors for your needs</p>
            <div className="option-features">
              <span>🧠 AI Recommendations</span>
              <span>🚚 Auto-Requests</span>
              <span>🎯 Smart Filtering</span>
            </div>
            <div className="selection-indicator">
              {selectedOption === 'smart' ? '✓ Selected' : 'Click to Select'}
            </div>
          </div>
        </div>

        <div className="landing-footer">
          <p>Powered by AI • Connecting you with the best street vendors</p>
                     <div className="landing-nav-links">
             <button
               className="nav-link-btn"
               onClick={() => navigate('/leaderboard')}
             >
               🏆 Leaderboard
             </button>
           </div>
        </div>
      </div>
    </div>
  );
}

export default CustomerLanding;
