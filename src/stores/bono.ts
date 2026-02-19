import { defineStore } from "pinia";
import { ref, computed } from "vue";
import type { BonoTemplate, ClientBono } from "@/interfaces/bono";
import { bonosApi } from "@/infrastructure/bonosApi";

export const useBonoStore = defineStore("bono", () => {
  const templates = ref<BonoTemplate[]>([]);
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

  const getTemplateById = (id: string) =>
    templates.value.find((t) => t.id === id);

  const addTemplate = async (data: Omit<BonoTemplate, "id">): Promise<BonoTemplate> => {
    const created = await bonosApi.createTemplate(data);
    templates.value.push(created);
    return created;
  };

  const updateTemplate = async (id: string, updates: Partial<Omit<BonoTemplate, "id">>): Promise<void> => {
    const updated = await bonosApi.updateTemplate(id, updates);
    const index = templates.value.findIndex((t) => t.id === id);
    if (index !== -1) templates.value[index] = updated;
  };

  const deleteTemplate = async (id: string): Promise<void> => {
    await bonosApi.deleteTemplate(id);
    templates.value = templates.value.filter((t) => t.id !== id);
    clientBonos.value = clientBonos.value.filter((b) => b.templateId !== id);
  };

  const getBonosByClientId = (clientId: string) =>
    clientBonos.value.filter((b) => b.clientId === clientId);

  const isClientBonoActive = (b: ClientBono, template: BonoTemplate | undefined) => {
    if (!template) return false;
    if (template.type === "pack") {
      return (b.remainingSessions ?? 0) > 0;
    }
    return (b.freeSessionsRemaining ?? 0) > 0 || (b.paidCount ?? 0) >= 0;
  };

  const getActiveBonosForClient = (clientId: string) => {
    return getBonosByClientId(clientId).filter((b) => {
      const t = getTemplateById(b.templateId);
      return isClientBonoActive(b, t);
    });
  };

  const clientIdsWithActiveBono = computed(() => {
    const set = new Set<string>();
    clientBonos.value.forEach((b) => {
      const t = getTemplateById(b.templateId);
      if (isClientBonoActive(b, t)) set.add(b.clientId);
    });
    return set;
  });

  const hasActiveBono = (clientId: string) =>
    clientIdsWithActiveBono.value.has(clientId);

  const assignBonoToClient = async (
    clientId: string,
    templateId: string,
  ): Promise<ClientBono | null> => {
    const template = getTemplateById(templateId);
    if (!template) return null;
    const bono = await bonosApi.createClientBono(clientId, templateId);
    clientBonos.value.push(bono);
    return bono;
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
    const bono = clientBonos.value.find((x) => x.id === clientBonoId);
    const template = bono ? getTemplateById(bono.templateId) : undefined;
    if (!bono || !template || template.type !== "loyalty") return false;

    const trigger = template.loyaltyTriggerEvery ?? 0;
    const reward = template.loyaltyRewardSessions ?? 0;
    if (trigger < 1) return false;

    const paid = (bono.paidCount ?? 0) + 1;
    const newPaidCount = paid >= trigger ? paid - trigger : paid;
    const newFree = paid >= trigger
      ? (bono.freeSessionsRemaining ?? 0) + reward
      : bono.freeSessionsRemaining ?? 0;

    await bonosApi.updateClientBono(clientBonoId, {
      paidCount: newPaidCount,
      freeSessionsRemaining: newFree,
    });
    bono.paidCount = newPaidCount;
    bono.freeSessionsRemaining = newFree;
    return true;
  };

  const useLoyaltyFreeSession = async (clientBonoId: string): Promise<boolean> => {
    const bono = clientBonos.value.find((x) => x.id === clientBonoId);
    if (
      !bono ||
      bono.freeSessionsRemaining === undefined ||
      bono.freeSessionsRemaining < 1
    )
      return false;
    const newFree = bono.freeSessionsRemaining - 1;
    await bonosApi.updateClientBono(clientBonoId, { freeSessionsRemaining: newFree });
    bono.freeSessionsRemaining = newFree;
    return true;
  };

  return {
    templates,
    clientBonos,
    initialize,
    getTemplateById,
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
