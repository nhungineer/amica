// Import Router and Prisma client
import { Router } from "express";
import { prisma } from "../db";
import { VenueType } from "@prisma/client";
import { requireAuth } from "../middleware/auth";
// Create router instance
const router = Router();

// POST /gatherings - Create a new gathering (PROTECTED - requires auth)
// Handle POST requests, extract required fields from request body
// organizerId comes from authenticated user (req.user)
// Prisma inserts new gathering into database
// new Date(rsvpDeadline) converts string to javaScript date object
router.post("/", requireAuth, async (req, res) => {
  try {
    const { title, location, timezone, timeOptions, rsvpDeadline, venueType } =
      req.body;
    // Validate venueType if provided
    const validVenueTypes = Object.values(VenueType);
    if (venueType && !validVenueTypes.includes(venueType)) {
      return res.status(400).json({
        error: `Invalid venue type. Must be one of: ${validVenueTypes.join(
          ", "
        )}`,
      });
    }

    // Get organizerId from authenticated user
    const organizerId = req.user!.userId;

    const gathering = await prisma.gathering.create({
      data: {
        organizerId,
        title,
        location,
        venueType: venueType || VenueType.RESTAURANT, // use provided value or default
        timezone,
        timeOptions,
        rsvpDeadline: new Date(rsvpDeadline),
        status: "COLLECTING", // Default status
      },
    });

    res.status(201).json(gathering);
  } catch (error) {
    res.status(400).json({ error: "Failed to create gathering" });
  }
});

// GET /gatherings/:id - Get gathering by ID
// Find one gathering by ID - unique ID
// Include fetch organiser user data and responses data
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const gathering = await prisma.gathering.findUnique({
      where: { id },
      include: {
        organizer: true,
        responses: {
          include: {
            user: true, // ← Include user data with each response!
          },
        },
      },
    });

    if (!gathering) {
      return res.status(404).json({ error: "Gathering not found" });
    }

    res.json(gathering);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch gathering" });
  }
});

// PATCH /gatherings/:id - Update gathering (mainly status)
// PATCH updates specific fields vs POST: new and PUT overwrites/replaces
router.patch("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { status, agentOutput } = req.body;

    const gathering = await prisma.gathering.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(agentOutput && { agentOutput }),
      },
    });

    res.json(gathering);
  } catch (error) {
    res.status(400).json({ error: "Failed to update gathering" });
  }
});
// Make router available for import in index.ts
export default router;
