"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateToken = generateToken;
exports.verifyToken = verifyToken;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
// Get JWT secret from environment variables
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
    throw new Error("JWT_SECRET environment variable is required");
}
/**
 * Generate a JWT token for a user
 * @param payload - User data to encode in the token
 * @returns Signed JWT token string
 */
function generateToken(payload) {
    // Sign the token with 7-day expiration
    // Use non-null assertion (!) because we validated JWT_SECRET above
    return jsonwebtoken_1.default.sign(payload, JWT_SECRET, {
        expiresIn: "7d",
    });
}
/**
 * Verify and decode a JWT token
 * @param token - JWT token string to verify
 * @returns Decoded payload if valid
 * @throws Error if token is invalid or expired
 */
function verifyToken(token) {
    try {
        // Verify signature and decode payload
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        // Extract our custom fields
        return {
            userId: decoded.userId,
            email: decoded.email,
        };
    }
    catch (error) {
        if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
            throw new Error("Token has expired");
        }
        if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
            throw new Error("Invalid token");
        }
        throw error;
    }
}
//# sourceMappingURL=jwt.js.map