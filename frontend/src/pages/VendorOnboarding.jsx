import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { vendorAPI, utils } from '../utils/api';
import SpoilageWarning from '../components/SpoilageWarning';
import DonationSuccessPopup from '../components/DonationSuccessPopup';
import './VendorOnboarding.css';

function VendorOnboarding() {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [inventoryItems, setInventoryItems] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const [showDonationPopup, setShowDonationPopup] = useState(false);
  const [donationMessage, setDonationMessage] = useState('');

  // Mock spoilage warning data for registration - only tomatoes need attention
  const [spoilageItems, setSpoilageItems] = useState([
    {
      name: "Tomato",
      quantity: "1 kg",
      daysUntilSpoilage: 1,
      price: 40
    }
  ]);

  // Get vendor data from registration
  const vendorData = location.state?.vendorData || {
    name: "New Vendor",
    phone: "+91-00000-00000",
    location: "Your Location"
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
      // Simulate AI analysis with loading
      setTimeout(async () => {
        try {
          const imageData = await utils.imageToBase64(selectedFile);
          
          // Mock analysis result for demo - 3 perfect items and 1 likely to spoil
          const mockResult = {
            success: true,
            items: [
              {
                name: "Mango",
                quantity: "1 kg", // Fixed quantity
                unit: "kg",
                detection_confidence: 0.95,
                price_per_unit: 0
              },
              {
                name: "Banana",
                quantity: "1 kg", // Fixed quantity
                unit: "kg",
                detection_confidence: 0.92,
                price_per_unit: 0
              },
              {
                name: "Onion",
                quantity: "1 kg", // Fixed quantity
                unit: "kg",
                detection_confidence: 0.85,
                price_per_unit: 0
              },
              {
                name: "Tomato",
                quantity: "1 kg", // Fixed quantity
                unit: "kg",
                detection_confidence: 0.88,
                price_per_unit: 0
              }
            ],
            image_url: "cart_photo.jpg"
          };

          setAnalysisResult(mockResult);
          setInventoryItems(mockResult.items.map(item => ({
            ...item,
            price_per_unit: item.price_per_unit || 0
          })));
          setSuccess('🎉 Image analyzed successfully! Your inventory has been detected.');
          setCurrentStep(2);
        } catch (err) {
          setError('Failed to analyze image: ' + err.message);
        } finally {
          setLoading(false);
        }
      }, 3000);

    } catch (err) {
      setError('Failed to analyze image: ' + err.message);
      setLoading(false);
    }
  };

  const handleDonate = (item, centerId) => {
    // Handle donation logic for registration
    console.log(`Registration donating ${item.name} to center ${centerId}`);
    
    // Remove the donated item from spoilage items
    setSpoilageItems(prevItems => prevItems.filter(spoilageItem => spoilageItem.name !== item.name));
    
    // Show donation success popup
    setDonationMessage(`🎁 Donation request sent for ${item.name}! Thank you for helping the community and maintaining sustainability.`);
    setShowDonationPopup(true);
  };

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...inventoryItems];
    updatedItems[index] = {
      ...updatedItems[index],
      [field]: value
    };
    setInventoryItems(updatedItems);
  };

  const handleCompleteOnboarding = async () => {
    if (inventoryItems.length === 0) {
      setError('Please add inventory items first');
      return;
    }

    // Check if all items have price
    const incompleteItems = inventoryItems.filter(item => !item.price_per_unit);
    if (incompleteItems.length > 0) {
      setError('Please set prices for all items');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      console.log('🚀 Starting vendor onboarding...', { vendorData, inventoryItems });
      
      // First, register the vendor
      console.log('📝 Registering vendor...');
      const onboardResponse = await vendorAPI.onboard(
        vendorData.phone,
        vendorData.name,
        vendorData.location
      );

      console.log('📝 Onboard response:', onboardResponse);

      if (!onboardResponse.success) {
        throw new Error(onboardResponse.message || 'Failed to register vendor');
      }

      const vendorId = onboardResponse.vendor_id;
      console.log('✅ Vendor registered with ID:', vendorId);

      // Then save the inventory
      console.log('📦 Saving inventory...');
      const inventoryResponse = await vendorAPI.updateInventory(
        vendorId,
        inventoryItems,
        analysisResult?.image_url || null
      );

      console.log('📦 Inventory response:', inventoryResponse);

      if (inventoryResponse.success) {
        setShowSuccessAnimation(true);
        setSuccess('🎉 Onboarding completed successfully!');
        
        // Simple redirect after success animation
        setTimeout(() => {
          console.log('🔄 Redirecting to success page...');
          navigate('/vendor/success', { 
            state: { 
              vendorData: { ...vendorData, vendor_id: vendorId },
              inventoryItems: inventoryItems,
              analysisResult: analysisResult
            },
            replace: true // Replace current history entry
          });
        }, 3000); // Give more time for animation
        
      } else {
        throw new Error(inventoryResponse.message || 'Failed to save inventory');
      }

    } catch (err) {
      console.error('❌ Onboarding error:', err);
      setError('Failed to complete onboarding: ' + err.message);
      setLoading(false);
    }
  };

  const renderStep1 = () => (
    <div className="onboarding-step">
      <div className="step-header">
        <div className="step-number">1</div>
        <h2>📸 Upload Your Cart Photo</h2>
        <p>Let's start by taking a photo of your cart to automatically detect your inventory</p>
      </div>

      <div className="upload-section">
        <div className="file-upload">
          <input
            type="file"
            id="cartImage"
            accept="image/*"
            onChange={handleFileSelect}
            className="file-input"
          />
          <label htmlFor="cartImage" className="file-label">
            📷 Choose Cart Photo
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
              {loading ? '🔍 Analyzing...' : '🔍 Analyze Image'}
            </button>
          </div>
        )}

        {loading && (
          <div className="analysis-loading">
            <div className="loading-spinner"></div>
            <h3>AI is analyzing your cart...</h3>
            <p>Detecting fruits, vegetables, and other items</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="onboarding-step">
      <div className="step-header">
        <div className="step-number">2</div>
        <h2>💰 Set Your Prices</h2>
        <p>Set competitive prices for your detected inventory items</p>
      </div>

      <div className="inventory-review">
        <div className="detected-items">
          <h4>Detected Items ({inventoryItems.length})</h4>
          
          {inventoryItems.map((item, index) => (
            <div key={index} className="item-card">
              <div className="item-info">
                <h5>{item.name}</h5>
                <p>Quantity: {item.quantity}</p>
                <p>Confidence: {(item.detection_confidence * 100).toFixed(1)}%</p>
              </div>
              
              <div className="item-pricing">
                <div className="input-group">
                  <label>Price per {item.unit}:</label>
                  <input
                    type="number"
                    value={item.price_per_unit}
                    onChange={(e) => handleItemChange(index, 'price_per_unit', parseFloat(e.target.value) || 0)}
                    placeholder="0"
                    min="0"
                    step="0.01"
                    className="price-input"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="completion-section">
          <button
            onClick={handleCompleteOnboarding}
            className="btn btn-primary btn-large"
            disabled={loading || inventoryItems.length === 0}
          >
            {loading ? 'Completing...' : '✅ Complete Onboarding'}
          </button>
        </div>

        {/* Spoilage Warning for Registration - At the bottom */}
        {spoilageItems.length > 0 && (
          <>
            <SpoilageWarning
              items={spoilageItems}
              onDonate={handleDonate}
              showDonationInfo={true}
            />

            {/* Donation Message */}
            <div className="donation-message">
              <h4>💝 Donation Opportunity</h4>
              <p>You can take action to donate these extra products to the needy in case of surplus inventory. This helps reduce food waste and supports the community.</p>
            </div>
          </>
        )}
      </div>
    </div>
  );

  return (
    <div className="vendor-onboarding">
      <div className="onboarding-container">
        <div className="onboarding-header">
          <h1>🚚 Welcome to Vendee!</h1>
          <p>Let's get your business set up in just a few steps</p>
        </div>

        <div className="progress-bar">
          <div className={`progress-step ${currentStep >= 1 ? 'active' : ''}`}>
            <span className="step-icon">📸</span>
            <span className="step-label">Upload Photo</span>
          </div>
          <div className={`progress-step ${currentStep >= 2 ? 'active' : ''}`}>
            <span className="step-icon">📦</span>
            <span className="step-label">Review Inventory</span>
          </div>
          <div className={`progress-step ${currentStep >= 3 ? 'active' : ''}`}>
            <span className="step-icon">✅</span>
            <span className="step-label">Complete</span>
          </div>
        </div>

        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}

        {/* Loading State */}
        {loading && (
          <div className="loading-overlay">
            <div className="loading-content">
              <div className="loading-spinner"></div>
              <h3>Setting up your vendor account...</h3>
              <p>Please wait while we register your business and save your inventory</p>
            </div>
          </div>
        )}

        {/* Success Animation */}
        {showSuccessAnimation && (
          <div className="success-animation-overlay">
            <div className="success-animation">
              <div className="success-icon">🎉</div>
              <h2>Welcome to Vendee!</h2>
              <p>Your shop is being set up...</p>
              <div className="loading-dots">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}

        {/* Fallback Welcome Message */}
        {!analysisResult && !loading && currentStep === 1 && (
          <div className="welcome-message">
            <div className="welcome-content">
              <div className="welcome-icon">🚚</div>
              <h2>Welcome to Vendee!</h2>
              <p>Let's get your business set up in just a few steps</p>
              <div className="welcome-steps">
                <div className="welcome-step">
                  <span className="step-number">1</span>
                  <span>Upload a photo of your cart</span>
                </div>
                <div className="welcome-step">
                  <span className="step-number">2</span>
                  <span>AI will detect your inventory</span>
                </div>
                <div className="welcome-step">
                  <span className="step-number">3</span>
                  <span>Set prices and go live!</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Error and Success Messages */}
        {error && (
          <div className="error-message">
            ❌ {error}
            <button 
              className="btn btn-secondary" 
              onClick={() => setError('')}
              style={{ marginTop: '1rem' }}
            >
              Try Again
            </button>
          </div>
        )}

        {success && (
          <div className="success-message">
            ✅ {success}
          </div>
        )}

        {/* Donation Success Popup */}
        <DonationSuccessPopup
          message={donationMessage}
          isVisible={showDonationPopup}
          onClose={() => setShowDonationPopup(false)}
        />
      </div>
    </div>
  );
}

export default VendorOnboarding;