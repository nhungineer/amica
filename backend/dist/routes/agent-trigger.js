"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const orchestrator_1 = require("../agents/orchestrator");
const router = (0, express_1.Router)();
/**
 * POST /agent-trigger/:gatheringId
 * Manually trigger the agent workflow for a gathering
 */
router.post('/:gatheringId', async (req, res) => {
    try {
        const { gatheringId } = req.params;
        console.log(`🎯 Agent trigger requested for gathering: ${gatheringId}`);
        const result = await (0, orchestrator_1.runAgentWorkflow)(gatheringId);
        res.status(200).json({
            message: 'Agent workflow completed successfully',
            ...result,
        });
    }
    catch (error) {
        console.error('Error triggering agent workflow:', error);
        res.status(500).json({
            error: 'Failed to run agent workflow',
            message: error.message,
        });
    }
});
exports.default = router;
//# sourceMappingURL=agent-trigger.js.map