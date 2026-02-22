import { PrismaClient } from "./src/generated/prisma/index.js";

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://user:password@localhost:5432/gest_tools?schema=public"
    }
  }
})

async function main() {
  const allTables: any[] = await prisma.$queryRaw`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;`
  console.log("ALL TABLES IN DATABASE:")
  allTables.forEach(t => console.log(` - ${t.table_name}`))
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
