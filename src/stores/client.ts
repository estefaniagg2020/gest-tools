import { defineStore } from "pinia";
import { ref } from "vue";
import type { Client } from "@/interfaces";
import { DEFAULT_CLIENTS } from "@/data/clients";
import { loadStoredClients, saveClientList } from "@/infrastructure/clientStorage";

export const useClientStore = defineStore("client", () => {
  const clients = ref<Client[]>([]);

  const initialize = () => {
    clients.value = loadStoredClients() ?? [...DEFAULT_CLIENTS];
  };

  const getClientById = (id: string) => clients.value.find((c) => c.id === id);

  const addClient = (client: Omit<Client, "id">) => {
    const id = `client-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const newClient: Client = { ...client, id };
    clients.value.push(newClient);
    saveClientList(clients.value);
    return newClient;
  };

  const updateClient = (id: string, updates: Partial<Omit<Client, "id">>) => {
    const index = clients.value.findIndex((c) => c.id === id);
    if (index === -1) return;
    clients.value[index] = { ...clients.value[index], ...updates };
    saveClientList(clients.value);
  };

  const deleteClient = (id: string) => {
    clients.value = clients.value.filter((c) => c.id !== id);
    saveClientList(clients.value);
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
