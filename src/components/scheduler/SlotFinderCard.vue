<template>
  <div class="app-card p-4 bg-brand-soft/30 border-brand-primary/10">
    <h4 class="font-semibold text-brand-primary text-sm mb-2">{{ $t('scheduler.slotFinderTitle') }}</h4>
    <p class="text-xs text-app-text/80 mb-3">{{ $t('scheduler.slotFinderHint') }}</p>

    <div class="space-y-2 mb-3">
      <div class="grid grid-cols-2 gap-2">
        <div>
          <label class="text-xs font-medium text-app-text/80 block mb-1">{{ $t('scheduler.slotFinderFromDate') }}</label>
          <input
            v-model="fromDateStr"
            type="date"
            class="w-full p-2 bg-app-bg border border-app-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
          />
        </div>
        <div>
          <label class="text-xs font-medium text-app-text/80 block mb-1">{{ $t('scheduler.slotFinderToDate') }}</label>
          <input
            v-model="toDateStr"
            type="date"
            class="w-full p-2 bg-app-bg border border-app-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
          />
        </div>
      </div>

      <div>
        <label class="text-xs font-medium text-app-text/80 block mb-1">{{ $t('scheduler.slotFinderTimeWindows') }}</label>
        <div class="space-y-2">
          <div
            v-for="(win, idx) in timeWindows"
            :key="idx"
            class="flex flex-wrap items-end gap-2 p-2 rounded-lg bg-app-bg/50 border border-app-border-subtle"
          >
            <div class="flex-1 min-w-[80px]">
              <label class="text-[10px] text-app-text/60 block mb-0.5">{{ $t('scheduler.slotFinderDay') }}</label>
              <select
                v-model="win.dayOfWeek"
                class="w-full p-1.5 bg-app-bg border border-app-border rounded text-xs"
              >
                <option
                  v-for="d in dayOptions"
                  :key="d.value"
                  :value="d.value"
                >
                  {{ d.label }}
                </option>
              </select>
            </div>
            <div class="w-20">
              <label class="text-[10px] text-app-text/60 block mb-0.5">{{ $t('scheduler.slotFinderFromHour') }}</label>
              <input
                v-model="win.startHourStr"
                type="time"
                :min="minTimeStr"
                :max="maxTimeStr"
                class="w-full p-1.5 bg-app-bg border border-app-border rounded text-xs"
              />
            </div>
            <div class="w-20">
              <label class="text-[10px] text-app-text/60 block mb-0.5">{{ $t('scheduler.slotFinderToHour') }}</label>
              <input
                v-model="win.endHourStr"
                type="time"
                :min="minTimeStr"
                :max="maxTimeStr"
                class="w-full p-1.5 bg-app-bg border border-app-border rounded text-xs"
              />
            </div>
            <button
              type="button"
              class="p-1.5 text-red-500 hover:bg-red-50 rounded"
              :title="$t('scheduler.slotFinderRemoveWindow')"
              @click="removeWindow(idx)"
            >
              ✕
            </button>
          </div>
          <button
            type="button"
            class="w-full py-1.5 text-xs font-medium text-brand-primary border border-dashed border-brand-primary/40 rounded-lg hover:bg-brand-primary/5"
            @click="addWindow"
          >
            + {{ $t('scheduler.slotFinderAddWindow') }}
          </button>
        </div>
      </div>

      <div>
        <label class="text-xs font-medium text-app-text/80 block mb-1">{{ $t('scheduler.slotFinderDuration') }}</label>
        <select
          v-model="durationMinutes"
          class="w-full p-2 bg-app-bg border border-app-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
        >
          <option :value="30">30 {{ $t('scheduler.minutes') }}</option>
          <option :value="60">60 {{ $t('scheduler.minutes') }}</option>
          <option :value="90">90 {{ $t('scheduler.minutes') }}</option>
          <option :value="120">120 {{ $t('scheduler.minutes') }}</option>
        </select>
      </div>
    </div>

    <div class="max-h-40 overflow-y-auto space-y-1 custom-scrollbar">
      <button
        v-for="slot in availableSlots"
        :key="`${slot.date.toISOString()}-${slot.startHour}-${slot.memberId}`"
        type="button"
        class="w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium bg-app-surface border border-app-border-subtle hover:bg-brand-primary/10 hover:border-brand-primary/20 transition-colors"
        @click="$emit('slot-select', slot)"
      >
        <span class="text-app-title">{{ formatSlotLabel(slot.startHour) }} - {{ formatSlotLabel(slot.endHour) }}</span>
        <span class="text-app-text/70 ml-1">· {{ formatDayShort(slot.date) }}</span>
        <span class="text-app-text/60 ml-1 truncate">· {{ slot.memberName.split(' ')[0] }}</span>
      </button>
      <p
        v-if="availableSlots.length === 0 && !showAddToWaitlist"
        class="text-xs text-app-text/60 py-2"
      >
        {{ $t('scheduler.slotFinderNoResults') }}
      </p>
      <div
        v-if="showAddToWaitlist"
        class="pt-3 mt-3 border-t border-app-border-subtle space-y-2"
      >
        <p class="text-xs font-medium text-app-text">
          {{ $t('scheduler.slotFinderAddToWaitlistTitle') }}
        </p>
        <div class="flex gap-2">
          <select
            v-model="waitlistServiceId"
            class="flex-1 p-2 bg-app-bg border border-app-border rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
          >
            <option value="">
              {{ $t('scheduler.slotFinderSelectService') }}
            </option>
            <option
              v-for="s in services"
              :key="s.id"
              :value="s.id"
            >
              {{ s.name }}
            </option>
          </select>
          <button
            type="button"
            class="px-3 py-2 rounded-lg bg-brand-primary text-white text-xs font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
            :disabled="!waitlistServiceId || waitlistLoading"
            @click="handleAddToWaitlist"
          >
            {{ waitlistLoading ? $t('common.loading') : $t('scheduler.slotFinderAddToWaitlist') }}
          </button>
        </div>
        <p
          v-if="waitlistError"
          class="text-xs text-red-600"
        >
          {{ waitlistError }}
        </p>
        <p
          v-else-if="waitlistSuccess"
          class="text-xs text-emerald-600"
        >
          {{ $t('scheduler.slotFinderAddToWaitlistSuccess') }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, watch } from "vue";
  import { useI18n } from "vue-i18n";
  import { useSlotFinder, type AvailableSlot, type TimeWindow } from "@/composables/useSlotFinder";
  import { formatSlotLabel } from "@/composables/useScheduleDates";
  import { getIntlLocale } from "@/utils/intlLocale";
  import { useServiceStore } from "@/stores/service";
  import { bookingApi } from "@/infrastructure/bookingApi";
  import type { ScheduleBlock } from "@/interfaces";
  import type { Appointment } from "@/interfaces";
  import type { TeamMember } from "@/interfaces/team";

  const props = withDefaults(
    defineProps<{
      members: TeamMember[];
      blocks: ScheduleBlock[];
      appointments: Appointment[];
      minHour: number;
      maxHour: number;
      slotDurationMinutes: number;
      initialDate?: Date;
      businessId?: string | null;
    }>(),
    { businessId: null },
  );

  defineEmits<{
    (e: "slot-select", slot: AvailableSlot): void;
  }>();

  const hourToTimeStr = (h: number) => {
    const hi = Math.floor(Math.max(0, Math.min(24, h)));
    const mi = Math.round((h - hi) * 60);
    return `${String(hi).padStart(2, "0")}:${String(mi).padStart(2, "0")}`;
  };

  const minTimeStr = computed(() => hourToTimeStr(props.minHour));
  const maxTimeStr = computed(() => hourToTimeStr(props.maxHour));

  const defaultStartStr = computed(() => hourToTimeStr(props.minHour));
  const defaultEndStr = computed(() =>
    hourToTimeStr(props.minHour + Math.min(4, Math.max(1, props.maxHour - props.minHour - 2))),
  );
  const defaultEndStrPm = computed(() =>
    hourToTimeStr(props.maxHour - Math.min(2, Math.max(1, props.maxHour - props.minHour - 2))),
  );

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const nextWeek = new Date(today);
  nextWeek.setDate(nextWeek.getDate() + 6);

  const fromDate = ref<Date>(props.initialDate ? new Date(props.initialDate) : new Date(today));
  const toDate = ref<Date>(new Date(nextWeek));
  const durationMinutes = ref(60);

  interface TimeWindowRow {
    dayOfWeek: number;
    startHourStr: string;
    endHourStr: string;
  }

  const serviceStore = useServiceStore();
  const services = computed(() => serviceStore.services);

  const timeWindows = ref<TimeWindowRow[]>([]);

  const initTimeWindows = () => {
    timeWindows.value = [
      { dayOfWeek: 1, startHourStr: defaultStartStr.value, endHourStr: defaultEndStr.value },
      {
        dayOfWeek: 1,
        startHourStr: defaultEndStrPm.value,
        endHourStr: hourToTimeStr(props.maxHour),
      },
    ];
  };

  watch(
    () => [props.minHour, props.maxHour],
    () => initTimeWindows(),
    { immediate: true },
  );

  const { t } = useI18n();
  const dayOptions = computed(() => [
    { value: 0, label: t("scheduler.slotFinderDaySun") },
    { value: 1, label: t("scheduler.slotFinderDayMon") },
    { value: 2, label: t("scheduler.slotFinderDayTue") },
    { value: 3, label: t("scheduler.slotFinderDayWed") },
    { value: 4, label: t("scheduler.slotFinderDayThu") },
    { value: 5, label: t("scheduler.slotFinderDayFri") },
    { value: 6, label: t("scheduler.slotFinderDaySat") },
  ]);

  const addWindow = () => {
    timeWindows.value.push({
      dayOfWeek: 1,
      startHourStr: defaultStartStr.value,
      endHourStr: defaultEndStr.value,
    });
  };

  const removeWindow = (idx: number) => {
    timeWindows.value.splice(idx, 1);
  };

  const timeWindowsComputed = computed<TimeWindow[]>(() =>
    timeWindows.value.map((w) => {
      const [sh, sm] = (w.startHourStr || defaultStartStr.value).split(":").map(Number);
      const [eh, em] = (w.endHourStr || defaultEndStr.value).split(":").map(Number);
      return {
        dayOfWeek: w.dayOfWeek,
        startHour: sh + sm / 60,
        endHour: eh + em / 60,
      };
    }),
  );

  const formatDateForInput = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

  const fromDateStr = computed({
    get: () => formatDateForInput(fromDate.value),
    set: (v: string) => {
      if (v) fromDate.value = new Date(v + "T12:00:00");
    },
  });

  const toDateStr = computed({
    get: () => formatDateForInput(toDate.value),
    set: (v: string) => {
      if (v) toDate.value = new Date(v + "T12:00:00");
    },
  });

  const { availableSlots } = useSlotFinder({
    fromDate: () => fromDate.value,
    toDate: () => toDate.value,
    durationMinutes: () => durationMinutes.value,
    members: () => props.members,
    blocks: () => props.blocks,
    appointments: () => props.appointments,
    timeWindows: () => timeWindowsComputed.value,
    slotDurationMinutes: () => props.slotDurationMinutes,
  });

  const showAddToWaitlist = computed(
    () => availableSlots.value.length === 0 && !!props.businessId && services.value.length > 0,
  );

  const waitlistServiceId = ref("");
  const waitlistLoading = ref(false);
  const waitlistError = ref("");
  const waitlistSuccess = ref(false);

  const handleAddToWaitlist = async () => {
    if (!props.businessId || !waitlistServiceId.value) return;
    const service = services.value.find((s) => s.id === waitlistServiceId.value);
    if (!service) return;
    waitlistLoading.value = true;
    waitlistError.value = "";
    waitlistSuccess.value = false;
    try {
      const startHour = timeWindowsComputed.value[0]?.startHour ?? props.minHour;
      const preferredStart = new Date(fromDate.value);
      preferredStart.setHours(Math.floor(startHour), Math.round((startHour % 1) * 60), 0, 0);
      const preferredEnd = new Date(preferredStart.getTime() + service.duration * 60 * 1000);
      await bookingApi.addToWaitlist({
        businessId: props.businessId,
        serviceId: waitlistServiceId.value,
        preferredStart: preferredStart.toISOString(),
        preferredEnd: preferredEnd.toISOString(),
      });
      waitlistSuccess.value = true;
    } catch (e) {
      waitlistError.value = e instanceof Error ? e.message : "Error al apuntarse";
    } finally {
      waitlistLoading.value = false;
    }
  };

  const formatDayShort = (d: Date) =>
    new Intl.DateTimeFormat(getIntlLocale(), { weekday: "short", day: "numeric", month: "short" }).format(d);

  watch(
    () => props.initialDate,
    (d) => {
      if (d) fromDate.value = new Date(d);
    },
  );
</script>
