<template>
  <Modal
    :is-open="rejections.length > 0"
    @close="dismissCurrent"
  >
    <template #title>{{ SCHEDULER_CONSTANTS.REJECTION_NOTICE_MODAL_TITLE }}</template>
    <div class="space-y-4">
      <p class="text-sm text-gray-700">{{ SCHEDULER_CONSTANTS.REJECTION_NOTICE_INTRO }}</p>
      <div
        v-for="r in rejections"
        :key="r.id"
        class="border border-red-200 rounded-xl p-4 bg-red-50/50 space-y-2"
      >
        <p class="font-bold text-gray-800">{{ r.blockSnapshot.title }}</p>
        <p class="text-xs text-gray-600">
          {{ typeLabel(r.blockSnapshot.type) }} · {{ formatTime(r.blockSnapshot.start) }} –
          {{ formatTime(r.blockSnapshot.end) }}
        </p>
        <p
          v-if="r.blockSnapshot.description"
          class="text-xs text-gray-500"
        >
          {{ r.blockSnapshot.description }}
        </p>
        <p class="text-[10px] text-gray-400 mt-1">Rechazado el {{ formatRejectionDate(r.rejectedAt) }}</p>
      </div>
    </div>
    <template #footer>
      <button
        type="button"
        class="px-4 py-2 bg-spa-teal text-white text-sm font-bold rounded-lg hover:bg-[#005a5d] transition-colors cursor-pointer"
        @click="dismissCurrent"
      >
        {{ SCHEDULER_CONSTANTS.REJECTION_NOTICE_BTN }}
      </button>
    </template>
  </Modal>
</template>

<script setup lang="ts">
  import { storeToRefs } from "pinia";
  import { useRejectedRequestsStore } from "@/stores/rejectedRequests";
  import { SCHEDULER_CONSTANTS } from "@/data/constants";
  import { BLOCK_EDITOR_TYPE_OPTIONS } from "@/data/blockEditorConfig";
  import { formatTime } from "@/composables/useScheduleDates";
  import type { ScheduleBlockType } from "@/interfaces";
  import Modal from "@/components/common/Modal.vue";

  const rejectedRequestsStore = useRejectedRequestsStore();
  const { rejections } = storeToRefs(rejectedRequestsStore);

  const typeLabel = (type: ScheduleBlockType): string => {
    const opt = BLOCK_EDITOR_TYPE_OPTIONS.find((o) => o.value === type);
    return opt?.label ?? "Otro";
  };

  const formatRejectionDate = (iso: string): string =>
    new Intl.DateTimeFormat("es-ES", {
      dateStyle: "short",
      timeStyle: "short",
    }).format(new Date(iso));

  const dismissCurrent = () => {
    const ids = rejections.value.map((r) => r.id);
    ids.forEach((id) => rejectedRequestsStore.dismissRejection(id));
  };
</script>
