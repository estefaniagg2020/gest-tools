import express from "express";
import type { PrismaClient } from "@prisma/client";

export const TEST_TOKEN = "test-token-12345";
export const TEST_USER = {
  id: "user-1",
  username: "admin",
  role: { name: "admin" },
  name: "Admin",
  email: null,
  phone: null,
  workspaces: [{ businessId: "biz-1" }],
};

type ModelMock = Record<string, ReturnType<typeof vi.fn>>;

// Creates a mock PrismaClient with cached per-model objects so fn reassignments work.
export function mockPrisma(overrides: Record<string, Partial<ModelMock>> = {}): PrismaClient {
  const cache = new Map<string, ModelMock>();

  const makeModel = (name: string): ModelMock => {
    if (cache.has(name)) return cache.get(name)!;
    const base: ModelMock = {
      findMany: vi.fn().mockResolvedValue([]),
      findUnique: vi.fn().mockResolvedValue(null),
      findFirst: vi.fn().mockResolvedValue(null),
      create: vi.fn().mockResolvedValue({}),
      update: vi.fn().mockResolvedValue({}),
      delete: vi.fn().mockResolvedValue({}),
      deleteMany: vi.fn().mockResolvedValue({ count: 0 }),
      upsert: vi.fn().mockResolvedValue({}),
      count: vi.fn().mockResolvedValue(0),
    };
    // Apply overrides for this model
    const modelOverrides = overrides[name] ?? {};
    Object.assign(base, modelOverrides);
    // Special: user.findFirst must return TEST_USER so requireAuth passes
    if (name === "user" && !overrides.user?.findFirst) {
      base.findFirst = vi.fn().mockResolvedValue(TEST_USER);
    }
    cache.set(name, base);
    return base;
  };

  const proxyHandler: ProxyHandler<object> = {
    get(_target, prop: string) {
      if (prop === "$transaction") {
        return vi.fn().mockImplementation(
          async (cbOrArray: ((tx: PrismaClient) => Promise<unknown>) | Promise<unknown>[]) => {
            if (typeof cbOrArray === "function") return cbOrArray(proxy as PrismaClient);
            return Promise.all(cbOrArray);
          },
        );
      }
      return makeModel(prop);
    },
  };
  const proxy = new Proxy({} as PrismaClient, proxyHandler);
  return proxy;
}

// Creates an Express app from a router, injecting the auth Bearer token on every request
export function withAuth(router: ReturnType<typeof express.Router>) {
  const app = express();
  app.use(express.json());
  app.use("/", (_req, _res, next) => {
    (_req as Record<string, unknown>).authTokenInjected = true;
    if (!_req.headers.authorization) {
      _req.headers.authorization = `Bearer ${TEST_TOKEN}`;
    }
    next();
  });
  app.use("/", router);
  return app;
}
