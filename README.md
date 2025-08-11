# 🍎 Vendee - AI-Powered Street Vendor Marketplace

An intelligent platform that connects street vendors with customers using computer vision, natural language processing, and intelligent routing to create a live, hyper-local marketplace.

## 🚀 Features

### For Vendors
- **AI-Powered Inventory Detection**: Upload cart photos and automatically detect items
- **Easy Management**: Set prices, update status, and manage inventory
- **Customer Reach**: Get discovered by nearby customers looking for your products
- **Analytics**: Track performance and customer ratings

### For Customers
- **SmartBuy AI**: Natural language requests like "I want 2kg bananas delivered to my home"
- **Live Vendor Map**: Find nearby vendors with real-time inventory
- **Moving Vendor Delivery**: Request delivery from mobile vendors
- **Vendor Ratings**: Rate and review vendors to help others

## 🏗️ Architecture

- **Backend**: FastAPI with Python agents (rule-based for PoC, ready for LangGraph + Watsonx.ai)
- **Frontend**: React with Vite, modern UI components
- **Computer Vision**: Hugging Face model for item detection (existing YOLO detector)
- **Data Storage**: JSON files for PoC (easily replaceable with real databases)

## 📋 Prerequisites

- Python 3.10+
- Node.js 18+
- Git

## 🛠️ Setup Instructions

### 1. Clone and Setup Backend

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 2. Setup Frontend

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install
```

### 3. Start the Application

#### Start Backend (Terminal 1)
```bash
cd backend
# Activate virtual environment if not already active
python main.py
```

The backend will start at `http://localhost:8000`

#### Start Frontend (Terminal 2)
```bash
cd frontend
npm run dev
```

The frontend will start at `http://localhost:5173`

## 🎯 How to Use

### Vendor Onboarding
1. Go to `/vendor/onboard`
2. Enter phone number, business name, and location
3. Get your unique vendor ID
4. Upload cart photos for AI-powered inventory detection

### Customer Experience
1. Go to `/customer/search` to browse nearby vendors
2. Use `/customer/chat` for SmartBuy AI assistance
3. Search for specific items or request delivery

### SmartBuy Examples
- "I need tomatoes and onions"
- "2kg bananas delivered to my home"
- "Looking for fresh fruits"
- "Where can I find flowers?"

## 🔧 API Endpoints

### Vendor APIs
- `POST /vendor/onboard` - Vendor registration
- `POST /vendor/inventory/detect` - Image analysis
- `POST /vendor/inventory/update` - Update inventory
- `POST /vendor/status` - Update vendor status

### Customer APIs
- `POST /customer/smartbuy` - Process SmartBuy requests
- `GET /customer/vendors/nearby` - Find nearby vendors
- `POST /customer/request-moving-vendor` - Request delivery

## 📁 Project Structure

```
vendee-app/
├── backend/
│   ├── agents/           # AI agents (vendor & customer)
│   ├── api/             # FastAPI routes
│   ├── data/            # Mock JSON databases
│   ├── services/        # Computer vision & utilities
│   └── main.py          # FastAPI application
├── frontend/
│   ├── src/
│   │   ├── pages/       # React page components
│   │   ├── utils/       # API utilities
│   │   └── App.jsx      # Main application
│   └── package.json
└── README.md
```

## 🧪 PoC Features

### Currently Implemented
- ✅ Complete vendor onboarding flow
- ✅ AI-powered cart image analysis
- ✅ Inventory management with pricing
- ✅ Customer search and vendor discovery
- ✅ SmartBuy AI chat interface
- ✅ Moving vendor delivery requests
- ✅ Vendor rating system
- ✅ Mock data with realistic scenarios

### Ready for Production
- 🔄 Replace rule-based agents with LangGraph + Watsonx.ai
- 🔄 Replace JSON files with real databases
- 🔄 Add real-time notifications
- 🔄 Implement payment processing
- 🔄 Add user authentication

## 🚀 Future Enhancements

- **Real-time GPS tracking** for moving vendors
- **Advanced analytics** and demand forecasting
- **Multi-language support** for diverse vendor communities
- **Mobile apps** for iOS and Android
- **Integration** with delivery services and payment gateways

## 🤝 Contributing

This is a proof-of-concept implementation. The architecture is designed to be easily extended with:
- Real AI agents using LangGraph and Watsonx.ai
- Production databases (PostgreSQL, MongoDB)
- Real-time communication (WebSockets, Redis)
- Cloud deployment (AWS, Azure, GCP)

## 📄 License

This project is for demonstration purposes. Please ensure proper licensing for production use.

## 🆘 Support

For questions or issues:
1. Check the API documentation at `http://localhost:8000/docs`
2. Review the console logs for debugging
3. Ensure all dependencies are properly installed

---

**Vendee** - Connecting Street Vendors with Customers, One AI-Powered Interaction at a Time! 🚚🍎
