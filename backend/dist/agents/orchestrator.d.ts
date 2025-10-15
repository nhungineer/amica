/**
 * Orchestrates the full agent workflow
 * 1. Analyze preferences from responses
 * 2. Search and recommend venues
 * 3. Save results to database
 */
export declare function runAgentWorkflow(gatheringId: string): Promise<{
    success: boolean;
    gathering: {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        location: string;
        timezone: string;
        timeOptions: import("@prisma/client/runtime/library").JsonValue;
        rsvpDeadline: Date;
        status: import("@prisma/client").$Enums.GatheringStatus;
        agentOutput: import("@prisma/client/runtime/library").JsonValue | null;
        organizerId: string;
    };
    results: {
        preferenceAnalysis: {
            recommendedTimeSlot: {
                index: number;
                label: string;
                availableCount: number;
            };
            budgetRange: {
                min: number;
                max: number;
                currency: string;
            };
            cuisinePreferences: string[];
            dietaryRestrictions: string[];
            summary: string;
        };
        venueRecommendation: {
            recommendations: {
                name: string;
                address: string;
                rating: number;
                priceLevel: number;
                cuisine: string;
                reason: string;
            }[];
            recommendation: string;
            searchedAt: string;
            location: string;
        };
        completedAt: string;
    };
}>;
//# sourceMappingURL=orchestrator.d.ts.map