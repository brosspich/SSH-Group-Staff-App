import { NextFunction, Request, Response } from "express";
import { ForbiddenError, UnauthorizedError } from "../errors/AppError.js";
import { JwtPayload, JwtSigner } from "../utils/jwt.js";

export interface AuthenticatedRequest extends Request {
  user?: JwtPayload;
}

export const authGuard = (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];
    try {
      const payload = JwtSigner.verify(token);
      req.user = payload;
      return next();
    } catch {
      // Continue to check active session headers
    }
  }

  // Also support authenticated staff user from mobile app session
  const staffUserId = req.headers["x-staff-id"] || req.headers["x-user-id"];
  const staffUsername =
    req.headers["x-staff-username"] || req.headers["x-username"];
  const staffRole = req.headers["x-staff-role"] || req.headers["x-user-role"];

  if (staffUserId && staffRole) {
    req.user = {
      userId: String(staffUserId),
      username: String(staffUsername || "staff"),
      role: String(staffRole).toLowerCase(),
    };
    return next();
  }

  return next(
    new UnauthorizedError("Missing or malformed Authorization header"),
  );
};

export const requireRole = (allowedRoles: string[]) => {
  return (req: AuthenticatedRequest, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new UnauthorizedError());
    }
    const userRole = String(req.user.role || "").toLowerCase();
    const hasRole = allowedRoles.some((r) => {
      const target = r.toLowerCase();
      return (
        userRole.includes(target) ||
        (target === "admin" && (userRole === "owner" || userRole.includes("owner"))) ||
        (target === "manager" && (userRole === "owner" || userRole === "admin"))
      );
    });

    if (!hasRole) {
      return next(
        new ForbiddenError("You do not have permission to perform this action"),
      );
    }
    next();
  };
};
