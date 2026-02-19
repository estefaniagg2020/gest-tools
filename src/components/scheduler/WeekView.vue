<template>
  <div class="flex flex-col h-full agenda-grid-bg rounded-xl overflow-hidden border border-app-border-subtle shadow-(--shadow-card)">
    <div
      class="flex border-b border-app-border-subtle"
      :class="isThemeSelected ? 'bg-brand-accent' : 'bg-app-surface'"
    >
      <div
        class="w-16 shrink-0 border-r border-app-border-subtle"
        :class="isThemeSelected ? 'bg-brand-accent' : 'bg-app-surface'"
      ></div>
      <div
        v-for="day in weekDays"
        :key="day.toISOString()"
        class="flex-1 py-3 text-center border-r border-app-border-subtle last:border-0"
        :class="{
          'bg-brand-primary': isThemeSelected,
          'bg-brand-soft': dates.isToday(day) && !isThemeSelected,
        }"
      >
        <div
          class="text-xs font-medium"
          :class="{
            'text-white': isThemeSelected,
            'text-app-text/80': !isThemeSelected,
          }"
        >
          {{ dates.formatDayName(day) }}
        </div>
        <div
          class="text-xl font-bold"
          :class="{
            'text-white': isThemeSelected,
            'text-brand-primary': dates.isToday(day) && !isThemeSelected,
            'text-app-title': !dates.isToday(day) && !isThemeSelected,
          }"
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
          class="absolute left-0 right-0 z-0 pointer-events-none bg-brand-primary/4"
          :style="workingHoursStyle"
        />
        <div class="w-16 shrink-0 border-r border-app-border-subtle agenda-grid-bg z-10 sticky left-0">
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
          :ref="(el) => setDayRef(el as HTMLElement | null, dayIndex)"
          class="flex-1 relative border-r border-app-border-subtle last:border-0 cursor-default"
          @click="handleGridClick($event, day)"
          @pointermove="scheduleDrag.update($event)"
        >
          <div
            v-for="slotStart in gridSlotStarts"
            :key="slotStart"
            class="absolute w-full border-b border-app-border-subtle pointer-events-none"
            :style="{ top: topOffset + (slotStart - props.startHour) * props.pixelsPerHour + 'px' }"
          ></div>
          <div
            v-if="dates.isToday(day) && currentTimeStyle"
            class="absolute left-0 right-0 h-0.5 bg-brand-primary pointer-events-none z-5"
            :style="currentTimeStyle"
          >
            <span class="absolute -top-1 left-0 w-2 h-2 rounded-full bg-brand-primary" />
          </div>

          <BlockCard
            v-for="item in filterAgendaItemsByDay(props.items, day)"
            :key="item.id"
            :item="item"
            :start-hour="props.startHour"
            :pixels-per-hour="props.pixelsPerHour"
            :top-offset="topOffset"
            :overlap-left="overlapMap.get(item.id)?.left"
            :overlap-width="overlapMap.get(item.id)?.width"
            @click="$emit('item-click', item)"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed, onMounted, onUnmounted, ref } from "vue";
  import { DEFAULT_THEME_ID } from "@/data/themes";
  import { useScheduleGrid } from "@/composables/useScheduleGrid";
  import { useScheduleDates } from "@/composables/useScheduleDates";
  import { filterAgendaItemsByDay } from "@/composables/useScheduleBlocks";
  import { computeOverlapLayout } from "@/composables/useOverlapLayout";
  import { useThemeStore } from "@/stores/theme";
  import { useScheduleDrag } from "@/composables/useScheduleDrag";
  import type { AgendaItem } from "@/interfaces";
  import { isAppointment, isScheduleBlock } from "@/interfaces";
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
    (e: "appointment-move", data: { appointmentId: string; date: Date; hour: number }): void;
    (e: "block-move", data: { blockId: string; date: Date; hour: number }): void;
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
  const themeStore = useThemeStore();
  const scheduleDrag = useScheduleDrag();
  const isThemeSelected = computed(() => themeStore.themeId !== DEFAULT_THEME_ID);

  const overlapMap = computed(() => {
    const result = new Map<string, { left: number; width: number }>();
    for (const day of props.weekDays) {
      const dayItems = filterAgendaItemsByDay(props.items, day);
      computeOverlapLayout(dayItems).forEach((info, id) => result.set(id, info));
    }
    return result;
  });

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

  // Refs to day column elements for drop position calculation
  const dayColRefs = ref<(HTMLElement | null)[]>([]);
  const setDayRef = (el: HTMLElement | null, index: number) => {
    dayColRefs.value[index] = el;
  };

  const getHourFromPoint = (clientY: number, el: HTMLElement): number | null => {
    const rect = el.getBoundingClientRect();
    const y = clientY - rect.top - topOffset;
    if (y < 0) return null;
    const step = (props.slotDurationMinutes ?? 60) / 60;
    const slotIndex = Math.floor(y / props.pixelsPerHour / step);
    const hour = props.startHour + slotIndex * step;
    if (hour >= props.startHour && hour < props.endHour) return Math.round(hour * 100) / 100;
    return null;
  };

  const handleGridClick = (event: MouseEvent, day: Date) => {
    if (scheduleDrag.moving.value) return; // ignore click after drag
    const hour = grid.getSlotStartFromClick(event, topOffset);
    if (hour !== null) {
      emit("grid-click", { date: day, hour });
    }
  };

  const onDocumentPointerUp = (e: PointerEvent) => {
    const { item, moved } = scheduleDrag.end();
    if (!item || !moved) return;

    for (let i = 0; i < props.weekDays.length; i++) {
      const el = dayColRefs.value[i];
      if (!el) continue;
      const rect = el.getBoundingClientRect();
      if (
        e.clientX >= rect.left && e.clientX <= rect.right &&
        e.clientY >= rect.top && e.clientY <= rect.bottom
      ) {
        const hour = getHourFromPoint(e.clientY, el);
        if (hour !== null) {
          if (isScheduleBlock(item)) {
            emit("block-move", { blockId: item.id, date: props.weekDays[i], hour });
          } else if (isAppointment(item)) {
            emit("appointment-move", { appointmentId: item.id, date: props.weekDays[i], hour });
          }
        }
        break;
      }
    }
  };

  onMounted(() => document.addEventListener("pointerup", onDocumentPointerUp));
  onUnmounted(() => document.removeEventListener("pointerup", onDocumentPointerUp));
</script>

<style scoped>
  .custom-scrollbar::-webkit-scrollbar {
    width: 6px;
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: var(--color-app-border-subtle);
    border-radius: 3px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: var(--color-app-border);
  }
</style>
