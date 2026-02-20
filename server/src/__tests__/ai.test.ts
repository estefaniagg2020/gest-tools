import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import express from "express";
import { aiRouter } from "../routes/ai.js";

vi.mock("../services/aiSlotParser.js", () => ({
  parseSlotQueryWithAI: vi.fn().mockResolvedValue({
    date: "2025-06-15",
    timeFrom: "10:00",
    timeTo: "12:00",
    serviceHint: "corte",
  }),
}));

import { parseSlotQueryWithAI } from "../services/aiSlotParser.js";

const buildApp = () => {
  const app = express();
  app.use(express.json());
  app.use("/", aiRouter());
  return app;
};

describe("AI routes", () => {
  let app: ReturnType<typeof buildApp>;

  beforeEach(() => {
    vi.clearAllMocks();
    app = buildApp();
  });

  it("should_parse_slot_query_and_return_result_when_text_provided", async () => {
    const res = await request(app).post("/parse-slot-query").send({ text: "mañana por la mañana para un corte" });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("date");
    expect(parseSlotQueryWithAI).toHaveBeenCalledWith("mañana por la mañana para un corte");
  });

  it("should_return_400_when_text_is_missing", async () => {
    const res = await request(app).post("/parse-slot-query").send({});
    expect(res.status).toBe(400);
  });

  it("should_return_400_when_text_is_empty_string", async () => {
    const res = await request(app).post("/parse-slot-query").send({ text: "   " });
    expect(res.status).toBe(400);
  });

  it("should_return_400_when_text_exceeds_500_chars", async () => {
    const res = await request(app).post("/parse-slot-query").send({ text: "a".repeat(501) });
    expect(res.status).toBe(400);
  });

  it("should_return_500_when_ai_service_throws", async () => {
    vi.mocked(parseSlotQueryWithAI).mockRejectedValueOnce(new Error("AI unavailable"));
    const res = await request(app).post("/parse-slot-query").send({ text: "quiero cita" });
    expect(res.status).toBe(500);
    expect(res.body.error).toBe("AI unavailable");
  });
});
