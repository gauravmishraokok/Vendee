import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getIndianProfileImage } from '../utils/api';
import './Leaderboard.css';

function Leaderboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('vendors');
  const [timeFilter, setTimeFilter] = useState('month');

  // Mock leaderboard data with Indian profile images
  const vendorLeaderboard = [
    {
      id: 1,
      name: "Rajesh Kumar",
      rank: 1,
      rating: 4.9,
      orders: 156,
      earnings: 45200,
      image: getIndianProfileImage("rajesh-kumar"),
      badge: "🥇 Top Seller",
      category: "Vegetables"
    },
    {
      id: 2,
      name: "Priya Sharma",
      rank: 2,
      rating: 4.8,
      orders: 142,
      earnings: 38900,
      image: getIndianProfileImage("priya-sharma"),
      badge: "🥈 Quality Star",
      category: "Fruits"
    },
    {
      id: 3,
      name: "Amit Singh",
      rank: 3,
      rating: 4.7,
      orders: 128,
      earnings: 35600,
      image: getIndianProfileImage("amit-singh"),
      badge: "🥉 Rising Star",
      category: "Dairy"
    },
    {
      id: 4,
      name: "Lakshmi Devi",
      rank: 4,
      rating: 4.6,
      orders: 115,
      earnings: 32400,
      image: getIndianProfileImage("lakshmi-devi"),
      badge: "⭐ Consistent",
      category: "Grains"
    },
    {
      id: 5,
      name: "Suresh Patel",
      rank: 5,
      rating: 4.5,
      orders: 98,
      earnings: 28900,
      image: getIndianProfileImage("suresh-patel"),
      badge: "🔥 Hot Seller",
      category: "Beverages"
    }
  ];

  const customerLeaderboard = [
    {
      id: 1,
      name: "Anjali Gupta",
      rank: 1,
      orders: 89,
      savings: 12450,
      image: getIndianProfileImage("anjali-gupta"),
      badge: "🥇 Smart Shopper",
      loyaltyPoints: 1250
    },
    {
      id: 2,
      name: "Rahul Verma",
      rank: 2,
      orders: 76,
      savings: 10890,
      image: getIndianProfileImage("rahul-verma"),
      badge: "🥈 Bargain Hunter",
      loyaltyPoints: 980
    },
    {
      id: 3,
      name: "Meera Kapoor",
      rank: 3,
      orders: 65,
      savings: 9230,
      image: getIndianProfileImage("meera-kapoor"),
      badge: "🥉 Regular Customer",
      loyaltyPoints: 850
    },
    {
      id: 4,
      name: "Vikram Singh",
      rank: 4,
      orders: 58,
      savings: 8150,
      image: getIndianProfileImage("vikram-singh"),
      badge: "⭐ Loyal Customer",
      loyaltyPoints: 720
    },
    {
      id: 5,
      name: "Pooja Sharma",
      rank: 5,
      orders: 52,
      savings: 7340,
      image: getIndianProfileImage("pooja-sharma"),
      badge: "🔥 New Star",
      loyaltyPoints: 650
    }
  ];

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1: return "🥇";
      case 2: return "🥈";
      case 3: return "🥉";
      default: return `#${rank}`;
    }
  };

  const getTimeFilterLabel = () => {
    switch (timeFilter) {
      case 'week': return 'This Week';
      case 'month': return 'This Month';
      case 'quarter': return 'This Quarter';
      case 'year': return 'This Year';
      default: return 'This Month';
    }
  };

  return (
    <div className="leaderboard-container">
      <div className="leaderboard-header">
        <h1>🏆 Leaderboard</h1>
        <p className="leaderboard-subtitle">
          Celebrating our top performers in {getTimeFilterLabel()}
        </p>
      </div>

      <div className="leaderboard-controls">
        <div className="tab-buttons">
          <button
            className={`tab-btn ${activeTab === 'vendors' ? 'active' : ''}`}
            onClick={() => setActiveTab('vendors')}
          >
            🛒 Top Vendors
          </button>
          <button
            className={`tab-btn ${activeTab === 'customers' ? 'active' : ''}`}
            onClick={() => setActiveTab('customers')}
          >
            👥 Top Customers
          </button>
        </div>

        <div className="time-filter">
          <label>Time Period:</label>
          <select
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value)}
            className="time-select"
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
          </select>
        </div>
      </div>

      <div className="leaderboard-content">
        {activeTab === 'vendors' && (
          <div className="vendor-leaderboard">
            <div className="leaderboard-stats">
              <div className="stat-card">
                <h3>Total Vendors</h3>
                <p className="stat-number">1,247</p>
              </div>
              <div className="stat-card">
                <h3>Avg. Rating</h3>
                <p className="stat-number">4.6</p>
              </div>
              <div className="stat-card">
                <h3>Total Orders</h3>
                <p className="stat-number">15,892</p>
              </div>
            </div>

            <div className="leaderboard-list">
              {vendorLeaderboard.map((vendor) => (
                <div key={vendor.id} className="leaderboard-item vendor-item">
                  <div className="rank-section">
                    <span className="rank-icon">{getRankIcon(vendor.rank)}</span>
                    <span className="rank-number">{vendor.rank}</span>
                  </div>
                  
                  <div className="profile-section">
                    <img src={vendor.image} alt={vendor.name} className="profile-image" />
                    <div className="profile-info">
                      <h4 className="profile-name">{vendor.name}</h4>
                      <p className="profile-category">{vendor.category}</p>
                      <span className="profile-badge">{vendor.badge}</span>
                    </div>
                  </div>

                  <div className="stats-section">
                    <div className="stat">
                      <span className="stat-label">Rating</span>
                      <span className="stat-value">⭐ {vendor.rating}</span>
                    </div>
                    <div className="stat">
                      <span className="stat-label">Orders</span>
                      <span className="stat-value">📦 {vendor.orders}</span>
                    </div>
                    <div className="stat">
                      <span className="stat-label">Earnings</span>
                      <span className="stat-value">₹{vendor.earnings.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'customers' && (
          <div className="customer-leaderboard">
            <div className="leaderboard-stats">
              <div className="stat-card">
                <h3>Total Customers</h3>
                <p className="stat-number">8,934</p>
              </div>
              <div className="stat-card">
                <h3>Avg. Savings</h3>
                <p className="stat-number">₹2,450</p>
              </div>
              <div className="stat-card">
                <h3>Total Orders</h3>
                <p className="stat-number">23,567</p>
              </div>
            </div>

            <div className="leaderboard-list">
              {customerLeaderboard.map((customer) => (
                <div key={customer.id} className="leaderboard-item customer-item">
                  <div className="rank-section">
                    <span className="rank-icon">{getRankIcon(customer.rank)}</span>
                    <span className="rank-number">{customer.rank}</span>
                  </div>
                  
                  <div className="profile-section">
                    <img src={customer.image} alt={customer.name} className="profile-image" />
                    <div className="profile-info">
                      <h4 className="profile-name">{customer.name}</h4>
                      <p className="profile-category">Loyalty Points: {customer.loyaltyPoints}</p>
                      <span className="profile-badge">{customer.badge}</span>
                    </div>
                  </div>

                  <div className="stats-section">
                    <div className="stat">
                      <span className="stat-label">Orders</span>
                      <span className="stat-value">📦 {customer.orders}</span>
                    </div>
                    <div className="stat">
                      <span className="stat-label">Savings</span>
                      <span className="stat-value">💰 ₹{customer.savings.toLocaleString()}</span>
                    </div>
                    <div className="stat">
                      <span className="stat-label">Points</span>
                      <span className="stat-value">⭐ {customer.loyaltyPoints}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="leaderboard-footer">
        <p>🏆 Leaderboard updates every 24 hours</p>
        <button 
          className="back-btn"
          onClick={() => navigate(-1)}
        >
          ← Go Back
        </button>
      </div>
    </div>
  );
}

export default Leaderboard;
