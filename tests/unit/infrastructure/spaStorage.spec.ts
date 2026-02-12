import { describe, it, expect, beforeEach } from "vitest";
import type { Spa } from "@/interfaces";
import { loadStoredSpas, loadStoredCurrentSpaId, saveSpaList, saveCurrentSpaId } from "@/infrastructure/spaStorage";

describe("spaStorage", () => {
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

    it("should_return_null_when_stored_value_is_not_array", () => {
      localStorage.setItem("spa-list", JSON.stringify({ foo: 1 }));
      expect(loadStoredSpas()).toBeNull();
    });

    it("should_return_null_when_stored_value_is_invalid_json", () => {
      localStorage.setItem("spa-list", "invalid{");
      expect(loadStoredSpas()).toBeNull();
    });
  });

  describe("loadStoredCurrentSpaId", () => {
    it("should_return_null_when_no_id_stored", () => {
      expect(loadStoredCurrentSpaId()).toBeNull();
    });

    it("should_return_stored_id", () => {
      localStorage.setItem("spa-current-id", "spa-123");
      expect(loadStoredCurrentSpaId()).toBe("spa-123");
    });
  });

  describe("saveSpaList", () => {
    it("should_persist_list_for_loadStoredSpas", () => {
      const spas: Spa[] = [{ id: "s1", name: "Spa 1", themeColor: "#000" }];
      saveSpaList(spas);
      expect(loadStoredSpas()).toEqual(spas);
    });
  });

  describe("saveCurrentSpaId", () => {
    it("should_persist_id_for_loadStoredCurrentSpaId", () => {
      saveCurrentSpaId("my-spa-id");
      expect(loadStoredCurrentSpaId()).toBe("my-spa-id");
    });
  });
});
