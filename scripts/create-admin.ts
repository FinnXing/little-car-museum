import nextEnv from "@next/env";
import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../src/lib/auth/password.ts";

nextEnv.loadEnvConfig(process.cwd());

const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
const password = process.env.ADMIN_PASSWORD;

if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
  throw new Error("Set a valid ADMIN_EMAIL before running admin:create.");
}
if (!password || password.length < 8 || password.length > 200) {
  throw new Error(
    "Set ADMIN_PASSWORD with 8 to 200 characters before running admin:create.",
  );
}

const prisma = new PrismaClient();

try {
  const passwordHash = await hashPassword(password);
  const admin = await prisma.admin.upsert({
    where: { email },
    create: { email, passwordHash, role: "ADMIN", isActive: true },
    update: { passwordHash, role: "ADMIN", isActive: true },
    select: { id: true, email: true, role: true },
  });
  console.log(`Admin ready: ${admin.email} (${admin.id})`);
} finally {
  await prisma.$disconnect();
}
