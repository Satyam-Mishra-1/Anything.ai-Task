import jwt from "jsonwebtoken";
import { env } from "../config/env";
import type { AuthUser, JwtPayload, UserRole } from "../types/auth";

export function signAccessToken(user: AuthUser): string {
  const payload: JwtPayload = { sub: user.id, role: user.role };
  // jsonwebtoken typings are stricter; cast to accept string durations like "15m".
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN as any,
  } as any);
}

export function verifyAccessToken(token: string): JwtPayload {
  const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
  if (!decoded?.sub || !decoded?.role) {
    throw new Error("Invalid token payload");
  }
  return decoded;
}

export function normalizeRole(role: string): UserRole {
  if (role === "ADMIN") return "ADMIN";
  return "USER";
}

