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
    primary: "bg-brand-accent text-white hover:bg-[#015a5e] shadow-md shadow-brand-accent/20",
    secondary: "bg-brand-soft text-brand-primary hover:bg-[#edb595]",
    accent:
      "bg-linear-to-r from-brand-accent to-brand-secondary text-white hover:brightness-[1.03] shadow-lg shadow-brand-accent/25 hover:shadow-xl hover:shadow-brand-accent/30 hover:scale-[1.02] active:scale-[0.98]",
    danger: "bg-red-50 text-red-600 hover:bg-red-100 border border-red-200",
    outline: "border border-brand-accent/30 text-brand-accent bg-app-surface hover:bg-brand-accent/10",
    ghost: "text-gray-600 hover:bg-gray-100",
  };

  const variant = computed(() => props.variant || "primary");
</script>
