<template>
  <span
    v-if="variant === 'footer' && logoSrc"
    class="bokio-brand bokio-brand-footer inline-flex items-center gap-0"
    role="img"
    aria-label="Bokio"
  >
    <img
      :src="logoSrc"
      alt=""
      class="shrink-0 object-contain"
      :class="logoImgClass"
    />
  </span>
  <span
    v-else-if="variant === 'footer'"
    class="bokio-brand bokio-brand-footer inline-flex flex-col items-center gap-0.5 text-brand-accent"
    :class="sizeClass"
    role="img"
    aria-label="Bokio"
  >
    <svg
      class="shrink-0"
      :class="footerSvgClass"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 48 56"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
    >
      <rect
        x="4"
        y="8"
        width="40"
        height="44"
        rx="4"
      />
      <path d="M4 20h40" />
      <circle
        cx="14"
        cy="14"
        r="2"
        fill="currentColor"
      />
      <circle
        cx="34"
        cy="14"
        r="2"
        fill="currentColor"
      />
      <path
        d="M18 32l6 6 12-14"
        stroke-width="2.5"
      />
    </svg>
    <span class="font-semibold tracking-tight text-[length:inherit]">Bokio</span>
  </span>
  <span
    v-else
    class="bokio-brand inline-flex items-center gap-1.5 text-app-text/50"
    :class="sizeClass"
    role="img"
    aria-label="Bokio"
  >
    <img
      v-if="logoSrc"
      :src="logoSrc"
      alt=""
      class="shrink-0 object-contain"
      :class="logoImgClass"
    />
    <svg
      v-else
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      class="shrink-0 opacity-80"
      aria-hidden="true"
    >
      <path
        fill-rule="evenodd"
        d="M4 2a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H4Zm2 2h3v2H6V4Zm0 4h3v2H6V8Zm0 4h3v2H6v-2Zm5-8h3v2h-3V4Zm0 4h3v2h-3V8Zm0 4h3v2h-3v-2Z"
        clip-rule="evenodd"
      />
    </svg>
    <span
      v-if="!logoOnly"
      class="font-semibold tracking-tight"
    >Bokio</span>
  </span>
</template>

<script setup lang="ts">
  import { computed } from "vue";

  const props = withDefaults(
    defineProps<{
      size?: "xs" | "sm" | "md" | "lg";
      logoSrc?: string;
      logoOnly?: boolean;
      variant?: "default" | "footer";
    }>(),
    { size: "sm", logoOnly: false, variant: "default" }
  );

  const sizeClass = computed(() => {
    const map = {
      xs: "text-[10px] [&_svg]:w-3 [&_svg]:h-3",
      sm: "text-xs [&_svg]:w-3.5 [&_svg]:h-3.5",
      md: "text-sm [&_svg]:w-4 [&_svg]:h-4",
      lg: "text-base [&_svg]:w-5 [&_svg]:h-5",
    };
    return map[props.size];
  });

  const logoImgClass = computed(() => {
    const map = {
      xs: "w-5 h-5",
      sm: "w-6 h-6",
      md: "h-7 w-auto max-w-[120px]",
      lg: "h-12 w-auto max-w-[180px]",
    };
    return map[props.size];
  });

  const footerSvgClass = computed(() => {
    const map = {
      xs: "w-8 h-8",
      sm: "w-9 h-9",
      md: "w-10 h-10",
      lg: "w-12 h-12",
    };
    return map[props.size];
  });
</script>
