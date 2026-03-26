import type { Request, Response } from "express";
import { HttpError } from "../utils/httpError";
import { prisma } from "../config/prisma";
import { verifyPassword, hashPassword } from "../utils/password";
import { signAccessToken } from "../utils/jwt";
import { sanitizeText } from "../utils/sanitize";

export class AuthController {
  static async register(req: Request, res: Response) {
    const { email, password } = req.body as { email: string; password: string };

    const normalizedEmail = sanitizeText(email, 200);
    const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (existing) {
      throw new HttpError({
        status: 409,
        code: "EMAIL_ALREADY_EXISTS",
        message: "An account with this email already exists",
      });
    }

    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        passwordHash,
        role: "USER",
      },
      select: { id: true, email: true, role: true },
    });

    return res.status(201).json({ user });
  }

  static async login(req: Request, res: Response) {
    const { email, password } = req.body as { email: string; password: string };
    const normalizedEmail = sanitizeText(email, 200);

    const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (!user) {
      throw new HttpError({
        status: 401,
        code: "INVALID_CREDENTIALS",
        message: "Email or password is incorrect",
      });
    }

    const ok = await verifyPassword(password, user.passwordHash);
    if (!ok) {
      throw new HttpError({
        status: 401,
        code: "INVALID_CREDENTIALS",
        message: "Email or password is incorrect",
      });
    }

    const token = signAccessToken({
      id: user.id,
      email: user.email,
      role: user.role as any,
    });

    return res.status(200).json({
      token,
      user: { id: user.id, email: user.email, role: user.role },
    });
  }

  static async me(req: Request, res: Response) {
    if (!req.user) {
      throw new HttpError({
        status: 401,
        code: "UNAUTHORIZED",
        message: "Authentication required",
      });
    }
    return res.status(200).json({ user: req.user });
  }
}

