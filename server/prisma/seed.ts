import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import crypto from "crypto";

const hashPassword = (password: string, salt: string): string =>
  crypto.createHash("sha256").update(salt + password).digest("hex");

const generateSalt = (): string => crypto.randomBytes(16).toString("hex");

const DEFAULT_USERNAME = "admin";
const DEFAULT_PASSWORD = "admin";

async function main() {
  const pool = new pg.Pool({
    connectionString: process.env["DATABASE_URL"],
  });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });
  const existing = await prisma.user.count();
  if (existing > 0) {
    console.log("[seed] Ya existen usuarios, no se crea el usuario por defecto.");
    await prisma.$disconnect();
    return;
  }
  const salt = generateSalt();
  const passwordHash = hashPassword(DEFAULT_PASSWORD, salt);
  await prisma.user.create({
    data: {
      username: DEFAULT_USERNAME,
      passwordHash,
      salt,
      role: "gestor",
    },
  });
  console.log(
    `[seed] Usuario creado: ${DEFAULT_USERNAME} / ${DEFAULT_PASSWORD} (cámbialo en producción)`,
  );
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
