import { defineStore } from "pinia";
import { ref } from "vue";
import type { Client } from "@/interfaces";
import { clientsApi } from "@/infrastructure/clientsApi";

export const useClientStore = defineStore("client", () => {
  const clients = ref<Client[]>([]);

  const initialize = async (): Promise<void> => {
    try {
      clients.value = await clientsApi.getClients();
    } catch {
      clients.value = [];
    }
  };

  const getClientById = (id: string) => clients.value.find((c) => c.id === id);

  const addClient = async (client: Omit<Client, "id">): Promise<Client> => {
    const created = await clientsApi.createClient(client);
    clients.value.push(created);
    return created;
  };

  const updateClient = async (id: string, updates: Partial<Omit<Client, "id">>): Promise<void> => {
    const updated = await clientsApi.updateClient(id, updates);
    const index = clients.value.findIndex((c) => c.id === id);
    if (index !== -1) clients.value[index] = updated;
  };

  const deleteClient = async (id: string): Promise<void> => {
    await clientsApi.deleteClient(id);
    clients.value = clients.value.filter((c) => c.id !== id);
  };

  return {
    clients,
    initialize,
    getClientById,
    addClient,
    updateClient,
    deleteClient,
  };
});
