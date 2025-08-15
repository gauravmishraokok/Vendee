import React, { useState } from 'react';
import { vendorAPI, utils } from '../utils/api';
import './VendorUpload.css';

function VendorUpload() {
  const [vendorId, setVendorId] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [inventoryItems, setInventoryItems] = useState([]);
  const [vendorType, setVendorType] = useState('stationary');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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
    if (!vendorId || !selectedFile) {
      setError('Please enter vendor ID and select an image');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Convert image to base64
      const imageData = await utils.imageToBase64(selectedFile);
      
      // Call API to analyze image
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

  const handleSaveInventory = async () => {
    if (!vendorId || inventoryItems.length === 0) {
      setError('Please enter vendor ID and ensure items are detected');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Update inventory (include analyzed image URL so it is stored with inventory)
      const response = await vendorAPI.updateInventory(
        vendorId,
        inventoryItems,
        analysisResult?.image_url || null
      );
      
      if (response.success) {
        setSuccess('Inventory updated successfully!');
        
        // Update vendor status
        await vendorAPI.updateStatus(vendorId, { type: vendorType });
        
        setSuccess('Inventory updated and status set successfully! You are now visible to customers.');
      } else {
        throw new Error(response.message || 'Failed to update inventory');
      }
    } catch (err) {
      setError('Failed to save inventory: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVendorTypeChange = async (newType) => {
    setVendorType(newType);
    if (vendorId) {
      try {
        await vendorAPI.updateStatus(vendorId, { type: newType });
        setSuccess(`Vendor type updated to ${newType}`);
      } catch (err) {
        setError('Failed to update vendor type');
      }
    }
  };

  return (
    <div className="vendor-upload">
      <div className="container">
        <div className="upload-header">
          <h2>📸 Upload Cart Photo</h2>
          <p>Take a photo of your cart and let AI detect your inventory automatically</p>
        </div>

        <div className="upload-content">
          <div className="upload-section">
            <h3>Step 1: Enter Vendor ID</h3>
            <div className="form-group">
              <label htmlFor="vendorId">Vendor ID *</label>
              <input
                type="text"
                id="vendorId"
                value={vendorId}
                onChange={(e) => setVendorId(e.target.value)}
                placeholder="e.g., V001"
                required
              />
            </div>
          </div>

          <div className="upload-section">
            <h3>Step 2: Upload Cart Photo</h3>
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
                  disabled={loading || !vendorId}
                >
                  {loading ? 'Analyzing...' : '🔍 Analyze Image'}
                </button>
              </div>
            )}
          </div>

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

          {analysisResult && (
            <div className="analysis-section">
              <h3>Step 3: Review & Set Prices</h3>
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
                ))}
              </div>

              <div className="vendor-type-section">
                <h4>Vendor Type</h4>
                <div className="type-options">
                  <label className="type-option">
                    <input
                      type="radio"
                      name="vendorType"
                      value="stationary"
                      checked={vendorType === 'stationary'}
                      onChange={() => handleVendorTypeChange('stationary')}
                    />
                    <span>🏪 Stationary (Fixed Location)</span>
                  </label>
                  <label className="type-option">
                    <input
                      type="radio"
                      name="vendorType"
                      value="moving"
                      checked={vendorType === 'moving'}
                      onChange={() => handleVendorTypeChange('moving')}
                    />
                    <span>🚚 Moving (Mobile Vendor)</span>
                  </label>
                </div>
              </div>

              <div className="save-actions">
                <button
                  onClick={handleSaveInventory}
                  className="btn btn-primary"
                  disabled={loading}
                >
                  {loading ? 'Saving...' : '💾 Save Inventory & Go Live'}
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="upload-tips">
          <h3>📝 Tips for Best Results</h3>
          <div className="tips-grid">
            <div className="tip-item">
              <div className="tip-icon">📸</div>
              <h4>Clear Photo</h4>
              <p>Ensure good lighting and clear focus</p>
            </div>
            <div className="tip-item">
              <div className="tip-icon">🎯</div>
              <h4>Good Angle</h4>
              <p>Capture the entire cart from a good angle</p>
            </div>
            <div className="tip-item">
              <div className="tip-icon">🔍</div>
              <h4>Item Visibility</h4>
              <p>Make sure items are clearly visible</p>
            </div>
            <div className="tip-item">
              <div className="tip-icon">💰</div>
              <h4>Set Prices</h4>
              <p>Don't forget to set competitive prices</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default VendorUpload;
