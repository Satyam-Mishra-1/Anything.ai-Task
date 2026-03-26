import { prisma } from "../config/prisma";
import { hashPassword } from "../utils/password";

export async function seedAdminUser(opts: {
  email: string;
  password: string;
}) {
  const email = opts.email.trim().toLowerCase();
  const password = opts.password;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return;

  await prisma.user.create({
    data: {
      email,
      passwordHash: await hashPassword(password),
      role: "ADMIN",
    },
  });
}

