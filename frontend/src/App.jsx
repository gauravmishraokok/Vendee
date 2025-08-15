import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import './App.css';

// Import pages
import LandingPage from './pages/LandingPage';
import VendorLogin from './pages/VendorLogin';
import VendorDashboard from './pages/VendorDashboard';
import VendorProfile from './pages/VendorProfile';
import NewVendorProfile from './pages/NewVendorProfile';
import VendorOnboarding from './pages/VendorOnboarding';
import RegistrationSuccess from './pages/RegistrationSuccess';
import CustomerLanding from './pages/CustomerLanding';
import ManualBuy from './pages/ManualBuy';
import SmartBuy from './pages/SmartBuy';
import CustomerSearch from './pages/CustomerSearch';
import ChatWithAgent from './pages/ChatWithAgent';
import Leaderboard from './pages/Leaderboard';
import GovernmentSchemes from './pages/GovernmentSchemes';

function App() {
  return (
    <Router>
      <div className="App">
        <main className="app-main">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/vendor/login" element={<VendorLogin />} />
            <Route path="/vendor/dashboard" element={<VendorDashboard />} />
            <Route path="/vendor/profile" element={<VendorProfile />} />
            <Route path="/vendor/new-profile" element={<NewVendorProfile />} />
            <Route path="/vendor/onboarding" element={<VendorOnboarding />} />
            <Route path="/vendor/success" element={<RegistrationSuccess />} />
            <Route path="/customer" element={<CustomerLanding />} />
            <Route path="/customer/manual-buy" element={<ManualBuy />} />
            <Route path="/customer/smart-buy" element={<SmartBuy />} />
            <Route path="/customer/search" element={<CustomerSearch />} />
            <Route path="/customer/chat" element={<ChatWithAgent />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/government-schemes" element={<GovernmentSchemes />} />
          </Routes>
        </main>
        <AppFooter />
      </div>
    </Router>
  );
}

function AppFooter() {
  const location = useLocation();
  const isVendorPage = location.pathname.startsWith('/vendor/');
  
  // Don't show footer on vendor pages
  if (isVendorPage) {
    return null;
  }
  
  return (
    <footer className="app-footer">
      <div className="container">
        <p>&copy; 2024 Vendee - Connecting Street Vendors with Customers</p>
      </div>
    </footer>
  );
}

export default App;
