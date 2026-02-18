import { defineStore } from "pinia";
import { ref } from "vue";
import type { RejectedRequest, RejectedRequestSnapshot } from "@/interfaces";
import { loadRejectedRequests, saveRejectedRequests } from "@/infrastructure/rejectedRequestsStorage";
import { useAuthStore } from "@/stores/auth";

export const useRejectedRequestsStore = defineStore("rejectedRequests", () => {
  const rejections = ref<RejectedRequest[]>([]);

  const normalizeRejection = (r: RejectedRequest & { therapistId?: string }): RejectedRequest => ({
    ...r,
    memberId: r.memberId ?? r.therapistId ?? "",
  });

  const initialize = () => {
    const authStore = useAuthStore();
    const userId = authStore.currentUserId;
    if (!userId) {
      rejections.value = [];
      return;
    }
    const all = loadRejectedRequests() as (RejectedRequest & { therapistId?: string })[];
    const normalized = all.map(normalizeRejection);
    rejections.value = normalized.filter((r) => r.memberId === userId);
  };

  const addRejection = (memberId: string, blockSnapshot: RejectedRequestSnapshot) => {
    const request: RejectedRequest = {
      id: crypto.randomUUID(),
      memberId,
      blockSnapshot,
      rejectedAt: new Date().toISOString(),
    };
    const all = loadRejectedRequests();
    all.push(request);
    saveRejectedRequests(all);
    const authStore = useAuthStore();
    if (authStore.currentUserId === memberId) {
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
