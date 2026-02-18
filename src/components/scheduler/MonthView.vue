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
        :class="{ 'bg-gray-50 text-gray-400': !day.isCurrentMonth, 'bg-brand-accent/5': day.isToday }"
        @click="handleDayClick(day.date)"
      >
        <div
          class="text-right text-sm font-medium mb-1"
          :class="day.isToday ? 'text-brand-accent font-bold' : 'text-gray-700'"
        >
          {{ day.date.getDate() }}
        </div>

        <div class="flex-1 flex flex-col gap-1 overflow-hidden">
          <div
            v-for="block in day.blocks.slice(0, 3)"
            :key="block.id"
            class="px-1.5 py-0.5 rounded text-[10px] truncate cursor-pointer hover:opacity-80 transition-opacity"
            :class="monthCellClass(block.type)"
            @click.stop="$emit('block-click', block)"
          >
            {{ dates.formatTime(block.start) }} {{ block.title }}
          </div>
          <div
            v-if="day.blocks.length > 3"
            class="text-[10px] text-gray-500 pl-1"
          >
            {{ $t("scheduler.more", { count: day.blocks.length - 3 }) }}
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
  import { getBlockTypeMonthCellClass } from "@/data/scheduleBlockTypes";
  import { useMonthGrid, type MonthGridDay } from "@/composables/useMonthGrid";
  import { useScheduleDates } from "@/composables/useScheduleDates";
  import { getIntlLocale } from "@/utils/intlLocale";

  const monthCellClass = (type: ScheduleBlockType) => {
    if (type === "work") return "agenda-month-work";
    if (type === "vacation") return "agenda-month-vacation";
    return getBlockTypeMonthCellClass(type);
  };

  const props = defineProps<{
    currentDate: Date;
    blocks: ScheduleBlock[];
    weekStartsOn?: 0 | 1;
  }>();

  const emit = defineEmits<{
    (e: "block-click", block: ScheduleBlock): void;
    (e: "grid-click", data: { date: Date; hour: number }): void;
  }>();

  const dayNames = computed(() => {
    const base = new Date(Date.UTC(2024, 0, 7)); // Sunday
    const locale = getIntlLocale();
    const formatter = new Intl.DateTimeFormat(locale, { weekday: "short" });
    const names = Array.from({ length: 7 }, (_, i) => formatter.format(new Date(base.getTime() + i * 86_400_000)));
    const startsOn = props.weekStartsOn ?? 1;
    const rotated = startsOn === 0 ? names : [...names.slice(1), names[0]];
    return rotated.map((s) => s.replace(".", "").slice(0, 3));
  });

  const monthGrid = useMonthGrid(
    () => props.currentDate,
    () => props.blocks,
    () => props.weekStartsOn ?? 1,
  );

  const monthDays = computed((): MonthGridDay[] => monthGrid.days.value);

  const dates = useScheduleDates();

  const handleDayClick = (date: Date) => {
    emit("grid-click", { date: date, hour: 9 });
  };
</script>
