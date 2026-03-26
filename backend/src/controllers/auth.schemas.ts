import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().email().transform((v) => v.trim().toLowerCase()),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(72, "Password must be at most 72 characters"),
});

export const loginSchema = z.object({
  email: z.string().email().transform((v) => v.trim().toLowerCase()),
  password: z.string().min(1),
});

