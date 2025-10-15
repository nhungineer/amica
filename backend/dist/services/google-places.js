"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchVenues = searchVenues;
const axios_1 = __importDefault(require("axios"));
/**
 * Search for venues using Google Places API
 *
 * @param query - Search query (e.g., "Italian restaurant")
 * @param location - Location string (e.g., "Brunswick, VIC, Australia")
 * @param radius - Search radius in meters (default: 5000m = 5km)
 * @returns Array of formatted venue data
 */
async function searchVenues(query, location, radius = 5000) {
    try {
        const apiKey = process.env.GOOGLE_PLACES_API_KEY;
        if (!apiKey) {
            throw new Error('GOOGLE_PLACES_API_KEY not found in environment variables');
        }
        // Step 1: Geocode the location (convert address to lat/lng)
        const geocodeUrl = 'https://maps.googleapis.com/maps/api/geocode/json';
        const geocodeResponse = await axios_1.default.get(geocodeUrl, {
            params: {
                address: location,
                key: apiKey
            }
        });
        if (!geocodeResponse.data.results || geocodeResponse.data.results.length === 0) {
            throw new Error(`Could not find location: ${location}`);
        }
        const firstResult = geocodeResponse.data.results[0];
        if (!firstResult) {
            throw new Error(`Could not find location: ${location}`);
        }
        const { lat, lng } = firstResult.geometry.location;
        // Step 2: Search for places near that location
        const placesUrl = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json';
        const placesResponse = await axios_1.default.get(placesUrl, {
            params: {
                location: `${lat},${lng}`,
                radius,
                keyword: query,
                type: 'restaurant',
                key: apiKey
            }
        });
        if (placesResponse.data.status !== 'OK') {
            throw new Error(`Google Places API error: ${placesResponse.data.status}`);
        }
        // Step 3: Format the results
        const venues = placesResponse.data.results.slice(0, 10).map(place => ({
            name: place.name,
            address: place.vicinity,
            rating: place.rating || 0,
            priceLevel: place.price_level || 2, // Default to moderate pricing
            cuisine: extractCuisineFromTypes(place.types),
            placeId: place.place_id
        }));
        return venues;
    }
    catch (error) {
        console.error('Error searching venues:', error);
        throw error;
    }
}
/**
 * Helper function to extract cuisine type from Google Places types array
 * Google returns types like: ["restaurant", "italian_restaurant", "food",
"point_of_interest"]
 */
function extractCuisineFromTypes(types) {
    // Remove generic types
    const genericTypes = ['restaurant', 'food', 'point_of_interest', 'establishment'];
    const cuisineTypes = types.filter(type => !genericTypes.includes(type));
    if (cuisineTypes.length > 0) {
        // Convert "italian_restaurant" to "Italian"
        const firstCuisine = cuisineTypes[0];
        if (firstCuisine) {
            return firstCuisine
                .replace('_restaurant', '')
                .replace('_', ' ')
                .split(' ')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' ');
        }
    }
    return 'Restaurant'; // Default fallback
}
//# sourceMappingURL=google-places.js.map