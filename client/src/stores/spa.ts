import { defineStore } from "pinia";
import { ref } from "vue";
import type { Spa } from "@/interfaces";
import { DEFAULT_SPAS } from "@/data/spas";
import { INDEX_NOT_FOUND } from "@/data/constants";
import { loadStoredCurrentSpaId, loadStoredSpas, saveCurrentSpaId, saveSpaList } from "@/utils/spaStorage";

export const useSpaStore = defineStore("spa", () => {
  const spas = ref<Spa[]>([]);
  const currentSpaId = ref<string>("spa-1");

  /** Establece el estado inicial desde persistencia o defaults. */
  const initialize = () => {
    spas.value = loadStoredSpas() ?? DEFAULT_SPAS;
    const storedId = loadStoredCurrentSpaId();
    const isValidStored = storedId !== null && spas.value.some((s) => s.id === storedId);
    currentSpaId.value = isValidStored ? storedId : (spas.value[0]?.id ?? "");
  };

  const setCurrentSpa = (id: string) => {
    if (spas.value.some((spa) => spa.id === id)) {
      currentSpaId.value = id;
      saveCurrentSpaId(id);
    }
  };

  const getSpaById = (id: string) => {
    return spas.value.find((spa) => spa.id === id);
  };

  const addSpa = (spa: Omit<Spa, "id">) => {
    const newSpa: Spa = {
      ...spa,
      id: crypto.randomUUID(),
    };
    spas.value.push(newSpa);
    saveSpaList(spas.value);
  };

  const updateSpa = (id: string, updates: Partial<Spa>) => {
    const index = spas.value.findIndex((spa) => spa.id === id);
    if (index !== INDEX_NOT_FOUND) {
      spas.value[index] = { ...spas.value[index], ...updates };
      saveSpaList(spas.value);
    }
  };

  const deleteSpa = (id: string) => {
    spas.value = spas.value.filter((spa) => spa.id !== id);
    if (currentSpaId.value === id) {
      currentSpaId.value = spas.value.length > 0 ? spas.value[0].id : "";
      saveCurrentSpaId(currentSpaId.value);
    }
    saveSpaList(spas.value);
  };

  return {
    spas,
    currentSpaId,
    initialize,
    setCurrentSpa,
    getSpaById,
    addSpa,
    updateSpa,
    deleteSpa,
  };
});
