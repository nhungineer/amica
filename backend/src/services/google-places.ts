import axios from "axios";
import { traceable } from "langsmith/traceable";
/**
 * Interface for Google Places API response (simplified)
 */
interface PlaceResult {
  name: string;
  formatted_address: string; // Replace vicinity in nearby search with formatted_address in text search
  vicinity?: string;
  rating?: number;
  price_level?: number; // 1-4 scale
  types: string[];
  place_id: string;
}

interface GooglePlacesResponse {
  results: PlaceResult[];
  status: string;
}

/**
 * Interface for our formatted venue data
 */
export interface VenueData {
  name: string;
  address: string;
  rating: number;
  priceLevel: number;
  cuisine: string;
  placeId: string;
  googleUrl: string; // Add direct link to Google Maps
}

/**
 * Search for venues using Google Places API
 *
 * @param query - Search query (e.g., "Italian restaurant")
 * @param location - Location string (e.g., "Brunswick, VIC, Australia")
 * @param venueType - Venue type for filtering
 * @param dietaryRestrictions - Array of dietary needs to include in search
 * @returns Array of formatted venue data
 **/
export const searchVenues = traceable(
  async function searchVenues(
    query: string,
    location: string,
    venueType: string, // Dynamic venue type for Google Places API
    dietaryRestrictions: string[] = [] // Add dietary restrictions to query
  ): Promise<VenueData[]> {
    try {
      const apiKey = process.env.GOOGLE_PLACES_API_KEY;

      if (!apiKey) {
        throw new Error(
          "GOOGLE_PLACES_API_KEY not found in environment variables"
        );
      }
      // NEW: Build a richer search query
      let searchQuery = `${query} ${venueType} in ${location}`;

      // Add dietary restrictions to search for better matches
      if (dietaryRestrictions.length > 0) {
        const dietaryKeywords = dietaryRestrictions.join(" ");
        searchQuery += ` ${dietaryKeywords}`;
      }

      console.log(`🔍 Searching Google Places: "${searchQuery}"`);

      // CHANGED: Use Text Search API instead of Nearby Search
      const placesUrl =
        "https://maps.googleapis.com/maps/api/place/textsearch/json";
      const placesResponse = await axios.get<GooglePlacesResponse>(placesUrl, {
        params: {
          query: searchQuery, // Natural language query
          type: venueType.toLowerCase(),
          key: apiKey,
        },
      });

      if (
        placesResponse.data.status !== "OK" &&
        placesResponse.data.status !== "ZERO_RESULTS"
      ) {
        throw new Error(
          `Google Places API error: ${placesResponse.data.status}`
        );
      }

      if (placesResponse.data.status === "ZERO_RESULTS") {
        console.log("⚠️ No results found, trying fallback search...");
        // Fallback to simpler query
        const fallbackResponse = await axios.get<GooglePlacesResponse>(
          placesUrl,
          {
            params: {
              query: `${venueType} in ${location}`,
              key: apiKey,
            },
          }
        );
        placesResponse.data = fallbackResponse.data;
      }

      // Step 3: Format the results
      const venues: VenueData[] = placesResponse.data.results
        .slice(0, 20) // Increase the pool to 20 instead of 10
        .map((place) => ({
          name: place.name,
          address:
            place.formatted_address ||
            place.vicinity ||
            "Address not available",
          rating: place.rating || 0,
          priceLevel: place.price_level || 2, // Default to moderate pricing
          cuisine: extractCuisineFromTypes(place.types),
          placeId: place.place_id,
          googleUrl: `https://www.google.com/maps/place/?q=place_id:${place.place_id}`, // NEW
        }));
      console.log(`✅ Found ${venues.length} venues`); // NEW: Add this log

      return venues;
    } catch (error) {
      console.error("Error searching venues:", error);
      throw error;
    }
  },
  // Add config object
  {
    name: "Google Places Search",
    run_type: "tool",
    metadata: {
      api: "google_places",
      search_type: "text_search",
    },
  }
);

/**
   * Helper function to extract cuisine type from Google Places types array
   * Google returns types like: ["restaurant", "italian_restaurant", "food", 
  "point_of_interest"]
   */
function extractCuisineFromTypes(types: string[]): string {
  // Remove generic types
  const genericTypes = [
    "restaurant",
    "food",
    "point_of_interest",
    "establishment",
  ];
  const cuisineTypes = types.filter((type) => !genericTypes.includes(type));

  if (cuisineTypes.length > 0) {
    // Convert "italian_restaurant" to "Italian"
    const firstCuisine = cuisineTypes[0];
    if (firstCuisine) {
      return firstCuisine
        .replace("_restaurant", "")
        .replace("_", " ")
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
    }
  }

  return "Restaurant"; // Default fallback
}
