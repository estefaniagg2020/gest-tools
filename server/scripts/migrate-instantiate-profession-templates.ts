/**
 * One-time migration script: instantiate profession templates for existing businesses.
 *
 * Before the new catalog system, businesses read directly from ProfessionCategory/ProfessionService.
 * Now each business needs its own BusinessCategory/BusinessService rows copied from the templates.
 *
 * Usage:  npx tsx scripts/migrate-instantiate-profession-templates.ts
 */
import "dotenv/config";
import pg from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/index.js";
import { instantiateProfessionTemplate } from "../src/services/professionService.js";

async function main() {
  const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter } as any);

  const businesses = await prisma.business.findMany({
    select: { id: true, name: true, professionId: true },
  });

  console.log(`Found ${businesses.length} businesses.`);

  for (const business of businesses) {
    if (!business.professionId) {
      console.log(`  [SKIP] ${business.name} — no professionId set`);
      continue;
    }

    const existing = await prisma.businessCategory.count({
      where: { businessId: business.id },
    });

    if (existing > 0) {
      console.log(`  [SKIP] ${business.name} — already has ${existing} categories`);
      continue;
    }

    console.log(`  [MIGRATE] ${business.name} (professionId: ${business.professionId})...`);
    await instantiateProfessionTemplate(prisma, business.id, business.professionId);
    console.log(`  [DONE] ${business.name}`);
  }

  const totalCats = await prisma.businessCategory.count();
  const totalSvcs = await prisma.businessService.count();
  console.log(`\nDone. BusinessCategory: ${totalCats}, BusinessService: ${totalSvcs}`);

  await prisma.$disconnect();
  await pool.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
