from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import json
import os
from datetime import datetime

from agents.vendor_agent import VendorAgent

router = APIRouter(prefix="/vendor", tags=["vendor"])
vendor_agent = VendorAgent()

# Pydantic models
class VendorOnboardRequest(BaseModel):
    phone: str
    name: str
    location: Dict[str, float]

class InventoryUpdateRequest(BaseModel):
    vendor_id: str
    items: List[Dict[str, Any]]
    image_url: Optional[str] = None

class VendorStatusUpdate(BaseModel):
    vendor_id: str
    type: Optional[str] = None  # "stationary" or "moving"
    status: Optional[str] = None  # "active" or "closed"
    location: Optional[Dict[str, float]] = None
    operating_hours: Optional[str] = None

class CartImageAnalysisRequest(BaseModel):
    vendor_id: str
    image_data: str  # Base64 encoded image

@router.post("/onboard")
async def onboard_vendor(request: VendorOnboardRequest):
    """
    Onboard a new vendor with phone number and location
    """
    try:
        result = vendor_agent.onboard_vendor(
            phone=request.phone,
            name=request.name,
            location=request.location
        )
        
        if result["success"]:
            return {
                "success": True,
                "vendor_id": result["vendor_id"],
                "message": result["message"],
                "data": {
                    "vendor_id": result["vendor_id"],
                    "name": request.name,
                    "phone": request.phone,
                    "location": request.location,
                    "onboarded_at": datetime.now().isoformat()
                }
            }
        else:
            raise HTTPException(status_code=400, detail=result.get("error", "Onboarding failed"))
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Onboarding error: {str(e)}")

@router.post("/inventory/detect")
async def analyze_cart_image(request: CartImageAnalysisRequest):
    """
    Analyze vendor cart image to detect items
    """
    try:
        result = vendor_agent.analyze_cart_image(
            image_data=request.image_data,
            vendor_id=request.vendor_id
        )
        
        if result["success"]:
            return {
                "success": True,
                "items": result["items"],
                "total_items": result["total_items"],
                "image_quality": result["image_quality"],
                "message": "Image analyzed successfully"
            }
        else:
            return {
                "success": False,
                "error": result["error"],
                "items": []
            }
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Image analysis error: {str(e)}")

@router.post("/inventory/update")
async def update_inventory(request: InventoryUpdateRequest):
    """
    Update vendor inventory with detected items and prices
    """
    try:
        result = vendor_agent.update_inventory(
            vendor_id=request.vendor_id,
            items=request.items,
            image_url=request.image_url
        )
        
        if result["success"]:
            return {
                "success": True,
                "message": result["message"],
                "total_items": result["total_items"],
                "updated_at": datetime.now().isoformat()
            }
        else:
            raise HTTPException(status_code=400, detail=result.get("error", "Inventory update failed"))
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Inventory update error: {str(e)}")

@router.post("/status")
async def update_vendor_status(request: VendorStatusUpdate):
    """
    Update vendor status (moving/stationary, open/closed, location)
    """
    try:
        status_updates = {}
        if request.type:
            status_updates["type"] = request.type
        if request.status:
            status_updates["status"] = request.status
        if request.location:
            status_updates["location"] = request.location
        if request.operating_hours:
            status_updates["operating_hours"] = request.operating_hours
        
        if not status_updates:
            raise HTTPException(status_code=400, detail="No status updates provided")
        
        result = vendor_agent.update_vendor_status(
            vendor_id=request.vendor_id,
            status_updates=status_updates
        )
        
        if result["success"]:
            return {
                "success": True,
                "message": result["message"],
                "updated_at": datetime.now().isoformat()
            }
        else:
            raise HTTPException(status_code=400, detail=result.get("error", "Status update failed"))
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Status update error: {str(e)}")

@router.get("/{vendor_id}/analytics")
async def get_vendor_analytics(vendor_id: str):
    """
    Get vendor performance analytics
    """
    try:
        result = vendor_agent.get_vendor_analytics(vendor_id)
        
        if result["success"]:
            return {
                "success": True,
                "analytics": result
            }
        else:
            raise HTTPException(status_code=404, detail=result.get("error", "Vendor not found"))
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analytics error: {str(e)}")

@router.get("/{vendor_id}/demand-suggestions")
async def get_demand_suggestions(vendor_id: str):
    """
    Get suggestions for items to stock based on unmet demand
    """
    try:
        suggestions = vendor_agent.get_demand_suggestions(vendor_id)
        
        return {
            "success": True,
            "suggestions": suggestions,
            "message": f"Found {len(suggestions)} demand suggestions"
        }
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Demand suggestions error: {str(e)}")

@router.get("/{vendor_id}/inventory")
async def get_vendor_inventory(vendor_id: str):
    """
    Get current vendor inventory
    """
    try:
        # Load inventory data
        inventory_file = os.path.join("data", "inventories.json")
        if not os.path.exists(inventory_file):
            raise HTTPException(status_code=404, detail="Inventory data not found")
        
        with open(inventory_file, 'r', encoding='utf-8') as f:
            inventories = json.load(f)
        
        vendor_inventory = next((inv for inv in inventories if inv["vendor_id"] == vendor_id), None)
        
        if not vendor_inventory:
            return {
                "success": True,
                "inventory": None,
                "message": "No inventory found for this vendor"
            }
        
        return {
            "success": True,
            "inventory": vendor_inventory,
            "message": "Inventory retrieved successfully"
        }
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Inventory retrieval error: {str(e)}")
