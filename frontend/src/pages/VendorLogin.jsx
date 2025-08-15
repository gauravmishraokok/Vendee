import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { vendorAPI, utils } from '../utils/api';
import './VendorLogin.css';

function VendorLogin() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    phone: '',
    name: '',
    latitude: '',
    longitude: ''
  });
  const [otp, setOtp] = useState('');
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [countdown, setCountdown] = useState(0);
  const navigate = useNavigate();

  // Hardcoded vendor data for demo
  const demoVendor = {
    name: "Rajesh Kumar Fruits",
    phone: "+91-98765-43210",
    location: { latitude: 28.7041, longitude: 77.1025 }
  };

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

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

  const handleSendOtp = async () => {
    if (!formData.phone) {
      setError('Please enter your phone number first');
      return;
    }

    setLoading(true);
    setError('');
    
    // Simulate OTP sending
    setTimeout(() => {
      setOtpSent(true);
      setShowOtpInput(true);
      setCountdown(30);
      setLoading(false);
      setSuccess('OTP sent successfully!');
    }, 1500);
  };

  const handleResendOtp = () => {
    setOtpSent(false);
    setShowOtpInput(false);
    setOtp('');
    handleSendOtp();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (isLogin) {
        // Login logic - for demo, any OTP works
        if (!formData.phone) {
          throw new Error('Please enter your phone number');
        }
        if (!otp) {
          throw new Error('Please enter OTP');
        }

        // Simulate OTP verification
        setTimeout(() => {
          setSuccess('Login successful! Redirecting to dashboard...');
          setTimeout(() => {
            navigate('/vendor/dashboard', { 
              state: { 
                vendorData: {
                  vendor_id: 'V001', // Mock vendor ID for demo login
                  name: 'Rajesh Kumar',
                  phone: '+91-98765-43210',
                  location: { lat: 28.7041, lng: 77.1025 }
                }
              }
            });
          }, 2000);
        }, 1000);

      } else {
        // Registration logic
        if (!formData.phone || !formData.name || !formData.latitude || !formData.longitude) {
          throw new Error('Please fill in all fields');
        }

        const location = {
          latitude: parseFloat(formData.latitude),
          longitude: parseFloat(formData.longitude)
        };

        const response = await vendorAPI.onboard(
          formData.phone,
          formData.name,
          location
        );

        if (response.success) {
          setSuccess('Registration successful! Redirecting to setup...');
          setTimeout(() => {
            navigate('/vendor/onboarding', { 
              state: { 
                vendorData: {
                  name: formData.name,
                  phone: formData.phone,
                  location: location
                }
              }
            });
          }, 2000);
        } else {
          throw new Error(response.message || 'Registration failed');
        }
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = () => {
    // Quick login with demo data
    setFormData({
      phone: demoVendor.phone,
      name: demoVendor.name,
      latitude: demoVendor.location.latitude.toString(),
      longitude: demoVendor.location.longitude.toString()
    });
    setShowOtpInput(true);
    setOtpSent(true);
    setCountdown(30);
    setSuccess('Demo vendor loaded! Enter any OTP to continue.');
  };

  return (
    <div className="vendor-login">
      <div className="login-container">
        <div className="login-header">
          <h2>{isLogin ? '🚚 Vendor Login' : '🚚 Vendor Registration'}</h2>
          <p>{isLogin ? 'Welcome back! Login to manage your business' : 'Join Vendee and start selling to more customers'}</p>
        </div>

        <div className="login-form">
          <div className="form-toggle">
            <button
              className={`toggle-btn ${isLogin ? 'active' : ''}`}
              onClick={() => {
                setIsLogin(true);
                setShowOtpInput(false);
                setOtpSent(false);
                setOtp('');
              }}
            >
              Login
            </button>
            <button
              className={`toggle-btn ${!isLogin ? 'active' : ''}`}
              onClick={() => {
                setIsLogin(false);
                setShowOtpInput(false);
                setOtpSent(false);
                setOtp('');
              }}
            >
              Register
            </button>
          </div>

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

            {!isLogin && (
              <>
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
                </div>
              </>
            )}

            {isLogin && (
              <>
                {!showOtpInput ? (
                  <div className="form-actions">
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      className="btn btn-primary"
                      disabled={loading}
                    >
                      {loading ? 'Sending...' : '📱 Send OTP'}
                    </button>
                  </div>
                ) : (
                  <div className="otp-section">
                    <div className="otp-input-group">
                      <label htmlFor="otp">Enter OTP *</label>
                      <input
                        type="text"
                        id="otp"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        placeholder="123456"
                        maxLength="6"
                        required
                        className="otp-input"
                      />
                      <div className="otp-info">
                        {otpSent && (
                          <div className="otp-sent">
                            <span className="otp-icon">✅</span>
                            <span>OTP sent to {formData.phone}</span>
                          </div>
                        )}
                        {countdown > 0 && (
                          <span className="countdown">Resend in {countdown}s</span>
                        )}
                        {countdown === 0 && otpSent && (
                          <button
                            type="button"
                            onClick={handleResendOtp}
                            className="resend-link"
                          >
                            Resend OTP
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="form-actions">
                      <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={loading || !otp}
                      >
                        {loading ? 'Verifying...' : '🔐 Verify & Login'}
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}

            {!isLogin && (
              <div className="form-actions">
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading}
                >
                  {loading ? 'Processing...' : 'Complete Registration'}
                </button>
              </div>
            )}
          </form>

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
        </div>

        <div className="login-benefits">
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

export default VendorLogin;
