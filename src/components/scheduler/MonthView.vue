<template>
  <div class="flex flex-col h-full bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
    <div class="grid grid-cols-7 border-b border-gray-200 bg-gray-50">
      <div
        v-for="dayName in dayNames"
        :key="dayName"
        class="py-2 text-center text-xs uppercase font-semibold text-gray-500"
      >
        {{ dayName }}
      </div>
    </div>

    <div class="flex-1 grid grid-cols-7 auto-rows-fr bg-gray-200 gap-px border-b border-gray-200">
      <div
        v-for="day in monthDays"
        :key="day.date.toISOString()"
        class="bg-white p-2 min-h-[100px] flex flex-col relative cursor-pointer hover:bg-gray-50 transition-colors"
        :class="{ 'bg-gray-50 text-gray-400': !day.isCurrentMonth, 'bg-brand-soft': day.isToday }"
        @click="handleDayClick(day.date)"
      >
        <div
          class="text-right text-sm font-medium mb-1"
          :class="day.isToday ? 'text-brand-accent font-bold' : 'text-gray-700'"
        >
          {{ day.date.getDate() }}
        </div>

        <div class="flex-1 flex flex-col gap-1 overflow-hidden">
          <template v-for="entry in dayEntries(day).slice(0, 3)" :key="entry.id">
            <div
              v-if="entry.type === 'appointment'"
              class="px-1.5 py-0.5 rounded text-[10px] truncate cursor-pointer hover:opacity-80 transition-opacity bg-brand-accent/15 text-brand-accent border-l-2 border-brand-accent"
              @click.stop="$emit('item-click', entry.item)"
            >
              {{ dates.formatTime(entry.item.start) }} {{ monthAppointmentLabel(entry.item) }}
            </div>
            <div
              v-else
              class="px-1.5 py-0.5 rounded text-[10px] truncate cursor-pointer hover:opacity-80 transition-opacity"
              :class="monthCellClass(entry.item.type)"
              @click.stop="$emit('block-click', entry.item)"
            >
              {{ dates.formatTime(entry.item.start) }} {{ entry.item.title }}
            </div>
          </template>
          <div
            v-if="dayEntries(day).length > 3"
            class="text-[10px] text-gray-500 pl-1"
          >
            {{ $t("scheduler.more", { count: dayEntries(day).length - 3 }) }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed } from "vue";
  import type { ScheduleBlock } from "@/interfaces";
  import type { ScheduleBlockType } from "@/interfaces";
  import type { Appointment } from "@/interfaces/appointment";
  import { getBlockTypeMonthCellClass } from "@/data/scheduleBlockTypes";
  import { useMonthGrid, type MonthGridDay } from "@/composables/useMonthGrid";
  import { useScheduleDates } from "@/composables/useScheduleDates";
  import { getIntlLocale } from "@/utils/intlLocale";
  import { useClientStore } from "@/stores/client";
  import { useServiceStore } from "@/stores/service";

  const clientStore = useClientStore();
  const serviceStore = useServiceStore();

  const monthCellClass = (type: ScheduleBlockType) => {
    if (type === "work") return "agenda-month-work";
    if (type === "vacation") return "agenda-month-vacation";
    return getBlockTypeMonthCellClass(type);
  };

  const props = defineProps<{
    currentDate: Date;
    blocks: ScheduleBlock[];
    appointments?: Appointment[];
    weekStartsOn?: 0 | 1;
  }>();

  const emit = defineEmits<{
    (e: "block-click", block: ScheduleBlock): void;
    (e: "item-click", appointment: Appointment): void;
    (e: "grid-click", data: { date: Date; hour: number }): void;
  }>();

  const dayNames = computed(() => {
    const base = new Date(Date.UTC(2024, 0, 7)); // Sunday
    const locale = getIntlLocale();
    const formatter = new Intl.DateTimeFormat(locale, { weekday: "short" });
    const names = Array.from({ length: 7 }, (_, i) => formatter.format(new Date(base.getTime() + i * 86_400_000)));
    const startsOn = props.weekStartsOn ?? 1;
    const rotated = startsOn === 0 ? names : [...names.slice(1), names[0]];
    return rotated.map((shortName) => shortName.replace(".", "").slice(0, 3));
  });

  const monthGrid = useMonthGrid(
    () => props.currentDate,
    () => props.blocks,
    () => props.weekStartsOn ?? 1,
    () => props.appointments ?? [],
  );

  const monthDays = computed((): MonthGridDay[] => monthGrid.days.value);

  const dates = useScheduleDates();

  const monthAppointmentLabel = (apt: Appointment): string => {
    if (apt.clientId) {
      const client = clientStore.getClientById(apt.clientId);
      if (client?.name) return client.name;
    }
    if (apt.clientName?.trim()) return apt.clientName.trim();
    if (apt.serviceId) {
      const service = serviceStore.getServiceById(apt.serviceId);
      if (service?.name) return service.name;
    }
    return "—";
  };

  type DayEntry = { type: "appointment"; id: string; item: Appointment } | { type: "block"; id: string; item: ScheduleBlock };

  const dayEntries = (day: MonthGridDay): DayEntry[] => {
    const aptEntries: DayEntry[] = day.appointments.map((apt) => ({ type: "appointment", id: apt.id, item: apt }));
    const blockEntries: DayEntry[] = day.blocks.map((block) => ({ type: "block", id: block.id, item: block }));
    return [...aptEntries, ...blockEntries].sort((entryA, entryB) => {
      const timeA = entryA.type === "appointment" ? new Date(entryA.item.start).getTime() : new Date(entryA.item.start).getTime();
      const timeB = entryB.type === "appointment" ? new Date(entryB.item.start).getTime() : new Date(entryB.item.start).getTime();
      return timeA - timeB;
    });
  };

  const handleDayClick = (date: Date) => {
    emit("grid-click", { date: date, hour: 9 });
  };
</script>
