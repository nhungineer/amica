import { type PreferenceAnalysis } from './schemas';
import type { Response as GatheringResponse } from '@prisma/client';
/**
 * Preference Analysis Agent
 * Analyzes user responses to find group consensus on timing, budget, and preferences
 */
export declare function analyzePreferences(responses: GatheringResponse[], timeOptions: any[], gatheringLocation: string): Promise<PreferenceAnalysis>;
//# sourceMappingURL=preference-agent.d.ts.map