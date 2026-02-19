import { describe, it, expect, beforeEach, vi } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import { useGestorConfigStore } from "@/stores/gestorConfig";
import { DEFAULT_COMPANY_NAME, DEFAULT_CONTACT_DATA } from "@/interfaces";
import type { GestorConfig } from "@/interfaces";

vi.mock("@/infrastructure/gestorConfigStorage", () => ({
  loadGestorConfig: vi.fn(),
  saveGestorConfig: vi.fn(),
}));

import * as gestorConfigStorage from "@/infrastructure/gestorConfigStorage";

const fullConfig = (overrides: Partial<GestorConfig> = {}): GestorConfig => ({
  companyName: "",
  logoUrl: null,
  numberOfPeople: 1,
  businessType: "",
  contactData: { ...DEFAULT_CONTACT_DATA },
  onboardingComplete: false,
  ...overrides,
});

describe("useGestorConfigStore", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.mocked(gestorConfigStorage.loadGestorConfig).mockReturnValue(null);
  });

  it("should_show_default_company_name_when_empty", () => {
    const store = useGestorConfigStore();
    expect(store.displayCompanyName).toBe(DEFAULT_COMPANY_NAME);
  });

  it("should_initialize_from_storage", () => {
    vi.mocked(gestorConfigStorage.loadGestorConfig).mockReturnValue(
      fullConfig({ companyName: "Mi Empresa", logoUrl: "data:image/png;base64,x" })
    );
    const store = useGestorConfigStore();
    store.initialize("u1");
    expect(store.displayCompanyName).toBe("Mi Empresa");
    expect(store.displayLogoUrl).toBe("data:image/png;base64,x");
  });

  it("should_save_config_via_setConfig", () => {
    const store = useGestorConfigStore();
    const config = fullConfig({ companyName: "Test", logoUrl: null });
    store.setConfig("u1", config);
    expect(store.displayCompanyName).toBe("Test");
    expect(gestorConfigStorage.saveGestorConfig).toHaveBeenCalledWith("u1", config);
  });
});
