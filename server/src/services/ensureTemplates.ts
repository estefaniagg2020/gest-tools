import type { PrismaClient } from "@prisma/client";
import { PROFESSION_TEMPLATES } from "../data/professionTemplates.js";

export const ensureProfessionTemplates = async (prisma: PrismaClient): Promise<void> => {
  let totalProfessions = 0;
  let totalCategories = 0;
  let totalServices = 0;

  for (const [professionId, template] of Object.entries(PROFESSION_TEMPLATES)) {
    await prisma.profession.upsert({
      where: { id: professionId },
      create: { id: professionId, label: template.label },
      update: { label: template.label },
    });
    totalProfessions++;

    for (const cat of template.categories) {
      await prisma.professionCategory.upsert({
        where: { id: cat.id },
        create: { id: cat.id, professionId, label: cat.label, icon: cat.icon },
        update: { label: cat.label, icon: cat.icon },
      });
      totalCategories++;

      for (const svc of cat.services) {
        await prisma.professionService.upsert({
          where: { id: svc.id },
          create: {
            id: svc.id,
            categoryId: cat.id,
            name: svc.name,
            duration: svc.duration,
            price: svc.price,
            description: svc.description ?? null,
          },
          update: {
            name: svc.name,
            duration: svc.duration,
            price: svc.price,
            description: svc.description ?? null,
          },
        });
        totalServices++;
      }
    }
  }

  console.log(
    `[templates]: ${totalProfessions} profesiones, ${totalCategories} categorías, ${totalServices} servicios de sistema sincronizados`,
  );
};
