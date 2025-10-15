"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyzePreferences = analyzePreferences;
const ai_1 = require("ai");
const openai_1 = require("@ai-sdk/openai");
const schemas_1 = require("./schemas");
/**
 * Preference Analysis Agent
 * Analyzes user responses to find group consensus on timing, budget, and preferences
 */
async function analyzePreferences(responses, timeOptions, gatheringLocation) {
    // Build the prompt with all the data
    const prompt = `
You are a group preference analyst helping organize a casual gathering.

GATHERING LOCATION: ${gatheringLocation}

TIME OPTIONS (provided by organizer):
${timeOptions.map((opt, idx) => `${idx}: ${opt.label}`).join('\n')}

USER RESPONSES:
${responses.map((r, idx) => {
        const cuisinePrefs = Array.isArray(r.cuisinePreferences) && r.cuisinePreferences.length > 0
            ? r.cuisinePreferences.join(', ')
            : 'no preference';
        return `
Person ${idx + 1}:
- Available time slot indices: ${r.availableTimeSlotIndices.join(', ')}
- Budget max: $${r.budgetMax || 'flexible'}
- Cuisine preferences: ${cuisinePrefs}
- Dietary restrictions: ${r.dietaryRestrictions || 'none'}
- Additional notes: ${r.additionalNotes || 'none'}
`;
    }).join('\n---\n')}

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
    const result = await (0, ai_1.generateObject)({
        model: (0, openai_1.openai)('gpt-4o'),
        schema: schemas_1.PreferenceAnalysisSchema,
        prompt: prompt,
    });
    return result.object;
}
//# sourceMappingURL=preference-agent.js.map