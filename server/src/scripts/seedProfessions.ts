/**
 * Seed script: clean leftover professions and re-seed all templates.
 * Run with: npx tsx src/scripts/seedProfessions.ts
 */
import pg from "pg";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import dotenv from "dotenv";
import { ensureProfessionTemplates } from "../services/ensureTemplates.js";
import { PROFESSION_TEMPLATES } from "../data/professionTemplates.js";

dotenv.config();

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const validCodes = Object.keys(PROFESSION_TEMPLATES);

  // 1. Delete professions NOT in our templates (cascades to categories/services)
  const deleted = await (prisma as any).profession.deleteMany({
    where: { code: { notIn: validCodes } },
  });
  console.log(`[cleanup]: Deleted ${deleted.count} professions outside templates`);

  // 2. Upsert all valid professions (inserts missing, updates existing)
  await ensureProfessionTemplates(prisma);

  // 3. Show final list
  const all = await (prisma as any).profession.findMany({
    select: { id: true, code: true, label: true },
    orderBy: { code: "asc" },
  });
  console.log("\n[result]: Professions in DB:");
  for (const p of all) {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(p.id);
    console.log(`  ${isUuid ? "✅" : "⚠️ "} ${p.code.padEnd(22)} ${p.label}`);
  }
}

main()
  .catch(console.error)
  .finally(() => pool.end());
