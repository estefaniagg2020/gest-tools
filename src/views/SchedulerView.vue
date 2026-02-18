<template>
  <div class="h-full flex flex-col md:flex-row gap-4 sm:gap-5 lg:gap-6 p-4 sm:p-5 lg:p-6">
    <div class="flex-1 flex flex-col h-full min-w-0 gap-4 sm:gap-5 min-h-0">
      <PendingChangesBanner
        v-if="authStore.currentRole === ROLE_MANAGER && pendingBlocksCount > 0"
        :pending-blocks="pendingBlocks"
      />
      <RejectionNoticeModal v-if="authStore.currentRole === ROLE_EMPLOYEE" />

      <div
        class="scheduler-header-card app-card p-4 sm:p-4 md:p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4 overflow-visible min-w-0"
      >
        <div class="min-w-0 shrink-0">
          <h2 class="text-xl md:text-2xl font-bold text-app-title flex items-center gap-2 truncate">
            <span class="text-2xl md:text-3xl">🗓️</span>
            {{ $t('scheduler.mySchedule') }}
          </h2>
          <p class="text-app-text/80 text-xs md:text-sm mt-0.5 pl-1">
            {{ currentDate.getFullYear() }}
          </p>
        </div>

        <div class="min-w-0 w-full lg:w-auto shrink-0 overflow-visible lg:overflow-x-auto">
          <CalendarHeader
            :current-date="currentDate"
            :current-view="view"
            @prev="prev"
            @next="next"
            @today="setToday"
            @changeView="view = $event"
            class="p-0! bg-transparent! border-0! shadow-none! w-full lg:w-auto"
          />
        </div>

        <button
          type="button"
          class="hidden lg:flex items-center gap-1.5 px-3 py-2 rounded-lg border border-app-border bg-app-surface hover:bg-app-bg text-app-text text-sm font-medium transition-colors cursor-pointer shrink-0 shadow-sm"
          :title="isRightPanelVisible ? $t('scheduler.hidePanel') : $t('scheduler.showPanel')"
          @click="isRightPanelVisible = !isRightPanelVisible"
        >
          <span aria-hidden="true">{{ isRightPanelVisible ? `◀ ${$t('scheduler.panel')}` : `${$t('scheduler.panel')} ▶` }}</span>
        </button>
      </div>

      <div
        class="scheduler-agenda-card flex-none lg:flex-1 min-h-0 relative app-card flex flex-col overflow-visible lg:overflow-hidden"
      >
        <div
          v-if="view === 'week'"
          class="flex-none lg:flex-1 lg:min-h-0 overflow-y-auto overflow-x-visible lg:hidden p-4 sm:p-5 pb-24 sm:pb-24"
        >
          <WeekAgendaMobile
            :week-days="weekDays"
            :blocks="filteredBlocks"
            :members="filteredMembers"
            @block-click="handleEditBlock"
          />
        </div>
        <div
          v-if="view === 'week'"
          class="flex-1 min-h-0 overflow-hidden hidden lg:block"
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
          :members="filteredMembers"
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
            <h3 class="text-lg font-semibold text-app-title mb-1">{{ $t('scheduler.emptyTitle') }}</h3>
            <p class="text-sm text-app-text/80 mb-5">{{ $t('scheduler.emptySubtitle') }}</p>
            <div class="flex flex-wrap justify-center gap-2 mb-5">
              <button
                type="button"
                class="px-4 py-2 rounded-lg bg-brand-primary text-white text-sm font-medium hover:opacity-90 transition-opacity"
                @click="openAppointmentModal"
              >
                {{ $t('scheduler.newAppointment') }}
              </button>
              <button
                type="button"
                class="px-4 py-2 rounded-lg border border-app-border bg-app-surface text-app-text text-sm font-medium hover:bg-app-bg transition-colors"
                @click="openAddModal"
              >
                {{ $t('scheduler.internalBlock') }}
              </button>
              <button
                v-if="blocks.length === 0"
                type="button"
                class="px-4 py-2 rounded-lg border border-dashed border-app-border text-app-text/80 text-sm font-medium hover:border-brand-primary hover:text-brand-primary transition-colors"
                @click="regenerate"
              >
                {{ $t('scheduler.generateTestDataBtn') }}
              </button>
            </div>
            <ul class="text-xs text-app-text/70 text-left space-y-1.5">
              <li>· {{ $t('scheduler.emptySuggest1') }}</li>
              <li>· {{ $t('scheduler.emptySuggest2') }}</li>
              <li>· {{ $t('scheduler.emptySuggest3') }}</li>
            </ul>
          </div>
        </div>

        <div class="absolute bottom-6 right-6 flex flex-col gap-2 items-end">
          <div class="flex items-center gap-2">
            <span class="text-xs text-app-text/60 bg-app-surface/90 px-2 py-1 rounded-lg shadow-sm">{{ $t('scheduler.internalBlock') }}</span>
            <button
              type="button"
              class="w-12 h-12 bg-brand-accent text-white rounded-xl shadow-md flex items-center justify-center text-2xl hover:opacity-90 transition-opacity"
              :title="$t('scheduler.internalBlockTitle')"
              @click="openAddModal"
            >
              +
            </button>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-xs text-app-text/60 bg-app-surface/90 px-2 py-1 rounded-lg shadow-sm">{{ $t('scheduler.newAppointment') }}</span>
            <button
              type="button"
              class="w-12 h-12 bg-brand-primary text-white rounded-xl shadow-md flex items-center justify-center text-xl hover:opacity-90 transition-opacity"
              :title="$t('scheduler.newAppointmentTitle')"
              @click="openAppointmentModal"
            >
              📅
            </button>
          </div>
        </div>
      </div>
    </div>

    <div
      v-show="isRightPanelVisible"
      class="w-full lg:w-72 hidden lg:flex flex-col h-full gap-4 shrink-0 min-w-0"
    >
      <div class="app-card p-4">
        <label class="text-sm font-medium text-app-text mb-2 block">{{ $t('scheduler.agendaLabel') }}</label>
        <select
          v-model="selectedAgendaIndex"
          class="w-full p-2 bg-app-bg border border-app-border rounded-lg text-sm font-medium text-app-text focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
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

      <div class="app-card p-4 bg-brand-soft/30 border-brand-primary/10">
        <h4 class="font-semibold text-brand-primary text-sm mb-2">{{ $t('scheduler.quickActions') }}</h4>
        <div class="flex flex-wrap gap-2">
          <button
            v-if="blocks.length === 0"
            @click="regenerate"
            class="text-sm text-brand-primary hover:underline flex items-center gap-1 cursor-pointer"
          >
            {{ $t('scheduler.generateTestData') }}
          </button>
          <button
            v-if="activeAppointments.length > 0 || activeBlocks.length > 0"
            type="button"
            class="text-sm text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:underline cursor-pointer"
            @click="clearAgenda"
          >
            {{ $t('scheduler.clearAgenda') }}
          </button>
        </div>
        <div class="text-xs text-app-text/80 mt-2">
          {{ $t('scheduler.quickAddHint') }}
        </div>
      </div>
    </div>

    <BlockEditorModal
      :key="modalOpenKey"
      :is-open="isModalOpen"
      :edit-block="editingBlock"
      :initial-date="selectedDate"
      :initial-hour="initialBlockHour"
      :members="filteredMembers"
      @close="closeModal"
      @save="saveBlock"
      @delete="deleteBlock"
      @cancel="cancelBlockSoft"
      @update:date="selectedDate = $event"
    />

    <AppointmentEditorModal
      :key="'apt-' + appointmentModalKey"
      :is-open="isAppointmentModalOpen"
      :edit-appointment="editingAppointment"
      :initial-date="selectedDate"
      :initial-hour="initialBlockHour"
      :initial-member-id="selectedMemberId !== ALL_MEMBERS_ID ? selectedMemberId : undefined"
      @close="closeAppointmentModal"
      @save="onAppointmentSaved"
      @delete="deleteAppointment"
      @cancel="cancelAppointment"
    />
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, watch, onMounted } from "vue";
  import { useI18n } from "vue-i18n";
  import { storeToRefs } from "pinia";
  import { useTeamStore } from "@/stores/team";
  import { useScheduleStore } from "@/stores/schedule";
  import { useAuthStore } from "@/stores/auth";
  import { useSchedulerSettingsStore } from "@/stores/schedulerSettings";
  import { useAgendaListStore } from "@/stores/agendaList";
  import { useRejectedRequestsStore } from "@/stores/rejectedRequests";
  import { useCalendar } from "@/composables/useCalendar";
  import { useScheduleActions } from "@/composables/useScheduleActions";
  import { AUTH_CONFIG } from "@/data/authConfig";
  import { generateAllSchedules } from "@/utils/scheduleGenerator";
  import { slotOverlapsExisting } from "@/composables/useScheduleOverlap";
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

  const { t } = useI18n();
  const teamStore = useTeamStore();
  const scheduleStore = useScheduleStore();
  const clientStore = useClientStore();
  const appointmentStore = useAppointmentStore();
  const serviceStore = useServiceStore();
  const authStore = useAuthStore();
  const schedulerSettingsStore = useSchedulerSettingsStore();
  const agendaListStore = useAgendaListStore();
  const rejectedRequestsStore = useRejectedRequestsStore();
  const schedulerSettings = storeToRefs(schedulerSettingsStore);
  const ROLE_MANAGER = AUTH_CONFIG.ROLE_MANAGER;
  const ROLE_EMPLOYEE = AUTH_CONFIG.ROLE_EMPLOYEE;
  const { blocks } = storeToRefs(scheduleStore);
  const { saveBlock: saveScheduleBlock } = useScheduleActions();

  const { currentDate, view, weekDays, next, prev, setToday } = useCalendar();

  const ALL_MEMBERS_ID = "__all__";
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
    teamStore.initialize();
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

    if (scheduleStore.blocks.length === 0 && teamStore.members.length > 0) {
      generateAllSchedules(teamStore.members, currentDate.value);
    }
  });

  const PIXELS_PER_HOUR_FIXED = 45;
  const gridSettings = computed(() => ({
    startHour: schedulerSettings.startHour.value,
    endHour: schedulerSettings.endHour.value,
    pixelsPerHour: PIXELS_PER_HOUR_FIXED,
    slotDurationMinutes: 60 as const,
  }));

  watch(
    () => agendaListStore.agendas.length,
    (len) => {
      if (len > 0 && selectedAgendaIndex.value >= len) {
        selectedAgendaIndex.value = Math.max(0, len - 1);
      }
    },
  );

  const filteredMembers = computed(() => teamStore.members);

  const selectedMemberId = computed(() => ALL_MEMBERS_ID);

  const memberIdForBlock = computed(() => filteredMembers.value[0]?.id ?? "");

  const activeBlocks = computed(() =>
    blocks.value.filter((b) => b.status !== "cancelled"),
  );

  const filteredBlocks = computed(() => {
    if (view.value === "day") {
      const memberIds = filteredMembers.value.map((m) => m.id);
      return activeBlocks.value.filter((block) => memberIds.includes(block.memberId));
    }
    if (selectedMemberId.value === ALL_MEMBERS_ID) {
      return activeBlocks.value;
    }
    return activeBlocks.value.filter((block) => block.memberId === selectedMemberId.value);
  });

  const activeAppointments = computed(() =>
    appointmentStore.appointments.filter((a) => a.status !== "cancelled"),
  );

  const visibleAppointments = computed(() => appointmentStore.appointments);

  const filteredAppointmentsWeek = computed(() => {
    if (selectedMemberId.value === ALL_MEMBERS_ID) return visibleAppointments.value;
    return visibleAppointments.value.filter((a) =>
      !a.memberId || a.memberId === selectedMemberId.value,
    );
  });

  const filteredAppointmentsDay = computed(() => visibleAppointments.value);

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

  const openAddModal = () => {
    editingBlock.value = undefined;
    initialBlockHour.value = undefined;
    selectedDate.value = new Date(currentDate.value);
    modalOpenKey.value += 1;
    isModalOpen.value = true;
  };

  const handleGridClick = (data: { date: Date; hour: number; memberId?: string }) => {
    initialBlockHour.value = data.hour;
    selectedDate.value = data.date;
    editingAppointment.value = null;
    appointmentModalKey.value += 1;
    isAppointmentModalOpen.value = true;
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
    closeAppointmentModal();
  };

  const closeModal = () => {
    isModalOpen.value = false;
    editingBlock.value = undefined;
  };

  const saveBlock = (data: Partial<ScheduleBlock>) => {
    const mid = data.memberId ?? memberIdForBlock.value;
    if (!editingBlock.value && mid !== ALL_MEMBERS_ID && data.start != null && data.end != null && selectedDate.value) {
      const occupied = slotOverlapsExisting({
        blocks: activeBlocks.value,
        appointments: activeAppointments.value,
        memberId: mid,
        date: selectedDate.value,
        startTime: data.start,
        endTime: data.end,
      });
      if (occupied && !confirm(t("scheduler.slotOccupiedConfirm"))) return;
    }
    saveScheduleBlock({
      data,
      memberId: mid,
      currentDate: currentDate.value,
      selectedDate: selectedDate.value,
      editingBlock: editingBlock.value,
      onSuccess: closeModal,
    });
  };

  const deleteBlock = () => {
    closeModal();
  };

  const cancelBlockSoft = () => {
    closeModal();
  };

  const regenerate = () => {
    if (confirm(t("scheduler.regenerateConfirm"))) {
      generateAllSchedules(teamStore.members, currentDate.value);
    }
  };

  const clearAgenda = () => {
    if (!confirm(t("scheduler.clearAgendaConfirm"))) return;
    appointmentStore.clearAll();
    scheduleStore.clearAllBlocks();
    closeAppointmentModal();
    closeModal();
  };

  const cancelAppointment = () => {
    closeAppointmentModal();
  };
</script>
