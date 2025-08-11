from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

from api.routes_vendor import router as vendor_router
from api.routes_customer import router as customer_router

# Create FastAPI app
app = FastAPI(
    title="Vendee API",
    description="AI-powered street vendor marketplace platform",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],  # Frontend URLs
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(vendor_router)
app.include_router(customer_router)

# Health check endpoint
@app.get("/")
async def root():
    return {
        "message": "Welcome to Vendee API",
        "version": "1.0.0",
        "status": "running",
        "endpoints": {
            "vendor": "/vendor",
            "customer": "/customer",
            "docs": "/docs"
        }
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": "2024-01-20T10:00:00Z"
    }

# Create uploads directory if it doesn't exist
os.makedirs("uploads", exist_ok=True)

# Mount static files for uploads
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
