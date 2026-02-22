import "dotenv/config";
import { execSync } from "child_process";
import { PrismaClient } from "../src/generated/prisma/index.js";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const pool = new pg.Pool({ connectionString: process.env["DATABASE_URL"] });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function resetDatabase() {
  try {
    console.log("🔄 Resetting database...");

    // 1. Drop all data (but keep schema)
    console.log("🗑️  Clearing existing data...");
    await prisma.appointment.deleteMany({});
    await prisma.slotWaitlistEntry.deleteMany({});
    await prisma.waitlistNotification.deleteMany({});
    await prisma.clientPhoto.deleteMany({});
    await prisma.stockMovement.deleteMany({});
    await prisma.product.deleteMany({});
    await prisma.supplier.deleteMany({});
    await prisma.service.deleteMany({});
    await prisma.employee.deleteMany({});
    await prisma.gestorConfig.deleteMany({});
    await prisma.user.deleteMany({});
    await prisma.business.deleteMany({});
    await prisma.company.deleteMany({});

    console.log("✅ Data cleared");

    // 2. Run seed
    console.log("🌱 Seeding fresh data...");
    execSync("pnpm prisma db seed", { stdio: "inherit", cwd: process.cwd() });

    console.log("✅ Database reset complete!");
  } catch (error) {
    console.error("❌ Error resetting database:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

resetDatabase();
