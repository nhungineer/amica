import { generateObject } from "ai";
import { openai } from "@ai-sdk/openai";
import {
  VenueRecommendationSchema,
  type VenueRecommendation,
  type PreferenceAnalysis,
} from "./schemas";
import { searchVenues, type VenueData } from "../services/google-places";
import type { Response as GatheringResponse } from "@prisma/client"; // NEW: Import for type

/**
 * Venue Search Agent
 * Searches for venues using Google Places API and recommends the best matches
 */
export async function recommendVenues(
  preferenceAnalysis: PreferenceAnalysis,
  location: string,
  venueType: string, // NEW: venueType from gathering
  responses: GatheringResponse[] // Accept individual responses for context
): Promise<VenueRecommendation> {
  // Step 1: Build search query from preferences
  const cuisineQuery =
    preferenceAnalysis.cuisinePreferences.length > 0
      ? preferenceAnalysis.cuisinePreferences[0] // Use top cuisine preference
      : "restaurant";
  const searchQuery = `${cuisineQuery} ${venueType.toLowerCase()}`;

  // Step 2: Get venues from Google Places API
  let venues: VenueData[];
  try {
    venues = await searchVenues(
      searchQuery,
      location,
      venueType,
      preferenceAnalysis.dietaryRestrictions // Pass dietary retrictions to search venues
    );

    if (venues.length === 0) {
      // Fallback: search for generic restaurants if cuisine-specific search fails
      venues = await searchVenues(
        venueType,
        location,
        venueType,
        preferenceAnalysis.dietaryRestrictions
      );
    }
  } catch (error) {
    console.error("Error searching venues:", error);
    throw new Error("Failed to search for venues");
  }
  // NEW: Build context about individual responses for richer reasoning
  const responseContext = responses
    .map((r, idx) => {
      const cuisinePrefs =
        Array.isArray(r.cuisinePreferences) && r.cuisinePreferences.length > 0
          ? r.cuisinePreferences.join(", ")
          : "no preference";

      return `Person ${idx + 1}:
    - Budget: $${r.budgetMax || "flexible"}
    - Cuisine preferences: ${cuisinePrefs}
    - Dietary restrictions: ${r.dietaryRestrictions || "none"}
    - Additional notes: ${r.additionalNotes || "none"}`;
    })
    .join("\n");
  // Step 3: Build enhanced prompt for AI to analyze venues
  const prompt = `
  You are a venue recommendation specialist helping organize a gathering for ${
    responses.length
  } 
  people.

  INDIVIDUAL RESPONSES (pay attention to specific needs and notes):
  ${responseContext}

  GROUP CONSENSUS (from preference analysis):
  - Recommended time: ${preferenceAnalysis.recommendedTimeSlot.label} 
    (${preferenceAnalysis.recommendedTimeSlot.availableCount} people available)
  - Budget range: $${preferenceAnalysis.budgetRange.min}-$${
    preferenceAnalysis.budgetRange.max
  } per 
  person
  - Cuisine preferences: ${preferenceAnalysis.cuisinePreferences.join(", ")}
  - Dietary restrictions: ${
    preferenceAnalysis.dietaryRestrictions.length > 0
      ? preferenceAnalysis.dietaryRestrictions.join(", ")
      : "none"
  }
  - Analysis summary: ${preferenceAnalysis.summary}

  AVAILABLE VENUES (from Google Places, sorted by relevance):
  ${venues
    .map(
      (v, idx) => `
  ${idx + 1}. ${v.name}
     - Address: ${v.address}
     - Rating: ${v.rating}/5
     - Price Level: ${"$".repeat(v.priceLevel)} (1=cheap, 4=expensive)
     - Cuisine: ${v.cuisine}
     - Place ID: ${v.placeId}
     - Google Maps: ${v.googleUrl}
  `
    )
    .join("\n")}

  TASK:
  Select the TOP 3 venues that best match this specific group's needs.

  EVALUATION CRITERIA (in priority order):
  1. **Dietary Compatibility**: Can the venue accommodate ALL dietary restrictions? (This is 
  non-negotiable)
  2. **Budget Fit**: Does the price level align with the group's budget range?
  3. **Cuisine Match**: Does it match the group's cuisine preferences?
  4. **Quality**: Rating should be 4.0+ when possible
  5. **Group Size**: Can it accommodate ${responses.length} people comfortably?

  IMPORTANT: For each recommendation, write a SPECIFIC, DETAILED reason that:
  - Mentions HOW it accommodates the dietary restrictions (e.g., "has extensive vegetarian menu 
  section")
  - Explains WHY the price level fits the budget
  - References specific group needs from the individual responses
  - Avoids generic phrases like "offers a high rating" or "fits the budget"

  Examples of GOOD reasoning:
  ✅ "This venue has a dedicated gluten-free menu and vegetarian options, perfect for Person 1 and 
  Person 3's needs. At $$, it sits comfortably in the $25-$30 budget range. The 4.7 rating reflects 
  consistent quality for Italian cuisine, which Person 2 specifically requested."

  Examples of BAD reasoning (DO NOT USE):
  ❌ "Offers a high rating and fits the budget requirements."
  ❌ "Provides options that satisfy dietary restrictions."

  Provide an overall recommendation for the organizer on next steps (e.g., "Book early for Saturday 
  lunch as these venues fill up quickly").

  Current timestamp: ${new Date().toISOString()}
  Location searched: ${location}
  `;

  // Step 4: Call AI to analyze and recommend
  const result = await generateObject({
    model: openai("gpt-4o"),
    schema: VenueRecommendationSchema,
    prompt: prompt,
  });

  return result.object;
}
