import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  loadGestorConfig,
  resetGestorConfigStorage,
  saveGestorConfig,
} from "@/infrastructure/gestorConfigStorage";
import type { GestorConfig } from "@/interfaces";
import { DEFAULT_CONTACT_DATA } from "@/interfaces";

describe("gestorConfigStorage", () => {
  const userId = "user-1";

  const fullConfig = (overrides: Partial<GestorConfig> = {}): GestorConfig => ({
    companyName: "Mi Spa",
    logoUrl: "data:image/png;base64,abc",
    numberOfPeople: 1,
    businessType: "",
    contactData: { ...DEFAULT_CONTACT_DATA },
    onboardingComplete: false,
    ...overrides,
  });

  beforeEach(() => {
    resetGestorConfigStorage();
  });

  afterEach(() => {
    resetGestorConfigStorage();
  });

  it("should_return_null_when_no_config_stored", () => {
    expect(loadGestorConfig(userId)).toBeNull();
  });

  it("should_save_and_load_config", () => {
    const config = fullConfig();
    saveGestorConfig(userId, config);
    const loaded = loadGestorConfig(userId);
    expect(loaded).not.toBeNull();
    expect(loaded?.companyName).toBe(config.companyName);
    expect(loaded?.logoUrl).toBe(config.logoUrl);
    expect(loaded?.numberOfPeople).toBe(config.numberOfPeople);
    expect(loaded?.businessType).toBe(config.businessType);
    expect(loaded?.contactData).toEqual(config.contactData);
    expect(loaded?.onboardingComplete).toBe(config.onboardingComplete);
    expect(Array.isArray(loaded?.teamMembers)).toBe(true);
  });

  it("should_store_per_user", () => {
    saveGestorConfig("user-1", fullConfig({ companyName: "A" }));
    saveGestorConfig("user-2", fullConfig({ companyName: "B" }));
    expect(loadGestorConfig("user-1")?.companyName).toBe("A");
    expect(loadGestorConfig("user-2")?.companyName).toBe("B");
  });
});
