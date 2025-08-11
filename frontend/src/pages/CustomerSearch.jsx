import React, { useState, useEffect } from 'react';
import { customerAPI, utils } from '../utils/api';
import './CustomerSearch.css';

function CustomerSearch() {
  const [vendors, setVendors] = useState([]);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [customerLocation, setCustomerLocation] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  useEffect(() => {
    getCurrentLocation();
  }, []);



  const getCurrentLocation = async () => {
    try {
      const location = await utils.getCurrentLocation();
      setCustomerLocation(location);
      loadNearbyVendors(location);
    } catch (err) {
      setError('Failed to get current location');
    }
  };

  const loadNearbyVendors = async (location) => {
    setLoading(true);
    try {
      const response = await customerAPI.getNearbyVendors(
        location.latitude,
        location.longitude,
        2.0
      );
      
      if (response.success) {
        setVendors(response.vendors);
      } else {
        setError('Failed to load nearby vendors');
      }
    } catch (err) {
      setError('Failed to load vendors: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim() || !customerLocation) return;

    console.log('🔍 Starting search for:', searchQuery);
    console.log('📍 Customer location:', customerLocation);
    
    setLoading(true);
    try {
      const response = await customerAPI.searchVendors(
        searchQuery,
        customerLocation.latitude,
        customerLocation.longitude,
        2.0
      );
      
      console.log('📡 Search API response:', response);
      
      if (response.success) {
        console.log('✅ Search successful, found vendors:', response.matching_vendors);
        console.log('📊 Setting search results to:', response.matching_vendors);
        setSearchResults(response.matching_vendors);
        console.log('📊 Search results state should now be:', response.matching_vendors);
        setError(''); // Clear any previous errors
      } else {
        console.log('❌ Search failed:', response.error);
        setError('Search failed');
      }
    } catch (err) {
      console.error('💥 Search error:', err);
      setError('Search failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVendorClick = async (vendorId) => {
    try {
      const response = await customerAPI.getVendorDetails(vendorId);
      if (response.success) {
        setSelectedVendor(response.vendor);
      }
    } catch (err) {
      setError('Failed to load vendor details');
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
        if (response.vendor_accepted) {
          alert(`Great! ${response.vendor_name} has accepted your request. They will arrive in ${response.estimated_delivery_time}.`);
        } else {
          alert(response.message);
        }
      }
    } catch (err) {
      setError('Failed to request moving vendor');
    }
  };

  // Remove rating functionality for now - will be replaced with order history
  const handleViewOrders = () => {
    alert('Order history feature coming soon! This will show your previous orders and allow rating.');
  };

  const displayVendors = searchQuery ? searchResults : vendors;
  
  // Debug logging
  console.log('🔍 Search query:', searchQuery);
  console.log('📊 Search results:', searchResults);
  console.log('🏪 All vendors:', vendors);
  console.log('📋 Display vendors:', displayVendors);
  console.log('🔍 searchQuery truthy?', !!searchQuery);
  console.log('📊 searchResults length:', searchResults.length);

  return (
    <div className="customer-search">
      <div className="container">
        <div className="search-header">
          <h2>🗺️ Find Nearby Vendors</h2>
          <p>Discover fresh produce and local goods from street vendors in your area</p>
        </div>

        <div className="search-content">
          <div className="search-section">
            <div className="search-bar">
              <input
                type="text"
                placeholder="Search for items (e.g., bananas, tomatoes, flowers)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
              <button onClick={handleSearch} className="btn btn-primary" disabled={loading}>
                🔍 Search
              </button>
            </div>
            
            {customerLocation && (
              <div className="location-info">
                📍 Current Location: {customerLocation.address}
              </div>
            )}
          </div>

          {error && (
            <div className="error-message">
              ❌ {error}
            </div>
          )}

          <div className="vendors-section">
            <h3>
              {searchQuery ? `Search Results for "${searchQuery}"` : 'Nearby Vendors'}
              <span className="vendor-count"> ({displayVendors.length})</span>
            </h3>

            {loading ? (
              <div className="loading">Loading vendors...</div>
            ) : displayVendors.length === 0 ? (
              <div className="no-vendors">
                {searchQuery ? 'No vendors found for your search.' : 'No vendors found in your area.'}
              </div>
            ) : (
              <div className="vendors-grid">
                {displayVendors.map((vendor) => (
                  <div key={vendor.vendor_id} className="vendor-card">
                    <div className="vendor-header">
                      <h4>{vendor.name}</h4>
                      <div className="vendor-rating">
                        {'⭐'.repeat(Math.floor(vendor.rating))}
                        <span className="rating-text">({vendor.rating})</span>
                      </div>
                    </div>

                    <div className="vendor-info">
                      <p className="vendor-type">
                        {vendor.type === 'moving' ? '🚚 Moving Vendor' : '🏪 Stationary Vendor'}
                      </p>
                      <p className="vendor-distance">
                        {vendor.distance < 0.1 ? 
                          `${Math.round(vendor.distance * 1000)}m away` : 
                          `${vendor.distance.toFixed(2)}km away`
                        }
                      </p>
                      <p className="vendor-items">{vendor.total_items} items available</p>
                    </div>

                    {/* Random placeholder cart image */}
                    <div className="vendor-image">
                      <img 
                        src={`https://picsum.photos/300/200?random=${vendor.vendor_id}`} 
                        alt="Vendor cart" 
                        onError={(e) => {
                          e.target.src = `https://via.placeholder.com/300x200/667eea/ffffff?text=${vendor.name}'s+Cart`;
                        }}
                      />
                    </div>

                    {/* Vendor Items Display */}
                    <div className="vendor-items-display">
                      <h5>🛒 Available Items:</h5>
                      <div className="items-grid">
                        {vendor.inventory_items ? 
                          vendor.inventory_items.slice(0, 4).map((item, index) => (
                            <div key={index} className="item-chip">
                              <span className="item-name">{item.name}</span>
                              <span className="item-price">₹{item.price_per_unit}</span>
                            </div>
                          )) :
                          <div className="items-placeholder">
                            <span>Loading items...</span>
                          </div>
                        }
                        {vendor.inventory_items && vendor.inventory_items.length > 4 && (
                          <div className="item-chip more-items">
                            +{vendor.inventory_items.length - 4} more
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="vendor-actions">
                      <button
                        onClick={() => handleVendorClick(vendor.vendor_id)}
                        className="btn btn-secondary"
                      >
                        📋 View Details
                      </button>
                      
                      {vendor.type === 'moving' && (
                        <button
                          onClick={() => handleRequestMovingVendor(vendor.vendor_id, [])}
                          className="btn btn-primary"
                        >
                          🚚 Request Delivery
                        </button>
                      )}
                    </div>

                    <div className="vendor-orders-section">
                      <button
                        onClick={handleViewOrders}
                        className="btn btn-small btn-secondary"
                      >
                        📋 View Orders
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {selectedVendor && (
            <div className="vendor-details-modal">
              <div className="modal-content">
                <div className="modal-header">
                  <h3>{selectedVendor.name}</h3>
                  <button
                    onClick={() => setSelectedVendor(null)}
                    className="close-btn"
                  >
                    ✕
                  </button>
                </div>

                <div className="modal-body">
                  <div className="vendor-details">
                    <p><strong>Phone:</strong> {selectedVendor.phone}</p>
                    <p><strong>Type:</strong> {selectedVendor.type}</p>
                    <p><strong>Rating:</strong> {selectedVendor.rating}⭐ ({selectedVendor.total_ratings} ratings)</p>
                    <p><strong>Operating Hours:</strong> {selectedVendor.operating_hours}</p>
                    <p><strong>Specialties:</strong> {selectedVendor.specialties.join(', ')}</p>
                  </div>

                  {selectedVendor.inventory && (
                    <div className="inventory-section">
                      <h4>Current Inventory</h4>
                      <div className="inventory-items">
                        {selectedVendor.inventory.items.map((item, index) => (
                          <div key={index} className="inventory-item">
                            <span className="item-name">{item.name}</span>
                            <span className="item-quantity">{item.quantity}</span>
                            <span className="item-price">₹{item.price_per_unit}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="vendor-actions-modal">
                    <a
                      href={`tel:${selectedVendor.phone}`}
                      className="btn btn-primary"
                    >
                      📞 Call Vendor
                    </a>
                    
                    {selectedVendor.type === 'moving' && (
                      <button
                        onClick={() => handleRequestMovingVendor(selectedVendor.vendor_id, [])}
                        className="btn btn-secondary"
                      >
                        🚚 Request Delivery
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="search-tips">
          <h3>💡 Search Tips</h3>
          <div className="tips-grid">
            <div className="tip-item">
              <div className="tip-icon">🔍</div>
              <h4>Specific Items</h4>
              <p>Search for specific items like "bananas" or "tomatoes"</p>
            </div>
            <div className="tip-item">
              <div className="tip-icon">🚚</div>
              <h4>Moving Vendors</h4>
              <p>Request delivery from moving vendors</p>
            </div>
            <div className="tip-item">
              <div className="tip-icon">📋</div>
              <h4>Order History</h4>
              <p>View your previous orders and rate vendors</p>
            </div>
            <div className="tip-item">
              <div className="tip-icon">📱</div>
              <h4>Contact Directly</h4>
              <p>Call vendors directly for immediate assistance</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CustomerSearch;
