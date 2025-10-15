"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = require("../db");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// POST /responses - Create a new response (RSVP)
// Protected route - requires authentication
router.post("/", auth_1.requireAuth, async (req, res) => {
    try {
        // Extract userId from JWT token (set by requireAuth middleware)
        // This is secure because it comes from the cryptographically signed token
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({ error: "User not authenticated" });
        }
        // Get data from request body - NB userID comes from token
        const { gatheringId, availableTimeSlotIndices, budgetMax, cuisinePreferences, dietaryRestrictions, additionalNotes, } = req.body;
        // Create response in database using userId from token
        const response = await db_1.prisma.response.create({
            data: {
                gatheringId,
                userId, // from JWT token, not request body
                availableTimeSlotIndices,
                budgetMax,
                cuisinePreferences: cuisinePreferences || [],
                dietaryRestrictions,
                additionalNotes,
            },
        });
        res.status(201).json(response);
    }
    catch (error) {
        res.status(400).json({ error: "Failed to create response" });
    }
});
// GET /responses/:id - Get response by ID
router.get("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const response = await db_1.prisma.response.findUnique({
            where: { id },
            include: {
                user: true,
                gathering: true,
            },
        });
        if (!response) {
            return res.status(404).json({ error: "Response not found" });
        }
        res.json(response);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch response" });
    }
});
exports.default = router;
//# sourceMappingURL=responses.js.map