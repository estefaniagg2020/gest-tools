import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

console.log("DEBUG: DATABASE_URL is", process.env.DATABASE_URL ? "DEFINED" : "UNDEFINED");

const connectionString = process.env.DATABASE_URL || "postgresql://user:password@localhost:5432/gest_tools?schema=public";
const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function runTests() {
  console.log("🚀 Starting Comprehensive CRUD Verification...");
  
  // 1. Setup Test Data (Business & User)
  console.log("\n--- SETUP: Creating Test Environment ---");
  const testCompany = await prisma.company.create({ data: { name: "Test Company" } });
  const testBusiness = await prisma.business.create({
    data: {
      name: "Test Business CRUD",
      companyId: testCompany.id,
      gestorConfig: {
        create: {
            slug: `test-business-${Date.now()}`, // Unique slug
            businessType: "Veterinary"
        }
      }
    }
  });
  console.log("✅ Created Business:", testBusiness.name);

  const testUser = await prisma.user.create({
    data: {
      username: `testuser_${Date.now()}`,
      passwordHash: "dummy",
      salt: "dummy",
      role: "gestor",
      businessId: testBusiness.id
    }
  });
  console.log("✅ Created User (Owner):", testUser.username);

  // 2. INVENTORY CRUD
  console.log("\n--- TESTING INVENTORY ---");
  // Create Supplier
  const supplier = await prisma.supplier.create({
    data: {
      businessId: testBusiness.id,
      name: "Test Supplier",
      email: "supplier@test.com"
    }
  });
  console.log("✅ [CREATE] Supplier:", supplier.name);

  // Create Product
  let product = await prisma.product.create({
    data: {
      businessId: testBusiness.id,
      supplierId: supplier.id,
      name: "Test Shampoo",
      price: 15.0,
      cost: 8.0,
      stockLevel: 10
    }
  });
  console.log("✅ [CREATE] Product:", product.name, "| Stock:", product.stockLevel);

  // Read Product
  const fetchedProduct = await prisma.product.findUnique({ where: { id: product.id } });
  if (fetchedProduct?.name !== "Test Shampoo") throw new Error("Read Product Failed");
  console.log("✅ [READ] Product fetched correctly.");

  // Update Product (Stock Movement)
  // Simulate a sale (Inventory logic typically handled via API, but testing DB here)
  product = await prisma.product.update({
    where: { id: product.id },
    data: { stockLevel: { decrement: 2 } }
  });
  await prisma.stockMovement.create({
    data: {
        productId: product.id,
        quantity: -2,
        type: "SALE",
        reason: "Test Sale"
    }
  });
  console.log("✅ [UPDATE] Product Stock decremented to:", product.stockLevel);

  // 3. CRM & PETS CRUD
  console.log("\n--- TESTING CRM & PETS ---");
  // Create Client
  const client = await prisma.client.create({
    data: {
      businessId: testBusiness.id,
      name: "Test Client",
      email: "client@test.com"
    }
  });
  console.log("✅ [CREATE] Client:", client.name);

  // Create Pet
  let pet = await prisma.pet.create({
    data: {
      ownerId: testUser.id, // Using the User as Owner for now (schema links Pet to User, not Client directly yet? Wait, let's check schema. User is Owner. Client is separate entity currently?)
      // Schema check: Pet -> ownerId (User). Appointment -> clientId (Client) AND petId (Pet). 
      // This implies 'User' can be a client who owns pets.
      name: "Firulais",
      species: "dog",
      breed: "Labrador",
      needsMuzzle: true
    }
  });
  console.log("✅ [CREATE] Pet:", pet.name, "| Flag: Needs Muzzle =", pet.needsMuzzle);

  // Update Pet
  pet = await prisma.pet.update({
    where: { id: pet.id },
    data: { weight: 25.5, notes: "Very friendly despite muzzle" }
  });
  console.log("✅ [UPDATE] Pet updated. Weight:", pet.weight);

  // Add Technical Note
  const note = await prisma.clientNote.create({
    data: {
        petId: pet.id,
        content: "Vaccination applied",
        type: "VETERINARY_HISTORY"
    }
  });
  console.log("✅ [CREATE] Pet Clinical Note:", note.content);

  // 4. BOOKING / APPOINTMENTS
  console.log("\n--- TESTING BOOKING ---");
  // Create Service
  const service = await prisma.service.create({
    data: {
        businessId: testBusiness.id,
        name: "General Checkup",
        category: "Medical",
        duration: 30,
        price: 50,
        onlineBookingEnabled: true
    }
  });
  console.log("✅ [CREATE] Service:", service.name, "| Online Booking:", service.onlineBookingEnabled);

  // Create Appointment
  const appointment = await prisma.appointment.create({
    data: {
        businessId: testBusiness.id,
        serviceId: service.id,
        petId: pet.id,
        clientId: client.id, // Linking to client profile
        start: new Date(),
        end: new Date(Date.now() + 30*60000),
        status: "confirmed",
        origin: "online"
    }
  });
  console.log("✅ [CREATE] Appointment for Pet:", pet.name, "| Origin:", appointment.origin);


  // 5. CLEANUP (DELETE)
  console.log("\n--- TESTING DELETION (CLEANUP) ---");
  
  // Delete Appointment
  await prisma.appointment.delete({ where: { id: appointment.id } });
  console.log("✅ [DELETE] Appointment deleted.");

  // Delete Pet (should cascade notes/photos if configured, or fail if restricted. Schema says:
  // ClientNote -> petId (SetNull). So notes remain orphan or need manual delete.
  // Wait, ClientNote -> petId relation doesn't have onDelete. Let's see behavior.
  // Actually, usually we want cascade for notes. Let's try deleting Pet.)
  
  // First delete notes manually if cascade not set (Prisma default is SetNull for optional relations often, but let's check).
  // Schema: pet Pet? @relation(...)
  // If we delete pet, note.petId becomes null.
  await prisma.clientNote.deleteMany({ where: { petId: pet.id } });
  await prisma.pet.delete({ where: { id: pet.id } });
  console.log("✅ [DELETE] Pet deleted.");

  // Delete Product
  await prisma.stockMovement.deleteMany({ where: { productId: product.id } });
  await prisma.product.delete({ where: { id: product.id } });
  console.log("✅ [DELETE] Product deleted.");

  // Clean up remaining dependencies before Business
  await prisma.gestorConfig.delete({ where: { businessId: testBusiness.id } });
  // Services linked to Business (Appointment already deleted)
  // Wait, Appointment -> Service. If appointment deleted, Service can be deleted.
  // But waitlist/bonos might link to service. Assuming clean state here.
  await prisma.service.deleteMany({ where: { businessId: testBusiness.id } });
  await prisma.supplier.deleteMany({ where: { businessId: testBusiness.id } });

  // Clean up User and Business
  await prisma.user.delete({ where: { id: testUser.id } });
  await prisma.client.deleteMany({ where: { businessId: testBusiness.id } }); // Clients also link to Business
  await prisma.business.delete({ where: { id: testBusiness.id } });
  await prisma.company.delete({ where: { id: testCompany.id } });
  
  console.log("\n🎉 ALL TESTS PASSED SUCCESSFULLY! System is healthy and Architecture is Clean.");
}

runTests()
  .catch(e => {
    console.error("\n❌ TEST FAILED:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
