import express from "express";
import crypto from "crypto";
import { prisma } from "../db";
import { generateToken } from "../utils/jwt";

const router = express.Router();

// Resend API setup
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const RESEND_FROM_EMAIL =
  process.env.RESEND_FROM_EMAIL || "Amica <onboarding@resend.dev>";
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

/**
 * POST /auth/send-magic-link
 * Send magic link email to user
 */
router.post("/send-magic-link", async (req, res) => {
  try {
    const { email, name, redirectTo } = req.body;

    // Validation
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    // Find or create user
    let user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      // Create new user if doesn't exist
      user = await prisma.user.create({
        data: {
          email,
          name: name || email.split("@")[0], // Default name from email
        },
      });
    }

    // Generate random token (32 bytes = 64 hex characters)
    const token = crypto.randomBytes(32).toString("hex");

    // Set expiration to 15 minutes from now
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    // Save token to database
    await prisma.loginToken.create({
      data: {
        token,
        userId: user.id,
        email: user.email,
        expiresAt,
      },
    });

    // Build magic link URL
    const magicLink = `${FRONTEND_URL}/auth/verify?token=${token}${
      redirectTo ? `&redirect=${encodeURIComponent(redirectTo)}` : ""
    }`;

    // Send email via Resend
    if (RESEND_API_KEY) {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: RESEND_FROM_EMAIL,
          to: email,
          subject: "Your magic link to log in to Amica",
          html: `
            <h2>Log in to Amica</h2>
            <p>Click the link below to log in:</p>
            <a href="${magicLink}">Log in to Amica</a>
            <p>This link will expire in 15 minutes.</p>
            <p>If you didn't request this, you can safely ignore this email.</p>
          `,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        console.error("Resend error:", error);
        throw new Error("Failed to send email");
      }
    } else {
      // Test mode: Return token directly
      console.log("🔗 Magic link (test mode):", magicLink);
      return res.json({
        message: "Magic link generated (test mode)",
        token, // Only return in development!
        magicLink,
      });
    }

    res.json({ message: "Magic link sent! Check your email." });
  } catch (error) {
    console.error("Error in send-magic-link:", error);
    res.status(500).json({ error: "Failed to send magic link" });
  }
});

/**
 * GET /auth/verify-token?token=xxx
 * Verify magic link token and return JWT
 */
router.get("/verify-token", async (req, res) => {
  try {
    const { token } = req.query;

    if (!token || typeof token !== "string") {
      return res.status(400).json({ error: "Token is required" });
    }

    // Find token in database
    const loginToken = await prisma.loginToken.findUnique({
      where: { token },
      include: { user: true },
    });

    // Validation checks
    if (!loginToken) {
      return res.status(401).json({ error: "Invalid token" });
    }

    if (loginToken.usedAt) {
      return res.status(401).json({ error: "Token already used" });
    }

    if (new Date() > loginToken.expiresAt) {
      return res.status(401).json({ error: "Token expired" });
    }

    // Mark token as used
    await prisma.loginToken.update({
      where: { token },
      data: { usedAt: new Date() },
    });

    // Generate JWT session token
    const jwt = generateToken({
      userId: loginToken.user.id,
      email: loginToken.user.email,
    });

    // Return JWT and user info
    res.json({
      token: jwt,
      user: {
        id: loginToken.user.id,
        email: loginToken.user.email,
        name: loginToken.user.name,
      },
    });
  } catch (error) {
    console.error("Error in verify-token:", error);
    res.status(500).json({ error: "Failed to verify token" });
  }
});

export default router;
