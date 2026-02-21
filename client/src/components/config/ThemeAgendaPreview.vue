<template>
  <div
    class="rounded-lg overflow-hidden border border-gray-200/80 text-left"
    :style="{ backgroundColor: bgColor }"
  >
    <div class="px-2 py-1.5 border-b border-gray-200/60 flex items-center justify-between">
      <span class="text-[10px] font-medium text-gray-600">Vista previa — agenda</span>
    </div>
    <div class="p-2">
      <div class="flex gap-1">
        <div class="w-5 shrink-0 text-[8px] text-gray-500 flex flex-col justify-between h-16">
          <span>8</span>
          <span>12</span>
          <span>16</span>
        </div>
        <div class="flex-1 h-16 relative rounded border border-gray-100 overflow-hidden">
          <div
            class="absolute left-0 right-0 rounded-sm py-0.5 px-1.5 text-[8px] font-medium truncate border-l-2"
            style="top: 12.5%; height: 25%;"
            :style="{
              backgroundColor: primaryColor + '20',
              borderLeftColor: primaryColor,
              color: primaryColor,
            }"
          >
            Trabajo
          </div>
          <div
            class="absolute left-0 right-0 rounded-sm py-0.5 px-1.5 text-[8px] font-medium truncate border-l-2"
            style="top: 62.5%; height: 25%;"
            :style="{
              backgroundColor: secondaryColor + '20',
              borderLeftColor: secondaryColor,
              color: secondaryColor,
            }"
          >
            Vacaciones
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  withDefaults(
    defineProps<{
      primaryColor: string;
      secondaryColor: string;
      bgColor?: string;
    }>(),
    { bgColor: "#ffffff" }
  );
</script>
