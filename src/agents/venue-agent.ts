import { generateObject } from 'ai';
  import { openai } from '@ai-sdk/openai';
  import { VenueRecommendationSchema, type VenueRecommendation, type PreferenceAnalysis
   } from './schemas';
  import { searchVenues, type VenueData } from '../services/google-places';

  /**
   * Venue Search Agent
   * Searches for venues using Google Places API and recommends the best matches
   */
  export async function recommendVenues(
    preferenceAnalysis: PreferenceAnalysis,
    location: string
  ): Promise<VenueRecommendation> {

    // Step 1: Build search query from preferences
    const cuisineQuery = preferenceAnalysis.cuisinePreferences.length > 0
      ? preferenceAnalysis.cuisinePreferences[0]  // Use top cuisine preference
      : 'restaurant';

  const venueType = 'restaurant';  // TODO: Make this dynamic later
  const searchQuery = `${cuisineQuery} ${venueType}`;
  
    // Step 2: Get venues from Google Places API
    let venues: VenueData[];
    try {
      venues = await searchVenues(searchQuery, location, 5000);

      if (venues.length === 0) {
        // Fallback: search for generic restaurants if cuisine-specific search fails
        venues = await searchVenues('restaurant', location, 5000);
      }
    } catch (error) {
      console.error('Error searching venues:', error);
      throw new Error('Failed to search for venues');
    }

    // Step 3: Build prompt for AI to analyze venues
    const prompt = `
  You are a venue recommendation specialist helping choose the best restaurant for a 
  group gathering.

  GROUP PREFERENCES (from preference analysis):
  - Recommended time: ${preferenceAnalysis.recommendedTimeSlot.label} 
  (${preferenceAnalysis.recommendedTimeSlot.availableCount} people available)
  - Budget range: 
  $${preferenceAnalysis.budgetRange.min}-$${preferenceAnalysis.budgetRange.max} per 
  person
  - Cuisine preferences: ${preferenceAnalysis.cuisinePreferences.join(', ')}
  - Dietary restrictions: ${preferenceAnalysis.dietaryRestrictions.length > 0 ? 
  preferenceAnalysis.dietaryRestrictions.join(', ') : 'none'}
  - Analysis summary: ${preferenceAnalysis.summary}

  AVAILABLE VENUES (from Google Places API):
  ${venues.map((v, idx) => `
  ${idx + 1}. ${v.name}
     - Address: ${v.address}
     - Rating: ${v.rating}/5
     - Price Level: ${'$'.repeat(v.priceLevel)} (1=cheap, 4=expensive)
     - Cuisine: ${v.cuisine}
     - Place ID: ${v.placeId}
  `).join('\n')}

  TASK:
  Analyze these venues and select the TOP 3 that best match the group's preferences.

  Consider:
  1. Budget compatibility (price level should match budget range)
  2. Cuisine match (prioritize cuisines from preferences)
  3. Rating (higher is better, but don't ignore budget/cuisine fit)
  4. Can accommodate dietary restrictions (based on cuisine type)

  For each recommendation, explain WHY it's a good fit for this group.

  Provide an overall recommendation for the organizer on next steps.

  Current timestamp: ${new Date().toISOString()}
  Location searched: ${location}
  `;

    // Step 4: Call AI to analyze and recommend
    const result = await generateObject({
      model: openai('gpt-4o'),
      schema: VenueRecommendationSchema,
      prompt: prompt,
    });

    return result.object;
  }
