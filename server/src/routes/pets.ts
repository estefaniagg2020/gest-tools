import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

export const petsRouter = (prisma: PrismaClient) => {
  const router = Router();

  // Get pets for a specific client (owner)
  router.get("/client/:clientId", async (req: Request, res: Response) => {
    const { clientId } = req.params;
    try {
      const pets = await prisma.pet.findMany({
        where: { ownerId: clientId },
        include: {
          medicalNotes: {
             orderBy: { createdAt: "desc" },
             take: 1 // Latest note
          }
        },
        orderBy: { name: "asc" },
      });
      res.json(pets);
    } catch (error) {
      console.error("Error fetching pets:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Get single pet details
  router.get("/:id", async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
      const pet = await prisma.pet.findUnique({
        where: { id },
        include: {
          owner: {
             select: { id: true, name: true, email: true, phone: true }
          },
          medicalNotes: {
            orderBy: { createdAt: "desc" }
          },
          photos: {
             orderBy: { createdAt: "desc" }
          },
          appointments: {
             orderBy: { start: "desc" },
             take: 5
          }
        },
      });
      
      if (!pet) {
        res.status(404).json({ error: "Pet not found" });
        return;
      }
      
      res.json(pet);
    } catch (error) {
      console.error("Error fetching pet:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Create a new pet
  router.post("/", async (req: Request, res: Response) => {
    const {
      ownerId,
      name,
      breed,
      species,
      birthDate,
      weight,
      needsMuzzle,
      allowsOtherPets,
      needsSedation,
      notes,
    } = req.body;

    if (!ownerId || !name) {
      res.status(400).json({ error: "Missing required fields (ownerId, name)" });
      return;
    }

    try {
      const pet = await prisma.pet.create({
        data: {
          ownerId,
          name,
          breed,
          species: species || "dog",
          birthDate: birthDate ? new Date(birthDate) : null,
          weight: weight ? Number(weight) : null,
          needsMuzzle: Boolean(needsMuzzle),
          allowsOtherPets: allowsOtherPets !== undefined ? Boolean(allowsOtherPets) : true,
          needsSedation: Boolean(needsSedation),
          notes,
        },
      });
      res.json(pet);
    } catch (error) {
      console.error("Error creating pet:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Update a pet
  router.put("/:id", async (req: Request, res: Response) => {
    const { id } = req.params;
    const data = req.body;

    // Remove immutable fields
    delete data.id;
    delete data.ownerId;
    delete data.createdAt;

    try {
      const pet = await prisma.pet.update({
        where: { id },
        data: {
          ...data,
          birthDate: data.birthDate ? new Date(data.birthDate) : undefined,
          weight: data.weight ? Number(data.weight) : undefined,
        },
      });
      res.json(pet);
    } catch (error) {
      console.error("Error updating pet:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Delete a pet
  router.delete("/:id", async (req: Request, res: Response) => {
      const { id } = req.params;
      
      try {
          await prisma.pet.delete({
              where: { id }
          });
          res.json({ success: true });
      } catch (error) {
          console.error("Error deleting pet:", error);
          res.status(500).json({ error: "Internal server error" });
      }
  });

  // --- MEDICAL / TECHNICAL NOTES ---

  // Get notes for a pet
  router.get("/:id/notes", async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
      const notes = await prisma.clientNote.findMany({
        where: { petId: id },
        orderBy: { createdAt: "desc" },
      });
      res.json(notes);
    } catch (error) {
      console.error("Error fetching notes:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Create a note for a pet
  router.post("/:id/notes", async (req: Request, res: Response) => {
    const { id } = req.params;
    const { content, type } = req.body;

    if (!content) {
      res.status(400).json({ error: "Content is required" });
      return;
    }

    try {
      const note = await prisma.clientNote.create({
        data: {
          petId: id,
          content,
          type: type || "GENERAL",
        },
      });
      res.json(note);
    } catch (error) {
      console.error("Error creating note:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  return router;
};
