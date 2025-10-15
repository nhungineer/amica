"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAuth = requireAuth;
const jwt_1 = require("../utils/jwt");
/**
 * Auth middleware - Protects routes that require authentication
 * Extracts JWT from Authorization header, verifies it, and attaches user to request
 */
function requireAuth(req, res, next) {
    try {
        // Get token from Authorization header
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ error: "No authorization header" });
        }
        // Expected format: "Bearer <token>"
        const parts = authHeader.split(" ");
        if (parts.length !== 2 || parts[0] !== "Bearer") {
            return res
                .status(401)
                .json({ error: "Invalid authorization header format" });
        }
        const token = parts[1]; // Non-null assertion - we know it exists
        // Verify JWT and extract payload
        const payload = (0, jwt_1.verifyToken)(token);
        // Attach user info to request object for use in route handlers
        req.user = payload;
        // Continue to next middleware/route handler
        next();
    }
    catch (error) {
        if (error instanceof Error) {
            return res.status(401).json({ error: error.message });
        }
        return res.status(401).json({ error: "Authentication failed" });
    }
}
//# sourceMappingURL=auth.js.map