import { type VenueRecommendation, type PreferenceAnalysis } from "./schemas";
import type { Response, User } from "@prisma/client";
type ResponseWithUser = Response & {
    user: User | null;
};
/**
 * Venue Search Agent
 * Searches for venues using Google Places API and recommends the best matches
 */
export declare function recommendVenues(preferenceAnalysis: PreferenceAnalysis, location: string, venueType: string, responses: ResponseWithUser[]): Promise<VenueRecommendation>;
export {};
//# sourceMappingURL=venue-agent.d.ts.map