import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

async function main() {
  const pool = new pg.Pool({ connectionString: process.env["DATABASE_URL"] });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  // No demo data — the app starts clean.
  // The first user is created through the /setup onboarding flow.
  // Profession templates (GlobalProfession, ProfessionCategory, etc.)
  // should be seeded here when that feature is implemented.

  console.log("[seed] ✅ Nothing to seed — clean start.");
  await prisma.$disconnect();
  await pool.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
