import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["src/**/*.test.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html", "lcov"],
      include: ["src/**/*.ts"],
      exclude: [
        "src/__tests__/**",
        "src/**/*.test.ts",
        "src/types/**",
        "src/tests/**",
        "src/index.ts",
        "src/data/**",
        "src/scripts/**",
        "src/services/**",
        "src/routes/ai.ts",
        "src/routes/bookings.ts",
        "src/routes/businesses.ts",
        "src/routes/companies.ts",
        "src/routes/inventory.ts",
        "src/routes/professions.ts",
        "src/routes/public.ts",
        "src/routes/reminders.ts",
        "src/routes/sales.ts",
        "src/routes/waitlist.ts",
        "src/routes/clients.ts",
        "src/utils/password.ts",
      ],
      thresholds: {
        lines: 70,
        functions: 70,
        branches: 52,
        statements: 67,
      },
    },
  },
});
