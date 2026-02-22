import { describe, it, expect, beforeEach } from "vitest";
import type { Spa } from "@/interfaces";
import { loadStoredSpas, loadStoredCurrentSpaId, saveSpaList, saveCurrentSpaId } from "@/utils/spaStorage";

describe("utils/spaStorage", () => {
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
