import React from 'react';
import './VendorDetailsModal.css';

const VendorDetailsModal = ({ vendor, isOpen, onClose, onRequest }) => {
  if (!isOpen || !vendor) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{vendor.name}</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-body">
          <div className="vendor-info">
            <div className="vendor-meta">
              <span className={`vendor-type ${vendor.type}`}>
                {vendor.type === 'moving' ? '🚚 Moving Vendor' : '🏪 Stationary Vendor'}
              </span>
              <span className="vendor-distance">{vendor.distance} km away</span>
            </div>
            
            <div className="vendor-contact">
              <p><strong>Location:</strong> {vendor.location}</p>
              <p><strong>Phone:</strong> {vendor.phone}</p>
            </div>
          </div>

          <div className="vendor-items">
            <h4>Available Items</h4>
            <div className="items-grid">
              {vendor.items.map((item, index) => (
                <div key={index} className="item-card">
                  <div className="item-header">
                    <h5>{item.name}</h5>
                    <span className="item-price">₹{item.price}/{item.unit || 'kg'}</span>
                  </div>
                  <div className="item-actions">
                    <input
                      type="number"
                      placeholder="Qty"
                      min="1"
                      className="quantity-input"
                      defaultValue="1"
                    />
                    <button 
                      className="request-btn"
                      onClick={() => onRequest(vendor, item, 1)}
                    >
                      Request
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="vendor-actions">
            <button className="action-btn call-btn">
              📞 Call {vendor.name}
            </button>
            <button className="action-btn message-btn">
              💬 Message
            </button>
            <button className="action-btn directions-btn">
              🧭 Get Directions
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorDetailsModal;
