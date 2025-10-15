"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VenueRecommendationSchema = exports.PreferenceAnalysisSchema = void 0;
const zod_1 = require("zod");
/**
 * Schema for the Preference Analysis Agent output
 * This agent analyzes all user responses and finds consensus
 */
exports.PreferenceAnalysisSchema = zod_1.z.object({
    // Recommended time slot based on group availability
    recommendedTimeSlot: zod_1.z.object({
        index: zod_1.z.number().describe('Index of the time slot from the gathering time_options array'),
        label: zod_1.z.string().describe('Human-readable time (e.g., "Saturday 6pm")'),
        availableCount: zod_1.z.number().describe('Number of people available at this time')
    }),
    // Budget range that works for the group
    budgetRange: zod_1.z.object({
        min: zod_1.z.number().describe('Minimum budget in dollars'),
        max: zod_1.z.number().describe('Maximum budget in dollars'),
        currency: zod_1.z.string().default('USD').describe('Currency code')
    }),
    // Cuisine preferences consensus
    cuisinePreferences: zod_1.z.array(zod_1.z.string()).describe('List of cuisines that accommodate the group (prioritized)'),
    // Dietary restrictions to consider
    dietaryRestrictions: zod_1.z.array(zod_1.z.string()).describe('Consolidated list of dietary restrictions from all responses'),
    // Summary of the analysis
    summary: zod_1.z.string().describe('Brief explanation of how consensus was reached')
});
/**
 * Schema for individual venue recommendation
 */
const VenueSchema = zod_1.z.object({
    name: zod_1.z.string().describe('Venue name'),
    address: zod_1.z.string().describe('Full address'),
    rating: zod_1.z.number().min(0).max(5).describe('Google rating (0-5 stars)'),
    priceLevel: zod_1.z.number().min(1).max(4).describe('Price level (1=$ to 4=$$$$)'),
    cuisine: zod_1.z.string().describe('Type of cuisine'),
    reason: zod_1.z.string().describe('Why this venue matches the group preferences')
});
/**
 * Schema for the Venue Recommendation Agent output
 * This agent searches for venues and recommends the top 3
 */
exports.VenueRecommendationSchema = zod_1.z.object({
    recommendations: zod_1.z.array(VenueSchema).length(3).describe('Top 3 venue recommendations'),
    // Overall recommendation and next steps
    recommendation: zod_1.z.string().describe('Overall recommendation and suggested next steps for the organizer'),
    // Metadata
    searchedAt: zod_1.z.string().describe('ISO timestamp of when the search was performed'),
    location: zod_1.z.string().describe('Location that was searched')
});
//# sourceMappingURL=schema.js.map