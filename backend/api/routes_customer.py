from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import json
import os
from datetime import datetime

from agents.customer_agent import CustomerAgent

router = APIRouter(prefix="/customer", tags=["customer"])
customer_agent = CustomerAgent()

# Pydantic models
class CustomerLocation(BaseModel):
    latitude: float
    longitude: float
    address: Optional[str] = None

class SmartBuyRequest(BaseModel):
    request_text: str
    customer_location: CustomerLocation

class MovingVendorRequest(BaseModel):
    vendor_id: str
    items: List[Dict[str, Any]]
    customer_location: CustomerLocation

class VendorRatingRequest(BaseModel):
    vendor_id: str
    rating: float  # 1.0 to 5.0
    comment: Optional[str] = None
    customer_id: str = "C001"  # Mock customer ID for PoC

@router.post("/smartbuy")
async def process_smart_buy(request: SmartBuyRequest):
    """
    Process SmartBuy request and return vendor recommendations
    """
    try:
        result = customer_agent.process_smart_buy_request(
            request_text=request.request_text,
            customer_location=request.customer_location
        )
        
        if result["success"]:
            return {
                "success": True,
                "request": result["request"],
                "recommendations": result["recommendations"],
                "message": result["message"],
                "processed_at": datetime.now().isoformat()
            }
        else:
            return {
                "success": False,
                "error": result["error"],
                "suggestions": result.get("suggestions", [])
            }
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"SmartBuy processing error: {str(e)}")

@router.post("/request-moving-vendor")
async def request_moving_vendor(request: MovingVendorRequest):
    """
    Send request to moving vendor for delivery
    """
    try:
        result = customer_agent.request_moving_vendor(
            vendor_id=request.vendor_id,
            items=request.items,
            customer_location=request.customer_location
        )
        
        if result["success"]:
            return {
                "success": True,
                "vendor_accepted": result["vendor_accepted"],
                "vendor_name": result.get("vendor_name"),
                "phone": result.get("phone"),
                "estimated_delivery_time": result.get("estimated_delivery_time"),
                "distance": result.get("distance"),
                "message": result["message"],
                "requested_at": datetime.now().isoformat()
            }
        else:
            raise HTTPException(status_code=400, detail=result.get("error", "Moving vendor request failed"))
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Moving vendor request error: {str(e)}")

@router.get("/vendors/nearby")
async def get_nearby_vendors(
    latitude: float,
    longitude: float,
    radius_km: float = 2.0
):
    """
    Get all vendors within specified radius
    """
    try:
        customer_location = CustomerLocation(
            latitude=latitude,
            longitude=longitude
        )
        
        vendors = customer_agent.get_nearby_vendors(
            customer_location=customer_location,
            radius_km=radius_km
        )
        
        return {
            "success": True,
            "vendors": vendors,
            "total_vendors": len(vendors),
            "search_radius_km": radius_km,
            "customer_location": {
                "latitude": customer_location.latitude,
                "longitude": customer_location.longitude
            },
            "searched_at": datetime.now().isoformat()
        }
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Nearby vendors search error: {str(e)}")

@router.get("/vendors/{vendor_id}")
async def get_vendor_details(vendor_id: str):
    """
    Get detailed vendor information including inventory
    """
    try:
        # Load vendor data
        vendor_file = os.path.join("backend/data", "vendors.json")
        inventory_file = os.path.join("backend/data", "inventories_file.json")
        
        if not os.path.exists(vendor_file):
            raise HTTPException(status_code=404, detail="Vendor data not found")
        
        with open(vendor_file, 'r', encoding='utf-8') as f:
            vendors = json.load(f)
        
        vendor = next((v for v in vendors if v["vendor_id"] == vendor_id), None)
        
        if not vendor:
            raise HTTPException(status_code=404, detail="Vendor not found")
        
        # Load inventory data
        vendor_inventory = None
        inventory_file = os.path.join("backend/data", "inventories.json")
        if os.path.exists(inventory_file):
            with open(inventory_file, 'r', encoding='utf-8') as f:
                inventories = json.load(f)
            
            vendor_inventory = next((inv for inv in inventories if inv["vendor_id"] == vendor_id), None)
        
        # Prepare response
        vendor_details = {
            "vendor_id": vendor["vendor_id"],
            "name": vendor["name"],
            "phone": vendor["phone"],
            "location": vendor["location"],
            "type": vendor["type"],
            "rating": vendor["rating"],
            "total_ratings": vendor["total_ratings"],
            "specialties": vendor["specialties"],
            "operating_hours": vendor["operating_hours"],
            "status": vendor["status"],
            "last_active": vendor["last_active"],
            "inventory": vendor_inventory
        }
        
        return {
            "success": True,
            "vendor": vendor_details,
            "message": "Vendor details retrieved successfully"
        }
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Vendor details retrieval error: {str(e)}")

@router.post("/rate-vendor")
async def rate_vendor(request: VendorRatingRequest):
    """
    Rate a vendor (1.0 to 5.0 stars)
    """
    try:
        # Load vendor data
        vendor_file = os.path.join("backend/data", "vendors.json")
        
        if not os.path.exists(vendor_file):
            raise HTTPException(status_code=404, detail="Vendor data not found")
        
        with open(vendor_file, 'r', encoding='utf-8') as f:
            vendors = json.load(f)
        
        # Find vendor
        vendor = next((v for v in vendors if v["vendor_id"] == request.vendor_id), None)
        
        if not vendor:
            raise HTTPException(status_code=404, detail="Vendor not found")
        
        # Validate rating
        if not 1.0 <= request.rating <= 5.0:
            raise HTTPException(status_code=400, detail="Rating must be between 1.0 and 5.0")
        
        # Update vendor rating
        current_rating = vendor["rating"]
        current_count = vendor["total_ratings"]
        
        # Calculate new average rating
        new_count = current_count + 1
        new_rating = ((current_rating * current_count) + request.rating) / new_count
        
        vendor["rating"] = round(new_rating, 1)
        vendor["total_ratings"] = new_count
        
        # Save updated data
        with open(vendor_file, 'w', encoding='utf-8') as f:
            json.dump(vendors, f, indent=2, ensure_ascii=False)
        
        return {
            "success": True,
            "message": "Vendor rated successfully",
            "vendor_id": request.vendor_id,
            "new_rating": vendor["rating"],
            "total_ratings": vendor["total_ratings"],
            "rated_at": datetime.now().isoformat()
        }
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Vendor rating error: {str(e)}")

@router.get("/leaderboard")
async def get_vendor_leaderboard(location_lat: float, location_lng: float, radius_km: float = 5.0):
    """
    Get vendor leaderboard for a specific area
    """
    try:
        customer_location = CustomerLocation(
            latitude=location_lat,
            longitude=location_lng
        )
        
        # Get nearby vendors
        vendors = customer_agent.get_nearby_vendors(
            customer_location=customer_location,
            radius_km=radius_km
        )
        
        # Sort by rating (highest first)
        vendors.sort(key=lambda x: x["rating"], reverse=True)
        
        # Take top 10
        top_vendors = vendors[:10]
        
        return {
            "success": True,
            "leaderboard": top_vendors,
            "location": {
                "latitude": customer_location.latitude,
                "longitude": customer_location.longitude
            },
            "radius_km": radius_km,
            "total_vendors": len(vendors),
            "generated_at": datetime.now().isoformat()
        }
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Leaderboard generation error: {str(e)}")

@router.get("/search")
async def search_vendors(
    query: str,
    latitude: float,
    longitude: float,
    radius_km: float = 2.0
):
    """
    Search vendors by item name or specialty
    """
    try:
        customer_location = CustomerLocation(
            latitude=latitude,
            longitude=longitude
        )
        
        # Use the new search method from customer agent
        matching_vendors = customer_agent.search_vendors(
            query=query,
            customer_location=customer_location,
            radius_km=radius_km
        )
        
        return {
            "success": True,
            "query": query,
            "matching_vendors": matching_vendors,
            "total_matches": len(matching_vendors),
            "search_location": {
                "latitude": customer_location.latitude,
                "longitude": customer_location.longitude
            },
            "radius_km": radius_km,
            "searched_at": datetime.now().isoformat()
        }
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Vendor search error: {str(e)}")
