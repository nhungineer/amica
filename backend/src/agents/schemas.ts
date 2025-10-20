import { z } from "zod";

export const PreferenceAnalysisSchema = z.object({
  recommendedTimeSlot: z.object({
    index: z
      .number()
      .describe("Index of the time slot from the gathering time_options array"),
    label: z.string().describe('Human-readable time (e.g., "Saturday 6pm")'),
    availableCount: z
      .number()
      .describe("Number of people available at this time"),
  }),
  budgetRange: z.object({
    min: z.number().describe("Minimum budget in dollars"),
    max: z.number().describe("Maximum budget in dollars"),
    currency: z.string().default("AUD").describe("Currency code"),
  }),
  cuisinePreferences: z
    .array(z.string())
    .describe("List of cuisines that accommodate the group (prioritized)"),
  dietaryRestrictions: z
    .array(z.string())
    .describe("Consolidated list of dietary restrictions from all responses"),
  summary: z
    .string()
    .describe("Brief explanation of how consensus was reached"),
});

const VenueSchema = z.object({
  name: z.string().describe("Venue name"),
  address: z.string().describe("Full address"),
  rating: z.number().min(0).max(5).describe("Google rating (0-5 stars)"),
  priceLevel: z.number().min(1).max(4).describe("Price level (1=$ to 4=$$$$)"),
  cuisine: z.string().describe("Type of cuisine"),
  placeId: z.string().describe("Google Places ID for this venue"), // add placeID
  googleUrl: z.string().describe("Direct Google Maps link to this venue"), // Add googleUrl
  reason: z
    .string()
    .describe(
      "Specific, detailed explanation of why this venue is perfect for THIS particular group (mention group size, dietary needs, budget, and atmosphere fit)"
    ),
});

export const VenueRecommendationSchema = z.object({
  recommendations: z
    .array(VenueSchema)
    .length(3)
    .describe("Top 3 venue recommendations"),
  recommendation: z
    .string()
    .describe(
      "Overall recommendation and suggested next steps for the organizer"
    ),
  searchedAt: z
    .string()
    .describe("ISO timestamp of when the search was performed"),
  location: z.string().describe("Location that was searched"),
});

export type PreferenceAnalysis = z.infer<typeof PreferenceAnalysisSchema>;
export type VenueRecommendation = z.infer<typeof VenueRecommendationSchema>;
