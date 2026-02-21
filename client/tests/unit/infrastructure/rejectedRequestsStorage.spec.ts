import { describe, it, expect, beforeEach } from "vitest";
import type { RejectedRequest } from "@/interfaces";
import { loadRejectedRequests, saveRejectedRequests } from "@/infrastructure/rejectedRequestsStorage";

const STORAGE_KEY = "spa-rejected-requests";

describe("rejectedRequestsStorage", () => {
  beforeEach(() => {
    localStorage.clear();
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

    it("should_return_parsed_array_when_valid_json_stored", () => {
      const requests = [createRequest()];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(requests));
      expect(loadRejectedRequests()).toEqual(requests);
    });

    it("should_return_empty_array_when_stored_value_is_not_array", () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({}));
      expect(loadRejectedRequests()).toEqual([]);
    });

    it("should_return_empty_array_when_invalid_json", () => {
      localStorage.setItem(STORAGE_KEY, "not json");
      expect(loadRejectedRequests()).toEqual([]);
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
