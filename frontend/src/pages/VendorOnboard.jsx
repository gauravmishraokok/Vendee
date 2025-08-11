import React, { useState } from 'react';
import { vendorAPI, utils } from '../utils/api';
import './VendorOnboard.css';

function VendorOnboard() {
  const [formData, setFormData] = useState({
    phone: '',
    name: '',
    latitude: '',
    longitude: ''
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const getCurrentLocation = async () => {
    try {
      const location = await utils.getCurrentLocation();
      setFormData(prev => ({
        ...prev,
        latitude: location.latitude.toString(),
        longitude: location.longitude.toString()
      }));
    } catch (err) {
      setError('Failed to get current location. Please enter manually.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);

    try {
      // Validate form data
      if (!formData.phone || !formData.name || !formData.latitude || !formData.longitude) {
        throw new Error('Please fill in all fields');
      }

      const location = {
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude)
      };

      // Call API
      const response = await vendorAPI.onboard(
        formData.phone,
        formData.name,
        location
      );

      if (response.success) {
        setResult(response);
        // Reset form
        setFormData({
          phone: '',
          name: '',
          latitude: '',
          longitude: ''
        });
      } else {
        throw new Error(response.message || 'Onboarding failed');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="vendor-onboard">
      <div className="container">
        <div className="onboard-header">
          <h2>🚚 Vendor Onboarding</h2>
          <p>Join Vendee and start selling to more customers with AI-powered inventory management</p>
        </div>

        <div className="onboard-content">
          <div className="onboard-form">
            <h3>Register Your Business</h3>
            
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="phone">Phone Number *</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="+91-98765-43210"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="name">Business Name *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g., Rajesh Kumar Fruits"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="latitude">Latitude *</label>
                <input
                  type="number"
                  id="latitude"
                  name="latitude"
                  value={formData.latitude}
                  onChange={handleInputChange}
                  placeholder="28.7041"
                  step="any"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="longitude">Longitude *</label>
                <input
                  type="number"
                  id="longitude"
                  name="longitude"
                  value={formData.longitude}
                  onChange={handleInputChange}
                  placeholder="77.1025"
                  step="any"
                  required
                />
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  onClick={getCurrentLocation}
                  className="btn btn-secondary"
                  disabled={loading}
                >
                  📍 Use Current Location
                </button>
                
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading}
                >
                  {loading ? 'Onboarding...' : 'Complete Onboarding'}
                </button>
              </div>
            </form>

            {error && (
              <div className="error-message">
                ❌ {error}
              </div>
            )}
          </div>

          {result && (
            <div className="onboard-success">
              <div className="success-card">
                <div className="success-icon">✅</div>
                <h3>Welcome to Vendee!</h3>
                <p>Your vendor account has been created successfully.</p>
                
                <div className="vendor-details">
                  <div className="detail-item">
                    <strong>Vendor ID:</strong> {result.vendor_id}
                  </div>
                  <div className="detail-item">
                    <strong>Name:</strong> {result.data.name}
                  </div>
                  <div className="detail-item">
                    <strong>Phone:</strong> {result.data.phone}
                  </div>
                  <div className="detail-item">
                    <strong>Location:</strong> {result.data.location.latitude}, {result.data.location.longitude}
                  </div>
                </div>

                <div className="next-steps">
                  <h4>Next Steps:</h4>
                  <ol>
                    <li>Upload a photo of your cart to detect items</li>
                    <li>Set prices for detected items</li>
                    <li>Choose if you're moving or stationary</li>
                    <li>Start receiving customer requests!</li>
                  </ol>
                </div>

                <a href="/vendor/upload" className="btn btn-primary">
                  📸 Upload Cart Photo
                </a>
              </div>
            </div>
          )}
        </div>

        <div className="onboard-benefits">
          <h3>Why Join Vendee?</h3>
          <div className="benefits-grid">
            <div className="benefit-item">
              <div className="benefit-icon">🤖</div>
              <h4>AI-Powered Inventory</h4>
              <p>Automatically detect items from cart photos</p>
            </div>
            <div className="benefit-item">
              <div className="benefit-icon">📱</div>
              <h4>Easy Management</h4>
              <p>Simple interface to update prices and status</p>
            </div>
            <div className="benefit-item">
              <div className="benefit-icon">👥</div>
              <h4>More Customers</h4>
              <p>Reach customers looking for your products</p>
            </div>
            <div className="benefit-item">
              <div className="benefit-icon">📊</div>
              <h4>Analytics</h4>
              <p>Track performance and customer ratings</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default VendorOnboard;
