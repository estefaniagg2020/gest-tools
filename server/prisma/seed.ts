import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import crypto from "crypto";

const hashPassword = (password: string, salt: string): string =>
  crypto.createHash("sha256").update(salt + password).digest("hex");

const generateSalt = (): string => crypto.randomBytes(16).toString("hex");

const DEFAULT_USERNAME = "admin";
const DEFAULT_PASSWORD = "admin";

/** UTC datetime helper */
const dt = (year: number, month: number, day: number, hour: number, minute = 0): Date =>
  new Date(Date.UTC(year, month - 1, day, hour, minute));

async function main() {
  const pool = new pg.Pool({ connectionString: process.env["DATABASE_URL"] });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  // ── 1. Ensure admin user exists ──────────────────────────────────────────
  let admin = await prisma.user.findUnique({ where: { username: DEFAULT_USERNAME } });
  if (!admin) {
    const salt = generateSalt();
    admin = await prisma.user.create({
      data: {
        username: DEFAULT_USERNAME,
        passwordHash: hashPassword(DEFAULT_PASSWORD, salt),
        salt,
        role: "gestor",
      },
    });
    console.log(`[seed] Admin user created: ${DEFAULT_USERNAME} / ${DEFAULT_PASSWORD}`);
  } else {
    console.log(`[seed] Admin user already exists: ${DEFAULT_USERNAME}`);
  }

  // ── 2. Always ensure demo data exists ────────────────────────────────────
  // Note: This seed is idempotent - it will create missing data but won't duplicate existing records

  // ── 3. Get or create Company + Business ───────────────────────────────────
  let business = await prisma.business.findFirst();

  if (!business) {
    const company = await prisma.company.create({ data: { name: "Demo Clínica SL" } });
    business = await prisma.business.create({
      data: { name: "Clínica Estética Demo", companyId: company.id },
    });
    console.log(`[seed] Company + Business created: ${business.name}`);
  } else {
    console.log(`[seed] Using existing business: ${business.id}`);
  }

  // ── 4. Ensure GestorConfig exists ─────────────────────────────────────────
  const existingConfig = await prisma.gestorConfig.findUnique({ where: { businessId: business.id } });
  if (!existingConfig) {
    await prisma.gestorConfig.create({
      data: {
        businessId: business.id,
        professionId: null,
        numberOfPeople: 4,
        startHour: 9,
        endHour: 20,
        slotDurationMinutes: 60,
        workDaysPerWeek: 5,
        maxPeoplePerSlot: 2,
        onboardingComplete: true,
      },
    });
    console.log("[seed] GestorConfig created");
  }

  // ── 5. Link admin to business ─────────────────────────────────────────────
  if (!admin.businessId) {
    await prisma.user.update({
      where: { id: admin.id },
      data: { businessId: business.id },
    });
    console.log("[seed] Admin linked to business");
  }

  // ── 6. Employees ──────────────────────────────────────────────────────────
  const employeesData = [
    { name: "Ana García", color: "#f87171", role: "therapist" as const, weeklyHours: 40, defaultWorkStartHour: 9, defaultWorkEndHour: 18 },
    { name: "Carlos Ruiz", color: "#60a5fa", role: "therapist" as const, weeklyHours: 40, defaultWorkStartHour: 9, defaultWorkEndHour: 18 },
    { name: "María López", color: "#34d399", role: "therapist" as const, weeklyHours: 40, defaultWorkStartHour: 10, defaultWorkEndHour: 19 },
    { name: "Pedro Martínez", color: "#a78bfa", role: "manager" as const, weeklyHours: 40, defaultWorkStartHour: 9, defaultWorkEndHour: 18 },
  ];

  const employees = await Promise.all(
    employeesData.map(async (emp) => {
      const existing = await prisma.employee.findFirst({
        where: { name: emp.name, businessId: business.id },
      });
      if (existing) return existing;
      return prisma.employee.create({
        data: { ...emp, businessId: business.id },
      });
    }),
  );
  const [ana, carlos, maria] = employees;
  console.log(`[seed] ${employees.length} employees ensured`);

  // ── 7. Categorías de servicio (clave ajena) ───────────────────────────────
  const categoryDefs = [
    { label: "Masajes", icon: "🤲" },
    { label: "Facial", icon: "🧴" },
    { label: "Uñas", icon: "💅" },
    { label: "Depilación", icon: "✨" },
    { label: "Corporal", icon: "🌿" },
  ];
  const serviceCategories = await Promise.all(
    categoryDefs.map(async (def) => {
      const existing = await prisma.serviceCategory.findFirst({
        where: { businessId: business.id, label: def.label },
      });
      if (existing) return existing;
      return prisma.serviceCategory.create({
        data: { businessId: business.id, label: def.label, icon: def.icon },
      });
    }),
  );
  const categoryByLabel = new Map(
    serviceCategories.map((c) => [c.label, c.id]),
  );
  console.log(`[seed] ${serviceCategories.length} service categories ensured`);

  // ── 8. Services (con categoryId FK) ───────────────────────────────────────
  const servicesData = [
    { name: "Masaje Relajante", category: "Masajes", duration: 60, price: 45 },
    { name: "Limpieza Facial", category: "Facial", duration: 45, price: 35 },
    { name: "Manicura", category: "Uñas", duration: 30, price: 20 },
    { name: "Depilación", category: "Depilación", duration: 30, price: 25 },
    { name: "Tratamiento Antiedad", category: "Facial", duration: 90, price: 80 },
    { name: "Masaje Descontracturante", category: "Masajes", duration: 50, price: 55 },
    { name: "Limpieza facial profunda", category: "Facial", duration: 60, price: 50 },
    { name: "Pedicura", category: "Uñas", duration: 60, price: 35 },
    { name: "Manicura semipermanente", category: "Uñas", duration: 60, price: 35 },
    { name: "Depilación con cera piernas", category: "Depilación", duration: 30, price: 22 },
    { name: "Depilación con cera axilas", category: "Depilación", duration: 15, price: 12 },
    { name: "Depilación con cera bikini", category: "Depilación", duration: 20, price: 18 },
    { name: "Envoltura corporal", category: "Corporal", duration: 60, price: 65 },
  ];

  const services = await Promise.all(
    servicesData.map(async (svc) => {
      const existing = await prisma.service.findFirst({
        where: { name: svc.name, businessId: business.id },
      });
      if (existing) {
        const catId = categoryByLabel.get(svc.category) ?? null;
        if (!existing.categoryId && catId) {
          await prisma.service.update({
            where: { id: existing.id },
            data: { categoryId: catId },
          });
        }
        return existing;
      }
      const categoryId = categoryByLabel.get(svc.category) ?? null;
      return prisma.service.create({
        data: {
          name: svc.name,
          category: svc.category,
          duration: svc.duration,
          price: svc.price,
          businessId: business.id,
          categoryId,
        },
      });
    }),
  );
  const [masaje, limpieza, manicura, depilacion, antiedad] = services;
  console.log(`[seed] ${services.length} services ensured`);

  // ── 9. Client users ───────────────────────────────────────────────────────
  const clientsData = [
    { username: "laura.fernandez", name: "Laura Fernández", email: "laura@demo.com" },
    { username: "miguel.torres", name: "Miguel Torres", email: "miguel@demo.com" },
    { username: "sofia.blanco", name: "Sofía Blanco", email: "sofia@demo.com" },
    { username: "javier.moreno", name: "Javier Moreno", email: "javier@demo.com" },
    { username: "carmen.diaz", name: "Carmen Díaz", email: "carmen@demo.com" },
    { username: "antonio.sanchez", name: "Antonio Sánchez", email: "antonio@demo.com" },
  ];

  const clients = await Promise.all(
    clientsData.map(async ({ username, name, email }) => {
      const existing = await prisma.user.findUnique({ where: { username } });
      if (existing) return existing;
      const s = generateSalt();
      return prisma.user.create({
        data: {
          username,
          name,
          email,
          role: "client",
          passwordHash: hashPassword("client123", s),
          salt: s,
          businessId: business!.id,
        },
      });
    }),
  );
  console.log(`[seed] ${clients.length} client users ensured`);

  const [laura, miguel, sofia, javier, carmen, antonio] = clients;

  // ── 10. Appointments (February 2026) ─────────────────────────────────────
  // Today: 2026-02-18 (Wednesday). Current week: Mon 16 – Sun 22.
  //
  // Stats produced:
  //   reservasMes = 28 confirmed   reservasCanceladas = 3  tasaCancelacion ≈ 10%
  //   ingresosMes ≈ 1 125 €        beneficioHoy = 180 €
  //   reservasSemana = 10          horasTrabajadasSemana ≈ 8.25 h
  //   serviciosPopulares: masaje(8), limpieza(7), manicura(5), antiedad(4), depilacion(4)
  //   empleadoMasReservas: Ana García (11)
  //   clientesNuevos = 6

  type ApptDef = {
    day: number;
    hour: number;
    duration: number;
    svcId: string;
    empId: string;
    userId: string;
    status?: string;
  };

  const Y = 2026;
  const MO = 2;

  const appts: ApptDef[] = [
    // ── Past confirmed (Feb 2–17) ────────────────────────────────────────
    { day: 2,  hour: 10, duration: 60, svcId: masaje.id,    empId: ana.id,    userId: laura.id },
    { day: 3,  hour: 11, duration: 45, svcId: limpieza.id,  empId: carlos.id, userId: miguel.id },
    { day: 3,  hour: 14, duration: 30, svcId: manicura.id,  empId: maria.id,  userId: sofia.id },
    { day: 4,  hour: 10, duration: 90, svcId: antiedad.id,  empId: ana.id,    userId: carmen.id },
    { day: 5,  hour: 15, duration: 30, svcId: depilacion.id,empId: carlos.id, userId: laura.id },
    { day: 6,  hour: 9,  duration: 60, svcId: masaje.id,    empId: maria.id,  userId: javier.id },
    { day: 7,  hour: 11, duration: 45, svcId: limpieza.id,  empId: ana.id,    userId: antonio.id },
    { day: 10, hour: 10, duration: 30, svcId: manicura.id,  empId: maria.id,  userId: laura.id },
    { day: 10, hour: 14, duration: 60, svcId: masaje.id,    empId: carlos.id, userId: sofia.id },
    { day: 11, hour: 9,  duration: 90, svcId: antiedad.id,  empId: ana.id,    userId: miguel.id },
    { day: 12, hour: 11, duration: 30, svcId: depilacion.id,empId: carlos.id, userId: carmen.id },
    { day: 13, hour: 10, duration: 45, svcId: limpieza.id,  empId: maria.id,  userId: javier.id },
    { day: 14, hour: 14, duration: 60, svcId: masaje.id,    empId: ana.id,    userId: laura.id },
    { day: 17, hour: 10, duration: 30, svcId: manicura.id,  empId: carlos.id, userId: antonio.id },
    { day: 17, hour: 15, duration: 45, svcId: limpieza.id,  empId: ana.id,    userId: sofia.id },
    // ── Past cancelled ────────────────────────────────────────────────────
    { day: 3,  hour: 16, duration: 60, svcId: masaje.id,   empId: carlos.id, userId: antonio.id, status: "cancelled" },
    { day: 8,  hour: 10, duration: 30, svcId: manicura.id, empId: maria.id,  userId: miguel.id,  status: "cancelled" },
    { day: 14, hour: 9,  duration: 90, svcId: antiedad.id, empId: ana.id,    userId: javier.id,  status: "cancelled" },
    // ── Today (Feb 18) — past morning + upcoming afternoon ───────────────
    { day: 18, hour: 9,  duration: 60, svcId: masaje.id,   empId: ana.id,    userId: laura.id },
    { day: 18, hour: 11, duration: 45, svcId: limpieza.id, empId: carlos.id, userId: sofia.id },
    { day: 18, hour: 14, duration: 30, svcId: manicura.id, empId: maria.id,  userId: javier.id },
    { day: 18, hour: 16, duration: 90, svcId: antiedad.id, empId: ana.id,    userId: miguel.id },
    // ── Current week (Feb 19–21) ─────────────────────────────────────────
    { day: 19, hour: 10, duration: 60, svcId: masaje.id,    empId: carlos.id, userId: carmen.id },
    { day: 19, hour: 14, duration: 30, svcId: depilacion.id,empId: maria.id,  userId: antonio.id },
    { day: 20, hour: 9,  duration: 45, svcId: limpieza.id,  empId: ana.id,    userId: laura.id },
    { day: 21, hour: 11, duration: 60, svcId: masaje.id,    empId: carlos.id, userId: javier.id },
    // ── Later in February ─────────────────────────────────────────────────
    { day: 24, hour: 10, duration: 60, svcId: masaje.id,   empId: carlos.id, userId: sofia.id },
    { day: 25, hour: 11, duration: 90, svcId: antiedad.id, empId: ana.id,    userId: miguel.id },
    { day: 26, hour: 14, duration: 30, svcId: manicura.id, empId: maria.id,  userId: javier.id },
    { day: 27, hour: 9,  duration: 45, svcId: limpieza.id, empId: carlos.id, userId: carmen.id },
    { day: 28, hour: 10, duration: 30, svcId: depilacion.id,empId: ana.id,   userId: antonio.id },
  ];

  let createdCount = 0;
  for (const a of appts) {
    const start = dt(Y, MO, a.day, a.hour);
    const end = new Date(start.getTime() + a.duration * 60 * 1000);
    const existing = await prisma.appointment.findFirst({
      where: {
        businessId: business.id,
        serviceId: a.svcId,
        userId: a.userId,
        employeeId: a.empId,
        start,
      },
    });
    if (!existing) {
      await prisma.appointment.create({
        data: {
          businessId: business.id,
          serviceId: a.svcId,
          userId: a.userId,
          employeeId: a.empId,
          start,
          end,
          status: a.status ?? "confirmed",
          paymentStatus: "simulated_paid",
        },
      });
      createdCount++;
    }
  }
  console.log(`[seed] ${createdCount} new appointments created (${appts.length} total ensured)`);
  console.log("[seed] ✅ Seed complete!");

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
