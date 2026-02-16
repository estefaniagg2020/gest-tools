<template>
  <button
    :class="[
      'px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer',
      variants[variant],
      { 'opacity-50 cursor-not-allowed': disabled },
    ]"
    :disabled="disabled"
    @click="$emit('click', $event)"
  >
    <slot name="icon"></slot>
    <slot />
  </button>
</template>

<script setup lang="ts">
  import { computed } from "vue";

  const props = defineProps<{
    variant?: "primary" | "secondary" | "danger" | "outline" | "ghost" | "accent";
    disabled?: boolean;
  }>();

  const variants = {
    primary: "bg-spa-teal text-white hover:bg-[#015a5e] shadow-md shadow-spa-teal/20",
    secondary: "bg-spa-peach text-spa-primary hover:bg-[#edb595]",
    accent:
      "bg-linear-to-r from-violet-600 to-indigo-600 text-white hover:from-violet-500 hover:to-indigo-500 shadow-lg shadow-violet-500/25 hover:shadow-xl hover:shadow-violet-500/30 hover:scale-[1.02] active:scale-[0.98]",
    danger: "bg-red-50 text-red-600 hover:bg-red-100 border border-red-200",
    outline: "border border-gray-300 text-gray-700 hover:bg-gray-50 bg-white",
    ghost: "text-gray-600 hover:bg-gray-100",
  };

  const variant = computed(() => props.variant || "primary");
</script>
