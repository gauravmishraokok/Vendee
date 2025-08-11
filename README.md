```
vendee-app/
│
├── backend/
│   ├── agents/
│   │   ├── vendor_agent.py          # LangGraph + Watson AI vendor agent logic (REAL)
│   │   ├── customer_agent.py        # LangGraph + Watson AI customer agent logic (REAL)
│   │   └── agent_config.yaml        # Config for LangGraph nodes, tools, and agent orchestration
│   │
│   ├── services/
│   │   ├── yolo_detector.py         # YOLO-based real object detection pipeline (REAL)
│   │   ├── mock_vendor_db.py        # Static JSON for vendor/product data (MOCK)
│   │   ├── mock_location_service.py # Mock GPS & geolocation results (MOCK)
│   │   └── mock_weather_service.py  # Mock weather data (MOCK)
│   │
│   ├── api/
│   │   ├── routes_vendor.py         # Flask/FastAPI endpoints for vendor operations
│   │   ├── routes_customer.py       # Flask/FastAPI endpoints for customer operations
│   │   └── routes_agent.py          # Endpoints to trigger agent interactions
│   │
│   ├── main.py                      # App entrypoint (Flask/FastAPI)
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── VendorOnboard.jsx    # UI for vendor onboarding (mocked success)
│   │   │   ├── CustomerSearch.jsx   # Search UI for customers
│   │   │   └── ChatWithAgent.jsx    # Chat interface with agent (REAL agent API)
│   │   │
│   │   ├── components/
│   │   │   ├── MockMap.jsx          # Shows static vendor map (MOCK)
│   │   │   └── ProductList.jsx      # Displays mocked detected items
│   │   │
│   │   ├── utils/
│   │   │   └── api.js               # Handles API requests to backend
│   │   │
│   │   └── App.jsx
│   │
│   └── package.json
│
└── README.md
```
