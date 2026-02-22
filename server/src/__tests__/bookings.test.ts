import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import { withAuth, mockPrisma, TEST_USER } from "./helpers.js";
import { bookingsRouter } from "../routes/bookings.js";

vi.mock("../services/whatsapp.js", () => ({
  sendAppointmentConfirmation: vi.fn().mockResolvedValue({ success: true }),
  sendAppointmentReminder: vi.fn().mockResolvedValue({ success: true }),
}));

vi.mock("../services/waitlist.js", () => ({
  notifyWaitlistForFreedSlot: vi.fn().mockResolvedValue(undefined),
  addToWaitlist: vi.fn(),
  addClientToWaitlist: vi.fn(),
  getMyWaitlist: vi.fn(),
  getMyNotifications: vi.fn(),
  markNotificationRead: vi.fn(),
  getWaitlistByBusiness: vi.fn(),
}));

import { notifyWaitlistForFreedSlot } from "../services/waitlist.js";

const BIZ = "biz-1";
const start = "2025-06-15T10:00:00.000Z";
const end = "2025-06-15T10:45:00.000Z";

const fakeService = {
  id: "svc-1",
  businessId: BIZ,
  name: "Corte",
  duration: 45,
  price: 20,
  description: null,
};

const fakeAppointment = {
  id: "apt-new",
  businessId: BIZ,
  serviceId: "svc-1",
  userId: TEST_USER.id,
  start: new Date(start),
  end: new Date(end),
  status: "confirmed",
  paymentStatus: "paid",
  discountPercent: null,
  service: fakeService,
  business: { name: "Salón Glamour" },
};

const CLIENT_USER = { ...TEST_USER, role: { name: "client" } };

describe("Bookings routes", () => {
  let prisma: ReturnType<typeof mockPrisma>;
  let app: ReturnType<typeof withAuth>;

  beforeEach(() => {
    vi.clearAllMocks();
    prisma = mockPrisma({
      user: {
        findFirst: vi.fn().mockResolvedValue(CLIENT_USER),
        findUnique: vi.fn().mockResolvedValue({ phone: null, name: "Cliente" }),
      },
      service: {
        findFirst: vi.fn().mockResolvedValue(fakeService),
      },
      appointment: {
        findFirst: vi.fn().mockResolvedValue(null),
        findUnique: vi.fn().mockResolvedValue(fakeAppointment),
        create: vi.fn().mockResolvedValue(fakeAppointment),
        update: vi.fn().mockResolvedValue({ ...fakeAppointment, status: "cancelled" }),
      },
      gestorConfig: {
        findUnique: vi.fn().mockResolvedValue({ whatsappRemindersEnabled: false }),
      },
    });
    app = withAuth(bookingsRouter(prisma));
  });

  it("should_create_booking_when_client_POST_slash_with_valid_data", async () => {
    const res = await request(app).post("/").send({ businessId: BIZ, serviceId: "svc-1", start, end });
    expect(res.status).toBe(201);
    expect(res.body.id).toBe("apt-new");
  });

  it("should_return_400_when_POST_slash_missing_required_fields", async () => {
    const res = await request(app).post("/").send({ businessId: BIZ });
    expect(res.status).toBe(400);
  });

  it("should_return_403_when_staff_tries_to_create_booking", async () => {
    prisma.user.findFirst = vi.fn().mockResolvedValue(TEST_USER);
    const res = await request(app).post("/").send({ businessId: BIZ, serviceId: "svc-1", start, end });
    expect(res.status).toBe(403);
  });

  it("should_return_404_when_service_not_found", async () => {
    prisma.businessService.findFirst = vi.fn().mockResolvedValue(null);
    const res = await request(app).post("/").send({ businessId: BIZ, serviceId: "no-svc", start, end });
    expect(res.status).toBe(404);
  });

  it("should_return_400_when_slot_duration_does_not_match_service", async () => {
    const wrongEnd = "2025-06-15T11:30:00.000Z";
    const res = await request(app).post("/").send({ businessId: BIZ, serviceId: "svc-1", start, end: wrongEnd });
    expect(res.status).toBe(400);
  });

  it("should_return_409_when_slot_is_already_taken", async () => {
    prisma.appointment.findFirst = vi.fn().mockResolvedValue({ id: "apt-overlap" });
    const res = await request(app).post("/").send({ businessId: BIZ, serviceId: "svc-1", start, end });
    expect(res.status).toBe(409);
  });

  it("should_cancel_booking_when_POST_id_cancel", async () => {
    const res = await request(app).post("/apt-new/cancel");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("cancelled");
  });

  it("should_notify_waitlist_after_cancellation", async () => {
    await request(app).post("/apt-new/cancel");
    expect(notifyWaitlistForFreedSlot).toHaveBeenCalled();
  });

  it("should_return_404_when_cancelling_non_existent_booking", async () => {
    prisma.appointment.findUnique = vi.fn().mockResolvedValue(null);
    const res = await request(app).post("/apt-999/cancel");
    expect(res.status).toBe(404);
  });

  it("should_return_already_cancelled_booking_without_re_cancelling", async () => {
    prisma.appointment.findUnique = vi.fn().mockResolvedValue({ ...fakeAppointment, status: "cancelled" });
    const res = await request(app).post("/apt-new/cancel");
    expect(res.status).toBe(200);
    expect(prisma.appointment.update).not.toHaveBeenCalled();
  });
});
