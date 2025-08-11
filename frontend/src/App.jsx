import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './App.css';

// Import pages
import VendorOnboard from './pages/VendorOnboard';
import VendorUpload from './pages/VendorUpload';
import CustomerSearch from './pages/CustomerSearch';
import ChatWithAgent from './pages/ChatWithAgent';

function App() {
  return (
    <Router>
      <div className="App">
        <header className="app-header">
          <div className="header-content">
            <h1 className="app-title">🍎 Vendee</h1>
            <p className="app-subtitle">AI-Powered Street Vendor Marketplace</p>
          </div>
          <nav className="nav-menu">
            <Link to="/vendor/onboard" className="nav-link">Vendor Onboard</Link>
            <Link to="/vendor/upload" className="nav-link">Vendor Upload</Link>
            <Link to="/customer/search" className="nav-link">Customer Search</Link>
            <Link to="/customer/chat" className="nav-link">SmartBuy Chat</Link>
          </nav>
        </header>

        <main className="app-main">
          <Routes>
            <Route path="/vendor/onboard" element={<VendorOnboard />} />
            <Route path="/vendor/upload" element={<VendorUpload />} />
            <Route path="/customer/search" element={<CustomerSearch />} />
            <Route path="/customer/chat" element={<ChatWithAgent />} />
            <Route path="/" element={<HomePage />} />
          </Routes>
        </main>

        <footer className="app-footer">
          <p>&copy; 2024 Vendee - Connecting Street Vendors with Customers</p>
        </footer>
      </div>
    </Router>
  );
}

function HomePage() {
  return (
    <div className="home-page">
      <div className="hero-section">
        <h2>Welcome to Vendee</h2>
        <p>Your AI-powered marketplace for fresh produce and local goods</p>
        
        <div className="feature-grid">
          <div className="feature-card">
            <h3>🚚 For Vendors</h3>
            <p>Upload cart photos, get AI-powered inventory detection, and reach more customers</p>
            <Link to="/vendor/onboard" className="btn btn-primary">Get Started</Link>
          </div>
          
          <div className="feature-card">
            <h3>🛒 For Customers</h3>
            <p>Find nearby vendors, use SmartBuy AI chat, and get fresh produce delivered</p>
            <Link to="/customer/search" className="btn btn-primary">Start Shopping</Link>
          </div>
        </div>
        
        <div className="how-it-works">
          <h3>How It Works</h3>
          <div className="steps">
            <div className="step">
              <div className="step-number">1</div>
              <p>Vendors upload cart photos</p>
            </div>
            <div className="step">
              <div className="step-number">2</div>
              <p>AI detects items automatically</p>
            </div>
            <div className="step">
              <div className="step-number">3</div>
              <p>Customers find vendors on map</p>
            </div>
            <div className="step">
              <div className="step-number">4</div>
              <p>SmartBuy AI helps with requests</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
