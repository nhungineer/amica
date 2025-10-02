import os
import requests
from langchain.agents import tool


class GooglePlacesTool:
    @tool
    def search_venues(query: str, location: str, radius: int = 5000):
        """Search for venues like restaurants, cafes, or bars near a location using Google Places API.

        Args:
            query: Type of venue (e.g., 'restaurant', 'cafe', 'bar')
            location: Location to search near (e.g., 'San Francisco, CA')
            radius: Search radius in meters (default: 5000)
        """
        try:
            api_key = os.environ.get("GOOGLE_PLACES_API_KEY")
            if not api_key:
                return "Error: Google Places API key not found in environment variables"

            # First, geocode the location to get lat/lng
            geocode_url = "https://maps.googleapis.com/maps/api/geocode/json"
            geocode_params = {
                "address": location,
                "key": api_key
            }

            geocode_response = requests.get(geocode_url, params=geocode_params)
            geocode_data = geocode_response.json()

            if not geocode_data.get("results"):
                return f"Error: Could not find location '{location}'"

            # Get coordinates
            location_data = geocode_data["results"][0]["geometry"]["location"]
            lat, lng = location_data["lat"], location_data["lng"]

            # Search for places
            places_url = "https://maps.googleapis.com/maps/api/place/nearbysearch/json"
            places_params = {
                "location": f"{lat},{lng}",
                "radius": radius,
                "keyword": query,
                "type": "restaurant" if "restaurant" in query.lower() else "establishment",
                "key": api_key
            }

            places_response = requests.get(places_url, params=places_params)
            places_data = places_response.json()

            if places_data.get("status") != "OK":
                return f"Error: {places_data.get('status', 'Unknown error')}"

            # Format results
            result_text = f"Found {len(places_data.get('results', []))} venues for '{query}' near '{location}':\n\n"

            for i, place in enumerate(places_data.get("results", [])[:5], 1):  # Limit to 5 results
                name = place.get("name", "Unknown")
                address = place.get("vicinity", "Address not available")
                rating = place.get("rating", "No rating")
                price_level = "💰" * place.get("price_level", 0) if place.get("price_level") else "Price not available"
                types = ", ".join(place.get("types", []))

                result_text += f"{i}. **{name}**\n"
                result_text += f"   - Address: {address}\n"
                result_text += f"   - Rating: {rating}\n"
                result_text += f"   - Price Level: {price_level}\n"
                result_text += f"   - Types: {types}\n"
                result_text += f"   - Place ID: {place.get('place_id')}\n\n"

            return result_text

        except Exception as e:
            return f"Error searching venues: {str(e)}"


    def tools():
        return [GooglePlacesTool.search_venues]