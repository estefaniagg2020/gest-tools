import { PrismaClient } from "../generated/prisma/index.js";

export async function instantiateProfessionTemplate(
  prisma: PrismaClient,
  businessId: string,
  professionId: string
) {
  // 1. Fetch the profession with hierarchy
  const profession = await prisma.profession.findUnique({
    where: { id: professionId },
    include: {
      categories: {
        include: { services: true },
      },
    },
  });

  if (!profession) {
    throw new Error(`Profession template '${professionId}' not found.`);
  }

  console.log(`[ProfessionService] Instantiating '${profession.label}' for business ${businessId}...`);

  // 2. Iterate categories
  for (const templateCat of profession.categories) {
    // Guard: skip if already instantiated for this business (avoids duplicates)
    const existing = await prisma.businessCategory.findFirst({
      where: { businessId, sourceCategoryId: templateCat.id },
    });
    if (existing) continue;

    // Create ServiceCategory for Business, linking to the template category
    const businessCat = await prisma.businessCategory.create({
      data: {
        businessId,
        label: templateCat.label,
        icon: templateCat.icon,
        sourceCategoryId: templateCat.id,
      },
    });

    // 3. Iterate services in category, linking to the template service
    for (const templateService of templateCat.services) {
      await prisma.businessService.create({
        data: {
          businessId,
          categoryId: businessCat.id,
          name: templateService.name,
          duration: templateService.duration,
          price: templateService.price,
          description: templateService.description,
          sourceServiceId: templateService.id,
          onlineBookingEnabled: true,
          requiresTherapist: true,
        },
      });
    }
  }

  console.log(`[ProfessionService] Done.`);
}
