import { z } from 'zod';
export declare const PreferenceAnalysisSchema: z.ZodObject<{
    recommendedTimeSlot: z.ZodObject<{
        index: z.ZodNumber;
        label: z.ZodString;
        availableCount: z.ZodNumber;
    }, z.core.$strip>;
    budgetRange: z.ZodObject<{
        min: z.ZodNumber;
        max: z.ZodNumber;
        currency: z.ZodDefault<z.ZodString>;
    }, z.core.$strip>;
    cuisinePreferences: z.ZodArray<z.ZodString>;
    dietaryRestrictions: z.ZodArray<z.ZodString>;
    summary: z.ZodString;
}, z.core.$strip>;
export declare const VenueRecommendationSchema: z.ZodObject<{
    recommendations: z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        address: z.ZodString;
        rating: z.ZodNumber;
        priceLevel: z.ZodNumber;
        cuisine: z.ZodString;
        reason: z.ZodString;
    }, z.core.$strip>>;
    recommendation: z.ZodString;
    searchedAt: z.ZodString;
    location: z.ZodString;
}, z.core.$strip>;
export type PreferenceAnalysis = z.infer<typeof PreferenceAnalysisSchema>;
export type VenueRecommendation = z.infer<typeof VenueRecommendationSchema>;
//# sourceMappingURL=schemas.d.ts.map