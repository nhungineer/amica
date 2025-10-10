import { z } from 'zod';

/**
 * Schema for the Preference Analysis Agent output
 * This agent analyzes all user responses and finds consensus
 */
export const PreferenceAnalysisSchema = z.object({
// Recommended time slot based on group availability
recommendedTimeSlot: z.object({
    index: z.number().describe('Index of the time slot from the gathering time_options array'),
    label: z.string().describe('Human-readable time (e.g., "Saturday 6pm")'),
    availableCount: z.number().describe('Number of people available at this time')
}),

// Budget range that works for the group
budgetRange: z.object({
    min: z.number().describe('Minimum budget in dollars'),
    max: z.number().describe('Maximum budget in dollars'),
    currency: z.string().default('USD').describe('Currency code')
}),

// Cuisine preferences consensus
cuisinePreferences: z.array(z.string()).describe('List of cuisines that accommodate the group (prioritized)'),

// Dietary restrictions to consider
dietaryRestrictions: z.array(z.string()).describe('Consolidated list of dietary restrictions from all responses'),

// Summary of the analysis
summary: z.string().describe('Brief explanation of how consensus was reached')
});

/**
 * Schema for individual venue recommendation
 */
const VenueSchema = z.object({
name: z.string().describe('Venue name'),
address: z.string().describe('Full address'),
rating: z.number().min(0).max(5).describe('Google rating (0-5 stars)'),
priceLevel: z.number().min(1).max(4).describe('Price level (1=$ to 4=$$$$)'),
cuisine: z.string().describe('Type of cuisine'),
reason: z.string().describe('Why this venue matches the group preferences')
});

/**
 * Schema for the Venue Recommendation Agent output
 * This agent searches for venues and recommends the top 3
 */
export const VenueRecommendationSchema = z.object({
recommendations: z.array(VenueSchema).length(3).describe('Top 3 venue recommendations'),

// Overall recommendation and next steps
recommendation: z.string().describe('Overall recommendation and suggested next steps for the organizer'),

// Metadata
searchedAt: z.string().describe('ISO timestamp of when the search was performed'),
location: z.string().describe('Location that was searched')
});

// TypeScript types derived from schemas (for use in your code)
export type PreferenceAnalysis = z.infer<typeof PreferenceAnalysisSchema>;
export type VenueRecommendation = z.infer<typeof VenueRecommendationSchema>;
