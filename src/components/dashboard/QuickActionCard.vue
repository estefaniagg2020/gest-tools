<template>
  <div
    @click="$emit('click')"
    class="p-4 rounded-2xl border cursor-pointer hover:shadow-md transition-all group flex items-center gap-4"
    :class="variantClasses"
  >
    <div
      class="w-10 h-10 bg-white rounded-full flex items-center justify-center text-xl shadow-sm group-hover:scale-110 transition-transform"
    >
      {{ icon }}
    </div>
    <div>
      <h4 class="font-bold text-gray-800">{{ title }}</h4>
      <p class="text-xs text-gray-500 mt-0.5">{{ subtitle }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed } from "vue";
  import type { QuickActionCardProps } from "@/interfaces/components";

  const props = defineProps<QuickActionCardProps>();

  defineEmits<{
    (e: "click"): void;
  }>();

  const variantClasses = computed(() => {
    const themes = {
      blue: "bg-gradient-to-br from-blue-50 to-blue-100/50 border-blue-100",
      purple: "bg-gradient-to-br from-purple-50 to-purple-100/50 border-purple-100",
      orange: "bg-gradient-to-br from-orange-50 to-orange-100/50 border-orange-100",
      green: "bg-gradient-to-br from-green-50 to-green-100/50 border-green-100",
    };
    return themes[props.variant];
  });
</script>
