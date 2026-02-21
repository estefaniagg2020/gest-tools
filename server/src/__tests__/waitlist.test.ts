import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import { withAuth, mockPrisma, TEST_USER } from "./helpers.js";
import { waitlistRouter } from "../routes/waitlist.js";

vi.mock("../services/waitlist.js", () => ({
  addToWaitlist: vi.fn().mockResolvedValue({ id: "wl-new", userId: "user-1", businessId: "biz-1" }),
  addClientToWaitlist: vi.fn().mockResolvedValue({ id: "wl-new-staff", clientId: "cli-1", businessId: "biz-1" }),
  getMyWaitlist: vi.fn().mockResolvedValue([{ id: "wl-1", serviceId: "svc-1" }]),
  getMyNotifications: vi.fn().mockResolvedValue([{ id: "notif-1", read: false }]),
  markNotificationRead: vi.fn().mockResolvedValue(undefined),
  getWaitlistByBusiness: vi.fn().mockResolvedValue([{ id: "wl-1", clientId: "cli-1" }]),
  notifyWaitlistForFreedSlot: vi.fn().mockResolvedValue(undefined),
}));

import {
  addToWaitlist,
  addClientToWaitlist,
  getMyWaitlist,
  getMyNotifications,
  markNotificationRead,
  getWaitlistByBusiness,
} from "../services/waitlist.js";

const BIZ = "biz-1";
const CLIENT_USER = { ...TEST_USER, role: { name: "client" }, workspaces: [] };

describe("Waitlist routes", () => {
  let prisma: ReturnType<typeof mockPrisma>;
  let app: ReturnType<typeof withAuth>;

  beforeEach(() => {
    vi.clearAllMocks();
    prisma = mockPrisma();
    app = withAuth(waitlistRouter(prisma));
  });

  it("should_return_waitlist_for_business_when_staff_GET_by-business", async () => {
    const res = await request(app).get("/by-business");
    expect(res.status).toBe(200);
    expect(res.body[0].id).toBe("wl-1");
    expect(getWaitlistByBusiness).toHaveBeenCalledWith(expect.anything(), BIZ);
  });

  it("should_return_403_when_non_staff_GET_by-business", async () => {
    prisma.user.findFirst = vi.fn().mockResolvedValue({ ...CLIENT_USER });
    const res = await request(app).get("/by-business");
    expect(res.status).toBe(403);
  });

  it("should_add_client_to_waitlist_when_staff_POST_for-client", async () => {
    const res = await request(app).post("/for-client").send({
      clientId: "cli-1",
      serviceId: "svc-1",
      preferredStart: "2025-06-10T09:00:00Z",
      preferredEnd: "2025-06-10T10:00:00Z",
    });
    expect(res.status).toBe(201);
    expect(addClientToWaitlist).toHaveBeenCalledWith(
      expect.anything(), BIZ, "cli-1", "svc-1", "2025-06-10T09:00:00Z", "2025-06-10T10:00:00Z",
    );
  });

  it("should_return_400_when_POST_for-client_missing_required_fields", async () => {
    const res = await request(app).post("/for-client").send({ clientId: "cli-1" });
    expect(res.status).toBe(400);
  });

  it("should_return_400_when_for-client_service_throws", async () => {
    vi.mocked(addClientToWaitlist).mockRejectedValueOnce(new Error("Ya está en la lista"));
    const res = await request(app).post("/for-client").send({
      clientId: "cli-1", serviceId: "svc-1",
      preferredStart: "2025-06-10T09:00:00Z", preferredEnd: "2025-06-10T10:00:00Z",
    });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Ya está en la lista");
  });

  it("should_add_self_to_waitlist_when_authenticated_POST_slash", async () => {
    const res = await request(app).post("/").send({
      businessId: BIZ,
      serviceId: "svc-1",
      preferredStart: "2025-06-10T09:00:00Z",
      preferredEnd: "2025-06-10T10:00:00Z",
    });
    expect(res.status).toBe(201);
    expect(addToWaitlist).toHaveBeenCalled();
  });

  it("should_return_400_when_POST_slash_missing_required_fields", async () => {
    const res = await request(app).post("/").send({ businessId: BIZ });
    expect(res.status).toBe(400);
  });

  it("should_return_my_waitlist_entries_when_GET_slash", async () => {
    const res = await request(app).get("/");
    expect(res.status).toBe(200);
    expect(res.body[0].serviceId).toBe("svc-1");
    expect(getMyWaitlist).toHaveBeenCalledWith(expect.anything(), TEST_USER.id);
  });

  it("should_return_my_notifications_when_GET_notifications", async () => {
    const res = await request(app).get("/notifications");
    expect(res.status).toBe(200);
    expect(res.body[0].read).toBe(false);
    expect(getMyNotifications).toHaveBeenCalledWith(expect.anything(), TEST_USER.id);
  });

  it("should_mark_notification_read_when_PATCH_notifications_id_read", async () => {
    const res = await request(app).patch("/notifications/notif-1/read");
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(markNotificationRead).toHaveBeenCalledWith(expect.anything(), "notif-1", TEST_USER.id);
  });
});
