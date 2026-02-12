import { defineStore } from "pinia";
import { ref } from "vue";
import type { Therapist } from "@/interfaces";
import { DEFAULT_THERAPISTS } from "@/data/therapists";
import { THERAPIST_MANAGER } from "@/data/constants";
import { INDEX_NOT_FOUND } from "@/data/constants";
import { generatePastelColor } from "@/utils/color";

const STORAGE_KEY = "spa-therapists-final";

export const useTherapistStore = defineStore("therapist", () => {
  const therapists = ref<Therapist[]>([]);

  const persistTherapists = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(therapists.value));
  };

  const initialize = () => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as Therapist[];
        const defaultsById = new Map(DEFAULT_THERAPISTS.map((t) => [t.id, t]));
        therapists.value = parsed.map((t) => {
          const def = defaultsById.get(t.id);
          if (!def) return t;
          return {
            ...t,
            linkedInUrl: t.linkedInUrl ?? def.linkedInUrl,
            defaultWorkStartHour:
              t.defaultWorkStartHour ?? def.defaultWorkStartHour ?? THERAPIST_MANAGER.DEFAULT_WORK_START_HOUR,
            defaultWorkEndHour:
              t.defaultWorkEndHour ?? def.defaultWorkEndHour ?? THERAPIST_MANAGER.DEFAULT_WORK_END_HOUR,
          };
        });
      } catch (e) {
        console.error("Error parsing therapists from local storage", e);
        therapists.value = DEFAULT_THERAPISTS;
      }
    } else {
      therapists.value = DEFAULT_THERAPISTS;
    }
  };

  const addTherapist = (therapist: Omit<Therapist, "id" | "color"> & { color?: string }) => {
    const newTherapist: Therapist = {
      ...therapist,
      id: crypto.randomUUID(),
      color: therapist.color || generatePastelColor(),
      role: "therapist",
      defaultWorkStartHour: therapist.defaultWorkStartHour ?? THERAPIST_MANAGER.DEFAULT_WORK_START_HOUR,
      defaultWorkEndHour: therapist.defaultWorkEndHour ?? THERAPIST_MANAGER.DEFAULT_WORK_END_HOUR,
    };
    therapists.value.push(newTherapist);
    persistTherapists();
  };

  const updateTherapist = (id: string, updates: Partial<Therapist>) => {
    const index = therapists.value.findIndex((therapist) => therapist.id === id);
    if (index !== INDEX_NOT_FOUND) {
      therapists.value[index] = { ...therapists.value[index], ...updates };
      persistTherapists();
    }
  };

  const deleteTherapist = (id: string) => {
    therapists.value = therapists.value.filter((therapist) => therapist.id !== id);
    persistTherapists();
  };

  const getTherapistById = (id: string) => {
    return therapists.value.find((therapist) => therapist.id === id);
  };

  return {
    therapists,
    initialize,
    addTherapist,
    updateTherapist,
    deleteTherapist,
    getTherapistById,
  };
});
