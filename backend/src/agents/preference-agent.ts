import { generateObject } from 'ai';
import { openai } from '@ai-sdk/openai';
import { PreferenceAnalysisSchema, type PreferenceAnalysis } from './schemas';
import type { Response } from '@prisma/client';

/**
 * Preference Analysis Agent
 * Analyzes user responses to find group consensus on timing, budget, and preferences
 */
export async function analyzePreferences(
  responses: Response[],
  timeOptions: any[],
  gatheringLocation: string
): Promise<PreferenceAnalysis> {

  // Build the prompt with all the data
  const prompt = `
You are a group preference analyst helping organize a casual gathering.

GATHERING LOCATION: ${gatheringLocation}

TIME OPTIONS (provided by organizer):
${timeOptions.map((opt, idx) => `${idx}: ${opt.label}`).join('\n')}

USER RESPONSES:
${responses.map((r, idx) => `
Person ${idx + 1}:
- Available time slot indices: ${r.availableTimeSlotIndices.join(', ')}
- Budget max: $${r.budgetMax || 'flexible'}
- Cuisine preferences: ${r.cuisinePreferences.length > 0 ? r.cuisinePreferences : 'no preference'}
- Dietary restrictions: ${r.dietaryRestrictions || 'none'}
- Additional notes: ${r.additionalNotes || 'none'}
`).join('\n---\n')}

TASK:
Analyze these responses and identify:
1. Which time slot works for the MOST people (recommend the one with highest availability)
2. Budget range that accommodates everyone (find the overlap)
3. Cuisine preferences that can satisfy the group (find common ground or diverse options)
4. All dietary restrictions that must be considered
5. A brief summary of how you reached consensus

Be practical and aim for maximum participation. If there are conflicts, explain trade-offs.
`;

  // Call OpenAI with structured output
  const result = await generateObject({
    model: openai('gpt-4o'),
    schema: PreferenceAnalysisSchema,
    prompt: prompt,
  });

  return result.object;
}
