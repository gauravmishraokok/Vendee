import React, { useState } from 'react';
import './SpoilageWarning.css';

function SpoilageWarning({ items = [], onDonate, showDonationInfo = true }) {
  const [showDetails, setShowDetails] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  // Mock donation centers data
  const donationCenters = [
    {
      id: 1,
      name: "Community Food Bank",
      address: "123 Main Street, Downtown",
      distance: "0.8 km",
      phone: "+91-98765-43210",
      hours: "9:00 AM - 6:00 PM",
      accepts: ["Vegetables", "Fruits", "Grains"],
      rating: 4.8,
      pickup: true
    },
    {
      id: 2,
      name: "Local NGO - Food for All",
      address: "456 Park Avenue, Central",
      distance: "1.2 km",
      phone: "+91-98765-43211",
      hours: "8:00 AM - 7:00 PM",
      accepts: ["All Food Items"],
      rating: 4.6,
      pickup: true
    },
    {
      id: 3,
      name: "Government Relief Center",
      address: "789 Station Road, North",
      distance: "2.1 km",
      phone: "+91-98765-43212",
      hours: "24/7",
      accepts: ["Vegetables", "Fruits", "Dairy"],
      rating: 4.9,
      pickup: false
    },
    {
      id: 4,
      name: "Temple Community Kitchen",
      address: "321 Temple Street, East",
      distance: "1.5 km",
      phone: "+91-98765-43213",
      hours: "6:00 AM - 9:00 PM",
      accepts: ["All Food Items"],
      rating: 4.7,
      pickup: true
    }
  ];

  const getSpoilageStatus = (item) => {
    const daysLeft = item.daysUntilSpoilage;
    if (daysLeft <= 2) return { status: 'warning', color: '#f59e0b', icon: '⚠️' };
    if (daysLeft <= 3) return { status: 'caution', color: '#fbbf24', icon: '⚡' };
    return { status: 'safe', color: '#10b981', icon: '✅' };
  };

  const handleDonate = (item) => {
    setSelectedItem(item);
    setShowDetails(true);
  };

  const handleDonateConfirm = (centerId) => {
    if (onDonate) {
      onDonate(selectedItem, centerId);
    }
    setShowDetails(false);
    setSelectedItem(null);
  };

  if (items.length === 0) {
    return null;
  }

  // Only show warning items (no critical items)
  const warningItems = items.filter(item => item.daysUntilSpoilage <= 3);

  return (
    <div className="spoilage-warning-container">
      {/* Warning Items */}
      {warningItems.length > 0 && (
        <div className="warning-section warning">
          <div className="warning-header">
            <span className="warning-icon">⚠️</span>
            <h3>Needs Attention - Spoils by approximately by tomorrow</h3>
            <span className="warning-count">{warningItems.length}</span>
          </div>
          <div className="warning-items">
            {warningItems.map((item, index) => (
              <div key={index} className="warning-item warning">
                <div className="item-info">
                  <span className="item-name">{item.name}</span>
                  <span className="item-quantity">{item.quantity}</span>
                  <span className="spoilage-time">
                    {item.daysUntilSpoilage === 1 ? 'Spoils tomorrow!' : `Spoils in ${item.daysUntilSpoilage} days`}
                  </span>
                </div>
                {showDonationInfo && (
                  <button 
                    className="donate-btn warning"
                    onClick={() => handleDonate(item)}
                  >
                    🎁 Donate
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Donation Modal */}
      {showDetails && selectedItem && (
        <div className="donation-modal-overlay">
          <div className="donation-modal">
            <div className="modal-header">
              <h3>🎁 Donate {selectedItem.name}</h3>
              <button 
                className="close-btn"
                onClick={() => setShowDetails(false)}
              >
                ✕
              </button>
            </div>
            
            <div className="modal-content">
              <div className="item-summary">
                <div className="item-details">
                  <span className="item-name">{selectedItem.name}</span>
                  <span className="item-quantity">{selectedItem.quantity}</span>
                  <span className="spoilage-status">
                    {getSpoilageStatus(selectedItem).icon} 
                    {selectedItem.daysUntilSpoilage === 1 ? 'Spoils tomorrow!' : `Spoils in ${selectedItem.daysUntilSpoilage} days`}
                  </span>
                </div>
              </div>

              <div className="donation-centers">
                <h4>📍 Nearby Donation Centers</h4>
                <div className="centers-list">
                  {donationCenters.map(center => (
                    <div key={center.id} className="center-card">
                      <div className="center-info">
                        <h5>{center.name}</h5>
                        <p className="center-address">{center.address}</p>
                        <div className="center-details">
                          <span className="distance">📍 {center.distance}</span>
                          <span className="hours">🕒 {center.hours}</span>
                          <span className="rating">⭐ {center.rating}</span>
                        </div>
                        <div className="center-accepts">
                          <span className="accepts-label">Accepts:</span>
                          <div className="accepts-tags">
                            {center.accepts.map((item, index) => (
                              <span key={index} className="accepts-tag">{item}</span>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="center-actions">
                        <a 
                          href={`tel:${center.phone}`}
                          className="contact-btn"
                        >
                          📞 Call
                        </a>
                        <button 
                          className="donate-center-btn"
                          onClick={() => handleDonateConfirm(center.id)}
                        >
                          {center.pickup ? '🚚 Schedule Pickup' : '📦 Drop Off'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="donation-tips">
                <h4>💡 Donation Tips:</h4>
                <ul>
                  <li>Ensure items are still safe for consumption</li>
                  <li>Pack items properly to prevent damage</li>
                  <li>Call ahead to confirm acceptance</li>
                  <li>Consider donating before items spoil</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SpoilageWarning;
