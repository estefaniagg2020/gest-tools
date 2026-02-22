import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import express from "express";
import cors from "cors";
import { PrismaClient } from "../generated/prisma/index.js";

// Mock normalizedOrigins to control allowed origins in test
const mockAllowedOrigins = ["http://localhost:5173", "https://www.bokioqest.es"];

// Helper to create the app with the same CORS logic as index.ts
const createTestApp = () => {
  const app = express();
  
  const normalizeOrigin = (origin: string): string => origin.trim().replace(/\/+$/, "");
  
  const originToRegExp = (pattern: string): RegExp => {
    const escaped = pattern.replace(/[.+?^${}()|[\]\\]/g, "\\$&");
    return new RegExp(`^${escaped.replace(/\\\*/g, ".*")}$`);
  };

  const allowedOriginPatterns = mockAllowedOrigins.map(originToRegExp);

  const corsOptions: cors.CorsOptions = {
    origin: (origin, callback) => {
      if (!origin) {
        callback(null, true);
        return;
      }
      const normalizedOrigin = normalizeOrigin(origin);
      const isAllowed = allowedOriginPatterns.some((pattern) => pattern.test(normalizedOrigin));
      
      if (isAllowed) {
        callback(null, true);
        return;
      }

      const isLocalDev = process.env.NODE_ENV !== "production" && 
        /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(normalizedOrigin);
      
      if (isLocalDev) {
        callback(null, true);
        return;
      }

      callback(null, false);
    },
    credentials: true,
  };

  app.use(cors(corsOptions));
  app.options(/.*/, cors(corsOptions));
  
  app.get("/test", (req, res) => {
    res.json({ ok: true });
  });
  
  return app;
};

describe("CORS Configuration", () => {
  it("should allow configured origins", async () => {
    const app = createTestApp();
    const res = await request(app)
      .get("/test")
      .set("Origin", "https://www.bokioqest.es");
    
    expect(res.status).toBe(200);
    expect(res.headers["access-control-allow-origin"]).toBe("https://www.bokioqest.es");
  });

  it("should allow local development origins if not in production", async () => {
    process.env.NODE_ENV = "development";
    const app = createTestApp();
    const res = await request(app)
      .get("/test")
      .set("Origin", "http://127.0.0.1:8080");
    
    expect(res.status).toBe(200);
    expect(res.headers["access-control-allow-origin"]).toBe("http://127.0.0.1:8080");
  });

  it("should block unknown origins", async () => {
    const app = createTestApp();
    const res = await request(app)
      .get("/test")
      .set("Origin", "https://evil.com");
    
    expect(res.status).toBe(200);
    expect(res.headers["access-control-allow-origin"]).toBeUndefined();
  });

  it("should handle preflight requests for allowed origins", async () => {
    const app = createTestApp();
    const res = await request(app)
      .options("/test")
      .set("Origin", "https://www.bokioqest.es")
      .set("Access-Control-Request-Method", "POST");
    
    expect(res.status).toBe(204);
    expect(res.headers["access-control-allow-origin"]).toBe("https://www.bokioqest.es");
  });
});
