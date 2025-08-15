import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import './NewVendorProfile.css';

function NewVendorProfile() {
  const location = useLocation();
  
  // Debug logging
  console.log('📍 NewVendorProfile - Location state:', location.state);
  console.log('📍 NewVendorProfile - Location pathname:', location.pathname);
  
  // Get vendor data and inventory from onboarding
  const vendorData = location.state?.vendorData || {
    name: "New Vendor",
    phone: "+91-00000-00000",
    location: "Your Location"
  };
  
  const inventoryItems = location.state?.inventoryItems || [];
  const analysisResult = location.state?.analysisResult;

  console.log('📍 NewVendorProfile - Vendor data:', vendorData);
  console.log('📍 NewVendorProfile - Inventory items:', inventoryItems);
  console.log('📍 NewVendorProfile - Analysis result:', analysisResult);

  // If no data was passed, show a message
  if (!location.state || Object.keys(location.state).length === 0) {
    return (
      <div className="new-vendor-profile">
        <div className="profile-header">
          <h1>👤 New Vendor Profile</h1>
          <p>Welcome to Vendee! Let's get you started</p>
        </div>
        
        <div className="no-data-message">
          <div className="no-data-icon">⚠️</div>
          <h3>No Data Received</h3>
          <p>It looks like you didn't complete the onboarding process. Please go back and complete the setup.</p>
          <div className="action-buttons">
            <button 
              className="btn btn-primary"
              onClick={() => window.location.href = '/vendor/onboarding'}
            >
              🔄 Go Back to Onboarding
            </button>
            <button 
              className="btn btn-secondary"
              onClick={() => {
                // Test with mock data
                const mockData = {
                  vendorData: { name: "Test Vendor", phone: "+91-12345-67890", location: "Test Location" },
                  inventoryItems: [
                    { name: "Mango", quantity: "2 kg", price_per_unit: 80, unit: "kg", detection_confidence: 0.95 },
                    { name: "Banana", quantity: "1 kg", price_per_unit: 60, unit: "kg", detection_confidence: 0.92 }
                  ],
                  analysisResult: { success: true }
                };
                window.location.href = `/vendor/new-profile?mock=true&data=${encodeURIComponent(JSON.stringify(mockData))}`;
              }}
              style={{ marginLeft: '1rem' }}
            >
              🧪 Test with Mock Data
            </button>
          </div>
        </div>
      </div>
    );
  }

  const renderOverview = () => (
    <div className="overview-section">
      <div className="vendor-header">
        <div className="vendor-avatar">
          <img src="https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&h=300&fit=crop" alt={vendorData.name} />
          <div className="new-badge">NEW</div>
        </div>
        <div className="vendor-info">
          <h2>{vendorData.name}</h2>
          <p className="vendor-location">📍 {vendorData.location}</p>
          <div className="vendor-rating">
            <span className="stars">☆☆☆☆☆</span>
            <span className="rating-text">0/5.0</span>
            <span className="total-reviews">(0 reviews)</span>
          </div>
          <p className="vendor-description">Welcome to Vendee! You're a new vendor starting your journey. Your inventory has been set up and you're ready to start selling!</p>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card new-vendor">
          <div className="stat-icon">🚀</div>
          <div className="stat-number">0</div>
          <div className="stat-label">Total Sales (₹)</div>
        </div>
        <div className="stat-card new-vendor">
          <div className="stat-icon">📦</div>
          <div className="stat-number">0</div>
          <div className="stat-label">Orders Completed</div>
        </div>
        <div className="stat-card new-vendor">
          <div className="stat-icon">⭐</div>
          <div className="stat-number">0</div>
          <div className="stat-label">Customer Rating</div>
        </div>
        <div className="stat-card new-vendor">
          <div className="stat-icon">🎯</div>
          <div className="stat-number">{inventoryItems.length}</div>
          <div className="stat-label">Items Available</div>
        </div>
      </div>

      {/* Inventory Items Section */}
      {inventoryItems.length > 0 && (
        <div className="inventory-items-section">
          <h3>🥬 Your Current Inventory</h3>
          <div className="inventory-grid">
            {inventoryItems.map((item, index) => (
              <div key={index} className="inventory-item-card">
                <div className="item-icon">🥬</div>
                <div className="item-details">
                  <h4>{item.name}</h4>
                  <p>Quantity: {item.quantity || 'Not set'}</p>
                  <p>Price: ₹{item.price_per_unit || '0'} per {item.unit}</p>
                  <p>Confidence: {(item.detection_confidence * 100).toFixed(1)}%</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="get-started-section">
        <h3>🚀 Next Steps</h3>
        <div className="get-started-steps">
          <div className="step-item">
            <div className="step-number">1</div>
            <div className="step-content">
              <h4>✅ Inventory Setup Complete</h4>
              <p>Your cart photo has been analyzed and inventory is ready</p>
            </div>
          </div>
          <div className="step-item">
            <div className="step-number">2</div>
            <div className="step-content">
              <h4>Go to Dashboard</h4>
              <p>Manage your business status and update inventory daily</p>
            </div>
          </div>
          <div className="step-item">
            <div className="step-number">3</div>
            <div className="step-content">
              <h4>Start Selling</h4>
              <p>Go live and reach customers in your area</p>
            </div>
          </div>
        </div>
        
        <div className="action-buttons">
          <button 
            className="btn btn-primary"
            onClick={() => window.location.href = '/vendor/dashboard'}
          >
            📊 Go to Dashboard
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="new-vendor-profile">
      <div className="profile-header">
        <h1>👤 New Vendor Profile</h1>
        <p>Welcome to Vendee! Let's get you started</p>
      </div>

      {/* Debug Section - Remove this in production */}
      <div className="debug-section" style={{ background: '#f0f9ff', padding: '1rem', margin: '1rem 0', borderRadius: '8px', fontSize: '0.9rem' }}>
        <h4>🔍 Debug Info:</h4>
        <p><strong>Location State:</strong> {JSON.stringify(location.state, null, 2)}</p>
        <p><strong>Vendor Data:</strong> {JSON.stringify(vendorData, null, 2)}</p>
        <p><strong>Inventory Items:</strong> {JSON.stringify(inventoryItems, null, 2)}</p>
        <p><strong>Analysis Result:</strong> {JSON.stringify(analysisResult, null, 2)}</p>
      </div>

      <div className="tab-content">
        {renderOverview()}
      </div>
    </div>
  );
}

export default NewVendorProfile;
