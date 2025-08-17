import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './VendorNav.css';

function VendorNav() {
  const location = useLocation();
  
  const navItems = [
    { path: '/vendor/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/vendor/profile', label: 'Profile', icon: '👤' },
    { path: '/leaderboard', label: 'Leaderboard', icon: '🏆' },
    { path: '/government-schemes', label: 'Schemes', icon: '🏛️' }
  ];

  return (
    <nav className="vendor-nav">
      <div className="nav-container">
        <div className="nav-brand">
          <span className="brand-icon">🚚</span>
          <span className="brand-text">Vendor Portal</span>
        </div>
        
        <div className="nav-links">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </Link>
          ))}
        </div>
        
        <div className="nav-actions">
          <Link to="/" className="nav-action">
            🏠 Back to Home
          </Link>
        </div>
      </div>
    </nav>
  );
}

export default VendorNav;
