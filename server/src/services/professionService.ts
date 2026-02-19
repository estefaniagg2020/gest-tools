import { PrismaClient } from "@prisma/client";

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
    // Create ServiceCategory for Business
    // Check if category already exists to avoid duplicates? 
    // For now, we assume this runs once on setup or forces new categories.
    const businessCat = await prisma.serviceCategory.create({
      data: {
        businessId,
        label: templateCat.label,
        icon: templateCat.icon,
      },
    });

    // 3. Iterate services in category
    for (const templateService of templateCat.services) {
      await prisma.service.create({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        data: {
          businessId,
          categoryId: businessCat.id,
          name: templateService.name,
          duration: templateService.duration,
          price: templateService.price,
          description: templateService.description,
          onlineBookingEnabled: true,
          requiresTherapist: true,
        } as any,
      });
    }
  }
  
  console.log(`[ProfessionService] Done.`);
}
