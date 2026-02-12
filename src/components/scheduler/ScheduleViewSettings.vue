<template>
  <div class="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
    <label class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">
      {{ SCHEDULE_VIEW_SETTINGS.SECTION_TITLE }}
    </label>
    <div class="space-y-3">
      <div>
        <label class="text-[10px] text-gray-500 block mb-0.5">{{ SCHEDULE_VIEW_SETTINGS.LABEL_START_HOUR }}</label>
        <select
          :value="startHour"
          @change="onStartHourChange"
          class="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-spa-teal/20"
        >
          <option
            v-for="opt in SCHEDULE_VIEW_SETTINGS.HOUR_OPTIONS"
            :key="opt.value"
            :value="opt.value"
          >
            {{ opt.label }}
          </option>
        </select>
      </div>
      <div>
        <label class="text-[10px] text-gray-500 block mb-0.5">{{ SCHEDULE_VIEW_SETTINGS.LABEL_END_HOUR }}</label>
        <select
          :value="endHour"
          @change="onEndHourChange"
          class="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-spa-teal/20"
        >
          <option
            v-for="opt in SCHEDULE_VIEW_SETTINGS.HOUR_OPTIONS"
            :key="opt.value"
            :value="opt.value"
          >
            {{ opt.label }}
          </option>
        </select>
      </div>
      <div>
        <label class="text-[10px] text-gray-500 block mb-0.5">{{ SCHEDULE_VIEW_SETTINGS.LABEL_SLOT_DURATION }}</label>
        <select
          :value="slotDurationMinutes"
          @change="onSlotDurationChange"
          class="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-spa-teal/20"
        >
          <option
            v-for="opt in SCHEDULE_VIEW_SETTINGS.SLOT_DURATION_OPTIONS"
            :key="opt.value"
            :value="opt.value"
          >
            {{ opt.label }}
          </option>
        </select>
      </div>
      <div>
        <label class="text-[10px] text-gray-500 block mb-0.5">{{ SCHEDULE_VIEW_SETTINGS.LABEL_PIXELS_PER_HOUR }}</label>
        <select
          :value="pixelsPerHour"
          @change="onPixelsPerHourChange"
          class="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-spa-teal/20"
        >
          <option
            v-for="px in pixelOptions"
            :key="px"
            :value="px"
          >
            {{ px }} px
          </option>
        </select>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed } from "vue";
  import { storeToRefs } from "pinia";
  import { useSchedulerSettingsStore } from "@/stores/schedulerSettings";
  import { SCHEDULE_VIEW_SETTINGS } from "@/data/constants";

  const store = useSchedulerSettingsStore();
  const { startHour, endHour, pixelsPerHour, slotDurationMinutes } = storeToRefs(store);

  const pixelOptions = computed(() => {
    const current = pixelsPerHour.value;
    const base: number[] = [...SCHEDULE_VIEW_SETTINGS.PIXEL_OPTIONS];
    if (!base.includes(current)) {
      base.push(current);
      base.sort((a, b) => a - b);
    }
    return base;
  });

  const onStartHourChange = (e: Event) => {
    const n = Number((e.target as HTMLSelectElement).value);
    if (!Number.isNaN(n)) store.updateSettings({ startHour: n });
  };

  const onEndHourChange = (e: Event) => {
    const n = Number((e.target as HTMLSelectElement).value);
    if (!Number.isNaN(n)) store.updateSettings({ endHour: n });
  };

  const onSlotDurationChange = (e: Event) => {
    const n = Number((e.target as HTMLSelectElement).value);
    if (!Number.isNaN(n) && [30, 60, 90, 120].includes(n))
      store.updateSettings({ slotDurationMinutes: n as 30 | 60 | 90 | 120 });
  };

  const onPixelsPerHourChange = (e: Event) => {
    const n = Number((e.target as HTMLSelectElement).value);
    if (!Number.isNaN(n)) store.updateSettings({ pixelsPerHour: n });
  };
</script>
