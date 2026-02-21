import { defineStore } from "pinia";
import { ref, computed } from "vue";
import type { Bono, ClientBono } from "@/interfaces/bono";
import { bonosApi } from "@/infrastructure/bonosApi";

export const useBonoStore = defineStore("bono", () => {
  const templates = ref<Bono[]>([]);
  const clientBonos = ref<ClientBono[]>([]);

  const initialize = async (): Promise<void> => {
    try {
      const [tmpl, bonos] = await Promise.all([
        bonosApi.getTemplates(),
        bonosApi.getClientBonos(),
      ]);
      templates.value = tmpl;
      clientBonos.value = bonos;
    } catch {
      templates.value = [];
      clientBonos.value = [];
    }
  };

  const getBonoById = (id: string) =>
    templates.value.find((t) => t.id === id);

  const addTemplate = async (data: Omit<Bono, "id">): Promise<Bono> => {
    const created = await bonosApi.createTemplate(data);
    templates.value.push(created);
    return created;
  };

  const updateTemplate = async (id: string, updates: Partial<Omit<Bono, "id">>): Promise<void> => {
    const updated = await bonosApi.updateTemplate(id, updates);
    const index = templates.value.findIndex((t) => t.id === id);
    if (index !== -1) templates.value[index] = updated;
  };

  const deleteTemplate = async (id: string): Promise<void> => {
    await bonosApi.deleteTemplate(id);
    templates.value = templates.value.filter((t) => t.id !== id);
    clientBonos.value = clientBonos.value.filter((b) => b.bonoId !== id);
  };

  const getBonosByClientId = (clientId: string) =>
    clientBonos.value.filter((b) => b.clientId === clientId);

  const isClientBonoActive = (b: ClientBono, bono: Bono | undefined) => {
    if (!bono) return false;
    if (bono.type === "pack") {
      return (b.remainingSessions ?? 0) > 0;
    }
    return (b.freeSessionsRemaining ?? 0) > 0 || (b.paidCount ?? 0) >= 0;
  };

  const getActiveBonosForClient = (clientId: string) => {
    return getBonosByClientId(clientId).filter((b) => {
      const t = getBonoById(b.bonoId);
      return isClientBonoActive(b, t);
    });
  };

  const clientIdsWithActiveBono = computed(() => {
    const set = new Set<string>();
    clientBonos.value.forEach((b) => {
      const t = getBonoById(b.bonoId);
      if (isClientBonoActive(b, t)) set.add(b.clientId);
    });
    return set;
  });

  const hasActiveBono = (clientId: string) =>
    clientIdsWithActiveBono.value.has(clientId);

  const assignBonoToClient = async (
    clientId: string,
    bonoId: string,
  ): Promise<ClientBono | null> => {
    const bono = getBonoById(bonoId);
    if (!bono) return null;
    const created = await bonosApi.createClientBono(clientId, bonoId);
    clientBonos.value.push(created);
    return created;
  };

  const removeClientBono = async (clientBonoId: string): Promise<void> => {
    await bonosApi.deleteClientBono(clientBonoId);
    clientBonos.value = clientBonos.value.filter((b) => b.id !== clientBonoId);
  };

  const usePackSession = async (clientBonoId: string): Promise<boolean> => {
    const b = clientBonos.value.find((x) => x.id === clientBonoId);
    if (!b || b.remainingSessions === undefined || b.remainingSessions < 1)
      return false;
    const newRemaining = b.remainingSessions - 1;
    await bonosApi.updateClientBono(clientBonoId, { remainingSessions: newRemaining });
    b.remainingSessions = newRemaining;
    return true;
  };

  const recordLoyaltyPaidUse = async (clientBonoId: string): Promise<boolean> => {
    const cb = clientBonos.value.find((x) => x.id === clientBonoId);
    const bono = cb ? getBonoById(cb.bonoId) : undefined;
    if (!cb || !bono || bono.type !== "loyalty") return false;

    const trigger = bono.loyaltyTriggerEvery ?? 0;
    const reward = bono.loyaltyRewardSessions ?? 0;
    if (trigger < 1) return false;

    const paid = (cb.paidCount ?? 0) + 1;
    const newPaidCount = paid >= trigger ? paid - trigger : paid;
    const newFree = paid >= trigger
      ? (cb.freeSessionsRemaining ?? 0) + reward
      : cb.freeSessionsRemaining ?? 0;

    await bonosApi.updateClientBono(clientBonoId, {
      paidCount: newPaidCount,
      freeSessionsRemaining: newFree,
    });
    cb.paidCount = newPaidCount;
    cb.freeSessionsRemaining = newFree;
    return true;
  };

  const useLoyaltyFreeSession = async (clientBonoId: string): Promise<boolean> => {
    const cb = clientBonos.value.find((x) => x.id === clientBonoId);
    if (
      !cb ||
      cb.freeSessionsRemaining === undefined ||
      cb.freeSessionsRemaining < 1
    )
      return false;
    const newFree = cb.freeSessionsRemaining - 1;
    await bonosApi.updateClientBono(clientBonoId, { freeSessionsRemaining: newFree });
    cb.freeSessionsRemaining = newFree;
    return true;
  };

  return {
    templates,
    clientBonos,
    initialize,
    getBonoById,
    addTemplate,
    updateTemplate,
    deleteTemplate,
    getBonosByClientId,
    getActiveBonosForClient,
    clientIdsWithActiveBono,
    hasActiveBono,
    assignBonoToClient,
    removeClientBono,
    usePackSession,
    recordLoyaltyPaidUse,
    useLoyaltyFreeSession,
  };
});
