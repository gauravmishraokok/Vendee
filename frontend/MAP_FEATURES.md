# Map Features for Manual Buy

## Overview
The Manual Buy page now includes an interactive map using Leaflet.js with the following features:

## Features Implemented

### 1. Interactive Map with Vendor Pins
- **Leaflet Integration**: Uses react-leaflet for map functionality
- **Custom Vendor Pins**: Different icons for moving (🚚) and stationary (🏪) vendors
- **Pin Colors**: 
  - Moving vendors: Blue (#3b82f6)
  - Stationary vendors: Green (#10b981)

### 2. Search Functionality
- **Item Search**: Search for specific items across all vendors
- **Vendor Highlighting**: Pins of vendors with matching items are highlighted with animation
- **Real-time Filtering**: Map updates as you type in the search bar
- **Map Search Bar**: Floating search bar positioned at the bottom of the map

### 3. Current Location Features
- **Hardcoded Location**: Uses a fixed location in Delhi for demo purposes
- **Location Marker**: Red circle shows the current position
- **Demo Coordinates**: Set to Delhi (28.7041, 77.1025) for consistent testing

### 4. Routing and Navigation
- **Path Visualization**: When a vendor is selected, a dashed line shows the route from user to vendor
- **Animated Route**: Route line has animated dash pattern
- **Distance Display**: Shows distance from user to each vendor

### 5. Vendor Interaction
- **Click to View Details**: Click any vendor pin to see detailed information
- **Modal Popup**: Comprehensive vendor details modal with:
  - Vendor information (name, type, location, phone)
  - Available items with prices
  - Quantity selection for each item
  - Request buttons for each item
  - Action buttons (Call, Message, Get Directions)

### 6. Responsive Design
- **Mobile Friendly**: Map and interface work well on mobile devices
- **Touch Support**: Pin interactions work with touch gestures
- **Adaptive Layout**: Map adjusts to different screen sizes

## Technical Implementation

### Dependencies Added
```json
{
  "leaflet": "^1.9.4",
  "react-leaflet": "^4.2.1"
}
```

### Key Components
1. **VendorMap.jsx**: Main map component with Leaflet integration
2. **VendorDetailsModal.jsx**: Modal for vendor details
3. **ManualBuy.jsx**: Updated to include map functionality

### Map Features
- **OpenStreetMap Tiles**: Free map tiles from OpenStreetMap
- **Custom Markers**: DivIcon-based markers with vendor type indicators
- **Popup Information**: Basic vendor info on pin click
- **Bounds Management**: Automatically fits map to show all relevant vendors

## Usage Instructions

1. **Search for Items**: Use the search bar to find specific items
2. **View Vendors**: Vendor pins will be highlighted if they have the searched item
3. **Click Pins**: Click any vendor pin to see detailed information
4. **Request Items**: Use the modal to select quantities and request items
5. **Get Directions**: Use the "Get Directions" button for navigation

## Future Enhancements

- **Advanced Routing**: Integration with Google Maps or other routing services
- **Offline Support**: Cache map tiles for offline use
- **Voice Navigation**: Voice-guided directions to vendors
- **Push Notifications**: Real-time order status updates
- **Delivery History**: Track past orders and delivery performance

## Order Tracking Features

### Live Tracking Map
- **Real-time Vendor Movement**: Animated vendor marker moving towards destination
- **ETA Calculation**: Dynamic estimated arrival time updates
- **Route Visualization**: Animated dashed line showing delivery route
- **Status Updates**: Real-time order status with delays and animations

### Order Flow Simulation
1. **Pending**: Waiting for vendor acceptance (3 seconds)
2. **Accepted**: Vendor accepts order (2 seconds)
3. **Preparing**: Vendor preparing order (2 seconds)
4. **Delivering**: Order on the way with live tracking map

### Tracking Interface
- **Order Details**: Complete order information display
- **Contact Actions**: Call and message vendor buttons
- **Live Status**: Real-time tracking status with animations
- **ETA Display**: Prominent ETA showing remaining time
