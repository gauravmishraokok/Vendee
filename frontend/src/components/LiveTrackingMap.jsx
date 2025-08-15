import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom vendor tracking icon
const createVendorIcon = () => {
  return L.divIcon({
    html: `<div style="
      background-color: #8b5cf6;
      color: white;
      border-radius: 50%;
      width: 50px;
      height: 50px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
      border: 4px solid white;
      box-shadow: 0 4px 8px rgba(0,0,0,0.3);
      animation: pulse 2s infinite;
    ">🚚</div>`,
    className: 'vendor-tracking-marker',
    iconSize: [50, 50],
    iconAnchor: [25, 25],
  });
};

// Custom destination icon
const createDestinationIcon = () => {
  return L.divIcon({
    html: `<div style="
      background-color: #ef4444;
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
    ">📍</div>`,
    className: 'destination-marker',
    iconSize: [40, 40],
    iconAnchor: [20, 20],
  });
};

// Component to handle map updates and vendor movement
function TrackingUpdater({ vendorLocation, destinationLocation }) {
  const map = useMap();
  const [currentVendorLocation, setCurrentVendorLocation] = useState(vendorLocation);
  const [routeLine, setRouteLine] = useState(null);

  useEffect(() => {
    if (vendorLocation && destinationLocation && map) {
      // Create route line
      const line = L.polyline([
        [vendorLocation.lat, vendorLocation.lng],
        [destinationLocation.lat, destinationLocation.lng]
      ], {
        color: '#8b5cf6',
        weight: 4,
        opacity: 0.8,
        dashArray: '10, 10'
      });

      line.addTo(map);
      setRouteLine(line);

      // Fit map to show both points
      const bounds = L.latLngBounds([
        [vendorLocation.lat, vendorLocation.lng],
        [destinationLocation.lat, destinationLocation.lng]
      ]);
      map.fitBounds(bounds, { padding: [20, 20] });

      return () => {
        if (line) {
          map.removeLayer(line);
        }
      };
    }
  }, [vendorLocation, destinationLocation, map]);

  // Simulate vendor movement towards destination
  useEffect(() => {
    if (!vendorLocation || !destinationLocation) return;

    const interval = setInterval(() => {
      setCurrentVendorLocation(prev => {
        if (!prev) return vendorLocation;

        // Calculate direction vector
        const latDiff = destinationLocation.lat - prev.lat;
        const lngDiff = destinationLocation.lng - prev.lng;
        
        // Move vendor slightly towards destination
        const stepSize = 0.0001; // Small movement step
        const distance = Math.sqrt(latDiff * latDiff + lngDiff * lngDiff);
        
        if (distance < stepSize) {
          // Vendor reached destination
          clearInterval(interval);
          return destinationLocation;
        }

        const normalizedLat = latDiff / distance * stepSize;
        const normalizedLng = lngDiff / distance * stepSize;

        return {
          lat: prev.lat + normalizedLat,
          lng: prev.lng + normalizedLng
        };
      });
    }, 2000); // Update every 2 seconds

    return () => clearInterval(interval);
  }, [vendorLocation, destinationLocation]);

  return null;
}

const LiveTrackingMap = ({ 
  vendorLocation, 
  destinationLocation, 
  vendorName, 
  eta 
}) => {
  const mapRef = useRef(null);

  if (!vendorLocation || !destinationLocation) {
    return (
      <div className="tracking-map-container">
        <div className="loading-map">
          <div className="loading-spinner"></div>
          <p>Loading tracking map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="tracking-map-container">
      <MapContainer
        center={[vendorLocation.lat, vendorLocation.lng]}
        zoom={15}
        style={{ height: '400px', width: '100%' }}
        ref={mapRef}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        {/* Vendor location marker */}
        <Marker
          position={[vendorLocation.lat, vendorLocation.lng]}
          icon={createVendorIcon()}
        >
          <Popup>
            <div className="vendor-popup">
              <h4>🚚 {vendorName}</h4>
              <p>Your delivery partner</p>
              <p><strong>ETA:</strong> {eta} minutes</p>
            </div>
          </Popup>
        </Marker>

        {/* Destination marker */}
        <Marker
          position={[destinationLocation.lat, destinationLocation.lng]}
          icon={createDestinationIcon()}
        >
          <Popup>
            <div className="destination-popup">
              <h4>📍 Your Location</h4>
              <p>Delivery destination</p>
            </div>
          </Popup>
        </Marker>

        {/* Route line */}
        <Polyline
          positions={[
            [vendorLocation.lat, vendorLocation.lng],
            [destinationLocation.lat, destinationLocation.lng]
          ]}
          color="#8b5cf6"
          weight={4}
          opacity={0.8}
          dashArray="10, 10"
        />

        {/* Tracking updater */}
        <TrackingUpdater
          vendorLocation={vendorLocation}
          destinationLocation={destinationLocation}
        />
      </MapContainer>

      {/* Tracking info overlay */}
      <div className="tracking-info-overlay">
        <div className="tracking-status">
          <div className="status-indicator">
            <span className="pulse-dot"></span>
            <span>Live Tracking</span>
          </div>
          <div className="eta-display">
            <span className="eta-label">ETA:</span>
            <span className="eta-time">{eta} min</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveTrackingMap;
