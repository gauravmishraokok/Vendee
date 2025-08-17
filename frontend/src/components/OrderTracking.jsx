import React, { useState, useEffect } from 'react';
import LiveTrackingMap from './LiveTrackingMap';
import './OrderTracking.css';

const OrderTracking = ({ order, onClose }) => {
  const [orderStatus, setOrderStatus] = useState('pending');
  const [statusMessage, setStatusMessage] = useState('Waiting for vendor to accept your order...');
  const [showTracking, setShowTracking] = useState(false);
  const [vendorLocation, setVendorLocation] = useState(null);
  const [eta, setEta] = useState(null);

  // Simulate order flow with delays
  useEffect(() => {
    const orderFlow = async () => {
      // Step 1: Waiting for vendor acceptance (3 seconds)
      await new Promise(resolve => setTimeout(resolve, 3000));
      setOrderStatus('accepted');
      setStatusMessage('Vendor accepted your order! 🎉');

      // Step 2: Vendor preparing order (2 seconds)
      await new Promise(resolve => setTimeout(resolve, 2000));
      setOrderStatus('preparing');
      setStatusMessage('Vendor is preparing your order... 📦');

      // Step 3: Order ready, starting delivery (2 seconds)
      await new Promise(resolve => setTimeout(resolve, 2000));
      setOrderStatus('delivering');
      setStatusMessage('Your order is on the way! 🚚');

      // Step 4: Show tracking map
      await new Promise(resolve => setTimeout(resolve, 1000));
      setShowTracking(true);
      
      // Set vendor location (slightly different from original for demo)
      setVendorLocation({
        lat: order.vendor.coordinates.lat + 0.001,
        lng: order.vendor.coordinates.lng + 0.001
      });
      
      // Calculate ETA (random between 5-15 minutes)
      const etaMinutes = Math.floor(Math.random() * 11) + 5;
      setEta(etaMinutes);
    };

    orderFlow();
  }, [order]);

  const getStatusIcon = () => {
    switch (orderStatus) {
      case 'pending':
        return '⏳';
      case 'accepted':
        return '✅';
      case 'preparing':
        return '📦';
      case 'delivering':
        return '🚚';
      default:
        return '📋';
    }
  };

  const getStatusColor = () => {
    switch (orderStatus) {
      case 'pending':
        return '#f59e0b';
      case 'accepted':
        return '#10b981';
      case 'preparing':
        return '#3b82f6';
      case 'delivering':
        return '#8b5cf6';
      default:
        return '#6b7280';
    }
  };

  return (
    <div className="order-tracking-overlay">
      <div className="order-tracking-content">
        <div className="tracking-header">
          <h2>📦 Order Tracking</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="order-details">
          <div className="order-info">
            <h3>Order #{order.id}</h3>
            <p><strong>Vendor:</strong> {order.vendor.name}</p>
            <p><strong>Items:</strong> {order.items.map(item => `${item.quantity} ${item.name}`).join(', ')}</p>
            <p><strong>Total:</strong> ₹{order.total}</p>
          </div>
        </div>

        {!showTracking ? (
          <div className="status-section">
            <div className="status-indicator" style={{ backgroundColor: getStatusColor() }}>
              <span className="status-icon">{getStatusIcon()}</span>
            </div>
            <div className="status-content">
              <h4 className="status-title">{orderStatus.charAt(0).toUpperCase() + orderStatus.slice(1)}</h4>
              <p className="status-message">{statusMessage}</p>
              <div className="loading-dots">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        ) : (
          <div className="tracking-section">
            <div className="tracking-info">
              <div className="eta-info">
                <h4>🚚 Delivery in Progress</h4>
                <p className="eta-text">Estimated arrival: <strong>{eta} minutes</strong></p>
                <p className="vendor-name">Delivered by: {order.vendor.name}</p>
              </div>
              
              <div className="contact-actions">
                <button className="contact-btn call-btn">
                  📞 Call Vendor
                </button>
                <button className="contact-btn message-btn">
                  💬 Message
                </button>
              </div>
            </div>

            <div className="map-container">
              <LiveTrackingMap
                vendorLocation={vendorLocation}
                destinationLocation={order.deliveryLocation || { lat: 28.7041, lng: 77.1025 }}
                vendorName={order.vendor.name}
                eta={eta}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderTracking;
