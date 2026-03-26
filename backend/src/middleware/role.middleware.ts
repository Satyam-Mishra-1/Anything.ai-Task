import type { NextFunction, Request, Response } from "express";
import { HttpError } from "../utils/httpError";
import type { UserRole } from "../types/auth";

export function requireRole(role: UserRole) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const user = req.user;
    if (!user) {
      return next(
        new HttpError({
          status: 401,
          code: "UNAUTHORIZED",
          message: "Authentication required",
        })
      );
    }
    if (user.role !== role) {
      return next(
        new HttpError({
          status: 403,
          code: "FORBIDDEN",
          message: "Insufficient permissions",
        })
      );
    }
    return next();
  };
}

