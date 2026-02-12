<template>
  <div class="flex flex-col gap-6 pb-6 md:hidden">
    <section
      v-for="day in weekDays"
      :key="day.toISOString()"
      class="flex flex-col gap-3"
    >
      <h3
        class="text-sm font-bold uppercase tracking-wider sticky top-0 z-10 py-2 bg-white border-b border-gray-100"
        :class="dates.isToday(day) ? 'text-spa-teal' : 'text-gray-500'"
      >
        {{ dates.formatDayName(day) }} {{ day.getDate() }}
      </h3>

      <div class="relative pl-4 space-y-3">
        <div
          class="absolute left-[7px] top-2 bottom-2 w-0.5 bg-gray-200 rounded-full"
          aria-hidden="true"
        />
        <article
          v-for="block in sortedBlocksByDay(day)"
          :key="block.id"
          class="relative flex gap-3 rounded-xl border-0 border-l-4 bg-white border-gray-200 shadow-sm overflow-hidden cursor-pointer transition-shadow hover:shadow-md active:scale-[0.99]"
          :class="[typeStyle(block.type).border, block.status === 'pending' ? 'border-dashed ring-1 ring-gray-200' : '']"
          @click="$emit('block-click', block)"
        >
          <div class="flex-1 min-w-0 p-3">
            <div class="flex items-start justify-between gap-2">
              <h4 class="font-bold text-gray-800 truncate">{{ block.title }}</h4>
              <span
                v-if="block.status === 'pending'"
                class="shrink-0 text-[10px] bg-white/70 px-1.5 py-0.5 rounded"
                title="Pendiente de confirmación"
              >
                ⏳
              </span>
            </div>
            <p
              v-if="block.description"
              class="text-xs text-gray-500 mt-0.5 line-clamp-2"
            >
              {{ block.description }}
            </p>
            <p class="text-xs text-gray-600 mt-1.5">
              {{ formatTime(block.start) }} – {{ formatTime(block.end) }}
            </p>
            <p class="text-[10px] text-gray-400 mt-0.5">
              {{ formatDuration(block.start, block.end) }}
            </p>
            <div
              v-if="therapistForBlock(block)"
              class="flex items-center gap-2 mt-2"
            >
              <Avatar
                :name="therapistForBlock(block)!.name"
                :src="therapistForBlock(block)!.photoUrl"
                :size="24"
                class="ring-1 ring-white shrink-0"
              />
              <span class="text-xs text-gray-600 truncate">{{ therapistForBlock(block)!.name }}</span>
            </div>
          </div>
        </article>
        <p
          v-if="sortedBlocksByDay(day).length === 0"
          class="text-xs text-gray-400 py-2 pl-2"
        >
          Sin bloques este día
        </p>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
  import { filterBlocksByDay } from "@/composables/useScheduleBlocks";
  import { useScheduleDates } from "@/composables/useScheduleDates";
  import { getBlockTypeCardStyle } from "@/data/scheduleBlockTypes";
  import type { ScheduleBlock, Therapist } from "@/interfaces";
  import Avatar from "@/components/common/Avatar.vue";

  const props = defineProps<{
    weekDays: Date[];
    blocks: ScheduleBlock[];
    therapists: Therapist[];
  }>();

  defineEmits<{
    (e: "block-click", block: ScheduleBlock): void;
  }>();

  const dates = useScheduleDates();
  const { formatTime, formatDuration } = dates;

  const typeStyle = (type: ScheduleBlock["type"]) => getBlockTypeCardStyle(type);

  const sortedBlocksByDay = (day: Date): ScheduleBlock[] => {
    const dayBlocks = filterBlocksByDay(props.blocks, day);
    return [...dayBlocks].sort(
      (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime(),
    );
  };

  const therapistForBlock = (block: ScheduleBlock): Therapist | undefined =>
    props.therapists.find((t) => t.id === block.therapistId);
</script>
