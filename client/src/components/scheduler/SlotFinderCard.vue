<template>
  <div class="app-card p-4 bg-brand-soft/30 border-brand-primary/10">
    <button
      type="button"
      class="w-full flex items-center justify-between gap-2 group"
      @click="collapsed = !collapsed"
    >
      <h4 class="font-semibold text-brand-primary text-sm">{{ $t('scheduler.slotFinderTitle') }}</h4>
      <span
        class="text-brand-primary/60 transition-transform duration-200"
        :class="{ 'rotate-180': !collapsed }"
      >
        ▾
      </span>
    </button>

    <template v-if="!collapsed">
    <p class="text-xs text-app-text/80 mt-2 mb-3">{{ $t('scheduler.slotFinderHint') }}</p>

    <div class="flex gap-1 mb-3 p-0.5 bg-app-bg rounded-lg border border-app-border-subtle">
      <button
        type="button"
        class="flex-1 py-1.5 text-xs font-medium rounded-md transition-colors"
        :class="mode === 'manual' ? 'bg-brand-primary text-white shadow-sm' : 'text-app-text/70 hover:text-app-text'"
        @click="mode = 'manual'"
      >
        {{ $t('scheduler.slotFinderModeManual') }}
      </button>
      <button
        type="button"
        class="flex-1 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center justify-center gap-1"
        :class="mode === 'ai' ? 'bg-brand-primary text-white shadow-sm' : 'text-app-text/70 hover:text-app-text'"
        @click="mode = 'ai'"
      >
        <span>✨</span>
        <span>{{ $t('scheduler.slotFinderModeAI') }}</span>
      </button>
    </div>

    <div
      v-if="mode === 'ai'"
      class="space-y-2 mb-3"
    >
      <div>
        <label class="text-xs font-medium text-app-text/80 block mb-1">{{ $t('scheduler.slotFinderAILabel') }}</label>
        <textarea
          v-model="aiQuery"
          rows="3"
          class="w-full p-2 bg-app-bg border border-app-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 resize-none"
          :placeholder="$t('scheduler.slotFinderAIPlaceholder')"
          maxlength="500"
        />
        <p class="text-[10px] text-app-text/50 text-right mt-0.5">
          {{ aiQuery.length }}/500
        </p>
      </div>
      <button
        type="button"
        class="w-full py-2 text-xs font-semibold rounded-lg bg-brand-primary text-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 transition-opacity"
        :disabled="!aiQuery.trim() || aiLoading"
        @click="runAISearch"
      >
        <span v-if="aiLoading" class="inline-block w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
        <span v-else>✨</span>
        <span>{{ aiLoading ? $t('scheduler.slotFinderAISearching') : $t('scheduler.slotFinderAISearch') }}</span>
      </button>
      <p
        v-if="aiError"
        class="text-xs text-red-600 bg-red-50 rounded-lg px-2 py-1.5"
      >
        {{ aiError }}
      </p>
      <div
        v-if="aiApplied && !aiError"
        class="text-xs text-emerald-700 bg-emerald-50 rounded-lg px-2 py-1.5 flex items-center gap-1"
      >
        <span>✓</span>
        <span>{{ $t('scheduler.slotFinderAIApplied', { count: timeWindows.length }) }}</span>
      </div>
    </div>

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

      <div v-if="mode === 'manual'">
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

      <div v-if="mode === 'ai' && timeWindows.length > 0">
        <label class="text-xs font-medium text-app-text/80 block mb-1">{{ $t('scheduler.slotFinderTimeWindows') }}</label>
        <div class="space-y-1">
          <div
            v-for="(win, idx) in timeWindows"
            :key="idx"
            class="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-app-bg/50 border border-app-border-subtle text-xs text-app-text"
          >
            <span class="font-medium text-brand-primary w-8">{{ getDayLabel(win.dayOfWeek) }}</span>
            <span>{{ win.startHourStr }} – {{ win.endHourStr }}</span>
          </div>
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
      <p
        v-if="availableSlots.length > 0"
        class="text-[10px] text-app-text/60 mb-1"
      >
        {{ $t('scheduler.slotFinderClickToBook') }}
      </p>
      <button
        v-for="slot in availableSlots"
        :key="`${slot.date.toISOString()}-${slot.startHour}-${slot.memberId}`"
        type="button"
        class="w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium bg-app-surface border border-app-border-subtle hover:bg-brand-primary/10 hover:border-brand-primary/30 cursor-pointer flex items-center justify-between gap-2 transition-colors"
        @click="$emit('slot-select', slot)"
      >
        <span>
          <span class="text-app-title">{{ formatSlotLabel(slot.startHour) }} – {{ formatSlotLabel(slot.endHour) }}</span>
          <span class="text-app-text/70 ml-1">· {{ formatDayShort(slot.date) }}</span>
          <span class="text-app-text/60 ml-1 truncate">· {{ slot.memberName.split(' ')[0] }}</span>
        </span>
        <span class="text-brand-primary text-[10px] font-semibold shrink-0">{{ $t('scheduler.slotFinderReserve') }}</span>
      </button>
      <p
        v-if="availableSlots.length === 0 && !showWaitlistSection"
        class="text-xs text-app-text/60 py-2"
      >
        {{ $t('scheduler.slotFinderNoResults') }}
      </p>
    </div>

    <div
      v-if="showWaitlistSection"
      class="mt-3 pt-3 border-t border-app-border-subtle space-y-2"
    >
      <p class="text-xs font-medium text-app-text">
        {{ availableSlots.length === 0 ? $t('scheduler.slotFinderAddToWaitlistTitle') : $t('scheduler.slotFinderOrAddToWaitlist') }}
      </p>
      <div v-if="clients.length > 0" class="relative">
        <div
          v-if="selectedClientForWaitlist"
          class="flex items-center gap-2 p-2 bg-app-bg border border-app-border rounded-lg"
        >
          <span class="text-xs text-app-title flex-1 truncate">{{ selectedClientForWaitlist.name }}</span>
          <button
            type="button"
            class="text-app-text/50 hover:text-red-500 transition-colors shrink-0"
            @click="clearWaitlistClient"
          >
            ✕
          </button>
        </div>
        <div v-else>
          <input
            v-model="clientSearchQuery"
            type="text"
            class="w-full p-2 bg-app-bg border border-app-border rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
            :placeholder="$t('scheduler.waitlistSelectClient')"
            @focus="showClientSuggestions = true"
            @blur="onClientInputBlur"
          />
          <div
            v-if="showClientSuggestions && filteredClientsForWaitlist.length > 0"
            class="absolute z-50 top-full left-0 right-0 mt-1 bg-app-surface border border-app-border rounded-lg shadow-lg max-h-40 overflow-y-auto"
          >
            <button
              v-for="c in filteredClientsForWaitlist"
              :key="c.id"
              type="button"
              class="w-full text-left px-3 py-2 text-xs text-app-title hover:bg-brand-primary/10 transition-colors"
              @mousedown.prevent="selectWaitlistClient(c)"
            >
              {{ c.name }}
            </button>
          </div>
          <p
            v-if="showClientSuggestions && clientSearchQuery.length >= 2 && filteredClientsForWaitlist.length === 0"
            class="absolute z-50 top-full left-0 right-0 mt-1 bg-app-surface border border-app-border rounded-lg shadow-sm px-3 py-2 text-xs text-app-text/60"
          >
            {{ $t('clients.noResults') }}
          </p>
        </div>
      </div>
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
          class="px-3 py-2 rounded-lg bg-brand-primary text-white text-xs font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
          :disabled="!waitlistServiceId || (clients.length > 0 && !waitlistClientId) || waitlistLoading"
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
    </template>
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
  import { aiApi } from "@/infrastructure/aiApi";
  import type { ScheduleBlock, Client } from "@/interfaces";
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
      clients?: Client[];
    }>(),
    { businessId: null, clients: () => [] },
  );

  defineEmits<{
    (e: "slot-select", slot: AvailableSlot): void;
  }>();

  const { t } = useI18n();

  const collapsed = ref(false);
  const mode = ref<"manual" | "ai">("manual");

  const aiQuery = ref("");
  const aiLoading = ref(false);
  const aiError = ref("");
  const aiApplied = ref(false);

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

  const dayOptions = computed(() => [
    { value: 0, label: t("scheduler.slotFinderDaySun") },
    { value: 1, label: t("scheduler.slotFinderDayMon") },
    { value: 2, label: t("scheduler.slotFinderDayTue") },
    { value: 3, label: t("scheduler.slotFinderDayWed") },
    { value: 4, label: t("scheduler.slotFinderDayThu") },
    { value: 5, label: t("scheduler.slotFinderDayFri") },
    { value: 6, label: t("scheduler.slotFinderDaySat") },
  ]);

  const getDayLabel = (dayOfWeek: number) =>
    dayOptions.value.find((d) => d.value === dayOfWeek)?.label ?? String(dayOfWeek);

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

  const nextMonthStart = () => {
    const d = new Date();
    d.setDate(1);
    d.setMonth(d.getMonth() + 1);
    d.setHours(0, 0, 0, 0);
    return d;
  };

  const nextMonthEnd = () => {
    const d = new Date();
    d.setDate(1);
    d.setMonth(d.getMonth() + 2);
    d.setDate(0);
    d.setHours(0, 0, 0, 0);
    return d;
  };

  const runAISearch = async () => {
    aiError.value = "";
    aiApplied.value = false;
    aiLoading.value = true;
    try {
      const result = await aiApi.parseSlotQuery(aiQuery.value);
      if (result.windows.length === 0) {
        aiError.value = t("scheduler.slotFinderAINoWindows");
        return;
      }
      timeWindows.value = result.windows.map((w) => ({
        dayOfWeek: w.dayOfWeek,
        startHourStr: hourToTimeStr(w.startHour),
        endHourStr: hourToTimeStr(w.endHour),
      }));
      durationMinutes.value = result.durationMinutes ?? 60;
      fromDate.value = nextMonthStart();
      toDate.value = nextMonthEnd();
      aiApplied.value = true;
    } catch (err) {
      aiError.value = err instanceof Error ? err.message : t("scheduler.slotFinderAIError");
    } finally {
      aiLoading.value = false;
    }
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

  const showWaitlistSection = computed(
    () => !!props.businessId && services.value.length > 0,
  );

  const waitlistClientId = ref("");
  const waitlistServiceId = ref("");
  const waitlistLoading = ref(false);
  const waitlistError = ref("");
  const waitlistSuccess = ref(false);

  const clientSearchQuery = ref("");
  const selectedClientForWaitlist = ref<Client | null>(null);
  const showClientSuggestions = ref(false);

  const filteredClientsForWaitlist = computed(() => {
    const q = clientSearchQuery.value.trim().toLowerCase();
    if (!q) return props.clients.slice(0, 8);
    return props.clients.filter((c) => c.name.toLowerCase().includes(q)).slice(0, 8);
  });

  const selectWaitlistClient = (c: Client) => {
    selectedClientForWaitlist.value = c;
    waitlistClientId.value = c.id;
    clientSearchQuery.value = "";
    showClientSuggestions.value = false;
  };

  const clearWaitlistClient = () => {
    selectedClientForWaitlist.value = null;
    waitlistClientId.value = "";
    clientSearchQuery.value = "";
  };

  const onClientInputBlur = () => {
    setTimeout(() => { showClientSuggestions.value = false; }, 150);
  };

  const handleAddToWaitlist = async () => {
    if (!waitlistServiceId.value) return;
    if (props.clients.length > 0 && !waitlistClientId.value) return;
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
      if (props.clients.length > 0 && waitlistClientId.value) {
        await bookingApi.addClientToWaitlist({
          clientId: waitlistClientId.value,
          serviceId: waitlistServiceId.value,
          preferredStart: preferredStart.toISOString(),
          preferredEnd: preferredEnd.toISOString(),
        });
      } else if (props.businessId) {
        await bookingApi.addToWaitlist({
          businessId: props.businessId,
          serviceId: waitlistServiceId.value,
          preferredStart: preferredStart.toISOString(),
          preferredEnd: preferredEnd.toISOString(),
        });
      }
      waitlistSuccess.value = true;
      waitlistClientId.value = "";
      waitlistServiceId.value = "";
      selectedClientForWaitlist.value = null;
      clientSearchQuery.value = "";
    } catch (e) {
      waitlistError.value = e instanceof Error ? e.message : t("scheduler.slotFinderAddToWaitlistError");
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
