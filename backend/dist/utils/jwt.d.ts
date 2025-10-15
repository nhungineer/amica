export interface JwtPayload {
    userId: string;
    email: string;
}
/**
 * Generate a JWT token for a user
 * @param payload - User data to encode in the token
 * @returns Signed JWT token string
 */
export declare function generateToken(payload: JwtPayload): string;
/**
 * Verify and decode a JWT token
 * @param token - JWT token string to verify
 * @returns Decoded payload if valid
 * @throws Error if token is invalid or expired
 */
export declare function verifyToken(token: string): JwtPayload;
//# sourceMappingURL=jwt.d.ts.map