import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom icons for different vendor types
const createCustomIcon = (type, isHighlighted = false) => {
  const iconColor = type === 'moving' ? '#3b82f6' : '#10b981';
  const iconSymbol = type === 'moving' ? '🚚' : '🏪';
  const highlightStyle = isHighlighted ? `
    animation: pulse 2s infinite;
    box-shadow: 0 4px 8px rgba(0,0,0,0.4);
    transform: scale(1.1);
  ` : '';
  
  return L.divIcon({
    html: `<div style="
      background-color: ${iconColor};
      color: white;
      border-radius: 50%;
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
      border: 3px solid white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      ${highlightStyle}
    ">${iconSymbol}</div>`,
    className: `custom-marker ${isHighlighted ? 'highlighted' : ''}`,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
  });
};

// Component to handle map updates when vendors change
function MapUpdater({ vendors, selectedVendor, searchQuery, currentLocation }) {
  const map = useMap();

  useEffect(() => {
    if (vendors.length > 0) {
      const bounds = L.latLngBounds();
      
      // Add vendor locations to bounds
      vendors.forEach(vendor => {
        bounds.extend([vendor.coordinates.lat, vendor.coordinates.lng]);
      });
      
      // Add current location to bounds if available
      if (currentLocation) {
        bounds.extend([currentLocation.lat, currentLocation.lng]);
      }
      
      map.fitBounds(bounds, { padding: [20, 20] });
    }
  }, [vendors, currentLocation, map]);

  return null;
}

// Component to handle routing
function RoutingControl({ selectedVendor, currentLocation }) {
  const map = useMap();
  const [route, setRoute] = useState(null);

  useEffect(() => {
    if (selectedVendor && currentLocation && map) {
      // Create a simple straight line route (in a real app, you'd use a routing service)
      const routeLine = L.polyline([
        [currentLocation.lat, currentLocation.lng],
        [selectedVendor.coordinates.lat, selectedVendor.coordinates.lng]
      ], {
        color: '#ef4444',
        weight: 4,
        opacity: 0.8,
        dashArray: '10, 10'
      });

      routeLine.addTo(map);
      setRoute(routeLine);

      return () => {
        if (routeLine) {
          map.removeLayer(routeLine);
        }
      };
    }
  }, [selectedVendor, currentLocation, map]);

  return null;
}

const VendorMap = ({ 
  vendors, 
  selectedVendor, 
  onVendorSelect, 
  searchQuery, 
  currentLocation,
  highlightedVendors = [] 
}) => {
  const mapRef = useRef(null);

  // Filter vendors based on search query
  const filteredVendors = vendors.filter(vendor => {
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    return vendor.name.toLowerCase().includes(query) ||
           vendor.items.some(item => item.name.toLowerCase().includes(query));
  });

  // Current location is now handled by the parent component with hardcoded coordinates

  return (
    <div className="vendor-map-container">
      <MapContainer
        center={[28.7041, 77.1025]} // Delhi coordinates
        zoom={13}
        style={{ height: '400px', width: '100%' }}
        ref={mapRef}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        {/* Current location marker */}
        {currentLocation && (
          <Circle
            center={[currentLocation.lat, currentLocation.lng]}
            radius={100}
            pathOptions={{
              color: '#ef4444',
              fillColor: '#ef4444',
              fillOpacity: 0.3
            }}
          >
            <Popup>
              <div>
                <h4>📍 Your Location</h4>
                <p>You are here</p>
              </div>
            </Popup>
          </Circle>
        )}

        {/* Vendor markers */}
        {filteredVendors.map((vendor) => {
          const isHighlighted = highlightedVendors.includes(vendor.id) || 
                               (searchQuery && vendor.items.some(item => 
                                 item.name.toLowerCase().includes(searchQuery.toLowerCase())
                               ));
          
          return (
            <Marker
              key={vendor.id}
              position={[vendor.coordinates.lat, vendor.coordinates.lng]}
              icon={createCustomIcon(vendor.type, isHighlighted)}
              eventHandlers={{
                click: () => onVendorSelect(vendor),
              }}
            >
              <Popup>
                <div className="vendor-popup">
                  <h4>{vendor.name}</h4>
                  <p className="vendor-type">
                    {vendor.type === 'moving' ? '🚚 Moving Vendor' : '🏪 Stationary Vendor'}
                  </p>
                  <p className="vendor-location">{vendor.location}</p>
                  <p className="vendor-distance">{vendor.distance} km away</p>
                  <div className="vendor-items">
                    <h5>Available Items:</h5>
                    <ul>
                      {vendor.items.map((item, index) => (
                        <li key={index}>
                          {item.name} - ₹{item.price}/{item.unit}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <button 
                    className="view-details-btn"
                    onClick={() => onVendorSelect(vendor)}
                  >
                    View Details
                  </button>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* Routing control */}
        {selectedVendor && currentLocation && (
          <RoutingControl 
            selectedVendor={selectedVendor}
            currentLocation={currentLocation}
          />
        )}

        {/* Map updater */}
        <MapUpdater 
          vendors={filteredVendors}
          selectedVendor={selectedVendor}
          searchQuery={searchQuery}
          currentLocation={currentLocation}
        />
      </MapContainer>
    </div>
  );
};

export default VendorMap;
