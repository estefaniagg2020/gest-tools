import { describe, it, expect, beforeEach } from "vitest";
import { getAvatarUrlForName, getCachedAvatarUrlForName, getRandomAnimalAvatarUrl } from "@/utils/avatar";

describe("getAvatarUrlForName", () => {
  it("should_return_same_url_for_same_name", () => {
    const url1 = getAvatarUrlForName("Ana García");
    const url2 = getAvatarUrlForName("Ana García");
    expect(url1).toBe(url2);
  });

  it("should_return_different_urls_for_different_names", () => {
    const url1 = getAvatarUrlForName("Ana");
    const url2 = getAvatarUrlForName("Pedro");
    expect(url1).not.toBe(url2);
  });

  it("should_use_base_animal_image_domain", () => {
    const url = getAvatarUrlForName("Test");
    expect(url).toMatch(/^https:\/\/randomfox\.ca\/images\/\d+\.jpg$/);
  });

  it("should_handle_empty_or_whitespace_name", () => {
    const url = getAvatarUrlForName("  ");
    expect(url).toMatch(/^https:\/\/randomfox\.ca\/images\/\d+\.jpg$/);
  });
});

describe("getCachedAvatarUrlForName", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("should_return_deterministic_url_for_name_when_cache_empty", () => {
    const url = getCachedAvatarUrlForName("Maria", 200);
    expect(url).toMatch(/^https:\/\/randomfox\.ca\/images\/\d+\.jpg$/);
  });

  it("should_return_same_as_getAvatarUrlForName_when_no_cache", () => {
    const cached = getCachedAvatarUrlForName("Luis", 200);
    const direct = getAvatarUrlForName("Luis", 200);
    expect(cached).toBe(direct);
  });
});

describe("getRandomAnimalAvatarUrl", () => {
  it("should_return_valid_animal_image_url", () => {
    const url = getRandomAnimalAvatarUrl();
    expect(url).toMatch(/^https:\/\/randomfox\.ca\/images\/\d+\.jpg$/);
  });
});
