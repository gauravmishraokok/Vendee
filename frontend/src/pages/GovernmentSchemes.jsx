import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './GovernmentSchemes.css';

function GovernmentSchemes() {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const schemes = [
    {
      id: 1,
      title: "PM FME (PM Formalization of Micro Food Processing Enterprises)",
      category: "food-processing",
      description: "Financial assistance for food processing units, technology upgradation, and capacity building.",
      benefits: [
        "Up to 35% subsidy on project cost",
        "Maximum assistance of ₹10 lakh",
        "Technical support and training",
        "Quality certification support"
      ],
      eligibility: [
        "Micro food processing units",
        "Annual turnover less than ₹250 crore",
        "Valid FSSAI license",
        "Minimum 2 years of operation"
      ],
      deadline: "2024-12-31",
      status: "active",
      priority: "high",
      contact: "+91-1800-111-111",
      website: "https://pmfme.mofpi.gov.in",
      documents: ["Aadhaar Card", "PAN Card", "FSSAI License", "Business Registration", "Bank Statement"]
    },
    {
      id: 2,
      title: "PMKSY (Pradhan Mantri Kisan Sampada Yojana)",
      category: "agriculture",
      description: "Comprehensive scheme for food processing sector development and infrastructure creation.",
      benefits: [
        "50% subsidy on project cost",
        "Maximum assistance of ₹50 crore",
        "Infrastructure development support",
        "Cold chain and storage facilities"
      ],
      eligibility: [
        "Food processing companies",
        "Minimum 51% Indian ownership",
        "Project cost above ₹10 crore",
        "Compliance with food safety standards"
      ],
      deadline: "2025-03-31",
      status: "active",
      priority: "high",
      contact: "+91-1800-222-333",
      website: "https://pmksy.mofpi.gov.in",
      documents: ["Company Registration", "Project Report", "Land Documents", "Environmental Clearance", "Financial Statements"]
    },
    {
      id: 3,
      title: "SFURTI (Scheme of Fund for Regeneration of Traditional Industries)",
      category: "traditional",
      description: "Support for traditional artisans and craftsmen including food processing artisans.",
      benefits: [
        "Up to 90% funding for infrastructure",
        "Skill development training",
        "Technology upgradation",
        "Market linkage support"
      ],
      eligibility: [
        "Traditional food processing artisans",
        "Registered with KVIC",
        "Minimum 10 artisans in cluster",
        "Traditional knowledge preservation"
      ],
      deadline: "2024-06-30",
      status: "active",
      priority: "medium",
      contact: "+91-1800-444-555",
      website: "https://sfurti.kvic.org.in",
      documents: ["Artisan Registration", "Cluster Formation Certificate", "Traditional Knowledge Documentation", "Bank Account Details"]
    },
    {
      id: 4,
      title: "MUDRA Yojana (Micro Units Development and Refinance Agency)",
      category: "finance",
      description: "Financial support for micro enterprises including food vendors and small processors.",
      benefits: [
        "Loans up to ₹10 lakh",
        "No collateral required",
        "Low interest rates",
        "Quick disbursement"
      ],
      eligibility: [
        "Micro enterprises",
        "Small business owners",
        "Street vendors",
        "Food cart operators"
      ],
      deadline: "Ongoing",
      status: "active",
      priority: "high",
      contact: "+91-1800-180-1111",
      website: "https://www.mudra.org.in",
      documents: ["Aadhaar Card", "PAN Card", "Business Plan", "Identity Proof", "Address Proof"]
    },
    {
      id: 5,
      title: "PM SVANidhi (PM Street Vendor's AtmaNirbhar Nidhi)",
      category: "street-vendors",
      description: "Special scheme for street vendors including food vendors affected by COVID-19.",
      benefits: [
        "Working capital loan up to ₹10,000",
        "Interest subsidy",
        "Digital payments incentive",
        "Credit history building"
      ],
      eligibility: [
        "Street vendors with vending certificate",
        "Vendors in urban areas",
        "Affected by COVID-19",
        "No existing bank loan"
      ],
      deadline: "2024-12-31",
      status: "active",
      priority: "high",
      contact: "+91-1800-111-222",
      website: "https://pmsvanidhi.mohua.gov.in",
      documents: ["Vending Certificate", "Aadhaar Card", "Bank Account", "Mobile Number", "Vendor Photo"]
    },
    {
      id: 6,
      title: "ASPIRE (A Scheme for Promotion of Innovation, Rural Industries and Entrepreneurship)",
      category: "innovation",
      description: "Support for innovative food processing ideas and rural entrepreneurship.",
      benefits: [
        "Up to ₹1 crore funding",
        "Incubation support",
        "Mentorship program",
        "Market access assistance"
      ],
      eligibility: [
        "Innovative food processing ideas",
        "Rural entrepreneurs",
        "Technology-driven solutions",
        "Scalable business models"
      ],
      deadline: "2024-09-30",
      status: "active",
      priority: "medium",
      contact: "+91-1800-333-444",
      website: "https://aspire.gov.in",
      documents: ["Innovation Proposal", "Business Plan", "Technical Feasibility", "Market Analysis", "Team Profile"]
    }
  ];

  const categories = [
    { id: 'all', name: 'All Schemes', icon: '🏛️' },
    { id: 'food-processing', name: 'Food Processing', icon: '🥫' },
    { id: 'agriculture', name: 'Agriculture', icon: '🌾' },
    { id: 'traditional', name: 'Traditional', icon: '🏺' },
    { id: 'finance', name: 'Finance', icon: '💰' },
    { id: 'street-vendors', name: 'Street Vendors', icon: '🛒' },
    { id: 'innovation', name: 'Innovation', icon: '💡' }
  ];

  const filteredSchemes = schemes.filter(scheme => {
    const matchesCategory = activeCategory === 'all' || scheme.category === activeCategory;
    const matchesSearch = scheme.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         scheme.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return '#ef4444';
      case 'medium': return '#f59e0b';
      case 'low': return '#10b981';
      default: return '#6b7280';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return '#10b981';
      case 'upcoming': return '#3b82f6';
      case 'closed': return '#6b7280';
      default: return '#6b7280';
    }
  };

  return (
    <div className="schemes-container">
      <div className="schemes-header">
        <h1>🏛️ Government Schemes</h1>
        <p className="schemes-subtitle">
          Discover government support programs, subsidies, and assistance for food vendors and processors
        </p>
      </div>

      <div className="schemes-controls">
        <div className="search-section">
          <input
            type="text"
            placeholder="Search schemes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="scheme-search"
          />
        </div>

        <div className="category-filters">
          {categories.map(category => (
            <button
              key={category.id}
              className={`category-btn ${activeCategory === category.id ? 'active' : ''}`}
              onClick={() => setActiveCategory(category.id)}
            >
              <span className="category-icon">{category.icon}</span>
              {category.name}
            </button>
          ))}
        </div>
      </div>

      <div className="schemes-stats">
        <div className="stat-card">
          <h3>Total Schemes</h3>
          <p className="stat-number">{schemes.length}</p>
        </div>
        <div className="stat-card">
          <h3>Active Schemes</h3>
          <p className="stat-number">{schemes.filter(s => s.status === 'active').length}</p>
        </div>
        <div className="stat-card">
          <h3>High Priority</h3>
          <p className="stat-number">{schemes.filter(s => s.priority === 'high').length}</p>
        </div>
      </div>

      <div className="schemes-grid">
        {filteredSchemes.map(scheme => (
          <div key={scheme.id} className="scheme-card">
            <div className="scheme-header">
              <div className="scheme-priority">
                <span 
                  className="priority-dot"
                  style={{ backgroundColor: getPriorityColor(scheme.priority) }}
                ></span>
                <span className="priority-text">{scheme.priority.toUpperCase()}</span>
              </div>
              <div className="scheme-status">
                <span 
                  className="status-badge"
                  style={{ backgroundColor: getStatusColor(scheme.status) }}
                >
                  {scheme.status.toUpperCase()}
                </span>
              </div>
            </div>

            <h3 className="scheme-title">{scheme.title}</h3>
            <p className="scheme-description">{scheme.description}</p>

            <div className="scheme-details">
              <div className="detail-item">
                <span className="detail-label">📅 Deadline:</span>
                <span className="detail-value">{scheme.deadline}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">📞 Contact:</span>
                <span className="detail-value">{scheme.contact}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">🌐 Website:</span>
                <a href={scheme.website} target="_blank" rel="noopener noreferrer" className="detail-link">
                  Visit Website
                </a>
              </div>
            </div>

            <div className="scheme-benefits">
              <h4>🎯 Key Benefits:</h4>
              <ul>
                {scheme.benefits.map((benefit, index) => (
                  <li key={index}>{benefit}</li>
                ))}
              </ul>
            </div>

            <div className="scheme-eligibility">
              <h4>✅ Eligibility Criteria:</h4>
              <ul>
                {scheme.eligibility.map((criteria, index) => (
                  <li key={index}>{criteria}</li>
                ))}
              </ul>
            </div>

            <div className="scheme-documents">
              <h4>📋 Required Documents:</h4>
              <div className="documents-list">
                {scheme.documents.map((doc, index) => (
                  <span key={index} className="document-tag">{doc}</span>
                ))}
              </div>
            </div>

            <div className="scheme-actions">
              <button className="action-btn primary">Apply Now</button>
              <button className="action-btn secondary">Learn More</button>
              <button className="action-btn outline">Save for Later</button>
            </div>
          </div>
        ))}
      </div>

      {filteredSchemes.length === 0 && (
        <div className="no-schemes">
          <div className="no-schemes-icon">🔍</div>
          <h4>No schemes found</h4>
          <p>Try adjusting your search or category filters</p>
        </div>
      )}

      <div className="schemes-footer">
        <div className="footer-info">
          <h4>💡 Tips for Application:</h4>
          <ul>
            <li>Keep all required documents ready before applying</li>
            <li>Ensure your business meets all eligibility criteria</li>
            <li>Apply well before the deadline to avoid last-minute issues</li>
            <li>Contact the helpline numbers for any queries</li>
          </ul>
        </div>
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

export default GovernmentSchemes;
