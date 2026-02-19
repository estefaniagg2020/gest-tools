import { describe, it, expect, beforeEach, vi } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import { useBonoStore } from "@/stores/bono";

vi.mock("@/infrastructure/bonosApi", () => ({
  bonosApi: {
    getTemplates: vi.fn(),
    createTemplate: vi.fn(),
    updateTemplate: vi.fn(),
    deleteTemplate: vi.fn(),
    getClientBonos: vi.fn(),
    createClientBono: vi.fn(),
    updateClientBono: vi.fn(),
    deleteClientBono: vi.fn(),
  },
}));

import { bonosApi } from "@/infrastructure/bonosApi";

const fakeTemplate = {
  id: "tmpl-1",
  name: "Pack 10",
  type: "pack" as const,
  packTotalSessions: 10,
  packPrice: 90,
};

const fakeClientBono = {
  id: "cb-1",
  clientId: "cli-1",
  templateId: "tmpl-1",
  remainingSessions: 8,
  paidCount: 0,
  assignedAt: new Date().toISOString(),
};

describe("useBonoStore", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.mocked(bonosApi.getTemplates).mockResolvedValue([fakeTemplate]);
    vi.mocked(bonosApi.getClientBonos).mockResolvedValue([fakeClientBono]);
    vi.mocked(bonosApi.createTemplate).mockResolvedValue({ ...fakeTemplate, id: "tmpl-new" });
    vi.mocked(bonosApi.updateTemplate).mockResolvedValue({ ...fakeTemplate, packPrice: 80 });
    vi.mocked(bonosApi.deleteTemplate).mockResolvedValue(undefined);
    vi.mocked(bonosApi.createClientBono).mockResolvedValue({ ...fakeClientBono, id: "cb-new" });
    vi.mocked(bonosApi.updateClientBono).mockResolvedValue({ ...fakeClientBono, remainingSessions: 7 });
    vi.mocked(bonosApi.deleteClientBono).mockResolvedValue(undefined);
  });

  it("should_start_empty", () => {
    const store = useBonoStore();
    expect(store.templates).toHaveLength(0);
    expect(store.clientBonos).toHaveLength(0);
  });

  it("should_initialize_templates_and_bonos_from_api", async () => {
    const store = useBonoStore();
    await store.initialize();
    expect(store.templates).toHaveLength(1);
    expect(store.templates[0].name).toBe("Pack 10");
    expect(store.clientBonos).toHaveLength(1);
  });

  it("should_initialize_empty_on_api_error", async () => {
    vi.mocked(bonosApi.getTemplates).mockRejectedValue(new Error("fail"));
    const store = useBonoStore();
    await store.initialize();
    expect(store.templates).toHaveLength(0);
    expect(store.clientBonos).toHaveLength(0);
  });

  it("should_add_template_via_api", async () => {
    const store = useBonoStore();
    const { id: _, ...payload } = fakeTemplate;
    const result = await store.addTemplate(payload);
    expect(result.id).toBe("tmpl-new");
    expect(store.templates).toHaveLength(1);
  });

  it("should_update_template_via_api", async () => {
    const store = useBonoStore();
    await store.initialize();
    await store.updateTemplate("tmpl-1", { packPrice: 80 });
    expect(store.templates[0].packPrice).toBe(80);
  });

  it("should_delete_template_via_api_and_remove_client_bonos", async () => {
    const store = useBonoStore();
    await store.initialize();
    await store.deleteTemplate("tmpl-1");
    expect(store.templates).toHaveLength(0);
    expect(store.clientBonos).toHaveLength(0);
    expect(bonosApi.deleteTemplate).toHaveBeenCalledWith("tmpl-1");
  });

  it("should_assign_bono_to_client", async () => {
    const store = useBonoStore();
    await store.initialize();
    const bono = await store.assignBonoToClient("cli-1", "tmpl-1");
    expect(bono).not.toBeNull();
    expect(bono?.id).toBe("cb-new");
    expect(store.clientBonos).toHaveLength(2);
  });

  it("should_return_null_when_template_not_found", async () => {
    const store = useBonoStore();
    await store.initialize();
    const bono = await store.assignBonoToClient("cli-1", "nonexistent");
    expect(bono).toBeNull();
  });

  it("should_remove_client_bono", async () => {
    const store = useBonoStore();
    await store.initialize();
    await store.removeClientBono("cb-1");
    expect(store.clientBonos).toHaveLength(0);
    expect(bonosApi.deleteClientBono).toHaveBeenCalledWith("cb-1");
  });

  it("should_use_pack_session_decrement_remaining", async () => {
    vi.mocked(bonosApi.updateClientBono).mockResolvedValue({ ...fakeClientBono, remainingSessions: 7 });
    const store = useBonoStore();
    await store.initialize();
    const result = await store.usePackSession("cb-1");
    expect(result).toBe(true);
    expect(store.clientBonos[0].remainingSessions).toBe(7);
  });

  it("should_use_pack_session_return_false_when_no_sessions", async () => {
    vi.mocked(bonosApi.getClientBonos).mockResolvedValue([{ ...fakeClientBono, remainingSessions: 0 }]);
    const store = useBonoStore();
    await store.initialize();
    const result = await store.usePackSession("cb-1");
    expect(result).toBe(false);
  });

  it("should_hasActiveBono_return_true_when_pack_has_sessions", async () => {
    const store = useBonoStore();
    await store.initialize();
    expect(store.hasActiveBono("cli-1")).toBe(true);
  });
});
