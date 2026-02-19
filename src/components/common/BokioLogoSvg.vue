<template>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 115 36"
    fill="none"
    class="bokio-logo-svg shrink-0"
    :class="sizeClass"
    role="img"
    aria-label="Bokio"
  >
    <text
      x="0"
      y="22"
      fill="currentColor"
      style="font-family: system-ui, -apple-system, sans-serif; font-weight: 600; letter-spacing: -0.05em;"
    >
      <tspan x="0">b</tspan>
      <tspan x="21">k</tspan>
      <tspan x="29">i</tspan>
      <tspan x="32">o</tspan>
    </text>
    <g transform="translate(15, 17)">
      <circle
        r="5.5"
        fill="none"
        stroke="var(--color-brand-accent, #187bcd)"
        stroke-width="2"
      />
      <rect
        x="-1.5"
        y="-8"
        width="3"
        height="2.5"
        rx="0.5"
        fill="var(--color-brand-accent, #187bcd)"
        fill-opacity="0.6"
      />
      <line
        x1="0"
        y1="0"
        x2="-2"
        y2="-3"
        stroke="var(--color-brand-accent, #187bcd)"
        stroke-width="1"
        stroke-linecap="round"
        stroke-opacity="0.7"
      />
      <line
        x1="0"
        y1="0"
        x2="2.5"
        y2="-2"
        stroke="var(--color-brand-accent, #187bcd)"
        stroke-width="1"
        stroke-linecap="round"
        stroke-opacity="0.7"
      />
      <circle
        cx="0"
        cy="0"
        r="0.8"
        fill="var(--color-brand-accent, #187bcd)"
        fill-opacity="0.7"
      />
      <line
        x1="0"
        y1="-4.8"
        x2="0"
        y2="-5.5"
        stroke="var(--color-brand-accent, #187bcd)"
        stroke-width="0.6"
        stroke-opacity="0.35"
      />
      <line
        x1="4.8"
        y1="0"
        x2="5.5"
        y2="0"
        stroke="var(--color-brand-accent, #187bcd)"
        stroke-width="0.6"
        stroke-opacity="0.35"
      />
      <line
        x1="0"
        y1="4.8"
        x2="0"
        y2="5.5"
        stroke="var(--color-brand-accent, #187bcd)"
        stroke-width="0.6"
        stroke-opacity="0.35"
      />
      <line
        x1="-4.8"
        y1="0"
        x2="-5.5"
        y2="0"
        stroke="var(--color-brand-accent, #187bcd)"
        stroke-width="0.6"
        stroke-opacity="0.35"
      />
    </g>
  </svg>
</template>

<script setup lang="ts">
  import { computed } from "vue";

  const props = withDefaults(
    defineProps<{
      size?: "sm" | "md" | "lg" | "xl";
    }>(),
    { size: "md" }
  );

  const sizeClass = computed(() => {
    const map = {
      sm: "h-10 w-auto",
      md: "h-14 w-auto",
      lg: "h-20 w-auto",
      xl: "h-28 w-auto",
    };
    return map[props.size];
  });
</script>
