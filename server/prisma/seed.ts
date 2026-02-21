import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import { ensureRoleTemplates } from "../src/services/ensureRoles.js";
import { ensureProfessionTemplates } from "../src/services/ensureTemplates.js";

async function main() {
  const pool = new pg.Pool({ connectionString: process.env["DATABASE_URL"] });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  await ensureRoleTemplates(prisma);
  await ensureProfessionTemplates(prisma);

  await prisma.$disconnect();
  await pool.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
