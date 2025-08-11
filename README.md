```
/vendee/
├── backend/
│   ├── app.py                # FastAPI backend
│   ├── agents/
│   │   ├── vendor_agent.py    # Real LangGraph agent logic
│   │   └── customer_agent.py  # Real LangGraph agent logic
│   ├── vision/
│   │   ├── yolo_detector.py   # Real YOLO detection code
│   ├── mock_data/
│   │   ├── vendors.json       # Mock vendor list
│   │   └── routes.json        # Mock vendor paths
│   ├── utils/
│   │   ├── location_utils.py  # Mock geolocation helpers
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── App.js             # React main file
│   │   ├── components/
│   │   │   ├── VendorMap.js   # Mock map UI
│   │   │   └── ChatUI.js      # Real agent chat UI
│   │   └── mock_services.js   # Mock API calls
├── README.md
```
