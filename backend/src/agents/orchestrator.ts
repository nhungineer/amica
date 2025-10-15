import { analyzePreferences } from "./preference-agent";
import { recommendVenues } from "./venue-agent";
import { prisma } from "../db";

/**
 * Orchestrates the full agent workflow
 * 1. Analyze preferences from responses
 * 2. Search and recommend venues
 * 3. Save results to database
 */
export async function runAgentWorkflow(gatheringId: string) {
  try {
    // Step 1: Fetch gathering and responses from database
    const gathering = await prisma.gathering.findUnique({
      where: { id: gatheringId },
      include: {
        responses: true, // Include all related responses
      },
    });
    // Validation: don't run agents if there's no data to analyse

    if (!gathering) {
      throw new Error(`Gathering not found: ${gatheringId}`);
    }

    if (gathering.responses.length === 0) {
      throw new Error(`No responses found for gathering: ${gatheringId}`);
    }

    console.log(`🚀 Starting agent workflow for gathering: ${gathering.title}`);
    console.log(`📊 Analyzing ${gathering.responses.length} responses...`);

    // Step 2: Run Preference Analysis Agent
    const preferenceAnalysis = await analyzePreferences(
      gathering.responses,
      gathering.timeOptions as any[], // Cast JSON to array
      gathering.location
    );

    console.log(`✅ Preference analysis complete`);
    console.log(
      `   Recommended time: ${preferenceAnalysis.recommendedTimeSlot.label}`
    );
    console.log(
      `   Budget: $${preferenceAnalysis.budgetRange.min}-$${preferenceAnalysis.budgetRange.max}`
    );
    console.log(
      `   Cuisines: ${preferenceAnalysis.cuisinePreferences.join(", ")}`
    );

    // Step 3: Run Venue Search Agent
    console.log(`🔍 Searching for venues...`);

    const venueRecommendation = await recommendVenues(
      preferenceAnalysis,
      gathering.location,
      gathering.venueType // Pass venueType from gathering
    );

    console.log(`✅ Venue recommendations complete`);
    console.log(
      `   Found ${venueRecommendation.recommendations.length} recommendations`
    );

    // Step 4: Save results to database in JSON field agentOutput, and update the status to COMPLETED
    const agentOutput = {
      preferenceAnalysis,
      venueRecommendation,
      completedAt: new Date().toISOString(),
    };

    const updatedGathering = await prisma.gathering.update({
      where: { id: gatheringId },
      data: {
        status: "COMPLETED",
        agentOutput: agentOutput,
        updatedAt: new Date(),
      },
    });

    console.log(`💾 Results saved to database`);
    console.log(`✨ Agent workflow complete for: ${gathering.title}`);

    return {
      success: true,
      gathering: updatedGathering,
      results: agentOutput,
    };
  } catch (error) {
    console.error(`❌ Error in agent workflow:`, error);

    // Update gathering status to FAILED
    await prisma.gathering.update({
      where: { id: gatheringId },
      data: {
        status: "FAILED",
        updatedAt: new Date(),
      },
    });

    throw error;
  }
}
