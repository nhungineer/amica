import { Router } from 'express';
  import { runAgentWorkflow } from '../agents/orchestrator';

  const router = Router();

  /**
   * POST /agent-trigger/:gatheringId
   * Manually trigger the agent workflow for a gathering
   */
  router.post('/:gatheringId', async (req, res) => {
    try {
      const { gatheringId } = req.params;

      console.log(`🎯 Agent trigger requested for gathering: ${gatheringId}`);

      const result = await runAgentWorkflow(gatheringId);

      res.status(200).json({
        message: 'Agent workflow completed successfully',
        ...result,
      });

    } catch (error: any) {
      console.error('Error triggering agent workflow:', error);

      res.status(500).json({
        error: 'Failed to run agent workflow',
        message: error.message,
      });
    }
  });

  export default router;
