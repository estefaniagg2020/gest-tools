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
import { bookingsRouter } from "./routes/bookings.js";
import { waitlistRouter } from "./routes/waitlist.js";
import { remindersRouter } from "./routes/reminders.js";

dotenv.config();

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Main health check
app.get("/health", (req: Request, res: Response) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Modular Routes
app.use("/api/auth", authRouter(prisma));
app.use("/api/companies", companyRouter(prisma));
app.use("/api/businesses", businessRouter(prisma));
app.use("/api/employees", employeeRouter(prisma));
app.use("/api/bookings", bookingsRouter(prisma));
app.use("/api/waitlist", waitlistRouter(prisma));
app.use("/api/reminders", remindersRouter(prisma));

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
  console.log(`[server]: Database connected through Prisma PG Adapter`);
});
