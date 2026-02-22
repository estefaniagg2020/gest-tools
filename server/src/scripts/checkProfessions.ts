import { PrismaClient } from "@prisma/client";
import dotenv from 'dotenv';
dotenv.config();

const prisma = new PrismaClient();

async function main() {
  const businesses = await prisma.business.findMany({
    include: { profession: true }
  });

  console.log(JSON.stringify(businesses.map(b => ({
    id: b.id,
    name: b.name,
    profession: b.profession?.label,
    professionCode: b.profession?.code,
    professionId: b.professionId
  })), null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
