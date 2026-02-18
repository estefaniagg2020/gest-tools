<template>
  <div class="flex flex-col gap-6 pb-6 md:hidden">
    <section
      v-for="day in weekDays"
      :key="day.toISOString()"
      class="flex flex-col gap-3"
    >
      <h3
        class="text-sm font-bold uppercase tracking-wider sticky top-0 z-10 py-2 bg-[var(--chrome-surface)] border-b border-[var(--chrome-border)]"
        :class="dates.isToday(day) ? 'text-brand-accent' : 'text-app-text/70'"
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
          :class="[mobileBlockTypeClass(block.type), block.status === 'pending' ? 'border-dashed ring-1 ring-gray-200' : '']"
          @click="$emit('block-click', block)"
        >
          <div class="flex-1 min-w-0 p-3">
            <div class="flex items-start justify-between gap-2">
              <h4 class="font-bold text-gray-800 truncate">{{ block.title }}</h4>
              <span
                v-if="block.status === 'pending'"
                class="shrink-0 text-[10px] bg-white/70 px-1.5 py-0.5 rounded"
                :title="$t('scheduler.pendingConfirmation')"
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
              v-if="memberForBlock(block)"
              class="flex items-center gap-2 mt-2"
            >
              <Avatar
                :name="memberForBlock(block)!.name"
                :src="memberForBlock(block)!.photoUrl"
                :size="24"
                class="ring-1 ring-white shrink-0"
              />
              <span class="text-xs text-gray-600 truncate">{{ memberForBlock(block)!.name }}</span>
            </div>
          </div>
        </article>
        <p
          v-if="sortedBlocksByDay(day).length === 0"
          class="text-xs text-app-text/60 py-2 pl-2"
        >
          {{ $t('scheduler.noBlocksToday') }}
        </p>
      </div>
    </section>
    <div class="h-4 shrink-0" aria-hidden="true" />
  </div>
</template>

<script setup lang="ts">
  import { filterBlocksByDay } from "@/composables/useScheduleBlocks";
  import { useScheduleDates } from "@/composables/useScheduleDates";
  import { getBlockTypeCardStyle } from "@/data/scheduleBlockTypes";
  import type { ScheduleBlock, TeamMember } from "@/interfaces";
  import Avatar from "@/components/common/Avatar.vue";

  const props = defineProps<{
    weekDays: Date[];
    blocks: ScheduleBlock[];
    members: TeamMember[];
  }>();

  defineEmits<{
    (e: "block-click", block: ScheduleBlock): void;
  }>();

  const dates = useScheduleDates();
  const { formatTime, formatDuration } = dates;

  const typeStyle = (type: ScheduleBlock["type"]) => getBlockTypeCardStyle(type);
  const mobileBlockTypeClass = (type: ScheduleBlock["type"]) => {
    if (type === "work") return "agenda-block-work";
    if (type === "vacation") return "agenda-block-vacation";
    return typeStyle(type).border;
  };

  const sortedBlocksByDay = (day: Date): ScheduleBlock[] => {
    const dayBlocks = filterBlocksByDay(props.blocks, day);
    return [...dayBlocks].sort(
      (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime(),
    );
  };

  const memberForBlock = (block: ScheduleBlock): TeamMember | undefined =>
    props.members.find((m) => m.id === block.memberId);
</script>
