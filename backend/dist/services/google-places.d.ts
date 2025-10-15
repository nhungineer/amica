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
}
/**
 * Search for venues using Google Places API
 *
 * @param query - Search query (e.g., "Italian restaurant")
 * @param location - Location string (e.g., "Brunswick, VIC, Australia")
 * @param radius - Search radius in meters (default: 5000m = 5km)
 * @returns Array of formatted venue data
 */
export declare function searchVenues(query: string, location: string, radius?: number): Promise<VenueData[]>;
//# sourceMappingURL=google-places.d.ts.map