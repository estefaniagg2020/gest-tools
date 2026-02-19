import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
dotenv.config();

const prisma = new PrismaClient();

async function main() {
  const businesses = await prisma.business.findMany({
    include: { 
      gestorConfig: {
        include: { profession: true }
      }
    }
  });

  console.log(JSON.stringify(businesses.map(b => ({
    id: b.id,
    name: b.name,
    profession: b.gestorConfig?.profession?.label,
    professionCode: b.gestorConfig?.profession?.code,
    professionId: b.gestorConfig?.professionId
  })), null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
