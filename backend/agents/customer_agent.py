import json
import os
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
from geopy.distance import geodesic
from services.watson_ai_service import WatsonAIService

class CustomerAgent:
    """
    Customer Agent - Handles SmartBuy requests, vendor matching, and moving vendor coordination.
    Currently uses rule-based logic, designed to be replaced with LangGraph + Watsonx.ai
    """
    
    def __init__(self):
        self.data_dir = "data"
        self.vendors_file = os.path.join(self.data_dir, "vendors.json")
        self.inventories_file = os.path.join(self.data_dir, "inventories.json")
        self.requests_file = os.path.join(self.data_dir, "requests.json")
        self.unmet_demand_file = os.path.join(self.data_dir, "unmet_demand.json")
        self.watson_ai = WatsonAIService()
    
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
    
    def _extract_coordinates(self, customer_location: Any) -> tuple[float, float]:
        """Extract latitude and longitude from customer_location (handles both dict and CustomerLocation model)"""
        if hasattr(customer_location, 'latitude') and hasattr(customer_location, 'longitude'):
            # CustomerLocation model
            return customer_location.latitude, customer_location.longitude
        elif isinstance(customer_location, dict) and 'latitude' in customer_location and 'longitude' in customer_location:
            # Dictionary format
            return customer_location['latitude'], customer_location['longitude']
        else:
            raise ValueError("Invalid customer_location format. Expected CustomerLocation model or dict with latitude/longitude")
    
    def parse_smart_buy_request(self, request_text: str) -> Dict[str, Any]:
        """
        Parse natural language request to extract items and requirements
        Returns: structured request data
        """
        # Simple rule-based parsing (can be replaced with LLM)
        request_text = request_text.lower()
        
        # Extract quantities and units
        import re
        quantity_pattern = r'(\d+)\s*(kg|g|pieces?|bunches?)'
        quantities = re.findall(quantity_pattern, request_text)
        
        # Extract common items
        items = []
        common_items = [
            "banana", "apple", "tomato", "onion", "potato", "carrot", 
            "coriander", "mint", "orange", "rose", "marigold", "mango", 
            "cucumber", "sunflower", "grapes", "cauliflower", "almonds", "cashews"
        ]
        
        for item in common_items:
            if item in request_text:
                # Find matching quantity
                quantity = "1 kg"  # Default
                unit = "kg"
                
                for qty, unit_type in quantities:
                    if unit_type in ["kg", "g"]:
                        quantity = f"{qty} {unit_type}"
                        unit = unit_type
                    elif unit_type in ["pieces", "piece"]:
                        quantity = f"{qty} pieces"
                        unit = "piece"
                    elif unit_type in ["bunches", "bunch"]:
                        quantity = f"{qty} bunches"
                        unit = "bunch"
                
                items.append({
                    "name": item,
                    "quantity": quantity,
                    "unit": unit
                })
        
        # Check if delivery is requested
        delivery_requested = any(word in request_text for word in ["deliver", "delivery", "home", "house"])
        
        return {
            "items": items,
            "delivery_requested": delivery_requested,
            "original_request": request_text,
            "parsed_successfully": len(items) > 0
        }
    
    def find_matching_vendors(self, items: List[Dict], customer_location: Any, 
                            vendor_type: str = None) -> List[Dict[str, Any]]:
        """
        Find vendors that match the requested items
        Returns: ranked list of matching vendors
        """
        vendors = self._load_json_data(self.vendors_file)
        inventories = self._load_json_data(self.inventories_file)
        
        matching_vendors = []
        
        for vendor in vendors:
            # Check vendor type if specified
            if vendor_type and vendor["type"] != vendor_type:
                continue
            
            # Check if vendor is active
            if vendor["status"] != "active":
                continue
            
            # Find vendor inventory
            vendor_inventory = next((inv for inv in inventories if inv["vendor_id"] == vendor["vendor_id"]), None)
            if not vendor_inventory:
                continue
            
            # Check item availability
            available_items = []
            total_price = 0
            
            for requested_item in items:
                for inventory_item in vendor_inventory["items"]:
                    if inventory_item["name"] == requested_item["name"]:
                        available_items.append({
                            "name": inventory_item["name"],
                            "quantity": inventory_item["quantity"],
                            "price_per_unit": inventory_item["price_per_unit"],
                            "unit": inventory_item["unit"]
                        })
                        total_price += inventory_item["price_per_unit"]
                        break
            
            # If vendor has at least one requested item
            if available_items:
                # Calculate distance
                vendor_location = vendor["location"]
                lat, lng = self._extract_coordinates(customer_location)
                distance = geodesic(
                    (lat, lng),
                    (vendor_location["latitude"], vendor_location["longitude"])
                ).kilometers
                
                # Calculate match score (lower is better)
                match_score = distance * 0.5 + (len(items) - len(available_items)) * 2
                
                matching_vendors.append({
                    "vendor_id": vendor["vendor_id"],
                    "name": vendor["name"],
                    "phone": vendor["phone"],
                    "location": vendor["location"],
                    "type": vendor["type"],  # Add vendor type
                    "rating": vendor["rating"],
                    "distance": round(distance, 2),
                    "available_items": available_items,
                    "total_price": total_price,
                    "match_score": match_score,
                    "image_url": vendor_inventory.get("image_url", "")
                })
        
        # Sort by match score (best matches first)
        matching_vendors.sort(key=lambda x: x["match_score"])
        
        return matching_vendors[:3]  # Top 3 matches
    
    def process_smart_buy_request(self, request_text: str, customer_location: Any) -> Dict[str, Any]:
        """
        Process SmartBuy request using Watson AI and return vendor recommendations
        """
        # Use Watson AI for enhanced parsing
        ai_result = self.watson_ai.process_smart_buy_request(request_text, customer_location)
        
        if not ai_result["success"]:
            return ai_result
        
        parsed_request = ai_result["parsed_request"]
        
        # Find all matching vendors regardless of type first
        all_matching_vendors = self.find_matching_vendors(
            parsed_request["items"], 
            customer_location, 
            None  # Don't filter by type initially
        )
        
        # Separate by type
        stationary_vendors = [v for v in all_matching_vendors if v.get("type") == "stationary"]
        moving_vendors = [v for v in all_matching_vendors if v.get("type") == "moving"]
        
        # If delivery is requested, prioritize moving vendors
        if parsed_request["delivery_requested"] and moving_vendors:
            moving_vendors = moving_vendors[:2]
        else:
            moving_vendors = moving_vendors[:1]  # Show fewer moving vendors for pickup requests
        
        # Always show some stationary vendors for pickup
        stationary_vendors = stationary_vendors[:2]
        
        # Combine all vendors for AI-powered recommendations
        all_vendors = stationary_vendors + moving_vendors
        
        # Get AI-powered vendor recommendations
        ai_recommendations = self.watson_ai.get_vendor_recommendations(parsed_request, all_vendors)
        
        # Generate AI-powered response
        ai_message = self.watson_ai.generate_ai_response(parsed_request, ai_recommendations)
        
        # Prepare response
        response = {
            "success": True,
            "request": parsed_request,
            "ai_confidence": ai_result.get("ai_confidence", 0.8),
            "recommendations": {
                "stationary_vendors": stationary_vendors[:2],  # Top 2 stationary
                "moving_vendors": moving_vendors[:2] if moving_vendors else [],
                "ai_recommendations": ai_recommendations[:3]  # Top 3 AI recommendations
            },
            "message": ai_message,
            "processed_by": "Watson AI"
        }
        
        # Track unmet demand if no vendors found
        if not stationary_vendors and not moving_vendors:
            self._track_unmet_demand(parsed_request["items"], customer_location)
        
        return response
    
    def _generate_response_message(self, parsed_request: Dict, stationary_vendors: List, moving_vendors: List) -> str:
        """Generate human-readable response message"""
        if not stationary_vendors and not moving_vendors:
            return f"Sorry, I couldn't find any vendors selling {', '.join([item['name'] for item in parsed_request['items']])} in your area."
        
        message = f"I found vendors for your request: {', '.join([item['name'] for item in parsed_request['items']])}\n\n"
        
        if stationary_vendors:
            message += "🏪 **Stationary Vendors:**\n"
            for i, vendor in enumerate(stationary_vendors[:2], 1):
                message += f"{i}. {vendor['name']} - {vendor['distance']}km away, Rating: {vendor['rating']}⭐\n"
                message += f"   Items: {', '.join([item['name'] for item in vendor['available_items']])}\n"
                message += f"   Total: ₹{vendor['total_price']}\n\n"
        
        if moving_vendors and parsed_request["delivery_requested"]:
            message += "🚚 **Moving Vendors (Delivery Available):**\n"
            for i, vendor in enumerate(moving_vendors[:2], 1):
                message += f"{i}. {vendor['name']} - {vendor['distance']}km away, Rating: {vendor['rating']}⭐\n"
                message += f"   Items: {', '.join([item['name'] for item in vendor['available_items']])}\n"
                message += f"   Total: ₹{vendor['total_price']}\n\n"
        
        return message
    
    def request_moving_vendor(self, vendor_id: str, items: List[Dict], 
                            customer_location: Any) -> Dict[str, Any]:
        """
        Send request to moving vendor for delivery
        Returns: request status and vendor response
        """
        vendors = self._load_json_data(self.vendors_file)
        vendor = next((v for v in vendors if v["vendor_id"] == vendor_id), None)
        
        if not vendor:
            return {"success": False, "error": "Vendor not found"}
        
        if vendor["type"] != "moving":
            return {"success": False, "error": "Vendor is not a moving vendor"}
        
        # Calculate distance and estimated delivery time
        vendor_location = vendor["location"]
        lat, lng = self._extract_coordinates(customer_location)
        distance = geodesic(
            (lat, lng),
            (vendor_location["latitude"], vendor_location["longitude"])
        ).kilometers
        
        estimated_time = int(distance * 3)  # Rough estimate: 3 min per km
        
        # Simulate vendor response (in real app, this would be async)
        import random
        vendor_accepts = random.choice([True, False])  # 50% chance for demo
        
        if vendor_accepts:
            # Create request record
            request_data = {
                "request_id": f"R{datetime.now().strftime('%Y%m%d%H%M%S')}",
                "customer_id": "C001",  # Mock customer ID
                "customer_location": customer_location,
                "request_type": "moving_vendor",
                "items_requested": items,
                "status": "accepted",
                "created_at": datetime.now(timezone.utc).isoformat(),
                "vendor_offers": [{
                    "vendor_id": vendor_id,
                    "vendor_name": vendor["name"],
                    "status": "accepted",
                    "offered_at": datetime.now(timezone.utc).isoformat(),
                    "estimated_delivery_time": f"{estimated_time} minutes",
                    "distance": round(distance, 2)
                }],
                "total_offers_sent": 1,
                "max_retries": 3
            }
            
            # Save request
            requests = self._load_json_data(self.requests_file)
            requests.append(request_data)
            self._save_json_data(self.requests_file, requests)
            
            return {
                "success": True,
                "vendor_accepted": True,
                "vendor_name": vendor["name"],
                "phone": vendor["phone"],
                "estimated_delivery_time": f"{estimated_time} minutes",
                "distance": round(distance, 2),
                "message": f"Great! {vendor['name']} has accepted your delivery request. They will arrive in approximately {estimated_time} minutes."
            }
        else:
            return {
                "success": True,
                "vendor_accepted": False,
                "message": f"{vendor['name']} is currently busy and cannot accept your request. Would you like me to find another moving vendor?"
            }
    
    def _track_unmet_demand(self, items: List[Dict], customer_location: Any):
        """Track unmet demand for analytics"""
        unmet_demand = self._load_json_data(self.unmet_demand_file)
        
        for item in items:
            # Find existing demand or create new
            existing_demand = next((d for d in unmet_demand if d["item_name"] == item["name"]), None)
            
            if existing_demand:
                existing_demand["total_requests"] += 1
                existing_demand["last_requested"] = datetime.now(timezone.utc).isoformat()
                
                                # Add location if not exists
                lat, lng = self._extract_coordinates(customer_location)
                location_exists = any(
                    loc["latitude"] == lat and 
                    loc["longitude"] == lng 
                    for loc in existing_demand["locations"]
                )
                
                if not location_exists:
                    existing_demand["locations"].append({
                        "latitude": lat,
                        "longitude": lng,
                        "request_count": 1
                    })
                else:
                    # Update existing location count
                    for loc in existing_demand["locations"]:
                        if (loc["latitude"] == lat and
                            loc["longitude"] == lng):
                            loc["request_count"] += 1
                            break
            else:
                # Create new demand entry
                new_demand = {
                    "demand_id": f"D{str(len(unmet_demand) + 1).zfill(3)}",
                    "item_name": item["name"],
                    "total_requests": 1,
                    "last_requested": datetime.now(timezone.utc).isoformat(),
                    "locations": [{
                        "latitude": customer_location["latitude"],
                        "longitude": customer_location["longitude"],
                        "request_count": 1
                    }],
                    "avg_max_price": 100,  # Default
                    "priority": "medium"
                }
                unmet_demand.append(new_demand)
        
        self._save_json_data(self.unmet_demand_file, unmet_demand)
    
    def get_nearby_vendors(self, customer_location: Any, radius_km: float = 2.0) -> List[Dict[str, Any]]:
        """
        Get all vendors within specified radius
        """
        vendors = self._load_json_data(self.vendors_file)
        inventories = self._load_json_data(self.inventories_file)
        
        nearby_vendors = []
        
        for vendor in vendors:
            if vendor["status"] != "active":
                continue
            
            vendor_location = vendor["location"]
            lat, lng = self._extract_coordinates(customer_location)
            distance = geodesic(
                (lat, lng),
                (vendor_location["latitude"], vendor_location["longitude"])
            ).kilometers
            
            if distance <= radius_km:
                # Get vendor inventory
                vendor_inventory = next((inv for inv in inventories if inv["vendor_id"] == vendor["vendor_id"]), None)
                
                vendor_info = {
                    "vendor_id": vendor["vendor_id"],
                    "name": vendor["name"],
                    "phone": vendor["phone"],
                    "location": vendor["location"],
                    "type": vendor["type"],
                    "rating": vendor["rating"],
                    "total_ratings": vendor["total_ratings"],
                    "distance": round(distance, 2),
                    "image_url": vendor_inventory.get("image_url", "") if vendor_inventory else "",
                    "total_items": vendor_inventory.get("total_items", 0) if vendor_inventory else 0,
                    "inventory_items": vendor_inventory.get("items", []) if vendor_inventory else []
                }
                
                nearby_vendors.append(vendor_info)
        
        # Sort by distance
        nearby_vendors.sort(key=lambda x: x["distance"])
        
        return nearby_vendors
    
    def search_vendors(self, query: str, customer_location: Any, radius_km: float = 2.0) -> List[Dict[str, Any]]:
        """
        Search vendors by item name
        """
        vendors = self._load_json_data(self.vendors_file)
        inventories = self._load_json_data(self.inventories_file)
        
        print(f"DEBUG: Search query: '{query}'")
        print(f"DEBUG: Loaded {len(vendors)} vendors")
        print(f"DEBUG: Loaded {len(inventories)} inventories")
        
        matching_vendors = []
        query_lower = query.lower().strip()
        
        for vendor in vendors:
            if vendor["status"] != "active":
                continue
            
            # Get vendor inventory
            vendor_inventory = next((inv for inv in inventories if inv["vendor_id"] == vendor["vendor_id"]), None)
            if not vendor_inventory:
                print(f"DEBUG: No inventory found for vendor {vendor['vendor_id']}")
                continue
            
            # Check if any inventory item matches the search query
            matching_items = []
            for item in vendor_inventory["items"]:
                if query_lower in item["name"].lower():
                    matching_items.append(item)
                    print(f"DEBUG: Found matching item '{item['name']}' for query '{query_lower}'")
            
            if matching_items:
                # Calculate distance
                vendor_location = vendor["location"]
                lat, lng = self._extract_coordinates(customer_location)
                distance = geodesic(
                    (lat, lng),
                    (vendor_location["latitude"], vendor_location["longitude"])
                ).kilometers
                
                print(f"DEBUG: Vendor {vendor['vendor_id']} has matching items, distance: {distance}km")
                
                if distance <= radius_km:
                    # Calculate total price for matching items
                    total_price = sum(item["price_per_unit"] for item in matching_items)
                    
                    vendor_info = {
                        "vendor_id": vendor["vendor_id"],
                        "name": vendor["name"],
                        "phone": vendor["phone"],
                        "location": vendor["location"],
                        "type": vendor["type"],
                        "rating": vendor["rating"],
                        "total_ratings": vendor["total_ratings"],
                        "distance": round(distance, 2),
                        "image_url": vendor_inventory.get("image_url", ""),
                        "total_items": len(matching_items),
                        "inventory_items": matching_items,
                        "matching_items": matching_items,
                        "total_price": total_price
                    }
                    
                    matching_vendors.append(vendor_info)
                    print(f"DEBUG: Added vendor {vendor['vendor_id']} to results")
                else:
                    print(f"DEBUG: Vendor {vendor['vendor_id']} too far: {distance}km > {radius_km}km")
            else:
                print(f"DEBUG: Vendor {vendor['vendor_id']} has no matching items for query '{query_lower}'")
        
        print(f"DEBUG: Total matching vendors found: {len(matching_vendors)}")
        
        # Sort by distance and rating
        matching_vendors.sort(key=lambda x: (x["distance"], -x["rating"]))
        
        return matching_vendors
