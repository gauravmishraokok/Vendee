import os
import json
from typing import Dict, Any, List
import requests
from datetime import datetime

class WatsonAIService:
    """
    Watson AI Service for enhanced SmartBuy request processing
    Uses Watson Orchestrate for natural language understanding
    """
    
    def __init__(self):
        self.service_url = "https://api.ap-south-1.dl.watson-orchestrate.ibm.com/instances/20250808-1247-0789-30cc-fbe921fd0899"
        self.api_key = ""
        self.headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
    
    def process_smart_buy_request(self, request_text: str, customer_location: Dict[str, float]) -> Dict[str, Any]:
        """
        Process SmartBuy request using Watson AI for better understanding
        """
        try:
            # For now, use enhanced rule-based parsing (can be upgraded to Watson AI calls)
            enhanced_parsing = self._enhanced_parsing(request_text)
            
            if not enhanced_parsing["parsed_successfully"]:
                return {
                    "success": False,
                    "error": "Could not understand your request. Please try rephrasing.",
                    "suggestions": [
                        "Try: 'I want 2 kg bananas'", 
                        "Try: 'Need tomatoes and onions delivered'",
                        "Try: 'Looking for fresh vegetables'"
                    ]
                }
            
            return {
                "success": True,
                "parsed_request": enhanced_parsing,
                "ai_confidence": enhanced_parsing.get("confidence", 0.8),
                "processed_at": datetime.now().isoformat()
            }
            
        except Exception as e:
            # Fallback to basic parsing
            return self._fallback_parsing(request_text, customer_location)
    
    def _enhanced_parsing(self, request_text: str) -> Dict[str, Any]:
        """
        Enhanced rule-based parsing with better item recognition
        """
        request_text = request_text.lower().strip()
        
        # Enhanced item recognition
        item_patterns = {
            "fruits": ["banana", "apple", "orange", "mango", "grapes", "strawberry", "pineapple"],
            "vegetables": ["tomato", "onion", "potato", "carrot", "cucumber", "cauliflower", "broccoli"],
            "herbs": ["coriander", "mint", "basil", "parsley", "rosemary"],
            "flowers": ["rose", "marigold", "sunflower", "lily", "tulip"],
            "nuts": ["almonds", "cashews", "walnuts", "pistachios"],
            "grains": ["rice", "wheat", "pulses", "lentils"]
        }
        
        # Extract quantities and units
        import re
        quantity_pattern = r'(\d+)\s*(kg|g|pieces?|bunches?|dozens?|packs?)'
        quantities = re.findall(quantity_pattern, request_text)
        
        # Extract items
        items = []
        total_confidence = 0
        item_count = 0
        
        for category, category_items in item_patterns.items():
            for item in category_items:
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
                        elif unit_type in ["dozens", "dozen"]:
                            quantity = f"{qty} dozen"
                            unit = "dozen"
                        elif unit_type in ["packs", "pack"]:
                            quantity = f"{qty} packs"
                            unit = "pack"
                    
                    # Calculate confidence based on context
                    confidence = 0.9
                    if any(word in request_text for word in ["fresh", "organic", "local"]):
                        confidence += 0.1
                    if any(word in request_text for word in ["cheap", "expensive", "budget"]):
                        confidence += 0.05
                    
                    items.append({
                        "name": item,
                        "quantity": quantity,
                        "unit": unit,
                        "category": category,
                        "confidence": min(confidence, 1.0)
                    })
                    
                    total_confidence += confidence
                    item_count += 1
        
        # Check delivery preferences
        delivery_keywords = ["deliver", "delivery", "home", "house", "doorstep", "bring"]
        delivery_requested = any(word in request_text for word in delivery_keywords)
        
        # Check urgency
        urgency_keywords = ["urgent", "asap", "quick", "fast", "immediate"]
        is_urgent = any(word in request_text for word in urgency_keywords)
        
        # Check budget constraints
        budget_keywords = ["cheap", "affordable", "budget", "economical", "low price"]
        budget_constraint = any(word in request_text for word in budget_keywords)
        
        if item_count > 0:
            avg_confidence = total_confidence / item_count
        else:
            avg_confidence = 0
        
        return {
            "items": items,
            "delivery_requested": delivery_requested,
            "is_urgent": is_urgent,
            "budget_constraint": budget_constraint,
            "original_request": request_text,
            "parsed_successfully": len(items) > 0,
            "confidence": avg_confidence,
            "total_items": len(items)
        }
    
    def _fallback_parsing(self, request_text: str, customer_location: Dict[str, float]) -> Dict[str, Any]:
        """
        Fallback parsing when enhanced parsing fails
        """
        request_text = request_text.lower()
        
        # Basic item extraction
        basic_items = [
            "banana", "apple", "tomato", "onion", "potato", "carrot", 
            "coriander", "mint", "orange", "rose", "marigold", "mango"
        ]
        
        items = []
        for item in basic_items:
            if item in request_text:
                items.append({
                    "name": item,
                    "quantity": "1 kg",
                    "unit": "kg",
                    "confidence": 0.7
                })
        
        return {
            "items": items,
            "delivery_requested": "deliver" in request_text or "delivery" in request_text,
            "original_request": request_text,
            "parsed_successfully": len(items) > 0,
            "confidence": 0.7 if items else 0
        }
    
    def get_vendor_recommendations(self, parsed_request: Dict, available_vendors: List[Dict]) -> List[Dict]:
        """
        Get AI-powered vendor recommendations based on parsed request
        """
        if not available_vendors:
            return []
        
        # Score vendors based on multiple factors
        scored_vendors = []
        
        for vendor in available_vendors:
            score = 0
            
            # Distance score (closer is better)
            distance = vendor.get("distance", 10)
            if distance <= 1:
                score += 30
            elif distance <= 2:
                score += 20
            elif distance <= 5:
                score += 10
            
            # Rating score
            rating = vendor.get("rating", 0)
            score += rating * 10
            
            # Type preference (moving for delivery, stationary for pickup)
            if parsed_request.get("delivery_requested") and vendor.get("type") == "moving":
                score += 15
            elif not parsed_request.get("delivery_requested") and vendor.get("type") == "stationary":
                score += 15
            
            # Urgency bonus
            if parsed_request.get("is_urgent"):
                if vendor.get("type") == "moving":
                    score += 10
            
            # Budget consideration
            if parsed_request.get("budget_constraint"):
                # Prefer vendors with lower prices (this would need price data)
                score += 5
            
            scored_vendors.append({
                **vendor,
                "ai_score": score
            })
        
        # Sort by AI score
        scored_vendors.sort(key=lambda x: x["ai_score"], reverse=True)
        
        return scored_vendors[:5]  # Top 5 recommendations
    
    def generate_ai_response(self, parsed_request: Dict, recommendations: List[Dict]) -> str:
        """
        Generate AI-powered response message
        """
        if not recommendations:
            items_text = ", ".join([item["name"] for item in parsed_request["items"]])
            return f"Sorry, I couldn't find any vendors selling {items_text} in your area. Please try a different location or items."
        
        response = f"I found {len(recommendations)} great vendors for your request: {', '.join([item['name'] for item in parsed_request['items']])}\n\n"
        
        # Add context-aware suggestions
        if parsed_request.get("delivery_requested"):
            response += "🚚 **Delivery Available:**\n"
        else:
            response += "🏪 **Pickup Available:**\n"
        
        for i, vendor in enumerate(recommendations[:3], 1):
            response += f"{i}. **{vendor['name']}** - {vendor['distance']}km away ⭐{vendor['rating']}\n"
            
            if vendor.get("type") == "moving":
                response += f"   🚚 Moving vendor - can deliver to your location\n"
            else:
                response += f"   🏪 Stationary vendor - visit their location\n"
            
            if vendor.get("total_items"):
                response += f"   📦 {vendor['total_items']} items available\n"
            
            response += "\n"
        
        # Add AI-powered suggestions
        if parsed_request.get("is_urgent"):
            response += "⚡ **Urgent Request Detected:** Moving vendors can deliver faster!\n\n"
        
        if parsed_request.get("budget_constraint"):
            response += "💰 **Budget-Friendly Tip:** Consider visiting stationary vendors for better prices.\n\n"
        
        return response
