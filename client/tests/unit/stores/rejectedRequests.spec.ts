import { describe, it, expect, beforeEach, vi } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import { useRejectedRequestsStore } from "@/stores/rejectedRequests";
import { useAuthStore } from "@/stores/auth";
import * as storage from "@/infrastructure/rejectedRequestsStorage";

vi.mock("@/infrastructure/rejectedRequestsStorage", () => ({
  loadRejectedRequests: vi.fn(() => []),
  saveRejectedRequests: vi.fn(),
}));

describe("useRejectedRequestsStore", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.mocked(storage.loadRejectedRequests).mockReturnValue([]);
    vi.mocked(storage.saveRejectedRequests).mockImplementation(() => {});
  });

  it("should_initialize_with_empty_rejections_for_current_user", () => {
    const auth = useAuthStore();
    auth.setUser("manager", "5");
    const store = useRejectedRequestsStore();
    store.initialize();
    expect(store.rejections).toEqual([]);
  });

  it("should_add_rejection_and_persist", () => {
    useAuthStore().setUser("employee", "th-1");
    const store = useRejectedRequestsStore();
    const snapshot = {
      title: "Turno",
      start: "2025-02-03T09:00:00.000Z",
      end: "2025-02-03T10:00:00.000Z",
      type: "work" as const,
    };
    store.addRejection("th-1", snapshot);
    expect(store.rejections.length).toBe(1);
    expect(store.rejections[0].blockSnapshot).toEqual(snapshot);
    expect(storage.saveRejectedRequests).toHaveBeenCalled();
  });

  it("should_dismiss_rejection_by_id", () => {
    useAuthStore().setUser("employee", "th-1");
    const store = useRejectedRequestsStore();
    store.addRejection("th-1", {
      title: "T",
      start: "2025-02-03T09:00:00.000Z",
      end: "2025-02-03T10:00:00.000Z",
      type: "work",
    });
    const id = store.rejections[0].id;
    store.dismissRejection(id);
    expect(store.rejections).toHaveLength(0);
  });
});
