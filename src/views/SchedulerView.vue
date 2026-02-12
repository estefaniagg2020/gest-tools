<template>
  <div class="h-full flex flex-col md:flex-row gap-6 p-4">
    <div class="flex-1 flex flex-col h-full min-w-0 gap-4">
      <PendingChangesBanner
        v-if="authStore.currentRole === ROLE_MANAGER && pendingBlocksCount > 0"
        :pending-blocks="pendingBlocks"
      />
      <RejectionNoticeModal v-if="authStore.currentRole === ROLE_EMPLOYEE" />

      <div
        class="bg-white rounded-2xl shadow-sm border border-gray-100 p-3 md:p-4 flex flex-col md:flex-row md:items-center justify-between gap-3"
      >
        <div>
          <h2 class="text-lg md:text-xl font-bold text-gray-800 flex items-center gap-2">
            <span class="text-xl md:text-2xl">🗓️</span>
            {{ currentTherapist ? `Agenda de ${currentTherapist.name}` : "Mi Horario" }}
          </h2>
          <p class="text-gray-400 text-[10px] md:text-xs mt-0.5 pl-1">
            {{ currentDate.getFullYear() }}
          </p>
        </div>

        <CalendarHeader
          :current-date="currentDate"
          :current-view="view"
          @prev="prev"
          @next="next"
          @today="setToday"
          @changeView="view = $event"
          class="!p-0 !bg-transparent !border-0 !shadow-none w-full md:w-auto overflow-x-auto"
        />

        <button
          type="button"
          class="hidden md:flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-700 text-sm font-medium transition-colors cursor-pointer shrink-0"
          :title="isRightPanelVisible ? 'Ocultar panel' : 'Mostrar panel'"
          @click="isRightPanelVisible = !isRightPanelVisible"
        >
          <span aria-hidden="true">{{ isRightPanelVisible ? "◀ Panel" : "Panel ▶" }}</span>
        </button>
      </div>

      <div
        class="flex-1 min-h-0 relative bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col"
      >
        <div
          v-if="view === 'week'"
          class="flex-1 min-h-0 overflow-y-auto md:hidden p-4"
        >
          <WeekAgendaMobile
            :week-days="weekDays"
            :blocks="filteredBlocks"
            :therapists="filteredTherapists"
            @block-click="handleEditBlock"
          />
        </div>
        <div
          v-if="view === 'week'"
          class="flex-1 min-h-0 overflow-hidden hidden md:block"
        >
          <WeekView
            :week-days="weekDays"
            :blocks="filteredBlocks"
            v-bind="gridSettings"
            @block-click="handleEditBlock"
            @grid-click="handleGridClick"
          />
        </div>
        <DayView
          v-else-if="view === 'day'"
          :date="currentDate"
          :blocks="filteredBlocks"
          :therapists="filteredTherapists"
          v-bind="gridSettings"
          @block-click="handleEditBlock"
          @grid-click="handleGridClick"
        />
        <MonthView
          v-else-if="view === 'month'"
          :current-date="currentDate"
          :blocks="filteredBlocks"
          @block-click="handleEditBlock"
          @grid-click="handleGridClick"
        />

        <button
          @click="openAddModal"
          class="absolute bottom-6 right-6 w-12 h-12 bg-spa-teal text-white rounded-xl shadow-lg shadow-spa-teal/20 flex items-center justify-center text-2xl hover:scale-105 transition-transform hover:bg-[#005a5d]"
        >
          +
        </button>
      </div>
    </div>

    <div
      v-show="isRightPanelVisible"
      class="w-full md:w-72 hidden md:flex flex-col h-full gap-4 shrink-0"
    >
      <ScheduleViewSettings />

      <div class="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
        <label class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">Spa / Centro</label>
        <select
          v-model="spaStore.currentSpaId"
          class="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-spa-teal/20"
        >
          <option
            v-for="spa in spaStore.spas"
            :key="spa.id"
            :value="spa.id"
          >
            {{ spa.name }}
          </option>
        </select>
      </div>

      <TherapistRightPanel
        :therapists="filteredTherapists"
        :selected-id="selectedTherapistId"
        @select="handleTherapistSelect"
      />

      <div class="bg-gradient-to-br from-spa-primary/5 to-spa-peach/10 rounded-2xl p-4 border border-spa-peach/20">
        <h4 class="font-bold text-spa-primary text-sm mb-2">{{ SCHEDULER_CONSTANTS.QUICK_ACTIONS_TITLE }}</h4>
        <button
          v-if="blocks.length === 0"
          @click="regenerate"
          class="text-xs text-spa-primary hover:underline flex items-center gap-1 cursor-pointer"
        >
          {{ SCHEDULER_CONSTANTS.GENERATE_TEST_DATA }}
        </button>
        <div class="text-[10px] text-gray-400 mt-2">
          {{ SCHEDULER_CONSTANTS.QUICK_ADD_HINT }}
        </div>
      </div>
    </div>

    <BlockEditorModal
      :key="modalOpenKey"
      :is-open="isModalOpen"
      :edit-block="editingBlock"
      :initial-date="selectedDate"
      :initial-hour="initialBlockHour"
      @close="closeModal"
      @save="saveBlock"
      @delete="deleteBlock"
      @update:date="selectedDate = $event"
    />
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted } from "vue";
  import { storeToRefs } from "pinia";
  import { useTherapistStore } from "@/stores/therapist";
  import { useScheduleStore } from "@/stores/schedule";
  import { useAuthStore } from "@/stores/auth";
  import { useSpaStore } from "@/stores/spa";
  import { useSchedulerSettingsStore } from "@/stores/schedulerSettings";
  import { useRejectedRequestsStore } from "@/stores/rejectedRequests";
  import { useCalendar } from "@/composables/useCalendar";
  import { useScheduleActions } from "@/composables/useScheduleActions";
  import { SCHEDULER_CONSTANTS } from "@/data/constants";
  import { AUTH_CONFIG } from "@/data/authConfig";
  import { generateAllSchedules } from "@/utils/scheduleGenerator";
  import ScheduleViewSettings from "@/components/scheduler/ScheduleViewSettings.vue";
  import TherapistRightPanel from "@/components/scheduler/TherapistRightPanel.vue";
  import CalendarHeader from "@/components/scheduler/CalendarHeader.vue";
  import WeekView from "@/components/scheduler/WeekView.vue";
  import DayView from "@/components/scheduler/DayView.vue";
  import MonthView from "@/components/scheduler/MonthView.vue";
  import BlockEditorModal from "@/components/scheduler/BlockEditorModal.vue";
  import PendingChangesBanner from "@/components/scheduler/PendingChangesBanner.vue";
  import RejectionNoticeModal from "@/components/scheduler/RejectionNoticeModal.vue";
  import WeekAgendaMobile from "@/components/scheduler/WeekAgendaMobile.vue";
  import type { ScheduleBlock } from "@/interfaces";

  const therapistStore = useTherapistStore();
  const scheduleStore = useScheduleStore();
  const authStore = useAuthStore();
  const spaStore = useSpaStore();
  const schedulerSettingsStore = useSchedulerSettingsStore();
  const rejectedRequestsStore = useRejectedRequestsStore();
  const schedulerSettings = storeToRefs(schedulerSettingsStore);
  const ROLE_MANAGER = AUTH_CONFIG.ROLE_MANAGER;
  const ROLE_EMPLOYEE = AUTH_CONFIG.ROLE_EMPLOYEE;
  const { blocks } = storeToRefs(scheduleStore);
  const { saveBlock: saveScheduleBlock } = useScheduleActions();

  const { currentDate, view, weekDays, next, prev, setToday } = useCalendar();

  const userSelectedTherapistId = ref<string>("");
  const isModalOpen = ref(false);
  const modalOpenKey = ref(0);
  const editingBlock = ref<ScheduleBlock | undefined>(undefined);
  const initialBlockHour = ref<number | undefined>(undefined);
  const selectedDate = ref<Date | undefined>(undefined);
  const isRightPanelVisible = ref(true);

  onMounted(() => {
    therapistStore.initialize();
    scheduleStore.initialize();
    spaStore.initialize();
    schedulerSettingsStore.initialize();
    rejectedRequestsStore.initialize();

    if (scheduleStore.blocks.length === 0 && therapistStore.therapists.length > 0) {
      generateAllSchedules(therapistStore.therapists, currentDate.value);
    }
  });

  const gridSettings = computed(() => ({
    startHour: schedulerSettings.startHour.value,
    endHour: schedulerSettings.endHour.value,
    pixelsPerHour: schedulerSettings.pixelsPerHour.value,
    slotDurationMinutes: schedulerSettings.slotDurationMinutes.value,
  }));

  const filteredTherapists = computed(() => {
    return therapistStore.therapists.filter(
      (therapist) =>
        therapist.spaId === spaStore.currentSpaId || (!therapist.spaId && spaStore.currentSpaId === "spa-1"),
    );
  });

  const selectedTherapistId = computed({
    get() {
      const id = userSelectedTherapistId.value;
      const available = filteredTherapists.value;
      return available.some((t) => t.id === id) ? id : (available[0]?.id ?? "");
    },
    set(id: string) {
      userSelectedTherapistId.value = id;
    },
  });

  const currentTherapist = computed(() =>
    therapistStore.therapists.find((therapist) => therapist.id === selectedTherapistId.value),
  );

  const filteredBlocks = computed(() => {
    if (view.value === "day") {
      const therapistIds = filteredTherapists.value.map((therapist) => therapist.id);
      return blocks.value.filter((block) => therapistIds.includes(block.therapistId));
    }

    if (!selectedTherapistId.value) return [];
    return blocks.value.filter((block) => block.therapistId === selectedTherapistId.value);
  });

  const pendingBlocks = computed(() => blocks.value.filter((block) => block.status === "pending"));
  const pendingBlocksCount = computed(() => pendingBlocks.value.length);

  const handleTherapistSelect = (id: string) => {
    selectedTherapistId.value = id;
  };

  const openAddModal = () => {
    editingBlock.value = undefined;
    initialBlockHour.value = undefined;
    selectedDate.value = new Date(currentDate.value);
    modalOpenKey.value += 1;
    isModalOpen.value = true;
  };

  const handleGridClick = (data: { date: Date; hour: number; therapistId?: string }) => {
    editingBlock.value = undefined;
    initialBlockHour.value = data.hour;
    selectedDate.value = data.date;

    if (data.therapistId) {
      selectedTherapistId.value = data.therapistId;
    }

    modalOpenKey.value += 1;
    isModalOpen.value = true;
  };

  const handleEditBlock = (block: ScheduleBlock) => {
    editingBlock.value = block;
    modalOpenKey.value += 1;
    isModalOpen.value = true;
  };

  const closeModal = () => {
    isModalOpen.value = false;
    editingBlock.value = undefined;
  };

  const saveBlock = (data: Partial<ScheduleBlock>) => {
    saveScheduleBlock({
      data,
      therapistId: selectedTherapistId.value,
      currentDate: currentDate.value,
      selectedDate: selectedDate.value,
      editingBlock: editingBlock.value,
      onSuccess: closeModal,
    });
  };

  const deleteBlock = () => {
    if (editingBlock.value) {
      scheduleStore.deleteBlock(editingBlock.value.id);
      closeModal();
    }
  };

  const regenerate = () => {
    if (confirm(SCHEDULER_CONSTANTS.REGENERATE_CONFIRM)) {
      generateAllSchedules(therapistStore.therapists, currentDate.value);
    }
  };
</script>
