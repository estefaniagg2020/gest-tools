import { describe, it, expect, beforeEach } from "vitest";
import type { Spa } from "@/interfaces";
import { loadStoredSpas, loadStoredCurrentSpaId, saveSpaList, saveCurrentSpaId } from "@/infrastructure/spaStorage";

describe("spaStorage", () => {
  beforeEach(() => {
    saveSpaList([]);
    saveCurrentSpaId("");
  });

  describe("loadStoredSpas", () => {
    it("should_return_saved_array_when_data_is_saved", () => {
      const spas: Spa[] = [{ id: "s1", name: "Spa 1", themeColor: "#000" }];
      saveSpaList(spas);
      expect(loadStoredSpas()).toEqual(spas);
    });
  });

  describe("loadStoredCurrentSpaId", () => {
    it("should_return_saved_id", () => {
      saveCurrentSpaId("spa-123");
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
