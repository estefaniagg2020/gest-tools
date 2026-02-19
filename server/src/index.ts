import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

import { authRouter } from "./routes/auth.js";
import { companyRouter } from "./routes/companies.js";
import { businessRouter } from "./routes/businesses.js";
import { employeeRouter } from "./routes/employees.js";
import { dashboardRouter } from "./routes/dashboard.js";
import { bookingsRouter } from "./routes/bookings.js";
import { waitlistRouter } from "./routes/waitlist.js";
import { remindersRouter } from "./routes/reminders.js";
import { publicRouter } from "./routes/public.js";
import { inventoryRouter } from "./routes/inventory.js";
import { petsRouter } from "./routes/pets.js";
import { appointmentsRouter } from "./routes/appointments.js";
import { clientsRouter } from "./routes/clients.js";
import { scheduleBlocksRouter } from "./routes/schedule-blocks.js";
import { bonosRouter } from "./routes/bonos.js";
import { serviceCategoriesRouter } from "./routes/service-categories.js";
import { settingsRouter } from "./routes/settings.js";
import { professionsRouter } from "./routes/professions.js";
import { ensureProfessionTemplates } from "./services/ensureTemplates.js";

dotenv.config();

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use((req, _res, next) => {
  console.log(`[api] ${req.method} ${req.path}`);
  next();
});

// Main health check
app.get("/health", (req: Request, res: Response) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Modular Routes
app.use("/api/auth", authRouter(prisma));
app.use("/api/public", publicRouter(prisma));
app.use("/api/companies", companyRouter(prisma));
app.use("/api/businesses", businessRouter(prisma));
app.use("/api/employees", employeeRouter(prisma));
app.use("/api/dashboard", dashboardRouter(prisma));
app.use("/api/bookings", bookingsRouter(prisma));
app.use("/api/waitlist", waitlistRouter(prisma));
app.use("/api/reminders", remindersRouter(prisma));
app.use("/api/inventory", inventoryRouter(prisma));
app.use("/api/pets", petsRouter(prisma));
app.use("/api/appointments", appointmentsRouter(prisma));
app.use("/api/clients", clientsRouter(prisma));
app.use("/api/schedule-blocks", scheduleBlocksRouter(prisma));
app.use("/api/bonos", bonosRouter(prisma));
app.use("/api/service-categories", serviceCategoriesRouter(prisma));
app.use("/api/settings", settingsRouter(prisma));
app.use("/api/professions", professionsRouter(prisma));

ensureProfessionTemplates(prisma)
  .then(() => {
    app.listen(port, () => {
      console.log(`[server]: Server is running at http://localhost:${port}`);
      console.log(`[server]: Database connected through Prisma PG Adapter`);
    });
  })
  .catch((err) => {
    console.error("[server]: Failed to ensure profession templates:", err);
    process.exit(1);
  });
