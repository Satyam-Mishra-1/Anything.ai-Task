import type { NextFunction, Request, Response } from "express";
import { HttpError } from "../utils/httpError";
import { verifyAccessToken } from "../utils/jwt";
import { prisma } from "../config/prisma";

export async function requireAuth(req: Request, _res: Response, next: NextFunction) {
  try {
    const header = req.headers.authorization;
    if (!header) {
      throw new HttpError({
        status: 401,
        code: "UNAUTHORIZED",
        message: "Missing Authorization header",
      });
    }
    const [scheme, token] = header.split(" ");
    if (scheme !== "Bearer" || !token) {
      throw new HttpError({
        status: 401,
        code: "UNAUTHORIZED",
        message: "Invalid Authorization header format",
      });
    }

    const payload = verifyAccessToken(token);
    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, email: true, role: true },
    });

    if (!user) {
      throw new HttpError({
        status: 401,
        code: "UNAUTHORIZED",
        message: "User not found for provided token",
      });
    }

    req.user = { id: user.id, email: user.email, role: user.role as any };
    return next();
  } catch (err) {
    return next(err);
  }
}

