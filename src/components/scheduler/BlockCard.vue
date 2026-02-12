<template>
  <div
    class="absolute inset-x-1 rounded-md px-2 py-1 text-xs font-medium border-l-4 overflow-hidden cursor-pointer transition-all hover:brightness-95 hover:z-10 shadow-sm"
    :class="[
      colorClass.bg,
      colorClass.border,
      colorClass.text,
      position.isSmall ? 'flex items-center justify-center p-0' : '',
      block.status === 'pending' ? 'opacity-70 border-dashed !border-l-4 ring-2 ring-gray-300 ring-offset-1' : '',
    ]"
    :style="cardStyleValue"
    @click.stop="$emit('click')"
  >
    <div
      v-if="!position.isSmall"
      class="flex flex-col h-full"
    >
      <div class="flex items-center justify-between w-full">
        <span class="font-bold truncate">{{ block.title }}</span>
        <span
          v-if="block.status === 'pending'"
          class="text-[10px] bg-white/50 px-1 rounded"
          title="Pendiente de confirmación"
          >⏳</span
        >
        <span
          v-else
          class="opacity-70 text-[10px]"
          >{{ formatTime(block.start) }}</span
        >
      </div>

      <div
        class="truncate text-[10px] opacity-90 mt-0.5"
        v-if="block.description"
      >
        {{ block.description }}
      </div>
    </div>

    <span
      v-else
      class="truncate text-[10px]"
    >
      {{ block.title }}
    </span>
  </div>
</template>

<script setup lang="ts">
  import { computed } from "vue";
  import type { ScheduleBlock } from "@/interfaces";
  import { getBlockTypeCardStyles } from "@/composables/useBlockTypeStyles";
  import { useBlockPosition } from "@/composables/useBlockPosition";
  import { formatTime } from "@/composables/useScheduleDates";

  interface BlockCardProps {
    block: ScheduleBlock;
    startHour: number;
    pixelsPerHour: number;
    topOffset?: number;
  }

  const props = withDefaults(defineProps<BlockCardProps>(), { topOffset: 0 });

  defineEmits(["click"]);

  const colorClass = computed(() => getBlockTypeCardStyles(props.block.type));

  const position = useBlockPosition(
    () => props.block,
    () => props.startHour,
    () => props.pixelsPerHour,
    () => props.topOffset,
  );

  const cardStyleValue = computed(() => position.cardStyle.value);
</script>
