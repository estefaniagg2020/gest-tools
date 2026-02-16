<template>
  <div class="flex flex-col h-full agenda-grid-bg rounded-xl overflow-hidden border border-[var(--color-app-border-subtle)] shadow-[var(--shadow-card)]">
    <div class="flex border-b border-[var(--color-app-border-subtle)] bg-app-bg">
      <div class="w-16 shrink-0 border-r border-[var(--color-app-border-subtle)]"></div>
      <div
        v-for="day in weekDays"
        :key="day.toISOString()"
        class="flex-1 py-3 text-center border-r border-[var(--color-app-border-subtle)] last:border-0"
        :class="{ 'bg-spa-primary/5': dates.isToday(day) }"
      >
        <div class="text-xs font-medium text-app-text/80">{{ dates.formatDayName(day) }}</div>
        <div
          class="text-xl font-bold text-app-title"
          :class="{ 'text-spa-primary': dates.isToday(day) }"
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
        <div
          v-if="workingHoursStyle"
          class="absolute left-0 right-0 z-0 pointer-events-none bg-spa-primary/[0.04]"
          :style="workingHoursStyle"
        />
        <div class="w-16 shrink-0 border-r border-[var(--color-app-border-subtle)] agenda-grid-bg z-10 sticky left-0">
          <div
            v-for="slotStart in gridSlotStarts"
            :key="slotStart"
            class="absolute w-full text-center text-xs text-app-text/70 -mt-2.5"
            :style="{ top: topOffset + (slotStart - props.startHour) * props.pixelsPerHour + 'px' }"
          >
            {{ grid.formatSlotLabel(slotStart) }}
          </div>
        </div>

        <div
          v-for="(day, dayIndex) in weekDays"
          :key="day.toISOString()"
          class="flex-1 relative border-r border-[var(--color-app-border-subtle)] last:border-0 cursor-crosshair"
          @click="handleGridClick($event, day)"
          @mousemove="handleGridMouseMove($event, day, dayIndex)"
          @mouseleave="hoverSlot = null"
        >
          <div
            v-for="slotStart in gridSlotStarts"
            :key="slotStart"
            class="absolute w-full border-b border-[var(--color-app-border-subtle)] pointer-events-none"
            :style="{ top: topOffset + (slotStart - props.startHour) * props.pixelsPerHour + 'px' }"
          ></div>
          <div
            v-if="dates.isToday(day) && currentTimeStyle"
            class="absolute left-0 right-0 h-0.5 bg-spa-primary pointer-events-none z-[5]"
            :style="currentTimeStyle"
          >
            <span class="absolute -top-1 left-0 w-2 h-2 rounded-full bg-spa-primary" />
          </div>
          <div
            v-if="hoverSlot !== null && hoverDayIndex === dayIndex"
            class="absolute left-0 right-0 rounded py-0.5 px-1.5 bg-spa-primary/10 border border-spa-primary/20 text-spa-primary text-[10px] font-medium pointer-events-none z-10"
            :style="{ top: (hoverSlot - props.startHour) * props.pixelsPerHour + topOffset + 2 + 'px' }"
          >
            Crear cita · {{ grid.formatSlotLabel(hoverSlot) }}
          </div>

          <BlockCard
            v-for="item in filterAgendaItemsByDay(props.items, day)"
            :key="item.id"
            :item="item"
            :start-hour="props.startHour"
            :pixels-per-hour="props.pixelsPerHour"
            :top-offset="topOffset"
            @click="$emit('item-click', item)"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed, ref } from "vue";
  import { useScheduleGrid } from "@/composables/useScheduleGrid";
  import { useScheduleDates } from "@/composables/useScheduleDates";
  import { filterAgendaItemsByDay } from "@/composables/useScheduleBlocks";
  import type { AgendaItem } from "@/interfaces";
  import BlockCard from "./BlockCard.vue";

  const WORK_START = 8;
  const WORK_END = 20;

  const props = withDefaults(
    defineProps<{
      weekDays: Date[];
      items: AgendaItem[];
      startHour?: number;
      endHour?: number;
      pixelsPerHour?: number;
      slotDurationMinutes?: number;
    }>(),
    { startHour: 8, endHour: 22, pixelsPerHour: 60, slotDurationMinutes: 60 },
  );

  const emit = defineEmits<{
    (e: "item-click", item: AgendaItem): void;
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

  const workingHoursStyle = computed(() => {
    const start = Math.max(props.startHour, WORK_START);
    const end = Math.min(props.endHour, WORK_END);
    if (start >= end) return null;
    const top = topOffset + (start - props.startHour) * props.pixelsPerHour;
    const height = (end - start) * props.pixelsPerHour;
    return { top: `${top}px`, height: `${height}px`, left: 0, right: 0 };
  });

  const currentTimeStyle = computed(() => {
    const now = new Date();
    const currentHour = now.getHours() + now.getMinutes() / 60 + now.getSeconds() / 3600;
    if (currentHour < props.startHour || currentHour >= props.endHour) return null;
    const top = topOffset + (currentHour - props.startHour) * props.pixelsPerHour;
    return { top: `${top}px` };
  });

  const hoverSlot = ref<number | null>(null);
  const hoverDayIndex = ref<number | null>(null);

  const handleGridMouseMove = (event: MouseEvent, _day: Date, dayIndex: number) => {
    const hour = grid.getSlotStartFromClick(event, topOffset);
    hoverSlot.value = hour;
    hoverDayIndex.value = dayIndex;
  };

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
