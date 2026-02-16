<template>
  <div class="h-full flex flex-col md:flex-row gap-6 p-4">
    <div class="flex-1 flex flex-col h-full min-w-0 gap-4">
      <PendingChangesBanner
        v-if="authStore.currentRole === ROLE_MANAGER && pendingBlocksCount > 0"
        :pending-blocks="pendingBlocks"
      />
      <RejectionNoticeModal v-if="authStore.currentRole === ROLE_EMPLOYEE" />

      <div
        class="app-card p-3 md:p-4 flex flex-col md:flex-row md:items-center justify-between gap-3"
      >
        <div>
          <h2 class="text-xl md:text-2xl font-bold text-app-title flex items-center gap-2">
            <span class="text-2xl md:text-3xl">🗓️</span>
            {{ currentTherapist ? `${SCHEDULER_UI.AGENDA_OF} ${currentTherapist.name}` : SCHEDULER_UI.MY_SCHEDULE }}
            <span v-if="selectedTherapistId === ALL_THERAPISTS_ID && filteredTherapists.length > 1" class="text-sm font-normal text-app-text/80">(todos)</span>
          </h2>
          <p class="text-app-text/80 text-xs md:text-sm mt-0.5 pl-1">
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
          class="p-0! bg-transparent! border-0! shadow-none! w-full md:w-auto overflow-x-auto"
        />

        <button
          type="button"
          class="hidden md:flex items-center gap-1.5 px-3 py-2 rounded-lg border border-app-border bg-app-surface hover:bg-app-bg text-app-text text-sm font-medium transition-colors cursor-pointer shrink-0 shadow-sm"
          :title="isRightPanelVisible ? SCHEDULER_UI.HIDE_PANEL : SCHEDULER_UI.SHOW_PANEL"
          @click="isRightPanelVisible = !isRightPanelVisible"
        >
          <span aria-hidden="true">{{ isRightPanelVisible ? `◀ ${SCHEDULER_UI.PANEL}` : `${SCHEDULER_UI.PANEL} ▶` }}</span>
        </button>
      </div>

      <div
        class="flex-1 min-h-0 relative app-card overflow-hidden flex flex-col"
      >
        <div class="flex flex-wrap items-center gap-2 px-4 py-3 border-b border-app-border-subtle bg-app-surface">
          <span class="text-xs font-medium text-app-text/80 mr-1">Franja:</span>
          <button
            v-for="opt in zoomOptions"
            :key="opt.value"
            type="button"
            class="px-2.5 py-1 text-xs font-medium rounded-lg transition-colors"
            :class="schedulerSettings.slotDurationMinutes.value === opt.value ? 'bg-spa-primary text-white' : 'bg-app-bg text-app-text hover:bg-app-border-subtle'"
            @click="setZoom(opt.value)"
          >
            {{ opt.label }}
          </button>
        </div>
        <div class="flex flex-wrap items-center gap-2 px-4 py-2 border-b border-app-border-subtle bg-app-bg/30 overflow-x-auto">
          <button
            type="button"
            class="shrink-0 px-3 py-1.5 text-sm font-medium rounded-full border transition-colors"
            :class="!selectedTherapistId ? 'bg-spa-primary text-white border-spa-primary' : 'bg-app-surface border-app-border text-app-text hover:border-spa-primary/50'"
            @click="selectedTherapistId = ''"
          >
            Todos
          </button>
          <button
            v-for="t in filteredTherapists"
            :key="t.id"
            type="button"
            class="shrink-0 px-3 py-1.5 text-sm font-medium rounded-full border transition-colors"
            :class="selectedTherapistId === t.id ? 'bg-spa-primary text-white border-spa-primary' : 'bg-app-surface border-app-border text-app-text hover:border-spa-primary/50'"
            @click="selectedTherapistId = t.id"
          >
            {{ t.name.split(' ')[0] }}
          </button>
        </div>
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
            :items="agendaItemsWeek"
            v-bind="gridSettings"
            @item-click="handleItemClick"
            @grid-click="handleGridClick"
          />
        </div>
        <DayView
          v-else-if="view === 'day'"
          :date="currentDate"
          :items="agendaItemsDay"
          :therapists="filteredTherapists"
          v-bind="gridSettings"
          @item-click="handleItemClick"
          @grid-click="handleGridClick"
        />
        <MonthView
          v-else-if="view === 'month'"
          :current-date="currentDate"
          :blocks="filteredBlocks"
          @block-click="handleEditBlock"
          @grid-click="handleGridClick"
        />

        <div
          v-if="isEmptyView"
          class="absolute inset-0 z-20 flex items-center justify-center p-6 bg-app-surface/95 backdrop-blur-sm"
        >
          <div class="max-w-sm w-full text-center">
            <div class="text-4xl mb-3">📅</div>
            <h3 class="text-lg font-semibold text-app-title mb-1">{{ SCHEDULER_CONSTANTS.EMPTY_AGENDA_TITLE }}</h3>
            <p class="text-sm text-app-text/80 mb-5">{{ SCHEDULER_CONSTANTS.EMPTY_AGENDA_SUBTITLE }}</p>
            <div class="flex flex-wrap justify-center gap-2 mb-5">
              <button
                type="button"
                class="px-4 py-2 rounded-lg bg-spa-primary text-white text-sm font-medium hover:opacity-90 transition-opacity"
                @click="openAppointmentModal"
              >
                {{ SCHEDULER_CONSTANTS.EMPTY_AGENDA_ACTION_CITA }}
              </button>
              <button
                type="button"
                class="px-4 py-2 rounded-lg border border-app-border bg-app-surface text-app-text text-sm font-medium hover:bg-app-bg transition-colors"
                @click="openAddModal"
              >
                {{ SCHEDULER_CONSTANTS.EMPTY_AGENDA_ACTION_BLOQUE }}
              </button>
              <button
                v-if="blocks.length === 0"
                type="button"
                class="px-4 py-2 rounded-lg border border-dashed border-app-border text-app-text/80 text-sm font-medium hover:border-spa-primary hover:text-spa-primary transition-colors"
                @click="regenerate"
              >
                {{ SCHEDULER_CONSTANTS.EMPTY_AGENDA_ACTION_GENERATE }}
              </button>
            </div>
            <ul class="text-xs text-app-text/70 text-left space-y-1.5">
              <li>· {{ SCHEDULER_CONSTANTS.EMPTY_AGENDA_SUGGEST_1 }}</li>
              <li>· {{ SCHEDULER_CONSTANTS.EMPTY_AGENDA_SUGGEST_2 }}</li>
              <li>· {{ SCHEDULER_CONSTANTS.EMPTY_AGENDA_SUGGEST_3 }}</li>
            </ul>
          </div>
        </div>

        <div class="absolute bottom-6 right-6 flex flex-col gap-2 items-end">
          <button
            type="button"
            class="w-12 h-12 bg-spa-primary text-white rounded-xl shadow-md flex items-center justify-center text-xl hover:opacity-90 transition-opacity"
            title="Nueva cita (cliente + servicio + empleado)"
            @click="openAppointmentModal"
          >
            📅
          </button>
          <button
            type="button"
            class="w-12 h-12 bg-spa-teal text-white rounded-xl shadow-md flex items-center justify-center text-2xl hover:opacity-90 transition-opacity"
            title="Nuevo bloque (empleado)"
            @click="openAddModal"
          >
            +
          </button>
        </div>
      </div>
    </div>

    <div
      v-show="isRightPanelVisible"
      class="w-full md:w-72 hidden md:flex flex-col h-full gap-4 shrink-0"
    >
      <ScheduleViewSettings />

      <div class="app-card p-4">
        <label class="text-sm font-medium text-app-text mb-2 block">Agenda</label>
        <select
          v-model="selectedAgendaIndex"
          class="w-full p-2 bg-app-bg border border-app-border rounded-lg text-sm font-medium text-app-text focus:outline-none focus:ring-2 focus:ring-spa-primary/20"
        >
          <option
            v-for="(agenda, index) in agendaListStore.agendas"
            :key="index"
            :value="index"
          >
            {{ agenda.name }}
          </option>
        </select>
      </div>

      <TherapistRightPanel
        :therapists="filteredTherapists"
        :selected-id="selectedTherapistId"
        @select="handleTherapistSelect"
      />

      <div class="app-card p-4 bg-spa-peach/30 border-spa-primary/10">
        <h4 class="font-semibold text-spa-primary text-sm mb-2">{{ SCHEDULER_CONSTANTS.QUICK_ACTIONS_TITLE }}</h4>
        <button
          v-if="blocks.length === 0"
          @click="regenerate"
          class="text-sm text-spa-primary hover:underline flex items-center gap-1 cursor-pointer"
        >
          {{ SCHEDULER_CONSTANTS.GENERATE_TEST_DATA }}
        </button>
        <div class="text-xs text-app-text/80 mt-2">
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

    <AppointmentEditorModal
      :key="'apt-' + appointmentModalKey"
      :is-open="isAppointmentModalOpen"
      :edit-appointment="editingAppointment"
      :initial-date="selectedDate"
      :initial-hour="initialBlockHour"
      :initial-therapist-id="selectedTherapistId"
      @close="closeAppointmentModal"
      @save="onAppointmentSaved"
      @delete="deleteAppointment"
    />
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, watch, onMounted } from "vue";
  import { storeToRefs } from "pinia";
  import { useTherapistStore } from "@/stores/therapist";
  import { useScheduleStore } from "@/stores/schedule";
  import { useAuthStore } from "@/stores/auth";
  import { useSchedulerSettingsStore } from "@/stores/schedulerSettings";
  import { useAgendaListStore } from "@/stores/agendaList";
  import { useRejectedRequestsStore } from "@/stores/rejectedRequests";
  import { useLayoutStore } from "@/stores/layout";
  import { useCalendar } from "@/composables/useCalendar";
  import { useScheduleActions } from "@/composables/useScheduleActions";
  import { SCHEDULER_CONSTANTS, SCHEDULER_UI } from "@/data/constants";
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
  import AppointmentEditorModal from "@/components/scheduler/AppointmentEditorModal.vue";
  import type { ScheduleBlock, AgendaItem } from "@/interfaces";
  import { isAppointment } from "@/interfaces";
  import { useClientStore } from "@/stores/client";
  import { useAppointmentStore } from "@/stores/appointment";
  import { useServiceStore } from "@/stores/service";

  const therapistStore = useTherapistStore();
  const scheduleStore = useScheduleStore();
  const clientStore = useClientStore();
  const appointmentStore = useAppointmentStore();
  const serviceStore = useServiceStore();
  const authStore = useAuthStore();
  const schedulerSettingsStore = useSchedulerSettingsStore();
  const agendaListStore = useAgendaListStore();
  const rejectedRequestsStore = useRejectedRequestsStore();
  const layoutStore = useLayoutStore();
  const schedulerSettings = storeToRefs(schedulerSettingsStore);
  const { calendarAppearance } = storeToRefs(layoutStore);
  const ROLE_MANAGER = AUTH_CONFIG.ROLE_MANAGER;
  const ROLE_EMPLOYEE = AUTH_CONFIG.ROLE_EMPLOYEE;
  const { blocks } = storeToRefs(scheduleStore);
  const { saveBlock: saveScheduleBlock } = useScheduleActions();

  const { currentDate, view, weekDays, next, prev, setToday } = useCalendar();

  const ALL_THERAPISTS_ID = "__all__";
  const userSelectedTherapistId = ref<string>(ALL_THERAPISTS_ID);
  const selectedAgendaIndex = ref(0);
  const isModalOpen = ref(false);
  const modalOpenKey = ref(0);
  const editingBlock = ref<ScheduleBlock | undefined>(undefined);
  const initialBlockHour = ref<number | undefined>(undefined);
  const selectedDate = ref<Date | undefined>(undefined);
  const isRightPanelVisible = ref(true);
  const isAppointmentModalOpen = ref(false);
  const appointmentModalKey = ref(0);
  const editingAppointment = ref<import("@/interfaces").Appointment | null>(null);

  onMounted(() => {
    therapistStore.initialize();
    scheduleStore.initialize();
    clientStore.initialize();
    appointmentStore.initialize();
    serviceStore.initialize();
    schedulerSettingsStore.initialize();
    agendaListStore.initialize();
    rejectedRequestsStore.initialize();
    view.value = schedulerSettingsStore.defaultView;

    const agendaCount = agendaListStore.agendas.length;
    if (agendaCount > 0 && selectedAgendaIndex.value >= agendaCount) {
      selectedAgendaIndex.value = agendaCount - 1;
    }

    if (scheduleStore.blocks.length === 0 && therapistStore.therapists.length > 0) {
      generateAllSchedules(therapistStore.therapists, currentDate.value);
    }
  });

  const calendarAppearanceScale = computed(() => {
    const a = calendarAppearance.value;
    return a === "compact" ? 0.8 : a === "spacious" ? 1.25 : 1;
  });
  const gridSettings = computed(() => ({
    startHour: schedulerSettings.startHour.value,
    endHour: schedulerSettings.endHour.value,
    pixelsPerHour: Math.round(
      schedulerSettings.pixelsPerHour.value * calendarAppearanceScale.value,
    ),
    slotDurationMinutes: schedulerSettings.slotDurationMinutes.value,
  }));

  const zoomOptions = [
    { value: 30 as const, label: "30 min" },
    { value: 60 as const, label: "1 h" },
    { value: 90 as const, label: "1,5 h" },
    { value: 120 as const, label: "2 h" },
  ];

  const setZoom = (value: 30 | 60 | 90 | 120) => {
    schedulerSettingsStore.updateSettings({ slotDurationMinutes: value });
  };

  watch(
    () => agendaListStore.agendas.length,
    (len) => {
      if (len > 0 && selectedAgendaIndex.value >= len) {
        selectedAgendaIndex.value = Math.max(0, len - 1);
      }
    },
  );

  const filteredTherapists = computed(() => therapistStore.therapists);

  const selectedTherapistId = computed({
    get() {
      const id = userSelectedTherapistId.value;
      if (id === ALL_THERAPISTS_ID) return id;
      const available = filteredTherapists.value;
      return available.some((t) => t.id === id) ? id : (available[0]?.id ?? ALL_THERAPISTS_ID);
    },
    set(id: string) {
      userSelectedTherapistId.value = id;
    },
  });

  const currentTherapist = computed(() =>
    selectedTherapistId.value === ALL_THERAPISTS_ID
      ? null
      : therapistStore.therapists.find((therapist) => therapist.id === selectedTherapistId.value),
  );

  const filteredBlocks = computed(() => {
    if (view.value === "day") {
      const therapistIds = filteredTherapists.value.map((therapist) => therapist.id);
      return blocks.value.filter((block) => therapistIds.includes(block.therapistId));
    }
    if (selectedTherapistId.value === ALL_THERAPISTS_ID) {
      return blocks.value;
    }
    return blocks.value.filter((block) => block.therapistId === selectedTherapistId.value);
  });

  const filteredAppointmentsWeek = computed(() => {
    if (selectedTherapistId.value === ALL_THERAPISTS_ID) return appointmentStore.appointments;
    return appointmentStore.getByTherapist(selectedTherapistId.value);
  });

  const filteredAppointmentsDay = computed(() => appointmentStore.appointments);

  const agendaItemsWeek = computed<AgendaItem[]>(() => [
    ...filteredBlocks.value,
    ...filteredAppointmentsWeek.value,
  ]);

  const agendaItemsDay = computed<AgendaItem[]>(() => [
    ...filteredBlocks.value,
    ...filteredAppointmentsDay.value,
  ]);

  const isEmptyView = computed(() => {
    if (view.value === "week") return agendaItemsWeek.value.length === 0;
    if (view.value === "day") return agendaItemsDay.value.length === 0;
    if (view.value === "month") return filteredBlocks.value.length === 0;
    return false;
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

  const handleItemClick = (item: AgendaItem) => {
    if (isAppointment(item)) {
      editingAppointment.value = item;
      appointmentModalKey.value += 1;
      isAppointmentModalOpen.value = true;
    } else {
      editingBlock.value = item;
      modalOpenKey.value += 1;
      isModalOpen.value = true;
    }
  };

  const handleEditBlock = (block: ScheduleBlock) => {
    editingBlock.value = block;
    modalOpenKey.value += 1;
    isModalOpen.value = true;
  };

  const openAppointmentModal = () => {
    editingAppointment.value = null;
    selectedDate.value = new Date(currentDate.value);
    initialBlockHour.value = 9;
    appointmentModalKey.value += 1;
    isAppointmentModalOpen.value = true;
  };

  const closeAppointmentModal = () => {
    isAppointmentModalOpen.value = false;
    editingAppointment.value = null;
  };

  const onAppointmentSaved = () => {
    closeAppointmentModal();
  };

  const deleteAppointment = () => {
    if (editingAppointment.value) {
      appointmentStore.remove(editingAppointment.value.id);
      closeAppointmentModal();
    }
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
