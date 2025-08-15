import React, { useEffect } from 'react';
import './DonationSuccessPopup.css';

function DonationSuccessPopup({ message, isVisible, onClose }) {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  return (
    <div className="donation-success-overlay">
      <div className="donation-success-popup">
        <div className="success-icon">🎉</div>
        <h3>Thank You!</h3>
        <p>{message}</p>
        <div className="success-animation">
          <div className="checkmark">✓</div>
        </div>
        <button className="close-popup-btn" onClick={onClose}>
          ✕
        </button>
      </div>
    </div>
  );
}

export default DonationSuccessPopup;
