import { describe, it, expect, beforeEach, vi } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import { useGestorConfigStore } from "@/stores/gestorConfig";
import { DEFAULT_COMPANY_NAME, DEFAULT_CONTACT_DATA } from "@/interfaces";
import type { GestorConfig } from "@/interfaces";
import { businessConfigApi } from "@/infrastructure/businessConfigApi";

vi.mock("@/infrastructure/businessConfigApi", () => ({
  businessConfigApi: {
    getConfig: vi.fn(),
    updateConfig: vi.fn(),
  },
}));

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
    vi.mocked(businessConfigApi.getConfig).mockResolvedValue(null);
    vi.mocked(businessConfigApi.updateConfig).mockResolvedValue(undefined);
  });

  it("should_show_default_company_name_when_empty", () => {
    const store = useGestorConfigStore();
    expect(store.displayCompanyName).toBe(DEFAULT_COMPANY_NAME);
  });

  it("should_initialize_from_api", async () => {
    vi.mocked(businessConfigApi.getConfig).mockResolvedValue(
      fullConfig({ companyName: "Mi Empresa", logoUrl: "data:image/png;base64,x" }) as any,
    );
    const store = useGestorConfigStore();
    await store.initialize("u1", "b1");
    expect(store.displayCompanyName).toBe("Mi Empresa");
    expect(store.displayLogoUrl).toBe("data:image/png;base64,x");
  });

  it("should_update_state_via_setConfig", async () => {
    const store = useGestorConfigStore();
    const config = fullConfig({ companyName: "Test", logoUrl: null });
    await store.setConfig("u1", config, "b1");
    expect(store.displayCompanyName).toBe("Test");
    expect(businessConfigApi.updateConfig).toHaveBeenCalledWith("b1", expect.any(Object));
  });
});
