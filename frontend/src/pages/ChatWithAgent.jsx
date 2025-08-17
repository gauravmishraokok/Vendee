import React, { useState, useEffect } from 'react';
import { customerAPI, utils } from '../utils/api';
import VendorLocationModal from '../components/VendorLocationModal';
import './ChatWithAgent.css';

function ChatWithAgent() {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [customerLocation, setCustomerLocation] = useState(null);
  const [currentRequest, setCurrentRequest] = useState(null);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [selectedVendorForLocation, setSelectedVendorForLocation] = useState(null);

  useEffect(() => {
    getCurrentLocation();
    // Add welcome message
    setMessages([
      {
        id: 1,
        type: 'agent',
        content: "Hello! I'm your SmartBuy AI assistant. I can help you find vendors for fresh produce and local goods. What would you like to buy today?",
        timestamp: new Date().toLocaleTimeString()
      }
    ]);
  }, []);

  const getCurrentLocation = async () => {
    try {
      const location = await utils.getCurrentLocation();
      setCustomerLocation(location);
    } catch (err) {
      console.error('Failed to get location:', err);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !customerLocation) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date().toLocaleTimeString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setLoading(true);

    try {
      // Process SmartBuy request
      const response = await customerAPI.smartBuy(inputMessage, customerLocation);
      
      if (response.success) {
        const agentMessage = {
          id: Date.now() + 1,
          type: 'agent',
          content: response.message,
          timestamp: new Date().toLocaleTimeString(),
          data: response
        };
        
        setMessages(prev => [...prev, agentMessage]);
        setCurrentRequest(response);
      } else {
        const errorMessage = {
          id: Date.now() + 1,
          type: 'agent',
          content: response.error || 'Sorry, I couldn\'t understand your request. Please try rephrasing.',
          timestamp: new Date().toLocaleTimeString(),
          suggestions: response.suggestions || []
        };
        
        setMessages(prev => [...prev, errorMessage]);
      }
    } catch (err) {
      const errorMessage = {
        id: Date.now() + 1,
        type: 'agent',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date().toLocaleTimeString()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestMovingVendor = async (vendorId, items) => {
    if (!customerLocation) return;

    try {
      const response = await customerAPI.requestMovingVendor(
        vendorId,
        items,
        customerLocation
      );
      
      if (response.success) {
        const resultMessage = {
          id: Date.now(),
          type: 'agent',
          content: response.message,
          timestamp: new Date().toLocaleTimeString(),
          isResult: true
        };
        
        setMessages(prev => [...prev, resultMessage]);
      }
    } catch (err) {
      const errorMessage = {
        id: Date.now(),
        type: 'agent',
        content: 'Failed to request moving vendor. Please try again.',
        timestamp: new Date().toLocaleTimeString()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setInputMessage(suggestion);
  };

  const renderMessage = (message) => {
    return (
      <div key={message.id} className={`message ${message.type}`}>
        <div className="message-content">
          <div className="message-text">{message.content}</div>
          
          {message.suggestions && message.suggestions.length > 0 && (
            <div className="suggestions">
              {message.suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="suggestion-btn"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}
          
          {message.data && message.data.recommendations && (
            <div className="recommendations">
              {message.data.recommendations.stationary_vendors && 
               message.data.recommendations.stationary_vendors.length > 0 && (
                <div className="vendor-recommendations">
                  <h4>🏪 Stationary Vendors</h4>
                  {message.data.recommendations.stationary_vendors.map((vendor, index) => (
                    <div key={index} className="vendor-recommendation">
                      <div className="vendor-info">
                        <h5>{vendor.name}</h5>
                        <p>📍 {vendor.distance}km away | ⭐ {vendor.rating}</p>
                        <p>💰 Total: ₹{vendor.total_price}</p>
                        <p>📦 Items: {vendor.available_items.map(item => item.name).join(', ')}</p>
                      </div>
                      <div className="vendor-actions">
                        <a href={`tel:${vendor.phone}`} className="btn btn-small">
                          📞 Call
                        </a>
                        <button
                          onClick={() => {
                            setSelectedVendorForLocation(vendor);
                            setShowLocationModal(true);
                          }}
                          className="btn btn-small btn-secondary"
                        >
                          📍 Get Location
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {message.data.recommendations.moving_vendors && 
               message.data.recommendations.moving_vendors.length > 0 && (
                <div className="vendor-recommendations">
                  <h4>🚚 Moving Vendors (Delivery Available)</h4>
                  {message.data.recommendations.moving_vendors.map((vendor, index) => (
                    <div key={index} className="vendor-recommendation">
                      <div className="vendor-info">
                        <h5>{vendor.name}</h5>
                        <p>📍 {vendor.distance}km away | ⭐ {vendor.rating}</p>
                        <p>💰 Total: ₹{vendor.total_price}</p>
                        <p>📦 Items: {vendor.available_items.map(item => item.name).join(', ')}</p>
                      </div>
                      <div className="vendor-actions">
                        <button
                          onClick={() => handleRequestMovingVendor(vendor.vendor_id, vendor.available_items)}
                          className="btn btn-primary btn-small"
                        >
                          🚚 Request Delivery
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          
          <div className="message-timestamp">{message.timestamp}        </div>
      </div>

      {/* Vendor Location Modal */}
      <VendorLocationModal
        vendor={selectedVendorForLocation}
        isOpen={showLocationModal}
        onClose={() => setShowLocationModal(false)}
      />
    </div>
  );
};

  return (
    <div className="chat-with-agent">
      <div className="container">
        <div className="chat-header">
          <h2>🤖 SmartBuy AI Assistant</h2>
          <p>Chat with AI to find the best vendors for your needs</p>
          
          {customerLocation && (
            <div className="location-info">
              📍 {customerLocation.address}
            </div>
          )}
        </div>

        <div className="chat-container">
          <div className="chat-messages">
            {messages.map(renderMessage)}
            
            {loading && (
              <div className="message agent">
                <div className="message-content">
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="chat-input">
            <div className="input-container">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Type your request (e.g., 'I want 2kg bananas delivered to my home')..."
                disabled={loading || !customerLocation}
              />
              <button
                onClick={handleSendMessage}
                className="btn btn-primary"
                disabled={loading || !inputMessage.trim() || !customerLocation}
              >
                📤 Send
              </button>
            </div>
            
            {!customerLocation && (
              <div className="location-warning">
                ⚠️ Please allow location access to use SmartBuy
              </div>
            )}
          </div>
        </div>

        <div className="chat-examples">
          <h3>💡 Example Requests</h3>
          <div className="examples-grid">
            <div className="example-item">
              <h4>Basic Requests</h4>
              <ul>
                <li>"I need tomatoes and onions"</li>
                <li>"Looking for fresh fruits"</li>
                <li>"Where can I find flowers?"</li>
              </ul>
            </div>
            <div className="example-item">
              <h4>Delivery Requests</h4>
              <ul>
                <li>"2kg bananas delivered to my home"</li>
                <li>"Need vegetables delivered"</li>
                <li>"Can someone bring me fresh produce?"</li>
              </ul>
            </div>
            <div className="example-item">
              <h4>Specific Items</h4>
              <ul>
                <li>"Looking for organic spinach"</li>
                <li>"Need 5kg potatoes"</li>
                <li>"Where can I buy almonds?"</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="chat-features">
          <h3>🚀 SmartBuy Features</h3>
          <div className="features-grid">
            <div className="feature-item">
              <div className="feature-icon">🤖</div>
              <h4>AI-Powered</h4>
              <p>Natural language understanding for easy requests</p>
            </div>
            <div className="feature-item">
              <div className="feature-icon">📍</div>
              <h4>Location Aware</h4>
              <p>Finds vendors closest to your location</p>
            </div>
            <div className="feature-item">
              <div className="feature-icon">🚚</div>
              <h4>Delivery Support</h4>
              <p>Request delivery from moving vendors</p>
            </div>
            <div className="feature-item">
              <div className="feature-icon">💰</div>
              <h4>Price Comparison</h4>
              <p>Compare prices across different vendors</p>
            </div>
          </div>
        </div>
      </div>

      {/* Vendor Location Modal */}
      <VendorLocationModal
        vendor={selectedVendorForLocation}
        isOpen={showLocationModal}
        onClose={() => setShowLocationModal(false)}
      />
    </div>
  );
}

export default ChatWithAgent;
