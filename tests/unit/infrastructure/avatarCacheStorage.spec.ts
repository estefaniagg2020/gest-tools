import { describe, it, expect, beforeEach } from "vitest";
import { loadAvatarCache, saveAvatarCache } from "@/infrastructure/avatarCacheStorage";

const KEY = "spa-avatar-url-cache";

describe("avatarCacheStorage", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe("loadAvatarCache", () => {
    it("should_return_empty_object_when_no_data_stored", () => {
      expect(loadAvatarCache()).toEqual({});
    });

    it("should_return_parsed_record_when_valid_json_stored", () => {
      const cache = { "Ana|200": "https://example.com/1.jpg" };
      localStorage.setItem(KEY, JSON.stringify(cache));
      expect(loadAvatarCache()).toEqual(cache);
    });

    it("should_return_only_string_entries", () => {
      const stored = { "a|1": "url1", "b|2": 123, "c|3": "url3" };
      localStorage.setItem(KEY, JSON.stringify(stored));
      expect(loadAvatarCache()).toEqual({ "a|1": "url1", "c|3": "url3" });
    });

    it("should_return_empty_object_when_stored_value_is_not_object", () => {
      localStorage.setItem(KEY, JSON.stringify([]));
      expect(loadAvatarCache()).toEqual({});
    });

    it("should_return_empty_object_when_invalid_json", () => {
      localStorage.setItem(KEY, "not json");
      expect(loadAvatarCache()).toEqual({});
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
