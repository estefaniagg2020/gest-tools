import { describe, it, expect, beforeEach } from "vitest";
import type { RejectedRequest } from "@/interfaces";
import { loadRejectedRequests, saveRejectedRequests } from "@/infrastructure/rejectedRequestsStorage";

describe("rejectedRequestsStorage", () => {
  beforeEach(() => {
    saveRejectedRequests([]);
  });

  const createRequest = (overrides: Partial<RejectedRequest> = {}): RejectedRequest => ({
    id: "req-1",
    therapistId: "th-1",
    blockSnapshot: {
      title: "Turno",
      start: "2025-02-03T09:00:00.000Z",
      end: "2025-02-03T10:00:00.000Z",
      type: "work",
    },
    rejectedAt: "2025-02-03T12:00:00.000Z",
    ...overrides,
  });

  describe("loadRejectedRequests", () => {
    it("should_return_empty_array_when_no_data_stored", () => {
      expect(loadRejectedRequests()).toEqual([]);
    });

    it("should_return_saved_array_when_data_is_saved", () => {
      const requests = [createRequest()];
      saveRejectedRequests(requests);
      expect(loadRejectedRequests()).toEqual(requests);
    });
  });

  describe("saveRejectedRequests", () => {
    it("should_persist_requests_for_loadRejectedRequests", () => {
      const requests = [createRequest({ id: "r1" }), createRequest({ id: "r2" })];
      saveRejectedRequests(requests);
      expect(loadRejectedRequests()).toEqual(requests);
    });
  });
});
