import json
import os
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
from PIL import Image
import io
import base64

class VendorAgent:
    """
    Vendor Agent - Handles vendor onboarding, image analysis, and inventory management.
    Currently uses rule-based logic, designed to be replaced with LangGraph + Watsonx.ai
    """
    
    def __init__(self):
        self.data_dir = "data"
        self.vendors_file = os.path.join(self.data_dir, "vendors.json")
        self.inventories_file = os.path.join(self.data_dir, "inventories.json")
        self.unmet_demand_file = os.path.join(self.data_dir, "unmet_demand.json")
        
    def _load_json_data(self, file_path: str) -> List[Dict]:
        """Load JSON data from file"""
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                return json.load(f)
        except FileNotFoundError:
            return []
    
    def _save_json_data(self, file_path: str, data: List[Dict]):
        """Save JSON data to file"""
        os.makedirs(os.path.dirname(file_path), exist_ok=True)
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
    
    def onboard_vendor(self, phone: str, name: str, location: Dict[str, float]) -> Dict[str, Any]:
        """
        Onboard a new vendor
        Returns: vendor_id and success status
        """
        vendors = self._load_json_data(self.vendors_file)
        
        # Generate unique vendor ID
        vendor_id = f"V{str(len(vendors) + 1).zfill(3)}"
        
        new_vendor = {
            "vendor_id": vendor_id,
            "name": name,
            "phone": phone,
            "location": location,
            "status": "active",
            "type": "stationary",  # Default to stationary
            "rating": 0.0,
            "total_ratings": 0,
            "specialties": [],
            "operating_hours": "06:00-20:00",
            "onboarded_date": datetime.now(timezone.utc).strftime("%Y-%m-%d"),
            "last_active": datetime.now(timezone.utc).isoformat()
        }
        
        vendors.append(new_vendor)
        self._save_json_data(self.vendors_file, vendors)
        
        return {
            "success": True,
            "vendor_id": vendor_id,
            "message": "Vendor onboarded successfully"
        }
    
    def analyze_cart_image(self, image_data: str, vendor_id: str) -> Dict[str, Any]:
        """
        Analyze vendor cart image for item detection
        Returns: detected items list and analysis results
        """
        try:
            # Decode base64 image
            image_bytes = base64.b64decode(image_data.split(',')[1])
            image = Image.open(io.BytesIO(image_bytes))
            
            # Check image quality (basic blur detection)
            if self._is_image_blurry(image):
                return {
                    "success": False,
                    "error": "Image is blurry. Please upload a clear image.",
                    "items": []
                }
            
            # Ensure uploads directory exists and save the uploaded image for later reference
            os.makedirs("uploads", exist_ok=True)
            saved_image_path = os.path.join("uploads", f"{vendor_id}_cart_{datetime.now().strftime('%Y%m%d_%H%M%S')}.jpg")
            image.save(saved_image_path, format="JPEG")

            # Use the HF-backed detector to classify items with confidences
            from services.yolo_detector import analyze_vendor_cart
            # Pass the in-memory PIL image to avoid extra disk I/O during inference
            detections = analyze_vendor_cart(image, top_k=3, min_confidence=0.3)
            
            # Convert to inventory format
            inventory_items: List[Dict[str, Any]] = []
            for det in detections:
                inventory_items.append({
                    "name": det.get("name", "unknown"),
                    "quantity": "1 kg",
                    "price_per_unit": 0,
                    "unit": "kg",
                    "freshness": "fresh",
                    "detection_confidence": float(det.get("confidence", 0.0)),
                })
            
            return {
                "success": True,
                "items": inventory_items,
                "total_items": len(inventory_items),
                "image_quality": "good",
                "image_url": f"/uploads/{os.path.basename(saved_image_path)}"
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": f"Image analysis failed: {str(e)}",
                "items": []
            }
    
    def _is_image_blurry(self, image: Image.Image) -> bool:
        """
        Basic image blur detection
        Returns: True if image appears blurry
        """
        # Simple edge detection for blur check
        try:
            # Convert to grayscale
            gray = image.convert('L')
            
            # Calculate variance of Laplacian (blur metric)
            import numpy as np
            laplacian = np.array(gray).var()
            
            # Threshold for blur detection (adjust as needed)
            return laplacian < 100  # Lower values indicate more blur
            
        except:
            # If blur detection fails, assume image is OK
            return False
    
    def update_inventory(self, vendor_id: str, items: List[Dict], image_url: str = None) -> Dict[str, Any]:
        """
        Update vendor inventory with new items and prices
        """
        inventories = self._load_json_data(self.inventories_file)
        
        # Find existing inventory or create new
        existing_inv = None
        for inv in inventories:
            if inv["vendor_id"] == vendor_id:
                existing_inv = inv
                break
        
        if existing_inv:
            # Update existing inventory
            existing_inv["items"] = items
            existing_inv["last_updated"] = datetime.now(timezone.utc).isoformat()
            if image_url:
                existing_inv["image_url"] = image_url
        else:
            # Create new inventory
            new_inventory = {
                "vendor_id": vendor_id,
                "last_updated": datetime.now(timezone.utc).isoformat(),
                "image_url": image_url or f"/uploads/{vendor_id}_cart_{datetime.now().strftime('%Y%m%d')}.jpg",
                "items": items,
                "total_items": len(items),
                "estimated_value": sum(item.get("price_per_unit", 0) for item in items)
            }
            inventories.append(new_inventory)
        
        self._save_json_data(self.inventories_file, inventories)
        
        return {
            "success": True,
            "message": "Inventory updated successfully",
            "total_items": len(items)
        }
    
    def update_vendor_status(self, vendor_id: str, status_updates: Dict[str, Any]) -> Dict[str, Any]:
        """
        Update vendor status (moving/stationary, open/closed, location)
        """
        vendors = self._load_json_data(self.vendors_file)
        
        for vendor in vendors:
            if vendor["vendor_id"] == vendor_id:
                # Update allowed fields
                allowed_fields = ["type", "status", "location", "operating_hours"]
                for field in allowed_fields:
                    if field in status_updates:
                        vendor[field] = status_updates[field]
                
                vendor["last_active"] = datetime.now(timezone.utc).isoformat()
                break
        
        self._save_json_data(self.vendors_file, vendors)
        
        return {
            "success": True,
            "message": "Vendor status updated successfully"
        }
    
    def get_demand_suggestions(self, vendor_id: str) -> List[Dict[str, Any]]:
        """
        Get suggestions for items to stock based on unmet demand
        """
        unmet_demand = self._load_json_data(self.unmet_demand_file)
        
        # Filter high priority items
        high_priority = [item for item in unmet_demand if item["priority"] == "high"]
        
        # Sort by total requests
        high_priority.sort(key=lambda x: x["total_requests"], reverse=True)
        
        return high_priority[:3]  # Top 3 suggestions
    
    def get_vendor_analytics(self, vendor_id: str) -> Dict[str, Any]:
        """
        Get vendor performance analytics
        """
        vendors = self._load_json_data(self.vendors_file)
        inventories = self._load_json_data(self.inventories_file)
        
        vendor = next((v for v in vendors if v["vendor_id"] == vendor_id), None)
        inventory = next((inv for inv in inventories if inv["vendor_id"] == vendor_id), None)
        
        if not vendor:
            return {"success": False, "error": "Vendor not found"}
        
        analytics = {
            "vendor_id": vendor_id,
            "name": vendor["name"],
            "rating": vendor["rating"],
            "total_ratings": vendor["total_ratings"],
            "type": vendor["type"],
            "status": vendor["status"],
            "last_active": vendor["last_active"]
        }
        
        if inventory:
            analytics["current_items"] = inventory["total_items"]
            analytics["estimated_value"] = inventory["estimated_value"]
            analytics["last_inventory_update"] = inventory["last_updated"]
        
        return analytics
