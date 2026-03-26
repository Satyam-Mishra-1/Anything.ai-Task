import { z } from "zod";

const EnvSchema = z.object({
  NODE_ENV: z.string().optional(),
  PORT: z.coerce.number().default(3000),

  DATABASE_URL: z.string().min(1),

  JWT_SECRET: z.string().min(16),
  JWT_EXPIRES_IN: z.string().default("15m"),

  CORS_ORIGIN: z.string().default("http://localhost:5173"),

  BCRYPT_SALT_ROUNDS: z.coerce.number().int().positive().default(12),

  REDIS_URL: z.string().optional(),

  // Optional: creates an initial admin user for demonstration.
  SEED_ADMIN: z
    .string()
    .optional()
    .transform((v) => v === "true" || v === "1")
    .default(false),
  ADMIN_EMAIL: z.string().optional(),
  ADMIN_PASSWORD: z.string().optional(),
});

export type Env = z.infer<typeof EnvSchema>;

export const env: Env = EnvSchema.parse(process.env);

