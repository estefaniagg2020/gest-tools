<template>
  <div class="h-full flex flex-col md:flex-row gap-4 sm:gap-5 md:gap-4 lg:gap-6 p-4 sm:p-5 md:p-5 lg:p-6">
    <div class="flex-1 flex flex-col h-full min-w-0 gap-4 sm:gap-5 min-h-0 overflow-x-hidden">
      <PendingChangesBanner
        v-if="authStore.currentRole === ROLE_MANAGER && pendingBlocksCount > 0"
        :pending-blocks="pendingBlocks"
      />
      <RejectionNoticeModal v-if="authStore.currentRole === ROLE_EMPLOYEE" />

      <div
        :class="[
          'scheduler-header-card app-card p-4 sm:p-4 flex flex-col gap-3 sm:gap-4 min-w-0 overflow-visible max-w-full shrink-0',
          isThemeSelected ? 'bg-brand-accent/12 border-brand-accent/35' : '',
        ]"
      >
        <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-3 sm:gap-4 min-w-0 w-full">
          <div class="min-w-0 shrink-0">
            <h2 class="text-xl md:text-2xl font-bold text-app-title truncate">
              {{ currentAgendaName }}
            </h2>
            <p class="text-app-text/80 text-xs md:text-sm mt-0.5">
              {{ currentDayAndDate }}
            </p>
          </div>

          <div class="min-w-0 w-full max-w-full overflow-visible">
            <CalendarHeader
              :current-date="currentDate"
              :current-view="view"
              @prev="prev"
              @next="next"
              @today="setToday"
              @changeView="view = $event"
              class="p-0! bg-transparent! border-0! shadow-none! w-full max-w-full"
            />
          </div>

          <button
          type="button"
          class="hidden md:flex items-center gap-1.5 px-3 py-2 rounded-lg border border-app-border bg-app-surface hover:bg-app-bg text-app-text text-sm font-medium transition-colors cursor-pointer shrink-0 shadow-sm"
          :title="isRightPanelVisible ? $t('scheduler.hidePanel') : $t('scheduler.showPanel')"
          @click="isRightPanelVisible = !isRightPanelVisible"
        >
          <span aria-hidden="true">{{ isRightPanelVisible ? `◀ ${$t('scheduler.panel')}` : `${$t('scheduler.panel')} ▶` }}</span>
        </button>
        </div>
      </div>

      <div
        class="scheduler-agenda-card flex-none lg:flex-1 min-h-0 relative app-card flex flex-col overflow-x-hidden lg:overflow-hidden"
      >
        <div
          v-if="view === 'week'"
          class="flex-none lg:flex-1 lg:min-h-0 overflow-y-auto overflow-x-visible lg:hidden p-4 sm:p-5 pb-24 sm:pb-24"
        >
          <WeekAgendaMobile
            :week-days="weekDays"
            :items="agendaItemsWeek"
            :members="filteredMembers"
            @block-click="handleEditBlock"
            @item-click="handleItemClick"
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
            @appointment-move="handleAppointmentMove"
            @block-move="handleBlockMove"
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
          @appointment-move="handleAppointmentMoveDay"
          @block-move="handleBlockMoveDay"
        />
        <MonthView
          v-else-if="view === 'month'"
          :current-date="currentDate"
          :blocks="filteredBlocks"
          :appointments="visibleAppointments"
          @block-click="handleEditBlock"
          @item-click="handleItemClick"
          @grid-click="handleGridClick"
        />

        <div class="absolute bottom-6 right-6 flex flex-col items-end">
          <div class="relative" ref="addButtonRef">
            <button
              type="button"
              class="w-14 h-14 bg-brand-primary text-white rounded-xl shadow-md flex items-center justify-center text-2xl hover:opacity-90 transition-opacity"
              :title="$t('scheduler.whatToAdd')"
              @click="showAddMenu = !showAddMenu"
            >
              +
            </button>
            <div
              v-if="showAddMenu"
              class="absolute bottom-full right-0 mb-2 w-56 rounded-xl bg-app-surface border border-app-border shadow-lg py-2 z-30"
            >
              <p class="px-4 py-2 text-sm font-medium text-app-text border-b border-app-border-subtle">
                {{ $t('scheduler.whatToAdd') }}
              </p>
              <button
                type="button"
                class="w-full flex items-center gap-3 px-4 py-3 text-left text-sm text-app-text hover:bg-app-bg transition-colors"
                @click="onAddOption('block')"
              >
                <span class="w-8 h-8 rounded-lg bg-brand-accent/20 flex items-center justify-center text-lg">+</span>
                {{ $t('scheduler.internalBlock') }}
              </button>
              <button
                type="button"
                class="w-full flex items-center gap-3 px-4 py-3 text-left text-sm text-app-text hover:bg-app-bg transition-colors"
                @click="onAddOption('appointment')"
              >
                <span class="w-8 h-8 rounded-lg bg-brand-primary/20 flex items-center justify-center text-lg">📅</span>
                {{ $t('scheduler.newAppointment') }}
              </button>
            </div>
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

      <WaitlistPanel
        :is-dragging-confirmed="isDraggingConfirmedAppointment"
        :waitlist-entries="waitlistEntries"
        @cancel-appointment="cancelAppointmentById"
      />

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
        </div>
        <div class="text-xs text-app-text/80 mt-2">
          {{ $t('scheduler.quickAddHint') }}
        </div>
        <SlotFinderCard
          v-if="filteredMembers.length > 0"
          class="mt-4"
          :members="filteredMembers"
          :blocks="activeBlocks"
          :appointments="activeAppointments"
          :min-hour="slotFinderMinHour"
          :max-hour="slotFinderMaxHour"
          :slot-duration-minutes="schedulerSettings.slotDurationMinutes.value"
          :initial-date="currentDate"
          :business-id="authStore.user?.businessId ?? null"
          @slot-select="onSlotSelect"
        />
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
      :initial-member-id="initialAppointmentMemberId ?? (selectedMemberId !== ALL_MEMBERS_ID ? selectedMemberId : undefined)"
      :slot-duration-minutes="schedulerSettings.slotDurationMinutes.value"
      @close="closeAppointmentModal"
      @save="onAppointmentSaved"
      @delete="deleteAppointment"
      @cancel="cancelAppointment"
    />
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, watch, onMounted, onUnmounted } from "vue";
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
  import { DEFAULT_THEME_ID } from "@/data/themes";
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
  import SlotFinderCard from "@/components/scheduler/SlotFinderCard.vue";
  import WaitlistPanel from "@/components/scheduler/WaitlistPanel.vue";
  import type { ScheduleBlock, AgendaItem } from "@/interfaces";
  import { isAppointment } from "@/interfaces";
  import { useClientStore } from "@/stores/client";
  import { useAppointmentStore } from "@/stores/appointment";
  import { useServiceStore } from "@/stores/service";
  import { useThemeStore } from "@/stores/theme";
  import { useScheduleDrag } from "@/composables/useScheduleDrag";
  import { getIntlLocale } from "@/utils/intlLocale";
  import { useConfirmDialog } from "@/composables/useConfirmDialog";

  const { t } = useI18n();
  const { show: showConfirm } = useConfirmDialog();
  const teamStore = useTeamStore();
  const scheduleStore = useScheduleStore();
  const clientStore = useClientStore();
  const appointmentStore = useAppointmentStore();
  const serviceStore = useServiceStore();
  const authStore = useAuthStore();
  const themeStore = useThemeStore();
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
  const scheduleDrag = useScheduleDrag();
  const isModalOpen = ref(false);
  const modalOpenKey = ref(0);
  const editingBlock = ref<ScheduleBlock | undefined>(undefined);
  const initialBlockHour = ref<number | undefined>(undefined);
  const selectedDate = ref<Date | undefined>(undefined);
  const isRightPanelVisible = ref(true);
  const isAppointmentModalOpen = ref(false);
  const showAddMenu = ref(false);
  const addButtonRef = ref<HTMLElement | null>(null);
  const appointmentModalKey = ref(0);
  const editingAppointment = ref<import("@/interfaces").Appointment | null>(null);
  const initialAppointmentMemberId = ref<string | undefined>(undefined);

  const handleClickOutsideAddMenu = (e: MouseEvent) => {
    if (addButtonRef.value && !addButtonRef.value.contains(e.target as Node)) {
      showAddMenu.value = false;
    }
  };

  const handleResize = () => {
    if (window.innerWidth < 1024) isRightPanelVisible.value = false;
  };

  onMounted(() => {
    document.addEventListener("click", handleClickOutsideAddMenu);
    window.addEventListener("resize", handleResize);
    if (window.innerWidth < 1024) isRightPanelVisible.value = false;
    void teamStore.initialize();
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

  onUnmounted(() => {
    document.removeEventListener("click", handleClickOutsideAddMenu);
    window.removeEventListener("resize", handleResize);
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

  const currentAgendaName = computed(() => {
    const agenda = agendaListStore.getAgenda(selectedAgendaIndex.value);
    return agenda?.name ?? t("scheduler.mySchedule");
  });

  const currentDayAndDate = computed(() => {
    const displayDate = currentDate.value;
    const today = new Date();
    const isToday = displayDate.getDate() === today.getDate() && displayDate.getMonth() === today.getMonth() && displayDate.getFullYear() === today.getFullYear();
    const locale = getIntlLocale();
    const datePart = new Intl.DateTimeFormat(locale, { day: "numeric", month: "long", year: "numeric" }).format(displayDate);
    return isToday ? `${t("scheduler.today")}, ${datePart}` : new Intl.DateTimeFormat(locale, { weekday: "long", day: "numeric", month: "long" }).format(displayDate);
  });

  const selectedMemberId = computed(() => ALL_MEMBERS_ID);

  const memberIdForBlock = computed(() => filteredMembers.value[0]?.id ?? "");

  const activeBlocks = computed(() =>
    blocks.value.filter((block) => block.status !== "cancelled"),
  );

  const filteredBlocks = computed(() => {
    if (view.value === "day") {
      const memberIds = filteredMembers.value.map((member) => member.id);
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
    return visibleAppointments.value.filter((apt) =>
      !apt.memberId || apt.memberId === selectedMemberId.value,
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

  const pendingBlocks = computed(() => blocks.value.filter((block) => block.status === "pending"));
  const pendingBlocksCount = computed(() => pendingBlocks.value.length);
  const isThemeSelected = computed(() => themeStore.themeId !== DEFAULT_THEME_ID);

  const slotFinderMinHour = computed(() => {
    const agenda = agendaListStore.getAgenda(selectedAgendaIndex.value);
    return agenda?.startHour ?? schedulerSettings.startHour.value;
  });
  const slotFinderMaxHour = computed(() => {
    const agenda = agendaListStore.getAgenda(selectedAgendaIndex.value);
    return agenda?.endHour ?? schedulerSettings.endHour.value;
  });

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
    initialAppointmentMemberId.value = data.memberId;
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

  const onAddOption = (type: "block" | "appointment") => {
    showAddMenu.value = false;
    if (type === "block") openAddModal();
    else openAppointmentModal();
  };

  const openAppointmentModal = () => {
    editingAppointment.value = null;
    selectedDate.value = new Date(currentDate.value);
    initialBlockHour.value = 9;
    initialAppointmentMemberId.value = undefined;
    appointmentModalKey.value += 1;
    isAppointmentModalOpen.value = true;
  };

  const onSlotSelect = (slot: { date: Date; startHour: number; memberId: string }) => {
    selectedDate.value = new Date(slot.date);
    initialBlockHour.value = slot.startHour;
    initialAppointmentMemberId.value = slot.memberId;
    editingAppointment.value = null;
    appointmentModalKey.value += 1;
    isAppointmentModalOpen.value = true;
  };

  const closeAppointmentModal = () => {
    isAppointmentModalOpen.value = false;
    editingAppointment.value = null;
    initialAppointmentMemberId.value = undefined;
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

  const saveBlock = async (data: Partial<ScheduleBlock>) => {
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
      if (occupied) {
        const proceed = await showConfirm({
          title: "Horario ocupado",
          message: t("scheduler.slotOccupiedConfirm"),
          confirmLabel: "Guardar de todos modos",
          variant: "primary",
        });
        if (!proceed) return;
      }
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

  const regenerate = async () => {
    const ok = await showConfirm({
      title: "Regenerar datos",
      message: t("scheduler.regenerateConfirm"),
      confirmLabel: "Regenerar",
      variant: "danger",
    });
    if (ok) generateAllSchedules(teamStore.members, currentDate.value);
  };

  const cancelAppointment = () => {
    closeAppointmentModal();
  };

  const moveAppointmentToSlot = (
    appointmentId: string,
    date: Date,
    hour: number,
    memberId?: string,
  ) => {
    const apt = appointmentStore.getById(appointmentId);
    if (!apt) return;
    const start = new Date(apt.start);
    const end = new Date(apt.end);
    const durationMs = end.getTime() - start.getTime();
    const newStart = new Date(date);
    newStart.setHours(Math.floor(hour), Math.round((hour % 1) * 60), 0, 0);
    const newEnd = new Date(newStart.getTime() + durationMs);
    appointmentStore.update(appointmentId, {
      start: newStart.toISOString(),
      end: newEnd.toISOString(),
      ...(memberId ? { memberId } : {}),
    });
  };

  const handleAppointmentMove = (data: {
    appointmentId: string;
    date: Date;
    hour: number;
  }) => {
    const apt = appointmentStore.getById(data.appointmentId);
    moveAppointmentToSlot(
      data.appointmentId,
      data.date,
      data.hour,
      apt?.memberId,
    );
  };

  const handleAppointmentMoveDay = (data: {
    appointmentId: string;
    date: Date;
    hour: number;
    memberId: string;
  }) => {
    moveAppointmentToSlot(
      data.appointmentId,
      data.date,
      data.hour,
      data.memberId,
    );
  };

  const moveBlockToSlot = (blockId: string, date: Date, hour: number, memberId?: string) => {
    const block = scheduleStore.blocks.find((b) => b.id === blockId);
    if (!block) return;
    const start = new Date(block.start);
    const end = new Date(block.end);
    const durationMs = end.getTime() - start.getTime();
    const newStart = new Date(date);
    newStart.setHours(Math.floor(hour), Math.round((hour % 1) * 60), 0, 0);
    const newEnd = new Date(newStart.getTime() + durationMs);
    scheduleStore.updateBlock(blockId, {
      start: newStart.toISOString(),
      end: newEnd.toISOString(),
      ...(memberId ? { memberId } : {}),
    });
  };

  const handleBlockMove = (data: { blockId: string; date: Date; hour: number }) => {
    const block = scheduleStore.blocks.find((b) => b.id === data.blockId);
    moveBlockToSlot(data.blockId, data.date, data.hour, block?.memberId);
  };

  const handleBlockMoveDay = (data: { blockId: string; date: Date; hour: number; memberId: string }) => {
    moveBlockToSlot(data.blockId, data.date, data.hour, data.memberId);
  };

  const isDraggingConfirmedAppointment = computed(() => {
    const item = scheduleDrag.item.value as AgendaItem | null;
    if (!item || !scheduleDrag.moving.value) return false;
    if (isAppointment(item)) return item.status === "confirmed";
    return false;
  });

  const waitlistEntries = computed(() => {
    return [];
  });

  const cancelAppointmentById = (appointmentId: string) => {
    appointmentStore.cancel(appointmentId);
    scheduleDrag.end();
  };
</script>
