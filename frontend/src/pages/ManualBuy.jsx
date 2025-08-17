import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getIndianProfileImage } from '../utils/api';
import VendorMap from '../components/VendorMap';
import VendorDetailsModal from '../components/VendorDetailsModal';
import OrderTracking from '../components/OrderTracking';
import SpoilageWarning from '../components/SpoilageWarning';
import './ManualBuy.css';
import '../components/VendorMap.css';
import '../components/VendorDetailsModal.css';
import '../components/OrderTracking.css';
import '../components/LiveTrackingMap.css';

function ManualBuy() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    maxDistance: 5,
    vendorType: 'all', // 'all', 'moving', 'stationary'
    priceRange: [0, 1000]
  });
  const [sortBy, setSortBy] = useState('distance'); // 'distance', 'price'
  const [vendors, setVendors] = useState([]);
  const [filteredVendors, setFilteredVendors] = useState([]);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [showMap, setShowMap] = useState(true);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [highlightedVendors, setHighlightedVendors] = useState([]);
  const [showModal, setShowModal] = useState(false);
    const [showTracking, setShowTracking] = useState(false);
  const [currentOrder, setCurrentOrder] = useState(null);
  const [itemQuantities, setItemQuantities] = useState({});



  // Mock vendor data with Indian profile images
  useEffect(() => {
    const mockVendors = [
      {
        id: 1,
        name: "Rajesh Kumar",
        phone: "+91-98765-43210",
        location: "Near Central Market",
        distance: 0.8,
        type: "stationary",
        image: getIndianProfileImage("rajesh-kumar-vendor"),
        items: [
          { name: "Mango", price: 80, quantity: "2 kg", unit: "kg" },
          { name: "Banana", price: 60, quantity: "1 kg", unit: "kg" },
          { name: "Tomato", price: 40, quantity: "1 kg", unit: "kg" }
        ],
        coordinates: { lat: 28.7041, lng: 77.1025 }
      },
      {
        id: 2,
        name: "Amit Singh",
        phone: "+91-98765-43211",
        location: "Moving on Main Road",
        distance: 1.2,
        type: "moving",
        image: getIndianProfileImage("amit-singh-vendor"),
        items: [
          { name: "Onion", price: 30, quantity: "1 kg", unit: "kg" },
          { name: "Potato", price: 25, quantity: "2 kg", unit: "kg" },
          { name: "Carrot", price: 50, quantity: "0.5 kg", unit: "kg" }
        ],
        coordinates: { lat: 28.7045, lng: 77.1030 }
      },
      {
        id: 3,
        name: "Priya Sharma",
        phone: "+91-98765-43212",
        location: "Stationary at Park",
        distance: 2.1,
        type: "stationary",
        image: getIndianProfileImage("priya-sharma-vendor"),
        items: [
          { name: "Apple", price: 120, quantity: "1 kg", unit: "kg" },
          { name: "Orange", price: 90, quantity: "1 kg", unit: "kg" },
          { name: "Grapes", price: 150, quantity: "0.5 kg", unit: "kg" }
        ],
        coordinates: { lat: 28.7050, lng: 77.1035 }
      },
      {
        id: 4,
        name: "Suresh Patel",
        phone: "+91-98765-43213",
        location: "Near Metro Station",
        distance: 1.5,
        type: "moving",
        image: getIndianProfileImage("suresh-patel-vendor"),
        items: [
          { name: "Milk", price: 60, quantity: "1 liter", unit: "liter" },
          { name: "Bread", price: 35, quantity: "1 packet", unit: "packet" },
          { name: "Eggs", price: 80, quantity: "12 pieces", unit: "dozen" }
        ],
        coordinates: { lat: 28.7048, lng: 77.1028 }
      },
      {
        id: 5,
        name: "Lakshmi Devi",
        phone: "+91-98765-43214",
        location: "Community Park",
        distance: 2.8,
        type: "stationary",
        image: getIndianProfileImage("lakshmi-devi-vendor"),
        items: [
          { name: "Rice", price: 45, quantity: "1 kg", unit: "kg" },
          { name: "Dal", price: 120, quantity: "1 kg", unit: "kg" },
          { name: "Sugar", price: 40, quantity: "1 kg", unit: "kg" }
        ],
        coordinates: { lat: 28.7055, lng: 77.1040 }
      }
    ];
    setVendors(mockVendors);
    setFilteredVendors(mockVendors);
  }, []);

  // Set hardcoded current location
  useEffect(() => {
    // Using hardcoded location in Delhi for demo purposes
    setCurrentLocation({ lat: 28.7041, lng: 77.1025 });
  }, []);

  // Filter and sort vendors
  useEffect(() => {
    let filtered = vendors.filter(vendor => {
      const matchesSearch = vendor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           vendor.items.some(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesDistance = vendor.distance <= filters.maxDistance;
      const matchesType = filters.vendorType === 'all' || vendor.type === filters.vendorType;
      const matchesPrice = vendor.items.some(item => 
        item.price >= filters.priceRange[0] && item.price <= filters.priceRange[1]
      );
      
      return matchesSearch && matchesDistance && matchesType && matchesPrice;
    });

    // Sort vendors
    if (sortBy === 'distance') {
      filtered.sort((a, b) => a.distance - b.distance);
    } else if (sortBy === 'price') {
      filtered.sort((a, b) => {
        const avgPriceA = a.items.reduce((sum, item) => sum + item.price, 0) / a.items.length;
        const avgPriceB = b.items.reduce((sum, item) => sum + item.price, 0) / b.items.length;
        return avgPriceA - avgPriceB;
      });
    }

    setFilteredVendors(filtered);

    // Highlight vendors that match the search query
    if (searchQuery) {
      const matchingVendors = vendors.filter(vendor => 
        vendor.items.some(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      setHighlightedVendors(matchingVendors.map(v => v.id));
    } else {
      setHighlightedVendors([]);
    }
  }, [vendors, searchQuery, filters, sortBy]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleVendorSelect = (vendor) => {
    setSelectedVendor(vendor);
    setShowModal(true);
  };

  const handleQuantityChange = (vendorId, itemName, quantity) => {
    const key = `${vendorId}-${itemName}`;
    setItemQuantities(prev => ({
      ...prev,
      [key]: quantity
    }));
  };

  const getItemQuantity = (vendorId, itemName) => {
    const key = `${vendorId}-${itemName}`;
    return itemQuantities[key] || 0;
  };

  const handleRequest = (vendor, item, quantity) => {
    // Create order object
    const order = {
      id: Math.floor(Math.random() * 10000) + 1000,
      vendor: vendor,
      items: [{ ...item, quantity: quantity }],
      total: item.price * quantity,
      deliveryLocation: currentLocation,
      timestamp: new Date().toISOString()
    };
    
    setCurrentOrder(order);
    setShowTracking(true);
    setShowModal(false); // Close vendor details modal
  };

  const handlePlaceOrder = (vendor) => {
    // Get all items with quantity > 0 for this vendor
    const selectedItems = vendor.items
      .map(item => {
        const quantity = getItemQuantity(vendor.id, item.name);
        return { ...item, quantity };
      })
      .filter(item => item.quantity > 0);

    if (selectedItems.length === 0) {
      alert('Please select at least one item to order');
      return;
    }

    // Calculate total price
    const total = selectedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    // Create order object
    const order = {
      id: Math.floor(Math.random() * 10000) + 1000,
      vendor: vendor,
      items: selectedItems,
      total: total,
      deliveryLocation: currentLocation,
      timestamp: new Date().toISOString()
    };
    
    setCurrentOrder(order);
    setShowTracking(true);
    setShowModal(false); // Close vendor details modal
  };

                                                                               

  return (
    <div className="manual-buy">
      <div className="manual-buy-header">
        <button className="back-btn" onClick={() => navigate('/customer')}>
          ← Back
        </button>
                 <h1>🔍 Manual Buy</h1>
         <p>Browse vendors, compare prices, and make your own choices</p>
      </div>

      <div className="search-filters-section">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search for items or vendors..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          <button className="search-btn">🔍</button>
        </div>
        


        <div className="filters-container">
          <div className="filter-group">
            <label>Max Distance:</label>
            <select 
              value={filters.maxDistance} 
              onChange={(e) => handleFilterChange('maxDistance', Number(e.target.value))}
            >
              <option value={1}>1 km</option>
              <option value={2}>2 km</option>
              <option value={5}>5 km</option>
              <option value={10}>10 km</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Vendor Type:</label>
            <select 
              value={filters.vendorType} 
              onChange={(e) => handleFilterChange('vendorType', e.target.value)}
            >
              <option value="all">All Vendors</option>
              <option value="moving">Moving Only</option>
              <option value="stationary">Stationary Only</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Price Range:</label>
            <div className="price-range">
              <input
                type="number"
                placeholder="Min"
                value={filters.priceRange[0]}
                onChange={(e) => handleFilterChange('priceRange', [Number(e.target.value), filters.priceRange[1]])}
                className="price-input"
              />
              <span>-</span>
              <input
                type="number"
                placeholder="Max"
                value={filters.priceRange[1]}
                onChange={(e) => handleFilterChange('priceRange', [filters.priceRange[0], Number(e.target.value)])}
                className="price-input"
              />
            </div>
          </div>

          <div className="filter-group">
            <label>Sort By:</label>
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="distance">Distance</option>
              <option value="price">Price</option>
            </select>
          </div>
        </div>
      </div>

      

      <div className="main-content">
        <div className="map-section">
          <div className="map-header">
            <h3>📍 Map View</h3>
            <button 
              className={`toggle-btn ${showMap ? 'active' : ''}`}
              onClick={() => setShowMap(!showMap)}
            >
              {showMap ? 'Hide Map' : 'Show Map'}
            </button>
          </div>
          
          {showMap && (
            <div className="map-container">
              <VendorMap
                vendors={filteredVendors}
                selectedVendor={selectedVendor}
                onVendorSelect={handleVendorSelect}
                searchQuery={searchQuery}
                currentLocation={currentLocation}
                highlightedVendors={highlightedVendors}
              />
              {/* Map search bar */}
              <div className="map-search-bar">
                <input
                  type="text"
                  placeholder="Search items on map..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="map-search-input"
                />
                <button className="map-search-btn">🔍</button>
              </div>
            </div>
          )}
        </div>

        <div className="vendors-section">
          <h3>📋 Available Vendors ({filteredVendors.length})</h3>
          
          <div className="vendors-grid">
            {filteredVendors.map(vendor => (
              <div key={vendor.id} className="vendor-card">
                <div className="vendor-header">
                  <img src={vendor.image} alt={vendor.name} className="vendor-image" />
                  <div className="vendor-info">
                    <h4>{vendor.name}</h4>
                    <p className="vendor-location">{vendor.location}</p>
                    <div className="vendor-meta">
                      <span className={`vendor-type ${vendor.type}`}>
                        {vendor.type === 'moving' ? '🚚 Moving' : '🏪 Stationary'}
                      </span>
                      <span className="vendor-distance">{vendor.distance} km away</span>
                    </div>
                  </div>
                </div>

                <div className="vendor-items">
                  <h5>Available Items:</h5>
                                                                           {vendor.items.map((item, index) => {
                      const quantity = getItemQuantity(vendor.id, item.name);
                      const totalPrice = item.price * quantity;
                      
                      return (
                        <div key={index} className="item-row">
                          <div className="item-info">
                            <span className="item-name">{item.name}</span>
                            <span className="item-price">₹{item.price}/{item.unit || 'kg'}</span>
                          </div>
                          <div className="item-actions">
                                                         <input
                               type="number"
                               placeholder="Qty"
                               min="0"
                               value={quantity}
                               onChange={(e) => handleQuantityChange(vendor.id, item.name, parseInt(e.target.value) || 0)}
                               className="quantity-input"
                             />
                             <span className="total-price">₹{totalPrice}</span>
                          </div>
                        </div>
                      );
                    })}
                </div>

                                 <div className="vendor-actions">
                   <button className="action-btn call-btn">
                     📞 Call
                   </button>
                   <button className="action-btn message-btn">
                     💬 Message
                   </button>
                   <button className="action-btn directions-btn">
                     🧭 Directions
                   </button>
                   <button 
                     className="action-btn place-order-btn"
                     onClick={() => handlePlaceOrder(vendor)}
                   >
                     🛒 Place Order
                   </button>
                 </div>
              </div>
            ))}
          </div>

          {filteredVendors.length === 0 && (
            <div className="no-vendors">
              <div className="no-vendors-icon">🔍</div>
              <h4>No vendors found</h4>
              <p>Try adjusting your search or filters</p>
            </div>
          )}
        </div>
      </div>

      {/* Vendor Details Modal */}
      <VendorDetailsModal
        vendor={selectedVendor}
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onRequest={handleRequest}
      />

             {/* Order Tracking Modal */}
       {showTracking && currentOrder && (
         <OrderTracking
           order={currentOrder}
           onClose={() => setShowTracking(false)}
         />
       )}

       
     </div>
   );
 }

export default ManualBuy;
