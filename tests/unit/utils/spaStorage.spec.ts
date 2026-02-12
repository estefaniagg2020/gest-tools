import { describe, it, expect, beforeEach } from "vitest";
import type { Spa } from "@/interfaces";
import { loadStoredSpas, loadStoredCurrentSpaId, saveSpaList, saveCurrentSpaId } from "@/utils/spaStorage";

describe("utils/spaStorage", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe("loadStoredSpas", () => {
    it("should_return_null_when_no_data_stored", () => {
      expect(loadStoredSpas()).toBeNull();
    });

    it("should_return_parsed_array_when_valid_json_stored", () => {
      const spas: Spa[] = [{ id: "s1", name: "Spa 1", themeColor: "#000" }];
      localStorage.setItem("spa-list", JSON.stringify(spas));
      expect(loadStoredSpas()).toEqual(spas);
    });
  });

  describe("loadStoredCurrentSpaId", () => {
    it("should_return_stored_id", () => {
      localStorage.setItem("spa-current-id", "spa-123");
      expect(loadStoredCurrentSpaId()).toBe("spa-123");
    });
  });

  describe("saveSpaList", () => {
    it("should_persist_list", () => {
      const spas: Spa[] = [{ id: "s1", name: "Spa 1", themeColor: "#000" }];
      saveSpaList(spas);
      expect(loadStoredSpas()).toEqual(spas);
    });
  });

  describe("saveCurrentSpaId", () => {
    it("should_persist_id", () => {
      saveCurrentSpaId("my-id");
      expect(loadStoredCurrentSpaId()).toBe("my-id");
    });
  });
});
