import { Request, Response, NextFunction } from "express";
import { JwtPayload } from "../utils/jwt";
declare global {
    namespace Express {
        interface Request {
            user?: JwtPayload;
        }
    }
}
/**
 * Auth middleware - Protects routes that require authentication
 * Extracts JWT from Authorization header, verifies it, and attaches user to request
 */
export declare function requireAuth(req: Request, res: Response, next: NextFunction): Response<any, Record<string, any>> | undefined;
//# sourceMappingURL=auth.d.ts.map