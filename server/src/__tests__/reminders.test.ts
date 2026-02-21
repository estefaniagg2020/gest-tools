import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import request from "supertest";
import { withAuth, mockPrisma } from "./helpers.js";
import { remindersRouter } from "../routes/reminders.js";

vi.mock("../services/whatsapp.js", () => ({
  sendAppointmentReminder: vi.fn().mockResolvedValue({ success: true }),
  sendAppointmentConfirmation: vi.fn().mockResolvedValue({ success: true }),
}));

import { sendAppointmentReminder } from "../services/whatsapp.js";

const now = new Date();
const in12h = new Date(now.getTime() + 12 * 60 * 60 * 1000);

const fakeAppointment = {
  id: "apt-1",
  businessId: "biz-1",
  serviceId: "svc-1",
  start: in12h,
  end: new Date(in12h.getTime() + 60 * 60 * 1000),
  status: "confirmed",
  service: { id: "svc-1", name: "Corte" },
  business: { name: "Salón Glamour" },
  user: { phone: "+34600111222", name: "Laura", username: "laura" },
};

describe("Reminders routes", () => {
  let prisma: ReturnType<typeof mockPrisma>;
  let app: ReturnType<typeof withAuth>;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv("WHATSAPP_ACCESS_TOKEN", "wa-test-token");
    vi.stubEnv("CRON_SECRET", "");

    prisma = mockPrisma({
      appointment: {
        findMany: vi.fn().mockResolvedValue([fakeAppointment]),
      },
      gestorConfig: {
        findMany: vi.fn().mockResolvedValue([
          { businessId: "biz-1", whatsappRemindersEnabled: true, whatsappPhoneNumberId: "phone-id-1" },
        ]),
      },
    });
    app = withAuth(remindersRouter(prisma));
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("should_send_reminders_and_return_counts_when_POST_send", async () => {
    const res = await request(app).post("/send");
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("sent");
    expect(res.body).toHaveProperty("errors");
    expect(res.body).toHaveProperty("total");
    expect(res.body.total).toBe(1);
  });

  it("should_call_whatsapp_service_for_each_eligible_appointment", async () => {
    await request(app).post("/send");
    expect(sendAppointmentReminder).toHaveBeenCalledTimes(1);
  });

  it("should_return_503_when_whatsapp_token_not_configured", async () => {
    vi.stubEnv("WHATSAPP_ACCESS_TOKEN", "");
    const res = await request(app).post("/send");
    expect(res.status).toBe(503);
  });

  it("should_return_401_when_cron_secret_set_but_header_missing", async () => {
    vi.stubEnv("CRON_SECRET", "super-secret");
    const res = await request(app).post("/send");
    expect(res.status).toBe(401);
  });

  it("should_allow_request_when_cron_secret_matches_header", async () => {
    vi.stubEnv("CRON_SECRET", "super-secret");
    const res = await request(app).post("/send").set("x-cron-secret", "super-secret");
    expect(res.status).toBe(200);
  });

  it("should_skip_appointments_without_user_phone", async () => {
    prisma.appointment.findMany = vi.fn().mockResolvedValue([
      { ...fakeAppointment, user: { phone: null, name: "Sin Teléfono", username: "sin-tel" } },
    ]);
    await request(app).post("/send");
    expect(sendAppointmentReminder).not.toHaveBeenCalled();
  });
});
