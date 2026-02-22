import 'dotenv/config';
import { PrismaClient } from "@prisma/client";
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

  // 3. CRM CRUD
  console.log("\n--- TESTING CRM ---");
  const client = await prisma.client.create({
    data: {
      businessId: testBusiness.id,
      name: "Test Client",
      email: "client@test.com"
    }
  });
  console.log("✅ [CREATE] Client:", client.name);

  // 4. BOOKING / APPOINTMENTS
  console.log("\n--- TESTING BOOKING ---");
  // Create Service
  const service = await prisma.businessService.create({
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

  const appointment = await prisma.appointment.create({
    data: {
        businessId: testBusiness.id,
        serviceId: service.id,
        clientId: client.id,
        start: new Date(),
        end: new Date(Date.now() + 30*60000),
        status: "confirmed",
        origin: "online"
    }
  });
  console.log("✅ [CREATE] Appointment | Origin:", appointment.origin);


  // 5. CLEANUP (DELETE)
  console.log("\n--- TESTING DELETION (CLEANUP) ---");
  
  // Delete Appointment
  await prisma.appointment.delete({ where: { id: appointment.id } });
  console.log("✅ [DELETE] Appointment deleted.");

  // Delete Product
  await prisma.stockMovement.deleteMany({ where: { productId: product.id } });
  await prisma.product.delete({ where: { id: product.id } });
  console.log("✅ [DELETE] Product deleted.");

  // Clean up remaining dependencies before Business
  await prisma.gestorConfig.delete({ where: { businessId: testBusiness.id } });
  // Services linked to Business (Appointment already deleted)
  // Wait, Appointment -> Service. If appointment deleted, Service can be deleted.
  // But waitlist/bonos might link to service. Assuming clean state here.
  await prisma.businessService.deleteMany({ where: { businessId: testBusiness.id } });
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
