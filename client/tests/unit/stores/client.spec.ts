import { describe, it, expect, beforeEach, vi } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import { useClientStore } from "@/stores/client";

vi.mock("@/infrastructure/clientsApi", () => ({
  clientsApi: {
    getClients: vi.fn(),
    createClient: vi.fn(),
    updateClient: vi.fn(),
    deleteClient: vi.fn(),
  },
}));

import { clientsApi } from "@/infrastructure/clientsApi";

const fakeClient = { id: "cli-1", name: "Ana García", email: "ana@test.com", phone: "600000000" };

describe("useClientStore", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.mocked(clientsApi.getClients).mockResolvedValue([fakeClient]);
    vi.mocked(clientsApi.createClient).mockResolvedValue({ ...fakeClient, id: "cli-new" });
    vi.mocked(clientsApi.updateClient).mockResolvedValue({ ...fakeClient, name: "Ana Actualizada" });
    vi.mocked(clientsApi.deleteClient).mockResolvedValue(undefined);
  });

  it("should_start_empty", () => {
    const store = useClientStore();
    expect(store.clients).toHaveLength(0);
  });

  it("should_initialize_from_api", async () => {
    const store = useClientStore();
    await store.initialize();
    expect(store.clients).toHaveLength(1);
    expect(store.clients[0].name).toBe("Ana García");
    expect(clientsApi.getClients).toHaveBeenCalled();
  });

  it("should_initialize_empty_on_api_error", async () => {
    vi.mocked(clientsApi.getClients).mockRejectedValue(new Error("fail"));
    const store = useClientStore();
    await store.initialize();
    expect(store.clients).toHaveLength(0);
  });

  it("should_add_client_via_api", async () => {
    const store = useClientStore();
    const { id: _, ...payload } = fakeClient;
    const result = await store.addClient(payload);
    expect(result.id).toBe("cli-new");
    expect(store.clients).toHaveLength(1);
    expect(clientsApi.createClient).toHaveBeenCalledWith(payload);
  });

  it("should_update_client_via_api", async () => {
    const store = useClientStore();
    await store.initialize();
    await store.updateClient("cli-1", { name: "Ana Actualizada" });
    expect(store.clients[0].name).toBe("Ana Actualizada");
    expect(clientsApi.updateClient).toHaveBeenCalledWith("cli-1", { name: "Ana Actualizada" });
  });

  it("should_delete_client_via_api", async () => {
    const store = useClientStore();
    await store.initialize();
    await store.deleteClient("cli-1");
    expect(store.clients).toHaveLength(0);
    expect(clientsApi.deleteClient).toHaveBeenCalledWith("cli-1");
  });

  it("should_getClientById_return_correct_client", async () => {
    const store = useClientStore();
    await store.initialize();
    expect(store.getClientById("cli-1")).toBeDefined();
    expect(store.getClientById("x")).toBeUndefined();
  });
});
