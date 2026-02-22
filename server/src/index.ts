import express, { Request, Response, NextFunction } from "express";
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
import { appointmentsRouter } from "./routes/appointments.js";
import { clientsRouter } from "./routes/clients.js";
import { scheduleBlocksRouter } from "./routes/schedule-blocks.js";
import { bonosRouter } from "./routes/bonos.js";
import { serviceCategoriesRouter } from "./routes/service-categories.js";
import { settingsRouter } from "./routes/settings.js";
import { professionsRouter } from "./routes/professions.js";
import { salesRouter } from "./routes/sales.js";
import { aiRouter } from "./routes/ai.js";
import { ensureRoleTemplates } from "./services/ensureRoles.js";
import { ensureProfessionTemplates } from "./services/ensureTemplates.js";

dotenv.config();

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const app = express();
const port = process.env.PORT || 3000;

const normalizeOrigin = (origin: string): string => origin.trim().replace(/\/+$/, "");

const normalizeOrigins = (value: string | undefined): string[] => {
  const parsed = value
    ?.split(",")
    .map((origin) => normalizeOrigin(origin))
    .filter((origin) => origin.length > 0);
  if (parsed && parsed.length > 0) return parsed;
  return ["http://localhost:3000", "http://localhost:5173"];
};

const originToRegExp = (pattern: string): RegExp => {
  const escaped = pattern.replace(/[.+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`^${escaped.replace(/\\\*/g, ".*")}$`);
};

const rawAllowedOrigins = [
  ...(process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : []),
  ...(process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(",") : []),
];
const bokioUrl ="https://www.bokiogest.es"
const allowedOrigins = rawAllowedOrigins.length > 0
  ? rawAllowedOrigins.map(normalizeOrigin).filter((o) => o.length > 0)
  : ["https://www.bokiogest.es", "http://localhost:3000", "http://localhost:5173"];
const allowedOriginPatterns = allowedOrigins.map(originToRegExp);

console.log("[cors] allowed origins:", allowedOrigins);


const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    if (!origin) {
      callback(null, true);
      return;
    }
    const normalizedOrigin = normalizeOrigin(origin);
    const isLocalDevOrigin =
      process.env.NODE_ENV !== "production" &&
      /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(normalizedOrigin);
    const isAllowed = allowedOriginPatterns.some((pattern) => pattern.test(normalizedOrigin));
    if (isAllowed || isLocalDevOrigin) {
      callback(null, true);
      return;
    }
    console.warn("[cors] blocked origin:", normalizedOrigin);
    callback(null, false);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions));
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
app.use("/api/appointments", appointmentsRouter(prisma));
app.use("/api/clients", clientsRouter(prisma));
app.use("/api/schedule-blocks", scheduleBlocksRouter(prisma));
app.use("/api/bonos", bonosRouter(prisma));
app.use("/api/service-categories", serviceCategoriesRouter(prisma));
app.use("/api/settings", settingsRouter(prisma));
app.use("/api/professions", professionsRouter(prisma));
app.use("/api/sales", salesRouter(prisma));
app.use("/api/ai", aiRouter());

app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (res.headersSent) return;
  const message = err instanceof Error ? err.message : String(err);
  const status = (err as { statusCode?: number })?.statusCode ?? 500;
  console.error("[api] Error:", message, err);
  res.status(status).json({ error: message });
});

Promise.all([ensureRoleTemplates(prisma), ensureProfessionTemplates(prisma)])
  .then(() => {
    app.listen(port, () => {
      console.log(`[server]: Server is running at http://localhost:${port}`);
      console.log(`[server]: Database connected through Prisma PG Adapter`);
    });
  })
  .catch((err) => {
    console.error("[server]: Failed to ensure templates:", err);
    process.exit(1);
  });
