import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import OrderTracking from '../components/OrderTracking';
import './SmartBuy.css';

function SmartBuy() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [currentScenario, setCurrentScenario] = useState('initial');
  const [selectedItems, setSelectedItems] = useState([]);
  const [vendorOptions, setVendorOptions] = useState([]);
  const [showVendorSelection, setShowVendorSelection] = useState(false);
  const [itemQuantities, setItemQuantities] = useState({});
  const [showTracking, setShowTracking] = useState(false);
  const [currentOrder, setCurrentOrder] = useState(null);
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom only when user sends a message
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    // Only auto-scroll if the last message is from the user
    if (messages.length > 0 && messages[messages.length - 1].type === 'user') {
      scrollToBottom();
    }
  }, [messages]);

  // Initial welcome message
  useEffect(() => {
    const welcomeMessage = {
      id: 1,
      type: 'agent',
      content: "Hello! I'm your SmartBuy AI agent. I can help you find the best vendors for your needs. What would you like to buy today?",
      timestamp: new Date().toLocaleTimeString()
    };
    setMessages([welcomeMessage]);
  }, []);

  // Mock AI responses based on scenarios
  const getAIResponse = (userMessage, scenario) => {
    const lowerMessage = userMessage.toLowerCase();
    
    if (scenario === 'initial') {
      if (lowerMessage.includes('banana') || lowerMessage.includes('bananas')) {
        return {
          content: "🍌 Perfect! I found some great banana vendors for you. Let me analyze the best options based on freshness, price, and proximity to your location.",
          action: 'show_banana_vendors',
                     vendors: [
             {
               id: 1,
               name: "Rajesh Kumar",
               type: "Moving",
               distance: "0.8 km",
               rating: "4.8",
               items: ["Bananas"],
               price: "₹60/kg",
               freshness: "Today's stock",
               estimatedDelivery: "15-20 mins",
               reasoning: "Best choice: Fresh stock, moving vendor, excellent rating",
               coordinates: { lat: 28.7041, lng: 77.1025 }
             },
             {
               id: 2,
               name: "Priya Sharma",
               type: "Stationary",
               distance: "2.1 km",
               rating: "4.6",
               items: ["Bananas", "Other fruits"],
               price: "₹55/kg",
               freshness: "Yesterday's stock",
               estimatedDelivery: "You need to visit",
               reasoning: "Cheaper but requires travel, slightly older stock",
               coordinates: { lat: 28.7050, lng: 77.1035 }
             }
           ]
        };
      } else if (lowerMessage.includes('tomato') || lowerMessage.includes('tomatoes')) {
        if (lowerMessage.includes('grape') || lowerMessage.includes('grapes') || lowerMessage.includes('carrot') || lowerMessage.includes('carrots')) {
          return {
            content: "🍅🍇🥕 Excellent choice! I can see you want tomatoes, grapes, and carrots. Let me analyze the optimal vendor combination for you.",
            action: 'show_multi_item_vendors',
            analysis: {
              challenge: "No single vendor within 2km sells all three items together",
              solution: "Optimal route: Order tomatoes from moving vendor, visit stationary vendor for grapes & carrots",
              reasoning: "This saves you time and ensures freshest produce"
            },
                         vendors: [
               {
                 id: 1,
                 name: "Rajesh Kumar",
                 type: "Moving",
                 distance: "0.8 km",
                 rating: "4.8",
                 items: ["Tomatoes"],
                 price: "₹40/kg",
                 estimatedDelivery: "15-20 mins",
                 reasoning: "Moving vendor - tomatoes delivered to your doorstep",
                 coordinates: { lat: 28.7041, lng: 77.1025 }
               },
               {
                 id: 2,
                 name: "Priya Sharma",
                 type: "Stationary",
                 distance: "2.1 km",
                 rating: "4.6",
                 items: ["Grapes", "Carrots"],
                 price: "₹150/kg grapes, ₹50/kg carrots",
                 estimatedDelivery: "You visit them",
                 reasoning: "Best quality grapes & carrots, worth the short trip",
                 coordinates: { lat: 28.7050, lng: 77.1035 }
               }
             ]
          };
        }
      } else if (lowerMessage.includes('biryani') || lowerMessage.includes('dinner')) {
        return {
          content: "Great choice! For biryani, you'll need several ingredients. Let me show you what's typically required and help you find vendors.",
          action: 'show_biryani_items',
          items: [
            { name: "Basmati Rice", required: true },
            { name: "Chicken", required: true },
            { name: "Onions", required: true },
            { name: "Tomatoes", required: true },
            { name: "Ginger", required: true },
            { name: "Garlic", required: true },
            { name: "Spices", required: true },
            { name: "Mint", required: false },
            { name: "Coriander", required: false }
          ]
        };
      } else if (lowerMessage.includes('onion') || lowerMessage.includes('market')) {
        return {
          content: "I understand you need onions! Let me find the best vendors for you. I'll filter for stationary vendors with the cheapest prices.",
          action: 'filter_vendors',
          filters: { type: 'stationary', sortBy: 'price' }
        };
      } else if (lowerMessage.includes('delivery') || lowerMessage.includes('home') || lowerMessage.includes('soon')) {
        return {
          content: "I see you need delivery to your home as soon as possible! This suggests you need a moving vendor who can come to you. Let me find the nearest moving vendors.",
          action: 'filter_vendors',
          filters: { type: 'moving', sortBy: 'distance' }
        };
      }
    }
    
    if (scenario === 'biryani_items') {
             if (lowerMessage.includes('yes') || lowerMessage.includes('okay') || lowerMessage.includes('continue')) {
         return {
           content: "Perfect! Now let me ask a few questions to find the best vendors for you:\n\n1. Do you prefer moving vendors (they come to you) or stationary vendors (you go to them)?\n2. What's your budget range?\n3. Do you need everything delivered today?\n4. How many people will be eating?",
           action: 'ask_preferences'
         };
       }
    }

         if (scenario === 'ask_preferences') {
       // Hardcoded response for the three questions - always show the same response regardless of user input
       return {
         content: "Excellent choices! 🎯\n\n• **Moving vendors** - Perfect for convenience!\n• **Budget: ₹2000** - Great budget for quality ingredients\n• **Delivery today** - I'll prioritize fast delivery options\n• **4 people** - Perfect portion sizing\n\nLet me analyze the best vendors for your biryani ingredients with these preferences...",
         action: 'show_biryani_vendors',
                      vendors: [
               {
                 id: 1,
                 name: "Rajesh Kumar",
                 type: "Moving",
                 distance: "0.8 km",
                 rating: "4.8",
                 items: ["Biryani Ingredients for 4 people"],
                 price: "₹850 total",
                 estimatedDelivery: "15-20 mins",
                 reasoning: "Best match: Moving vendor, within budget, has most ingredients",
                 coordinates: { lat: 28.7041, lng: 77.1025 }
               },
               {
                 id: 2,
                 name: "Amit Singh",
                 type: "Moving",
                 distance: "1.2 km",
                 rating: "4.6",
                 items: ["Biryani Ingredients for 4 people"],
                 price: "₹920 total",
                 estimatedDelivery: "25-30 mins",
                 reasoning: "Complete ingredient set, slightly higher price but excellent quality",
                 coordinates: { lat: 28.7045, lng: 77.1030 }
               }
             ]
       };
     }
    
    if (scenario === 'vendor_selection') {
      return {
        content: "I've found the best vendors for you! Here are your top options. Which one would you like me to send a request to?",
        action: 'show_vendors',
        vendors: [
          {
            id: 1,
            name: "Rajesh Kumar",
            type: "Moving",
            distance: "0.8 km",
            rating: "4.8",
            items: ["Onions", "Tomatoes", "Spices"],
            estimatedDelivery: "15-20 mins"
          },
          {
            id: 2,
            name: "Amit Singh",
            type: "Moving", 
            distance: "1.2 km",
            rating: "4.6",
            items: ["Onions", "Potatoes", "Carrots"],
            estimatedDelivery: "25-30 mins"
          }
        ]
      };
    }

    // Default response
    return {
      content: "I understand you're looking for something. Could you please be more specific about what you need? For example:\n• 'I need onions for cooking'\n• 'I want to make biryani'\n• 'I need vegetables delivered to my home'\n• 'I want to buy bananas'\n• 'I want tomatoes, grapes and carrots'",
      action: 'clarify'
    };
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    // Add user message
    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date().toLocaleTimeString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Simulate AI thinking
    setTimeout(() => {
      const aiResponse = getAIResponse(inputMessage, currentScenario);
      
      const agentMessage = {
        id: Date.now() + 1,
        type: 'agent',
        content: aiResponse.content,
        timestamp: new Date().toLocaleTimeString(),
        action: aiResponse.action,
        data: aiResponse.data || aiResponse.vendors || aiResponse.items || aiResponse.filters
      };

      setMessages(prev => [...prev, agentMessage]);
      setIsTyping(false);

      // Handle different actions
      if (aiResponse.action === 'show_biryani_items') {
        setCurrentScenario('biryani_items');
        setSelectedItems(aiResponse.items);
              } else if (aiResponse.action === 'ask_preferences') {
          setCurrentScenario('ask_preferences');
          // Wait for user input, don't auto-respond
      } else if (aiResponse.action === 'show_biryani_vendors') {
        setVendorOptions(aiResponse.vendors);
        setShowVendorSelection(true);
      } else if (aiResponse.action === 'show_banana_vendors') {
        setVendorOptions(aiResponse.vendors);
        setShowVendorSelection(true);
      } else if (aiResponse.action === 'show_multi_item_vendors') {
        setVendorOptions(aiResponse.vendors);
        setShowVendorSelection(true);
      } else if (aiResponse.action === 'filter_vendors') {
        setCurrentScenario('vendor_selection');
        // Simulate vendor search
        setTimeout(() => {
          const vendorResponse = getAIResponse('show vendors', 'vendor_selection');
          const vendorMessage = {
            id: Date.now() + 2,
            type: 'agent',
            content: vendorResponse.content,
            timestamp: new Date().toLocaleTimeString(),
            action: vendorResponse.action,
            data: vendorResponse.vendors
          };
          setMessages(prev => [...prev, vendorMessage]);
          setVendorOptions(vendorResponse.vendors);
          setShowVendorSelection(true);
        }, 2000);
      } else if (aiResponse.action === 'show_vendors') {
        setVendorOptions(aiResponse.vendors);
        setShowVendorSelection(true);
      }
    }, 1500);
  };

  const handleItemToggle = (itemName) => {
    setSelectedItems(prev => 
      prev.map(item => 
        item.name === itemName 
          ? { ...item, required: !item.required }
          : item
      )
    );
  };

  const handleQuantityChange = (vendorId, itemName, quantity) => {
    const key = `${vendorId}-${itemName}`;
    setItemQuantities(prev => ({
      ...prev,
      [key]: quantity
    }));
  };

  const getItemQuantity = (vendorId, itemName) => {
    const key = `${vendorId}-${itemName}`;
    // For biryani ingredients, default to 4 people
    if (itemName.includes('Biryani Ingredients')) {
      return itemQuantities[key] || 4;
    }
    return itemQuantities[key] || 0;
  };

  const handlePlaceOrder = (vendor) => {
    // Get all items with quantity > 0
    const selectedItems = vendor.items.filter(item => {
      const quantity = getItemQuantity(vendor.id, item);
      return quantity > 0;
    });

    if (selectedItems.length === 0) {
      alert('Please select at least one item with quantity > 0');
      return;
    }

    // Calculate total price (simplified calculation)
    const totalPrice = selectedItems.reduce((total, item) => {
      const quantity = getItemQuantity(vendor.id, item);
      // Extract price from vendor data or use default
      const price = vendor.price ? parseInt(vendor.price.replace(/[^\d]/g, '')) : 100;
      return total + (price * quantity);
    }, 0);

    // Create order object
    const order = {
      id: Math.floor(Math.random() * 10000) + 1000,
      vendor: vendor,
      items: selectedItems.map(item => ({
        name: item,
        quantity: getItemQuantity(vendor.id, item)
      })),
      total: totalPrice,
      timestamp: new Date().toISOString()
    };

    // Simulate sending request
    const requestMessage = {
      id: Date.now(),
      type: 'agent',
      content: `Perfect! I've sent a request to ${vendor.name} for your items. Total: ₹${totalPrice}. They'll respond within a few minutes.`,
      timestamp: new Date().toLocaleTimeString(),
      action: 'request_sent'
    };

    setMessages(prev => [...prev, requestMessage]);
    setShowVendorSelection(false);
    setCurrentOrder(order);
    setShowTracking(true);
  };

  const handleVendorSelect = (vendor) => {
    // Create order object for single vendor selection
    const order = {
      id: Math.floor(Math.random() * 10000) + 1000,
      vendor: vendor,
      items: vendor.items.map(item => ({
        name: item,
        quantity: 1 // Default quantity
      })),
      total: vendor.items.length * 100, // Simplified total
      timestamp: new Date().toISOString()
    };

    // Simulate sending request
    const requestMessage = {
      id: Date.now(),
      type: 'agent',
      content: `Perfect! I've sent a request to ${vendor.name} for your items. They'll respond within a few minutes.`,
      timestamp: new Date().toLocaleTimeString(),
      action: 'request_sent'
    };

    setMessages(prev => [...prev, requestMessage]);
    setShowVendorSelection(false);
    setCurrentOrder(order);
    setShowTracking(true);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  return (
    <div className="smart-buy">
      <div className="smart-buy-header">
        <button className="back-btn" onClick={() => navigate('/customer')}>
          ← Back
        </button>
        <h1>🤖 Smart Buy</h1>
        <p>Let our AI agent find the best vendors for your needs</p>
      </div>

      <div className="chat-container">
        <div className="chat-messages">
          {messages.map((message) => (
            <div key={message.id} className={`message ${message.type}`}>
              <div className="message-content">
                {message.content}
              </div>
              <div className="message-timestamp">{message.timestamp}</div>
              
              {/* Render special message types */}
              {message.action === 'show_biryani_items' && message.data && (
                <div className="biryani-items-form">
                  <h4>Biryani Ingredients Checklist:</h4>
                  <div className="items-grid">
                    {message.data.map((item, index) => {
                      const selectedItem = selectedItems.find(selectedItem => selectedItem.name === item.name);
                      const isChecked = selectedItem ? selectedItem.required : item.required;
                      
                      return (
                        <label key={index} className="item-checkbox">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleItemToggle(item.name)}
                          />
                          <span className="checkbox-label">{item.name}</span>
                          {!isChecked && <span className="optional-tag">(Optional)</span>}
                        </label>
                      );
                    })}
                  </div>
                  <button 
                    className="continue-btn"
                    onClick={() => {
                      const response = getAIResponse('yes', 'biryani_items');
                      const agentMessage = {
                        id: Date.now(),
                        type: 'agent',
                        content: response.content,
                        timestamp: new Date().toLocaleTimeString(),
                        action: response.action
                      };
                      setMessages(prev => [...prev, agentMessage]);
                    }}
                  >
                    Continue with Selected Items
                  </button>
                </div>
              )}

                             {message.action === 'show_multi_item_vendors' && message.data && (
                 <div className="vendor-selection multi-item">
                   <div className="ai-analysis">
                     <h4>🤖 AI Analysis & Optimal Route:</h4>
                     <div className="analysis-content">
                       <div className="challenge">
                         <span className="icon">⚠️</span>
                         <strong>Challenge:</strong> {message.analysis?.challenge || "No single vendor within 2km sells all three items together"}
                       </div>
                       <div className="solution">
                         <span className="icon">💡</span>
                         <strong>Solution:</strong> {message.analysis?.solution || "Optimal route: Order tomatoes from moving vendor, visit stationary vendor for grapes & carrots"}
                       </div>
                       <div className="reasoning">
                         <span className="icon">🧠</span>
                         <strong>Reasoning:</strong> {message.analysis?.reasoning || "This saves you time and ensures freshest produce"}
                       </div>
                     </div>
                   </div>
                   <h4>Recommended Vendor Combination:</h4>
                   <div className="vendors-grid">
                     {message.data.map((vendor) => (
                       <div key={vendor.id} className="vendor-option">
                         <div className="vendor-header">
                           <h5>{vendor.name}</h5>
                           <span className={`vendor-type ${vendor.type.toLowerCase()}`}>
                             {vendor.type === 'Moving' ? '🚚' : '🏪'} {vendor.type}
                           </span>
                         </div>
                         <div className="vendor-details">
                           <p>📍 {vendor.distance} • ⭐ {vendor.rating}</p>
                           <p>🕒 {vendor.estimatedDelivery}</p>
                           <p>📦 {vendor.items.join(', ')}</p>
                           <p>💰 {vendor.price}</p>
                           <div className="reasoning-text">
                             <strong>Why this vendor:</strong> {vendor.reasoning}
                           </div>
                         </div>
                         <button 
                           className="select-vendor-btn"
                           onClick={() => handleVendorSelect(vendor)}
                         >
                           Select This Vendor
                         </button>
                       </div>
                     ))}
                   </div>
                 </div>
               )}

              {message.action === 'show_banana_vendors' && message.data && (
                <div className="vendor-selection">
                  <h4>🍌 Banana Vendor Recommendations:</h4>
                  <div className="vendors-grid">
                    {message.data.map((vendor) => (
                      <div key={vendor.id} className="vendor-option">
                        <div className="vendor-header">
                          <h5>{vendor.name}</h5>
                          <span className={`vendor-type ${vendor.type.toLowerCase()}`}>
                            {vendor.type === 'Moving' ? '🚚' : '🏪'} {vendor.type}
                          </span>
                        </div>
                        <div className="vendor-details">
                          <p>📍 {vendor.distance} • ⭐ {vendor.rating}</p>
                          <p>🕒 {vendor.estimatedDelivery}</p>
                          <p>📦 {vendor.items.join(', ')}</p>
                          <p>💰 {vendor.price}</p>
                          <p>🌱 {vendor.freshness}</p>
                          <div className="reasoning-text">
                            <strong>Why this vendor:</strong> {vendor.reasoning}
                          </div>
                        </div>
                        <button 
                          className="select-vendor-btn"
                          onClick={() => handleVendorSelect(vendor)}
                        >
                          Select This Vendor
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

                             {message.action === 'show_biryani_vendors' && message.data && (
                 <div className="vendor-selection">
                   <h4>🍛 Biryani Ingredients - Best Vendors:</h4>
                   <div className="vendors-grid">
                     {message.data.map((vendor) => (
                       <div key={vendor.id} className="vendor-option">
                         <div className="vendor-header">
                           <h5>{vendor.name}</h5>
                           <span className={`vendor-type ${vendor.type.toLowerCase()}`}>
                             {vendor.type === 'Moving' ? '🚚' : '🏪'} {vendor.type}
                           </span>
                         </div>
                         <div className="vendor-details">
                           <p>📍 {vendor.distance} • ⭐ {vendor.rating}</p>
                           <p>🕒 {vendor.estimatedDelivery}</p>
                           <p>💰 {vendor.price}</p>
                           <div className="reasoning-text">
                             <strong>Why this vendor:</strong> {vendor.reasoning}
                           </div>
                         </div>
                                                    <div className="vendor-items">
                             <h5>Available Items:</h5>
                             <div className="ai-autofill-notice">
                               🤖 AI Autofilled quantities for 4 people
                             </div>
                             {vendor.items.map((item, index) => {
                               const quantity = getItemQuantity(vendor.id, item);
                               const totalPrice = 100 * quantity; // Simplified price calculation
                               
                               return (
                                 <div key={index} className="item-row">
                                   <div className="item-info">
                                     <span className="item-name">{item}</span>
                                     <span className="item-price">₹100/kg</span>
                                   </div>
                                   <div className="item-actions">
                                     <input
                                       type="number"
                                       placeholder="Qty"
                                       min="0"
                                       value={quantity}
                                       onChange={(e) => handleQuantityChange(vendor.id, item, parseInt(e.target.value) || 0)}
                                       className="quantity-input"
                                     />
                                     <span className="total-price">₹{totalPrice}</span>
                                   </div>
                                 </div>
                               );
                             })}
                           </div>
                         <button 
                           className="place-order-btn"
                           onClick={() => handlePlaceOrder(vendor)}
                         >
                           Place Order
                         </button>
                       </div>
                     ))}
                   </div>
                 </div>
               )}

              {message.action === 'show_vendors' && message.data && (
                <div className="vendor-selection">
                  <h4>Top Vendor Recommendations:</h4>
                  <div className="vendors-grid">
                    {message.data.map((vendor) => (
                      <div key={vendor.id} className="vendor-option">
                        <div className="vendor-header">
                          <h5>{vendor.name}</h5>
                          <span className={`vendor-type ${vendor.type.toLowerCase()}`}>
                            {vendor.type === 'Moving' ? '🚚' : '🏪'} {vendor.type}
                          </span>
                        </div>
                        <div className="vendor-details">
                          <p>📍 {vendor.distance} • ⭐ {vendor.rating}</p>
                          <p>🕒 {vendor.estimatedDelivery}</p>
                          <p>📦 {vendor.items.join(', ')}</p>
                        </div>
                        <button 
                          className="select-vendor-btn"
                          onClick={() => handleVendorSelect(vendor)}
                        >
                          Select This Vendor
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
          
          {isTyping && (
            <div className="message agent typing">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        <div className="chat-input">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Tell me what you need... (e.g., 'I want to make biryani' or 'I need onions delivered')"
            className="message-input"
          />
          <button 
            onClick={handleSendMessage}
            className="send-btn"
            disabled={!inputMessage.trim()}
          >
            ➤
          </button>
        </div>
      </div>

      

      <div className="ai-features">
        <h3>🧠 AI Agent Capabilities</h3>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🎯</div>
            <h4>Smart Filtering</h4>
            <p>Automatically filters vendors based on your needs (distance, type, price)</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🚚</div>
            <h4>Auto-Requests</h4>
            <p>Sends requests to vendors automatically with your requirements</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">💡</div>
            <h4>Smart Insights</h4>
            <p>Provides additional suggestions based on context (flowers for guests, etc.)</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🗺️</div>
            <h4>Live Tracking</h4>
            <p>Shows real-time vendor location and delivery updates</p>
          </div>
        </div>
      </div>

      {/* Order Tracking Modal */}
      {showTracking && currentOrder && (
        <OrderTracking
          order={currentOrder}
          onClose={() => setShowTracking(false)}
        />
      )}
    </div>
  );
}

export default SmartBuy;
