import { defineStore } from "pinia";
import { ref } from "vue";
import type { RejectedRequest, RejectedRequestSnapshot } from "@/interfaces";
import { loadRejectedRequests, saveRejectedRequests } from "@/infrastructure/rejectedRequestsStorage";
import { useAuthStore } from "@/stores/auth";

export const useRejectedRequestsStore = defineStore("rejectedRequests", () => {
  const rejections = ref<RejectedRequest[]>([]);

  const initialize = () => {
    const authStore = useAuthStore();
    const userId = authStore.currentUserId;
    if (!userId) {
      rejections.value = [];
      return;
    }
    const all = loadRejectedRequests();
    rejections.value = all.filter((r) => r.therapistId === userId);
  };

  const addRejection = (therapistId: string, blockSnapshot: RejectedRequestSnapshot) => {
    const request: RejectedRequest = {
      id: crypto.randomUUID(),
      therapistId,
      blockSnapshot,
      rejectedAt: new Date().toISOString(),
    };
    const all = loadRejectedRequests();
    all.push(request);
    saveRejectedRequests(all);
    const authStore = useAuthStore();
    if (authStore.currentUserId === therapistId) {
      rejections.value = [...rejections.value, request];
    }
  };

  const dismissRejection = (id: string) => {
    const all = loadRejectedRequests().filter((r) => r.id !== id);
    saveRejectedRequests(all);
    rejections.value = rejections.value.filter((r) => r.id !== id);
  };

  return {
    rejections,
    initialize,
    addRejection,
    dismissRejection,
  };
});
