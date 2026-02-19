import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const result: any[] = await prisma.$queryRaw`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'Pet';`
  console.log("Pet table found:", result.length > 0)
  
  const allTables: any[] = await prisma.$queryRaw`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;`
  console.log("All tables:", allTables.map(t => t.table_name))
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
