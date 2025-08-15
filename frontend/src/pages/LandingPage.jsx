import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './LandingPage.css';

function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="landing-page">
      <div className="hero-section">
        <h2>Welcome to Vendee</h2>
        <p>Your AI-powered marketplace for fresh produce and local goods</p>
        
        <div className="landing-buttons">
          <button 
            className="landing-btn vendor-btn"
            onClick={() => navigate('/vendor/login')}
          >
            🏪 I'm a Vendor
          </button>
          <button 
            className="landing-btn customer-btn"
            onClick={() => navigate('/customer')}
          >
            🛒 I'm a Customer
          </button>
        </div>
        
        <div className="how-it-works">
          <h3>How It Works</h3>
          <div className="steps">
            <div className="step">
              <div className="step-number">1</div>
              <p>Vendors upload cart photos</p>
            </div>
            <div className="step">
              <div className="step-number">2</div>
              <p>AI detects items automatically</p>
            </div>
            <div className="step">
              <div className="step-number">3</div>
              <p>Customers find vendors on map</p>
            </div>
            <div className="step">
              <div className="step-number">4</div>
              <p>SmartBuy AI helps with requests</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LandingPage;
