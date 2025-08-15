import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './RegistrationSuccess.css';

function RegistrationSuccess() {
  const navigate = useNavigate();
  const location = useLocation();
  const [countdown, setCountdown] = useState(5);
  
  // Get vendor data from onboarding
  const vendorData = location.state?.vendorData || {
    name: "New Vendor",
    phone: "+91-00000-00000"
  };

  useEffect(() => {
    // Countdown timer
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          // Redirect to vendor login
          navigate('/vendor/login');
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate]);

  return (
    <div className="registration-success">
      <div className="success-container">
        <div className="success-icon">🎉</div>
        <h1>Registration Complete!</h1>
        <h2>Welcome, <span className="vendor-name">{vendorData.name}</span>!</h2>
        <p className="success-message">
          Your vendor account has been successfully created and you are now live on Vendee!
        </p>
        
        <div className="success-details">
          <div className="detail-item">
            <span className="detail-icon">✅</span>
            <span>Account Created</span>
          </div>
          <div className="detail-item">
            <span className="detail-icon">📱</span>
            <span>Phone: {vendorData.phone}</span>
          </div>
          <div className="detail-item">
            <span className="detail-icon">🚀</span>
            <span>Status: Live on Vendee</span>
          </div>
        </div>

        <div className="redirect-info">
          <p>Redirecting to login page in <span className="countdown">{countdown}</span> seconds...</p>
          <button 
            className="btn btn-primary"
            onClick={() => navigate('/vendor/login')}
          >
            Login Now
          </button>
        </div>
      </div>
    </div>
  );
}

export default RegistrationSuccess;
