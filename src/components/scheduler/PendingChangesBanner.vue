<template>
  <div
    class="bg-yellow-50 border border-yellow-200 rounded-xl p-3 flex items-center justify-between shadow-sm animate-pulse"
  >
    <div class="flex items-center gap-3">
      <span class="text-2xl">🔔</span>
      <div>
        <p class="text-sm font-bold text-yellow-800">
          {{ $t('scheduler.pendingChanges', { count: pendingCount }) }}
        </p>
        <p class="text-xs text-yellow-700">{{ $t('scheduler.reviewHint') }}</p>
      </div>
    </div>
    <button
      type="button"
      class="px-3 py-1.5 bg-yellow-100 hover:bg-yellow-200 text-yellow-800 text-xs font-bold rounded-lg transition-colors cursor-pointer"
      @click="openModal"
    >
      {{ $t('scheduler.review') }}
    </button>

    <Modal
      :is-open="isModalOpen"
      @close="closeModal"
    >
      <template #title>{{ $t('scheduler.pendingReviewTitle') }}</template>
      <div class="space-y-3">
        <p
          v-if="pendingBlocks.length === 0"
          class="text-sm text-gray-500"
        >
          {{ $t('scheduler.pendingReviewEmpty') }}
        </p>
        <div
          v-for="block in pendingBlocks"
          :key="block.id"
          class="border border-gray-200 rounded-xl p-3 bg-gray-50 space-y-2"
        >
          <div class="flex items-start justify-between gap-2">
            <div class="min-w-0">
              <p class="font-bold text-gray-800 truncate">{{ block.title }}</p>
              <p class="text-xs text-gray-500">{{ memberName(block.memberId) }} · {{ typeLabel(block.type) }}</p>
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
                {{ $t('scheduler.approve') }}
              </button>
              <button
                type="button"
                class="px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-800 text-xs font-bold rounded-lg transition-colors cursor-pointer"
                @click="reject(block)"
              >
                {{ $t('scheduler.reject') }}
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
  import { useI18n } from "vue-i18n";
  import { useScheduleStore } from "@/stores/schedule";
  import { useTeamStore } from "@/stores/team";
  import { useRejectedRequestsStore } from "@/stores/rejectedRequests";
  import { useToast } from "@/composables/useToast";
  import { BLOCK_EDITOR_TYPE_OPTIONS } from "@/data/blockEditorConfig";
  import { formatTime } from "@/composables/useScheduleDates";
  import type { ScheduleBlock, ScheduleBlockType } from "@/interfaces";
  import Modal from "@/components/common/Modal.vue";

  const props = defineProps<{
    pendingBlocks: ScheduleBlock[];
  }>();

  const { t } = useI18n();
  const scheduleStore = useScheduleStore();
  const teamStore = useTeamStore();
  const rejectedRequestsStore = useRejectedRequestsStore();
  const { addToast } = useToast();

  const isModalOpen = ref(false);

  const pendingCount = computed(() => props.pendingBlocks.length);

  const typeLabel = (type: ScheduleBlockType): string => {
    const opt = BLOCK_EDITOR_TYPE_OPTIONS.find((o) => o.value === type);
    return opt?.label ?? "Otro";
  };

  const memberName = (memberId: string): string => {
    const m = teamStore.members.find((x) => x.id === memberId);
    return m?.name ?? memberId;
  };

  const openModal = () => {
    isModalOpen.value = true;
  };

  const closeModal = () => {
    isModalOpen.value = false;
  };

  const approve = (block: ScheduleBlock) => {
    scheduleStore.updateBlock(block.id, { status: "confirmed" });
    addToast(t("scheduler.approvedToast"), "success");
  };

  const reject = (block: ScheduleBlock) => {
    rejectedRequestsStore.addRejection(block.memberId, {
      title: block.title,
      start: block.start,
      end: block.end,
      type: block.type,
      description: block.description,
    });
    scheduleStore.deleteBlock(block.id);
    addToast(t("scheduler.rejectedToast"), "info");
  };
</script>
