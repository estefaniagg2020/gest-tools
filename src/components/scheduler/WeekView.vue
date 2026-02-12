<template>
  <div class="flex flex-col h-full bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
    <div class="flex border-b border-gray-200 bg-gray-50">
      <div class="w-16 shrink-0 border-r border-gray-200"></div>
      <div
        v-for="day in weekDays"
        :key="day.toISOString()"
        class="flex-1 py-3 text-center border-r border-gray-200 last:border-0"
        :class="{ 'bg-spa-teal/5': dates.isToday(day) }"
      >
        <div class="text-xs uppercase font-semibold text-gray-500">{{ dates.formatDayName(day) }}</div>
        <div
          class="text-xl font-bold text-gray-800"
          :class="{ 'text-spa-teal': dates.isToday(day) }"
        >
          {{ day.getDate() }}
        </div>
      </div>
    </div>

    <div class="flex-1 min-h-0 overflow-y-auto relative custom-scrollbar">
      <div
        class="flex relative"
        :style="{ height: gridContentHeight + 'px' }"
      >
        <div class="w-16 shrink-0 border-r border-gray-200 bg-white z-10 sticky left-0">
          <div
            v-for="slotStart in gridSlotStarts"
            :key="slotStart"
            class="absolute w-full text-center text-xs text-gray-400 -mt-2.5"
            :style="{ top: topOffset + (slotStart - props.startHour) * props.pixelsPerHour + 'px' }"
          >
            {{ grid.formatSlotLabel(slotStart) }}
          </div>
        </div>

        <div
          v-for="day in weekDays"
          :key="day.toISOString()"
          class="flex-1 relative border-r border-gray-100 last:border-0 hover:bg-gray-50 transition-colors cursor-crosshair"
          @click="handleGridClick($event, day)"
        >
          <div
            v-for="slotStart in gridSlotStarts"
            :key="slotStart"
            class="absolute w-full border-b border-gray-100 pointer-events-none"
            :style="{ top: topOffset + (slotStart - props.startHour) * props.pixelsPerHour + 'px' }"
          ></div>

          <BlockCard
            v-for="block in filterBlocksByDay(props.blocks, day)"
            :key="block.id"
            :block="block"
            :start-hour="props.startHour"
            :pixels-per-hour="props.pixelsPerHour"
            :top-offset="topOffset"
            @click="$emit('block-click', block)"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed } from "vue";
  import { useScheduleGrid } from "@/composables/useScheduleGrid";
  import { useScheduleDates } from "@/composables/useScheduleDates";
  import { filterBlocksByDay } from "@/composables/useScheduleBlocks";
  import type { ScheduleBlock } from "@/interfaces";
  import BlockCard from "./BlockCard.vue";

  const props = withDefaults(
    defineProps<{
      weekDays: Date[];
      blocks: ScheduleBlock[];
      startHour?: number;
      endHour?: number;
      pixelsPerHour?: number;
      slotDurationMinutes?: number;
    }>(),
    { startHour: 8, endHour: 22, pixelsPerHour: 60, slotDurationMinutes: 60 },
  );

  const emit = defineEmits<{
    (e: "block-click", block: ScheduleBlock): void;
    (e: "grid-click", data: { date: Date; hour: number }): void;
  }>();

  const grid = useScheduleGrid(
    () => props.startHour,
    () => props.endHour,
    () => props.pixelsPerHour,
    () => props.slotDurationMinutes,
  );

  const TOP_OFFSET_PX = 12;
  const topOffset = TOP_OFFSET_PX;

  const gridSlotStarts = computed((): number[] => grid.slotStarts.value);
  const gridContentHeight = computed(() => grid.totalHeight.value + topOffset);
  const dates = useScheduleDates();

  const handleGridClick = (event: MouseEvent, day: Date) => {
    const hour = grid.getSlotStartFromClick(event, topOffset);
    if (hour !== null) {
      emit("grid-click", { date: day, hour });
    }
  };
</script>

<style scoped>
  .custom-scrollbar::-webkit-scrollbar {
    width: 6px;
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    background: #f1f1f1;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: #d4d4d4;
    border-radius: 3px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: #c0c0c0;
  }
</style>
