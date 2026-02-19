import { Router } from "express";
import { PrismaClient } from "@prisma/client";

export const publicRouter = (prisma: PrismaClient) => {
  const router = Router();

  // GET /business/:slug -> Public Profile Data
  router.get("/business/:slug", async (req, res) => {
    try {
      const { slug } = req.params;
      
      const business = await prisma.business.findFirst({
        where: { gestorConfig: { slug } },
        include: {
          gestorConfig: true,
          services: {
            where: { onlineBookingEnabled: true },
            include: { serviceCategory: true }
          },
          workspaceMembers: {
             select: { id: true, name: true, photoUrl: true, role: true, position: true }
          },
        }
      });

      if (!business) {
        res.status(404).json({ error: "Business not found" });
        return;
      }

      const config = business.gestorConfig; 
      
      const publicData = {
        id: business.id,
        name: business.name,
        slug: config?.slug,
        description: config?.description,
        contact: {
            phone: config?.publicPhoneNumber,
            socials: config?.socialLinks,
            address: config?.address,
            email: config?.email 
        },
        services: business.services,
        team: business.workspaceMembers
      };

      res.json(publicData);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Server error" });
    }
  });



  // GET /availability -> Check slots
  router.get("/availability", async (req, res) => {
      res.json({ slots: ["09:00", "10:00", "11:00", "15:00", "16:00"] });
  });

  return router;
};
