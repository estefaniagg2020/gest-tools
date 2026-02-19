import { describe, it, expect, beforeEach, vi } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import { flushPromises } from "@vue/test-utils";
import { useAppointmentStore } from "@/stores/appointment";

vi.mock("@/infrastructure/appointmentsApi", () => ({
  appointmentsApi: {
    getAppointments: vi.fn(),
    createAppointment: vi.fn(),
    updateAppointment: vi.fn(),
    deleteAppointment: vi.fn(),
  },
}));

import { appointmentsApi } from "@/infrastructure/appointmentsApi";

const fakeApt = {
  id: "apt-1",
  start: "2025-02-03T09:00:00.000Z",
  end: "2025-02-03T10:00:00.000Z",
  memberId: "m-1",
  status: "confirmed" as const,
  paymentStatus: "pending" as const,
};

describe("useAppointmentStore", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.mocked(appointmentsApi.getAppointments).mockResolvedValue([fakeApt]);
    vi.mocked(appointmentsApi.createAppointment).mockResolvedValue({ ...fakeApt, id: "apt-new" });
    vi.mocked(appointmentsApi.updateAppointment).mockResolvedValue({ ...fakeApt, status: "cancelled" });
    vi.mocked(appointmentsApi.deleteAppointment).mockResolvedValue(undefined);
  });

  it("should_start_empty", () => {
    const store = useAppointmentStore();
    expect(store.appointments).toHaveLength(0);
  });

  it("should_initialize_from_api", async () => {
    const store = useAppointmentStore();
    await store.initialize();
    expect(store.appointments).toHaveLength(1);
    expect(store.appointments[0].id).toBe("apt-1");
    expect(appointmentsApi.getAppointments).toHaveBeenCalled();
  });

  it("should_initialize_empty_on_api_error", async () => {
    vi.mocked(appointmentsApi.getAppointments).mockRejectedValue(new Error("fail"));
    const store = useAppointmentStore();
    await store.initialize();
    expect(store.appointments).toHaveLength(0);
  });

  it("should_add_appointment_via_api", async () => {
    const store = useAppointmentStore();
    const { id: _, ...payload } = fakeApt;
    const result = await store.add(payload);
    expect(result.id).toBe("apt-new");
    expect(store.appointments).toHaveLength(1);
    expect(appointmentsApi.createAppointment).toHaveBeenCalled();
  });

  it("should_update_appointment_via_api", async () => {
    const store = useAppointmentStore();
    await store.initialize();
    await store.update("apt-1", { status: "cancelled" });
    expect(store.appointments[0].status).toBe("cancelled");
    expect(appointmentsApi.updateAppointment).toHaveBeenCalledWith("apt-1", { status: "cancelled" });
  });

  it("should_cancel_appointment_with_reason", async () => {
    const store = useAppointmentStore();
    await store.initialize();
    vi.mocked(appointmentsApi.updateAppointment).mockResolvedValue({
      ...fakeApt, status: "cancelled", cancellationReason: "Cliente canceló",
    });
    await store.cancel("apt-1", "Cliente canceló");
    expect(appointmentsApi.updateAppointment).toHaveBeenCalledWith(
      "apt-1",
      { status: "cancelled", cancellationReason: "Cliente canceló" },
    );
  });

  it("should_remove_appointment_via_api", async () => {
    const store = useAppointmentStore();
    await store.initialize();
    await store.remove("apt-1");
    expect(store.appointments).toHaveLength(0);
    expect(appointmentsApi.deleteAppointment).toHaveBeenCalledWith("apt-1");
  });

  it("should_getById_return_appointment", async () => {
    const store = useAppointmentStore();
    await store.initialize();
    expect(store.getById("apt-1")).toBeDefined();
    expect(store.getById("x")).toBeUndefined();
  });

  it("should_getByMember_filter_correctly", async () => {
    vi.mocked(appointmentsApi.getAppointments).mockResolvedValue([
      fakeApt,
      { ...fakeApt, id: "apt-2", memberId: "m-2" },
    ]);
    const store = useAppointmentStore();
    await store.initialize();
    expect(store.getByMember("m-1")).toHaveLength(1);
    expect(store.getByMember("m-2")).toHaveLength(1);
    expect(store.getByMember("m-99")).toHaveLength(0);
  });
});
