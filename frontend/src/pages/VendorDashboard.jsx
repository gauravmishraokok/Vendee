import React, { useState, useEffect } from 'react';
import { vendorAPI, utils } from '../utils/api';
import VendorNav from '../components/VendorNav';
import SpoilageWarning from '../components/SpoilageWarning';
import DonationSuccessPopup from '../components/DonationSuccessPopup';
import './VendorDashboard.css';
import { useLocation } from 'react-router-dom';

function VendorDashboard() {
  const location = useLocation();
  const [vendorId, setVendorId] = useState(location.state?.vendorData?.vendor_id || 'V001'); // Get from onboarding state
  const [vendorName, setVendorName] = useState(location.state?.vendorData?.name || 'Rajesh Kumar'); // Get from onboarding state
  const [vendorStatus, setVendorStatus] = useState({
    isOpen: false,
    isMoving: false,
    location: null
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [inventoryItems, setInventoryItems] = useState([]);
  const [demandSuggestions, setDemandSuggestions] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLive, setIsLive] = useState(false);
  const [showLiveAnimation, setShowLiveAnimation] = useState(false);
  const [liveVendorName, setLiveVendorName] = useState('');
  const [showDonationPopup, setShowDonationPopup] = useState(false);
  const [donationMessage, setDonationMessage] = useState('');
  
                                     // Mock spoilage warning data - only tomatoes
                const [spoilageItems, setSpoilageItems] = useState([
                  {
                    name: "Tomatoes",
                    quantity: "2 kg",
                    daysUntilSpoilage: 2,
                    price: 40
                  }
                ]);

  useEffect(() => {
    getCurrentLocation();
    loadDemandSuggestions();
  }, []);

  const getCurrentLocation = async () => {
    try {
      const location = await utils.getCurrentLocation();
      setVendorStatus(prev => ({
        ...prev,
        location
      }));
    } catch (err) {
      setError('Failed to get current location');
    }
  };

  const loadDemandSuggestions = async () => {
    try {
      const suggestions = await vendorAPI.getDemandSuggestions(vendorId);
      setDemandSuggestions(suggestions);
    } catch (err) {
      console.log('No demand suggestions available');
    }
  };

  const handleStatusToggle = async (statusType) => {
    try {
      const newStatus = !vendorStatus[statusType];
      setVendorStatus(prev => ({
        ...prev,
        [statusType]: newStatus
      }));

      // Update vendor status in backend
      await vendorAPI.updateStatus(vendorId, {
        status: newStatus ? 'active' : 'closed',
        type: statusType === 'isMoving' ? (newStatus ? 'moving' : 'stationary') : undefined
      });

      setSuccess(`${statusType === 'isOpen' ? 'Open/Closed' : 'Moving/Stationary'} status updated!`);
    } catch (err) {
      setError(`Failed to update ${statusType} status`);
      // Revert the toggle on error
      setVendorStatus(prev => ({
        ...prev,
        [statusType]: !prev[statusType]
      }));
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setError('');
      setSuccess('');
    }
  };

  const handleAnalyzeImage = async () => {
    if (!selectedFile) {
      setError('Please select an image first');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const imageData = await utils.imageToBase64(selectedFile);
      const response = await vendorAPI.analyzeImage(vendorId, imageData);
      
      if (response.success) {
        setAnalysisResult(response);
        setInventoryItems(response.items.map(item => ({
          ...item,
          price_per_unit: 0,
          quantity: item.quantity || '1 kg'
        })));
        setSuccess('Image analyzed successfully! Please set prices for detected items.');
      } else {
        setError(response.error || 'Image analysis failed');
      }
    } catch (err) {
      setError('Failed to analyze image: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...inventoryItems];
    updatedItems[index] = {
      ...updatedItems[index],
      [field]: value
    };
    setInventoryItems(updatedItems);
  };

  const handleGoLive = async () => {
    if (inventoryItems.length === 0) {
      setError('Please add inventory items first');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');
    setShowLiveAnimation(true);
    setLiveVendorName(vendorName);

    try {
      const response = await vendorAPI.updateInventory(
        vendorId,
        inventoryItems,
        analysisResult?.image_url || null
      );
      
      if (response.success) {
        // Simulate processing time for better UX
        setTimeout(() => {
          setIsLive(true);
          setShowLiveAnimation(false);
          setSuccess('🎉 You are now LIVE! Customers can see your inventory.');
        }, 3000);
      } else {
        throw new Error(response.message || 'Failed to go live');
      }
    } catch (err) {
      setError('Failed to go live: ' + err.message);
      setShowLiveAnimation(false);
    } finally {
      setLoading(false);
    }
  };

  const getSpoilageWarning = (item) => {
    // Mock spoilage detection - in real app, this would use AI/ML
    const confidence = item.detection_confidence || 0;
    if (confidence < 0.5) {
      return { warning: '⚠️ Low quality detection - may spoil soon', color: '#f59e0b' };
    }
    return null;
  };

                                                                               const handleDonate = (item, centerId) => {
                     // Handle donation logic
                     console.log(`Donating ${item.name} to center ${centerId}`);
                     
                     // Remove the donated item from spoilage items
                     setSpoilageItems(prevItems => prevItems.filter(spoilageItem => spoilageItem.name !== item.name));
                     
                     // Show donation success popup
                     setDonationMessage(`🎁 Donation request sent for ${item.name}! Thank you for helping the community and maintaining sustainability.`);
                     setShowDonationPopup(true);
                   };

  return (
    <div className="vendor-dashboard">
      <VendorNav />
      
      <div className="dashboard-header">
        <h2>🚚 Vendor Dashboard</h2>
        <p>Welcome back, <strong>{vendorName}</strong>! Manage your business status and inventory</p>
      </div>

      {/* Status Toggles */}
      <div className="status-section">
        <h3>Business Status</h3>
        <div className="status-toggles">
          <div className="status-toggle">
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={vendorStatus.isOpen}
                onChange={() => handleStatusToggle('isOpen')}
              />
              <span className="slider"></span>
            </label>
            <div className="toggle-info">
              <h4>{vendorStatus.isOpen ? '🟢 Open' : '🔴 Closed'}</h4>
              <p>Mark your business as open or closed</p>
            </div>
          </div>

          <div className="status-toggle">
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={vendorStatus.isMoving}
                onChange={() => handleStatusToggle('isMoving')}
              />
              <span className="slider"></span>
            </label>
            <div className="toggle-info">
              <h4>{vendorStatus.isMoving ? '🚚 Moving' : '🏪 Stationary'}</h4>
              <p>Are you mobile or at a fixed location?</p>
            </div>
          </div>
        </div>
      </div>

      {/* Cart Photo Upload */}
      <div className="upload-section">
        <h3>📸 Today's Cart Photo</h3>
        <p>Upload a photo of your cart to update your inventory</p>
        
        <div className="file-upload">
          <input
            type="file"
            id="cartImage"
            accept="image/*"
            onChange={handleFileSelect}
            className="file-input"
          />
          <label htmlFor="cartImage" className="file-label">
            📷 Choose Photo
          </label>
        </div>

        {previewUrl && (
          <div className="image-preview">
            <img src={previewUrl} alt="Cart preview" />
            <button
              onClick={handleAnalyzeImage}
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Analyzing...' : '🔍 Analyze Image'}
            </button>
          </div>
        )}
      </div>

      {/* Error and Success Messages */}
      {error && (
        <div className="error-message">
          ❌ {error}
        </div>
      )}

      {success && (
        <div className="success-message">
          ✅ {success}
        </div>
      )}

      {/* Spoilage Warning */}
      <SpoilageWarning 
        items={spoilageItems}
        onDonate={handleDonate}
        showDonationInfo={true}
      />

      {/* Inventory Management */}
      {analysisResult && (
        <div className="inventory-section">
          <h3>📦 Inventory Management</h3>
          
          {/* Demand Suggestions */}
          {demandSuggestions.length > 0 && (
            <div className="demand-suggestions">
              <h4>💡 High Demand Items Nearby</h4>
              <p>Consider adding these items to increase sales:</p>
              <div className="suggestions-grid">
                {demandSuggestions.map((item, index) => (
                  <div key={index} className="suggestion-item">
                    <span className="item-name">{item.name}</span>
                    <span className="demand-count">{item.total_requests} requests</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="detected-items">
            <h4>Detected Items ({inventoryItems.length})</h4>
            
            {inventoryItems.map((item, index) => {
              const spoilageWarning = getSpoilageWarning(item);
              return (
                <div key={index} className="item-card">
                  <div className="item-info">
                    <h5>{item.name}</h5>
                    <p>Quantity: {item.quantity || 'Not set'}</p>
                    <p>Confidence: {(item.detection_confidence * 100).toFixed(1)}%</p>
                    {spoilageWarning && (
                      <p className="spoilage-warning" style={{ color: spoilageWarning.color }}>
                        {spoilageWarning.warning}
                      </p>
                    )}
                  </div>
                  
                  <div className="item-pricing">
                    <label>Price per {item.unit}:</label>
                    <input
                      type="number"
                      value={item.price_per_unit}
                      onChange={(e) => handleItemChange(index, 'price_per_unit', parseFloat(e.target.value) || 0)}
                      placeholder="0"
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="go-live-section">
            <button
              onClick={handleGoLive}
              className="btn btn-primary btn-large"
              disabled={loading || inventoryItems.length === 0}
            >
              {loading ? 'Processing...' : '🚀 Go Live & Start Selling'}
            </button>
          </div>
        </div>
      )}

      {/* Live Animation */}
      {showLiveAnimation && (
        <div className="live-animation-overlay">
          <div className="live-animation">
            <div className="animation-header">
              <div className="loading-spinner"></div>
              <h3>Setting up your shop...</h3>
            </div>
            
            <div className="animation-steps">
              <div className="step">
                <div className="step-icon">📸</div>
                <div className="step-text">Processing cart photo</div>
              </div>
              <div className="step">
                <div className="step-icon">🤖</div>
                <div className="step-text">AI analyzing inventory</div>
              </div>
              <div className="step">
                <div className="step-icon">💰</div>
                <div className="step-text">Setting up pricing</div>
              </div>
              <div className="step">
                <div className="step-icon">🚀</div>
                <div className="step-text">Going live...</div>
              </div>
            </div>
            
            <div className="vendor-name">
              <strong>{liveVendorName}</strong>, your shop is being prepared!
            </div>
          </div>
        </div>
      )}

      {/* Live Status */}
      {isLive && (
        <div className="live-status">
          <div className="live-indicator">
            <div className="pulse-dot"></div>
            <h3>🎉 You are LIVE!</h3>
            <p>Customers can now see your inventory and place orders</p>
          </div>
          
          <div className="live-stats">
            <div className="stat-item">
              <div className="stat-number">{inventoryItems.length}</div>
              <div className="stat-label">Items Available</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">{vendorStatus.isMoving ? 'Mobile' : 'Fixed'}</div>
              <div className="stat-label">Vendor Type</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">{vendorStatus.isOpen ? 'Open' : 'Closed'}</div>
              <div className="stat-label">Status</div>
            </div>
          </div>
        </div>
      )}



      {/* Donation Success Popup */}
      <DonationSuccessPopup
        message={donationMessage}
        isVisible={showDonationPopup}
        onClose={() => setShowDonationPopup(false)}
      />
    </div>
  );
}

export default VendorDashboard;
