<template>
  <div
    class="bg-yellow-50 border border-yellow-200 rounded-xl p-3 flex items-center justify-between shadow-sm animate-pulse"
  >
    <div class="flex items-center gap-3">
      <span class="text-2xl">🔔</span>
      <div>
        <p class="text-sm font-bold text-yellow-800">
          {{ SCHEDULER_CONSTANTS.PENDING_CHANGES_MSG(pendingCount) }}
        </p>
        <p class="text-xs text-yellow-700">{{ SCHEDULER_CONSTANTS.REVIEW_HINT }}</p>
      </div>
    </div>
    <button
      type="button"
      class="px-3 py-1.5 bg-yellow-100 hover:bg-yellow-200 text-yellow-800 text-xs font-bold rounded-lg transition-colors cursor-pointer"
      @click="openModal"
    >
      {{ SCHEDULER_CONSTANTS.REVISE_BUTTON }}
    </button>

    <Modal
      :is-open="isModalOpen"
      @close="closeModal"
    >
      <template #title>{{ SCHEDULER_CONSTANTS.PENDING_REVIEW_MODAL_TITLE }}</template>
      <div class="space-y-3">
        <p
          v-if="pendingBlocks.length === 0"
          class="text-sm text-gray-500"
        >
          {{ SCHEDULER_CONSTANTS.PENDING_REVIEW_EMPTY }}
        </p>
        <div
          v-for="block in pendingBlocks"
          :key="block.id"
          class="border border-gray-200 rounded-xl p-3 bg-gray-50 space-y-2"
        >
          <div class="flex items-start justify-between gap-2">
            <div class="min-w-0">
              <p class="font-bold text-gray-800 truncate">{{ block.title }}</p>
              <p class="text-xs text-gray-500">{{ therapistName(block.therapistId) }} · {{ typeLabel(block.type) }}</p>
              <p class="text-xs text-gray-600 mt-1">{{ formatTime(block.start) }} – {{ formatTime(block.end) }}</p>
              <p
                v-if="block.description"
                class="text-xs text-gray-500 mt-1 line-clamp-2"
              >
                {{ block.description }}
              </p>
            </div>
            <div class="flex gap-2 shrink-0">
              <button
                type="button"
                class="px-3 py-1.5 bg-green-100 hover:bg-green-200 text-green-800 text-xs font-bold rounded-lg transition-colors cursor-pointer"
                @click="approve(block)"
              >
                {{ SCHEDULER_CONSTANTS.BTN_APPROVE }}
              </button>
              <button
                type="button"
                class="px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-800 text-xs font-bold rounded-lg transition-colors cursor-pointer"
                @click="reject(block)"
              >
                {{ SCHEDULER_CONSTANTS.BTN_REJECT }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed } from "vue";
  import { useScheduleStore } from "@/stores/schedule";
  import { useTherapistStore } from "@/stores/therapist";
  import { useRejectedRequestsStore } from "@/stores/rejectedRequests";
  import { useToast } from "@/composables/useToast";
  import { SCHEDULER_CONSTANTS } from "@/data/constants";
  import { BLOCK_EDITOR_TYPE_OPTIONS } from "@/data/blockEditorConfig";
  import { formatTime } from "@/composables/useScheduleDates";
  import type { ScheduleBlock, ScheduleBlockType } from "@/interfaces";
  import Modal from "@/components/common/Modal.vue";

  const props = defineProps<{
    pendingBlocks: ScheduleBlock[];
  }>();

  const scheduleStore = useScheduleStore();
  const therapistStore = useTherapistStore();
  const rejectedRequestsStore = useRejectedRequestsStore();
  const { addToast } = useToast();

  const isModalOpen = ref(false);

  const pendingCount = computed(() => props.pendingBlocks.length);

  const typeLabel = (type: ScheduleBlockType): string => {
    const opt = BLOCK_EDITOR_TYPE_OPTIONS.find((o) => o.value === type);
    return opt?.label ?? "Otro";
  };

  const therapistName = (therapistId: string): string => {
    const t = therapistStore.therapists.find((x) => x.id === therapistId);
    return t?.name ?? therapistId;
  };

  const openModal = () => {
    isModalOpen.value = true;
  };

  const closeModal = () => {
    isModalOpen.value = false;
  };

  const approve = (block: ScheduleBlock) => {
    scheduleStore.updateBlock(block.id, { status: "confirmed" });
    addToast(SCHEDULER_CONSTANTS.APPROVED_TOAST, "success");
  };

  const reject = (block: ScheduleBlock) => {
    rejectedRequestsStore.addRejection(block.therapistId, {
      title: block.title,
      start: block.start,
      end: block.end,
      type: block.type,
      description: block.description,
    });
    scheduleStore.deleteBlock(block.id);
    addToast(SCHEDULER_CONSTANTS.REJECTED_TOAST, "info");
  };
</script>
