import "dotenv/config";
import { execSync } from "child_process";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const pool = new pg.Pool({ connectionString: process.env["DATABASE_URL"] });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function setupDatabase() {
  try {
    console.log("🔄 Setting up database...");

    // 1. Run migrations
    console.log("📦 Running migrations...");
    execSync("pnpm prisma migrate deploy", { stdio: "inherit", cwd: process.cwd() });

    // 2. Run seed
    console.log("🌱 Seeding database...");
    execSync("pnpm prisma db seed", { stdio: "inherit", cwd: process.cwd() });

    console.log("✅ Database setup complete!");
  } catch (error) {
    console.error("❌ Error setting up database:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

setupDatabase();
