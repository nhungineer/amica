import { type VenueRecommendation, type PreferenceAnalysis } from './schemas';
/**
 * Venue Search Agent
 * Searches for venues using Google Places API and recommends the best matches
 */
export declare function recommendVenues(preferenceAnalysis: PreferenceAnalysis, location: string): Promise<VenueRecommendation>;
//# sourceMappingURL=venue-agent.d.ts.map