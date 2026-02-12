<template>
  <div class="flex flex-col h-full bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
    <div class="flex border-b border-gray-200 bg-gray-50">
      <div class="w-16 shrink-0 border-r border-gray-200 bg-white z-20"></div>
      <div class="flex-1 flex overflow-hidden">
        <div
          v-for="therapist in therapists"
          :key="therapist.id"
          class="flex-1 py-3 text-center border-r border-gray-200 last:border-0 min-w-[150px]"
          :style="{ backgroundColor: therapist.color || '#f3f4f6', color: '#1f2937' }"
        >
          <div class="font-bold truncate px-2 text-gray-800">{{ therapist.name.split(" ")[0] }}</div>
          <div class="text-[10px] opacity-70">{{ therapist.weeklyHours }}h</div>
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
        <div class="flex-1 flex">
          <div
            v-for="therapist in therapists"
            :key="therapist.id"
            class="flex-1 relative border-r border-gray-100 last:border-0 hover:bg-gray-50/50 transition-colors cursor-crosshair min-w-[150px]"
            @click="handleGridClick($event, therapist.id)"
          >
            <div
              v-for="slotStart in gridSlotStarts"
              :key="slotStart"
              class="absolute w-full border-b border-gray-100 pointer-events-none"
              :style="{ top: topOffset + (slotStart - props.startHour) * props.pixelsPerHour + 'px' }"
            ></div>

            <BlockCard
              v-for="block in filterBlocksByDayAndTherapist(props.blocks, props.date, therapist.id)"
              :key="block.id"
              :block="block"
              :start-hour="props.startHour"
              :pixels-per-hour="props.pixelsPerHour"
              :top-offset="topOffset"
              @click.stop="$emit('block-click', block)"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed } from "vue";
  import { useScheduleGrid } from "@/composables/useScheduleGrid";
  import { filterBlocksByDayAndTherapist } from "@/composables/useScheduleBlocks";
  import type { ScheduleBlock, Therapist } from "@/interfaces";
  import BlockCard from "./BlockCard.vue";

  const props = withDefaults(
    defineProps<{
      date: Date;
      blocks: ScheduleBlock[];
      therapists: Therapist[];
      startHour?: number;
      endHour?: number;
      pixelsPerHour?: number;
      slotDurationMinutes?: number;
    }>(),
    { startHour: 8, endHour: 22, pixelsPerHour: 90, slotDurationMinutes: 60 },
  );

  const emit = defineEmits<{
    (e: "block-click", block: ScheduleBlock): void;
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
