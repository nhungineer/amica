import jwt from "jsonwebtoken";

// Get JWT secret from environment variables
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable is required");
}

// JWT payload structure - what data we store in the token
export interface JwtPayload {
  userId: string;
  email: string;
}

/**
 * Generate a JWT token for a user
 * @param payload - User data to encode in the token
 * @returns Signed JWT token string
 */
export function generateToken(payload: JwtPayload): string {
  // Sign the token with 7-day expiration
  // Use non-null assertion (!) because we validated JWT_SECRET above
  return jwt.sign(payload, JWT_SECRET!, {
    expiresIn: "7d",
  });
}

/**
 * Verify and decode a JWT token
 * @param token - JWT token string to verify
 * @returns Decoded payload if valid
 * @throws Error if token is invalid or expired
 */
export function verifyToken(token: string): JwtPayload {
  try {
    // Verify signature and decode payload
    const decoded = jwt.verify(token, JWT_SECRET!) as jwt.JwtPayload;

    // Extract our custom fields
    return {
      userId: decoded.userId as string,
      email: decoded.email as string,
    };
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error("Token has expired");
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new Error("Invalid token");
    }
    throw error;
  }
}
