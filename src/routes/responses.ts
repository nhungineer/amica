import { Router } from 'express';
import prisma from '../db';

const router = Router();

// POST /responses - Create a new response (RSVP)
router.post('/', async (req, res) => {
try {
    const {
    gatheringId,
    userId,
    availableTimeSlotIndices,
    budgetMax,
    cuisinePreferences,
    dietaryRestrictions,
    additionalNotes
    } = req.body;

    const response = await prisma.response.create({
    data: {
        gatheringId,
        userId,
        availableTimeSlotIndices,
        budgetMax,
        cuisinePreferences: cuisinePreferences || [],
        dietaryRestrictions,
        additionalNotes
    }
    });

    res.status(201).json(response);
} catch (error) {
    res.status(400).json({ error: 'Failed to create response' });
}
});

// GET /responses/:id - Get response by ID
router.get('/:id', async (req, res) => {
try {
    const { id } = req.params;

    const response = await prisma.response.findUnique({
    where: { id },
    include: {
        user: true,
        gathering: true
    }
    });

    if (!response) {
    return res.status(404).json({ error: 'Response not found' });
    }

    res.json(response);
} catch (error) {
    res.status(500).json({ error: 'Failed to fetch response' });
}
});

export default router;