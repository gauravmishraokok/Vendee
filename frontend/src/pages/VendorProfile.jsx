import React, { useState } from 'react';
import VendorNav from '../components/VendorNav';
import './VendorProfile.css';

function VendorProfile() {
  const [activeTab, setActiveTab] = useState('overview');
  
  // Hardcoded vendor data
  const vendorData = {
    name: "Rajesh Kumar Fruits",
    phone: "+91-98765-43210",
    email: "rajesh.kumar@email.com",
    location: "Connaught Place, New Delhi",
    coordinates: { lat: 28.7041, lng: 77.1025 },
    rating: 4.8,
    totalSales: 1250,
    totalOrders: 89,
    memberSince: "March 2024",
    businessType: "Mobile Vendor",
    specialties: ["Fresh Fruits", "Organic Vegetables", "Seasonal Produce"],
    description: "Serving fresh, high-quality fruits and vegetables to the Delhi community for over 5 years. We source directly from local farmers to ensure the best quality and fair prices.",
    imageUrl: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&h=300&fit=crop"
  };

  const recentOrders = [
    { id: 1, customer: "Priya Sharma", items: ["Apples", "Bananas"], amount: 150, status: "Delivered", date: "2024-01-15" },
    { id: 2, customer: "Amit Patel", items: ["Tomatoes", "Onions"], amount: 80, status: "In Progress", date: "2024-01-15" },
    { id: 3, customer: "Neha Singh", items: ["Oranges", "Grapes"], amount: 200, status: "Delivered", date: "2024-01-14" },
    { id: 4, customer: "Raj Malhotra", items: ["Carrots", "Potatoes"], amount: 120, status: "Delivered", date: "2024-01-14" }
  ];

  const inventoryStats = [
    { category: "Fruits", count: 12, value: 2500 },
    { category: "Vegetables", count: 18, value: 1800 },
    { category: "Herbs", count: 8, value: 500 },
    { category: "Seasonal", count: 5, value: 1200 }
  ];

  const customerReviews = [
    { customer: "Priya S.", rating: 5, comment: "Best quality fruits in the area! Very fresh and reasonably priced.", date: "2024-01-10" },
    { customer: "Amit P.", rating: 5, comment: "Rajesh bhai always has the freshest vegetables. Highly recommended!", date: "2024-01-08" },
    { customer: "Neha S.", rating: 4, comment: "Great service and good quality produce. Will order again.", date: "2024-01-05" },
    { customer: "Raj M.", rating: 5, comment: "Excellent fruits and very friendly vendor. Best in Connaught Place!", date: "2024-01-03" }
  ];

  const renderOverview = () => (
    <div className="overview-section">
      <div className="vendor-header">
        <div className="vendor-avatar">
          <img src={vendorData.imageUrl} alt={vendorData.name} />
        </div>
        <div className="vendor-info">
          <h2>{vendorData.name}</h2>
          <p className="vendor-location">📍 {vendorData.location}</p>
          <div className="vendor-rating">
            <span className="stars">★★★★★</span>
            <span className="rating-text">{vendorData.rating}/5.0</span>
            <span className="total-reviews">({customerReviews.length} reviews)</span>
          </div>
          <p className="vendor-description">{vendorData.description}</p>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-number">{vendorData.totalSales}</div>
          <div className="stat-label">Total Sales (₹)</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📦</div>
          <div className="stat-number">{vendorData.totalOrders}</div>
          <div className="stat-label">Orders Completed</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⭐</div>
          <div className="stat-number">{vendorData.rating}</div>
          <div className="stat-label">Customer Rating</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🎯</div>
          <div className="stat-number">{vendorData.specialties.length}</div>
          <div className="stat-label">Specialties</div>
        </div>
      </div>

      <div className="specialties-section">
        <h3>Specialties</h3>
        <div className="specialties-grid">
          {vendorData.specialties.map((specialty, index) => (
            <div key={index} className="specialty-tag">
              {specialty}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderOrders = () => (
    <div className="orders-section">
      <h3>Recent Orders</h3>
      <div className="orders-list">
        {recentOrders.map(order => (
          <div key={order.id} className="order-card">
            <div className="order-header">
              <span className="order-id">#{order.id}</span>
              <span className={`order-status ${order.status.toLowerCase()}`}>
                {order.status}
              </span>
            </div>
            <div className="order-details">
              <p><strong>Customer:</strong> {order.customer}</p>
              <p><strong>Items:</strong> {order.items.join(", ")}</p>
              <p><strong>Amount:</strong> ₹{order.amount}</p>
              <p><strong>Date:</strong> {order.date}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderInventory = () => (
    <div className="inventory-section">
      <h3>Inventory Overview</h3>
      <div className="inventory-grid">
        {inventoryStats.map((stat, index) => (
          <div key={index} className="inventory-card">
            <div className="inventory-icon">📦</div>
            <div className="inventory-category">{stat.category}</div>
            <div className="inventory-count">{stat.count} items</div>
            <div className="inventory-value">₹{stat.value}</div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderReviews = () => (
    <div className="reviews-section">
      <h3>Customer Reviews</h3>
      <div className="reviews-list">
        {customerReviews.map((review, index) => (
          <div key={index} className="review-card">
            <div className="review-header">
              <span className="reviewer-name">{review.customer}</span>
              <span className="review-rating">
                {'★'.repeat(review.rating)}
                {'☆'.repeat(5 - review.rating)}
              </span>
            </div>
            <p className="review-comment">{review.comment}</p>
            <span className="review-date">{review.date}</span>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="vendor-profile">
      <VendorNav />
      
      <div className="profile-header">
        <h1>👤 Vendor Profile</h1>
        <p>Welcome back, {vendorData.name.split(' ')[0]}!</p>
      </div>

      <div className="profile-tabs">
        <button
          className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          📊 Overview
        </button>
        <button
          className={`tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
          onClick={() => setActiveTab('orders')}
        >
          📦 Orders
        </button>
        <button
          className={`tab-btn ${activeTab === 'inventory' ? 'active' : ''}`}
          onClick={() => setActiveTab('inventory')}
        >
          🥬 Inventory
        </button>
        <button
          className={`tab-btn ${activeTab === 'reviews' ? 'active' : ''}`}
          onClick={() => setActiveTab('reviews')}
        >
          ⭐ Reviews
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'orders' && renderOrders()}
        {activeTab === 'inventory' && renderInventory()}
        {activeTab === 'reviews' && renderReviews()}
      </div>
    </div>
  );
}

export default VendorProfile;
