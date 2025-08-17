import React from 'react';
import './VendorLocationModal.css';

function VendorLocationModal({ vendor, isOpen, onClose }) {
  if (!isOpen || !vendor) return null;

  const handleGetDirections = () => {
    // Open Google Maps with directions
    const { lat, lng } = vendor.coordinates;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    window.open(url, '_blank');
  };

  const handleCallVendor = () => {
    // Extract phone number from vendor data or use a default
    const phoneNumber = vendor.phone || '+91-98765-43210';
    window.open(`tel:${phoneNumber}`, '_self');
  };

  return (
    <div className="vendor-location-modal-overlay" onClick={onClose}>
      <div className="vendor-location-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>📍 {vendor.name}'s Location</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="modal-content">
          <div className="vendor-info-section">
            <div className="vendor-details">
              <h4>{vendor.name}</h4>
              <p className="vendor-type">
                {vendor.type === 'Moving' ? '🚚 Moving Vendor' : '🏪 Stationary Vendor'}
              </p>
              <p className="vendor-distance">📍 {vendor.distance} away</p>
              <p className="vendor-rating">⭐ {vendor.rating} rating</p>
              {vendor.phone && (
                <p className="vendor-phone">📞 {vendor.phone}</p>
              )}
            </div>

            <div className="vendor-items">
              <h5>Available Items:</h5>
              <div className="items-list">
                {vendor.items.map((item, index) => (
                  <span key={index} className="item-tag">{item}</span>
                ))}
              </div>
            </div>
          </div>

          <div className="map-section">
            <div className="map-container">
              <div className="mock-map">
                <div className="map-placeholder">
                  <div className="map-icon">🗺️</div>
                  <h4>Interactive Map</h4>
                  <p>Vendor location: {vendor.coordinates.lat.toFixed(4)}, {vendor.coordinates.lng.toFixed(4)}</p>
                  
                  {/* Vendor pin on map */}
                  <div className="vendor-pin-on-map">
                    <div className="pin-icon">📍</div>
                    <div className="pin-label">{vendor.name}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="location-actions">
            <button className="action-btn primary" onClick={handleGetDirections}>
              🧭 Get Directions
            </button>
            <button className="action-btn secondary" onClick={handleCallVendor}>
              📞 Call Vendor
            </button>
            <button className="action-btn tertiary" onClick={onClose}>
              ✕ Close
            </button>
          </div>

          <div className="location-tips">
            <h5>💡 Tips for visiting this vendor:</h5>
            <ul>
              <li>Best time to visit: {vendor.type === 'Moving' ? 'Anytime' : 'Morning (6-10 AM)'}</li>
              <li>Payment: Cash and digital payments accepted</li>
              <li>Bring your own bags for eco-friendly shopping</li>
              <li>Ask about today's fresh arrivals</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default VendorLocationModal;
