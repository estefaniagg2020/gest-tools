<template>
  <div class="app-card overflow-hidden">
    <button
      type="button"
      class="w-full flex items-center justify-between p-4 text-left hover:bg-app-bg/50 transition-colors"
      @click="isCollapsed = !isCollapsed"
    >
      <h4 class="font-semibold text-app-title text-sm flex items-center gap-2">
        <span>📋</span>
        {{ $t('scheduler.waitlist') }}
      </h4>
      <span class="text-app-text/60 text-xs">{{ isCollapsed ? '▶' : '▼' }}</span>
    </button>
    <div
      v-show="!isCollapsed"
      class="border-t border-app-border-subtle"
    >
      <div
        class="p-4 transition-colors min-h-[80px] flex flex-col gap-2"
        :class="[
          isDropTarget ? 'bg-emerald-50 dark:bg-emerald-900/20 border-2 border-dashed border-emerald-400' : '',
        ]"
        @dragover.prevent="handleDragOver"
        @dragleave="handleDragLeave"
        @drop="handleDrop"
      >
        <p
          v-if="isDropTarget"
          class="text-sm font-medium text-emerald-700 dark:text-emerald-300"
        >
          {{ $t('scheduler.waitlistFreeSlot', { count: waitlistCount }) }}
        </p>
        <p
          v-else
          class="text-xs text-app-text/70"
        >
          {{ $t('scheduler.waitlistHint') }}
        </p>
        <div
          v-if="isDraggingConfirmed"
          class="mt-2 px-3 py-2 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 text-amber-800 dark:text-amber-200 text-xs"
        >
          Suelta aquí para cancelar la cita
        </div>
        <div
          v-else-if="waitlistCount > 0"
          class="space-y-1.5"
        >
          <div
            v-for="entry in waitlistEntries"
            :key="entry.id"
            class="flex items-center justify-between text-xs py-1.5 px-2 rounded bg-app-surface"
          >
            <span class="truncate">{{ entry.serviceName }}</span>
            <span class="text-app-text/70 shrink-0">{{ entry.count }} {{ entry.count === 1 ? 'persona' : 'personas' }}</span>
          </div>
        </div>
        <p
          v-else
          class="text-xs text-app-text/50 italic"
        >
          No hay personas en lista de espera
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed } from "vue";

  const props = withDefaults(
    defineProps<{
      isDraggingConfirmed?: boolean;
      waitlistEntries?: Array<{ id: string; serviceName: string; count: number }>;
    }>(),
    { waitlistEntries: () => [] },
  );

  const emit = defineEmits<{
    (e: "cancel-appointment", appointmentId: string): void;
  }>();

  const isCollapsed = ref(false);
  const isDropTarget = ref(false);

  const waitlistCount = computed(() =>
    props.waitlistEntries.reduce((sum, entry) => sum + entry.count, 0),
  );

  const handleDragOver = (e: DragEvent) => {
    if (!props.isDraggingConfirmed) return;
    e.dataTransfer!.dropEffect = "move";
    isDropTarget.value = true;
  };

  const handleDragLeave = () => {
    isDropTarget.value = false;
  };

  const handleDrop = (e: DragEvent) => {
    isDropTarget.value = false;
    e.preventDefault();
    const raw = e.dataTransfer?.getData("application/json");
    if (!raw) return;
    try {
      const { id } = JSON.parse(raw) as { id: string };
      emit("cancel-appointment", id);
    } catch {
      /* ignore */
    }
  };
</script>
