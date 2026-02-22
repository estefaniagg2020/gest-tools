import { describe, it, expect, beforeEach } from "vitest";
import { loadAvatarCache, saveAvatarCache } from "@/infrastructure/avatarCacheStorage";

describe("avatarCacheStorage", () => {
  beforeEach(() => {
    saveAvatarCache({});
  });

  describe("loadAvatarCache", () => {
    it("should_return_empty_object_when_no_data_stored", () => {
      expect(loadAvatarCache()).toEqual({});
    });

    it("should_return_saved_record_when_data_is_saved", () => {
      const cache = { "Ana|200": "https://example.com/1.jpg" };
      saveAvatarCache(cache);
      expect(loadAvatarCache()).toEqual(cache);
    });
  });

  describe("saveAvatarCache", () => {
    it("should_persist_cache_for_loadAvatarCache", () => {
      const cache = { "key|200": "https://cdn.example/avatar.jpg" };
      saveAvatarCache(cache);
      expect(loadAvatarCache()).toEqual(cache);
    });
  });
});
