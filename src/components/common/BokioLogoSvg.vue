<template>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 120 140"
    fill="none"
    class="bokio-logo-svg shrink-0"
    :class="sizeClass"
    role="img"
    aria-label="Bokio"
  >
    <rect
      x="10"
      y="20"
      width="100"
      height="110"
      rx="8"
      :fill="mainColor"
    />
    <ellipse
      cx="35"
      cy="35"
      rx="8"
      ry="6"
      :fill="mainColor"
    />
    <ellipse
      cx="85"
      cy="35"
      rx="8"
      ry="6"
      :fill="mainColor"
    />
    <path
      d="M45 85 L58 100 L95 58"
      stroke-width="12"
      stroke-linecap="round"
      stroke-linejoin="round"
      :stroke="checkColor"
      fill="none"
    />
    <text
      x="60"
      y="128"
      text-anchor="middle"
      :fill="mainColor"
      style="font-family: system-ui, -apple-system, sans-serif; font-size: 22px; font-weight: 700; letter-spacing: -0.02em;"
    >Bokio</text>
  </svg>
</template>

<script setup lang="ts">
  import { computed } from "vue";

  const props = withDefaults(
    defineProps<{
      size?: "sm" | "md" | "lg";
      mainColor?: string;
      checkColor?: string;
    }>(),
    {
      size: "md",
      mainColor: "currentColor",
      checkColor: "#e8dcc8",
    }
  );

  const sizeClass = computed(() => {
    const map = {
      sm: "h-8 w-auto",
      md: "h-10 w-auto",
      lg: "h-12 w-auto",
    };
    return map[props.size];
  });
</script>
