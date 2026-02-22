import type { PrismaClient } from "../generated/prisma/index.js";
import { ROLE_TEMPLATES } from "../data/roleTemplates.js";

export const ensureRoleTemplates = async (prisma: PrismaClient): Promise<void> => {
  for (const def of ROLE_TEMPLATES) {
    await prisma.role.upsert({
      where: { name: def.name },
      create: { name: def.name, description: def.description },
      update: { description: def.description },
    });
  }
  console.log(`[templates]: ${ROLE_TEMPLATES.length} roles sincronizados`);
};
