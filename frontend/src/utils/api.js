const API_BASE_URL = 'http://localhost:8000';

// Helper function to make API calls
async function apiCall(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
    },
    ...options,
  };

  try {
    const response = await fetch(url, defaultOptions);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
}

// Vendor API calls
export const vendorAPI = {
  // Onboard new vendor
  onboard: async (phone, name, location) => {
    return apiCall('/vendor/onboard', {
      method: 'POST',
      body: JSON.stringify({ phone, name, location }),
    });
  },

  // Analyze cart image
  analyzeImage: async (vendorId, imageData) => {
    return apiCall('/vendor/inventory/detect', {
      method: 'POST',
      body: JSON.stringify({ vendor_id: vendorId, image_data: imageData }),
    });
  },

  // Update inventory
  updateInventory: async (vendorId, items, imageUrl = null) => {
    return apiCall('/vendor/inventory/update', {
      method: 'POST',
      body: JSON.stringify({ vendor_id: vendorId, items, image_url: imageUrl }),
    });
  },

  // Update vendor status
  updateStatus: async (vendorId, statusUpdates) => {
    return apiCall('/vendor/status', {
      method: 'POST',
      body: JSON.stringify({ vendor_id: vendorId, ...statusUpdates }),
    });
  },

  // Get vendor analytics
  getAnalytics: async (vendorId) => {
    return apiCall(`/vendor/${vendorId}/analytics`);
  },

  // Get demand suggestions
  getDemandSuggestions: async (vendorId) => {
    return apiCall(`/vendor/${vendorId}/demand-suggestions`);
  },

  // Get vendor inventory
  getInventory: async (vendorId) => {
    return apiCall(`/vendor/${vendorId}/inventory`);
  },
};

// Customer API calls
export const customerAPI = {
  // Process SmartBuy request
  smartBuy: async (requestText, customerLocation) => {
    return apiCall('/customer/smartbuy', {
      method: 'POST',
      body: JSON.stringify({ request_text: requestText, customer_location: customerLocation }),
    });
  },

  // Request moving vendor
  requestMovingVendor: async (vendorId, items, customerLocation) => {
    return apiCall('/customer/request-moving-vendor', {
      method: 'POST',
      body: JSON.stringify({ vendor_id: vendorId, items, customer_location: customerLocation }),
    });
  },

  // Get nearby vendors
  getNearbyVendors: async (latitude, longitude, radiusKm = 2.0) => {
    const params = new URLSearchParams({
      latitude: latitude.toString(),
      longitude: longitude.toString(),
      radius_km: radiusKm.toString(),
    });
    return apiCall(`/customer/vendors/nearby?${params}`);
  },

  // Get vendor details
  getVendorDetails: async (vendorId) => {
    return apiCall(`/customer/vendors/${vendorId}`);
  },

  // Rate vendor
  rateVendor: async (vendorId, rating, comment = null) => {
    return apiCall('/customer/rate-vendor', {
      method: 'POST',
      body: JSON.stringify({ vendor_id: vendorId, rating, comment }),
    });
  },

  // Get leaderboard
  getLeaderboard: async (latitude, longitude, radiusKm = 5.0) => {
    const params = new URLSearchParams({
      location_lat: latitude.toString(),
      location_lng: longitude.toString(),
      radius_km: radiusKm.toString(),
    });
    return apiCall(`/customer/leaderboard?${params}`);
  },

  // Search vendors
  searchVendors: async (query, latitude, longitude, radiusKm = 2.0) => {
    const params = new URLSearchParams({
      query,
      latitude: latitude.toString(),
      longitude: longitude.toString(),
      radius_km: radiusKm.toString(),
    });
    return apiCall(`/customer/search?${params}`);
  },
};

// Utility functions
export const utils = {
  // Convert image file to base64
  imageToBase64: (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  },

  // Calculate distance between two coordinates
  calculateDistance: (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  },

  // Format price in Indian Rupees
  formatPrice: (price) => {
    return `₹${price.toFixed(2)}`;
  },

  // Get current location (mock for PoC)
  getCurrentLocation: () => {
    // Mock location for PoC - Connaught Place, New Delhi
    return Promise.resolve({
      latitude: 28.7041,
      longitude: 77.1025,
      address: "Connaught Place, New Delhi"
    });
  },
};

// Function to get random profile images
export const getRandomProfileImage = (gender = 'any', seed = null) => {
  // Use DiceBear API for consistent random avatars
  const baseUrl = 'https://api.dicebear.com/7.x/avataaars/svg';
  const params = new URLSearchParams({
    seed: seed || Math.random().toString(36).substring(7),
    backgroundColor: ['b6e3f4', 'c0aede', 'ffdfbf', 'ffd5dc'].join(','),
    skinColor: ['ffdbac', 'f1c27d', 'e0ac69', 'c68642', '8d5524'].join(','),
    hairColor: ['090806', '2c1810', '8b4513', 'a95c1a', 'd4a574', 'e6c384'].join(','),
    style: 'circle'
  });
  
  return `${baseUrl}?${params.toString()}`;
};

// Function to get random Indian-looking profile images
export const getIndianProfileImage = (seed = null) => {
  const baseUrl = 'https://api.dicebear.com/7.x/avataaars/svg';
  const params = new URLSearchParams({
    seed: seed || Math.random().toString(36).substring(7),
    backgroundColor: ['ffdfbf', 'f1c27d', 'e0ac69'].join(','), // Warmer skin tones
    skinColor: ['ffdbac', 'f1c27d', 'e0ac69', 'c68642'].join(','), // Indian skin tones
    hairColor: ['090806', '2c1810', '8b4513', 'a95c1a'].join(','), // Dark hair colors
    style: 'circle'
  });
  
  return `${baseUrl}?${params.toString()}`;
};
