<template>
  <div class="flex flex-col h-full agenda-grid-bg rounded-xl overflow-hidden border border-[var(--color-app-border-subtle)] shadow-[var(--shadow-card)]">
    <div class="flex border-b border-[var(--color-app-border-subtle)] bg-app-bg">
      <div class="w-16 shrink-0 border-r border-[var(--color-app-border-subtle)] bg-app-surface z-20"></div>
      <div class="flex-1 flex overflow-hidden">
        <div
          v-for="therapist in therapists"
          :key="therapist.id"
          class="flex-1 py-3 text-center border-r border-[var(--color-app-border-subtle)] last:border-0 min-w-[150px]"
          :style="{ backgroundColor: therapist.color || 'var(--color-app-bg)', color: 'var(--color-app-title)' }"
        >
          <div class="font-semibold truncate px-2 text-app-title">{{ therapist.name.split(" ")[0] }}</div>
          <div class="text-xs text-app-text/80">{{ therapist.weeklyHours }}h</div>
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
        <div
          v-if="currentTimeStyle"
          class="absolute left-0 right-0 z-[5] h-0.5 bg-spa-primary pointer-events-none"
          :style="currentTimeStyle"
        >
          <span class="absolute -top-1 left-0 w-2 h-2 rounded-full bg-spa-primary" />
        </div>
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
        <div class="flex-1 flex relative z-[2]">
          <div
            v-for="therapist in therapists"
            :key="therapist.id"
            class="flex-1 relative border-r border-[var(--color-app-border-subtle)] last:border-0 min-w-[150px] group cursor-crosshair"
            @click="handleGridClick($event, therapist.id)"
            @mousemove="handleGridMouseMove($event, therapist.id)"
            @mouseleave="hoverSlot = null"
          >
            <div
              v-for="slotStart in gridSlotStarts"
              :key="slotStart"
              class="absolute w-full border-b border-[var(--color-app-border-subtle)] pointer-events-none"
              :style="{ top: topOffset + (slotStart - props.startHour) * props.pixelsPerHour + 'px' }"
            ></div>
            <div
              v-if="hoverSlot !== null && hoverTherapistId === therapist.id"
              class="absolute left-0 right-0 rounded py-0.5 px-1.5 bg-spa-primary/10 border border-spa-primary/20 text-spa-primary text-[10px] font-medium pointer-events-none z-10"
              :style="{ top: (hoverSlot - props.startHour) * props.pixelsPerHour + topOffset + 2 + 'px' }"
            >
              Crear cita · {{ grid.formatSlotLabel(hoverSlot) }}
            </div>

            <BlockCard
              v-for="item in filterAgendaItemsByDayAndTherapist(props.items, props.date, therapist.id)"
              :key="item.id"
              :item="item"
              :start-hour="props.startHour"
              :pixels-per-hour="props.pixelsPerHour"
              :top-offset="topOffset"
              @click.stop="$emit('item-click', item)"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed, ref } from "vue";
  import { useScheduleGrid } from "@/composables/useScheduleGrid";
  import { filterAgendaItemsByDayAndTherapist } from "@/composables/useScheduleBlocks";
  import { isToday } from "@/composables/useScheduleDates";
  import type { AgendaItem, Therapist } from "@/interfaces";
  import BlockCard from "./BlockCard.vue";

  const WORK_START = 8;
  const WORK_END = 20;

  const props = withDefaults(
    defineProps<{
      date: Date;
      items: AgendaItem[];
      therapists: Therapist[];
      startHour?: number;
      endHour?: number;
      pixelsPerHour?: number;
      slotDurationMinutes?: number;
    }>(),
    { startHour: 8, endHour: 22, pixelsPerHour: 90, slotDurationMinutes: 60 },
  );

  const emit = defineEmits<{
    (e: "item-click", item: AgendaItem): void;
    (e: "grid-click", data: { date: Date; hour: number; therapistId: string }): void;
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

  const workingHoursStyle = computed(() => {
    const start = Math.max(props.startHour, WORK_START);
    const end = Math.min(props.endHour, WORK_END);
    if (start >= end) return null;
    const top = topOffset + (start - props.startHour) * props.pixelsPerHour;
    const height = (end - start) * props.pixelsPerHour;
    return { top: `${top}px`, height: `${height}px`, left: 0, right: 0 };
  });

  const currentTimeStyle = computed(() => {
    if (!isToday(props.date)) return null;
    const now = new Date();
    const currentHour = now.getHours() + now.getMinutes() / 60 + now.getSeconds() / 3600;
    if (currentHour < props.startHour || currentHour >= props.endHour) return null;
    const top = topOffset + (currentHour - props.startHour) * props.pixelsPerHour;
    return { top: `${top}px`, left: 0, right: 0 };
  });

  const hoverSlot = ref<number | null>(null);
  const hoverTherapistId = ref<string | null>(null);

  const handleGridMouseMove = (event: MouseEvent, therapistId: string) => {
    const hour = grid.getSlotStartFromClick(event, topOffset);
    hoverSlot.value = hour;
    hoverTherapistId.value = therapistId;
  };

  const handleGridClick = (event: MouseEvent, therapistId: string) => {
    const hour = grid.getSlotStartFromClick(event, topOffset);
    if (hour !== null) {
      emit("grid-click", { date: props.date, hour, therapistId });
    }
  };
</script>

<style scoped>
  .custom-scrollbar::-webkit-scrollbar {
    width: 6px;
    height: 6px;
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
