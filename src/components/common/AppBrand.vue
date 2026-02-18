<template>
  <div class="flex items-center gap-3">
    <div
      data-app-brand-logo-box
      class="flex shrink-0 items-center justify-center rounded-xl bg-[var(--color-brand-accent)] bg-gradient-to-tr from-brand-accent to-brand-accent/90 text-white shadow-lg shadow-brand-accent/20"
      :class="logoBoxClass"
    >
      <img
        v-if="displayLogoUrl"
        :src="displayLogoUrl"
        :alt="displayCompanyName"
        class="h-full w-full rounded-xl object-contain"
      />
      <svg
        v-else
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        class="w-[60%] h-[60%]"
        aria-hidden="true"
      >
        <path
          d="M12 2L2 7v10c0 2.76 2.24 5 5 5h10c2.76 0 5-2.24 5-5V7L12 2zm0 2.18l6 3.33v7.98c0 1.66-1.34 3-3 3H9c-1.66 0-3-1.34-3-3V7.51l6-3.33z"
        />
      </svg>
    </div>
    <div
      v-if="showName"
      class="min-w-0"
    >
      <h1
        class="font-bold text-app-title tracking-tight truncate"
        :class="nameClass"
      >
        {{ displayCompanyName }}
      </h1>
      <p
        v-if="showSubtitle"
        class="text-[10px] text-app-text/70 tracking-widest uppercase font-medium"
      >
        {{ subtitle }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed } from "vue";
  import { storeToRefs } from "pinia";
  import { useGestorConfigStore } from "@/stores/gestorConfig";

  const props = withDefaults(
    defineProps<{
      size?: "sm" | "md" | "lg";
      showName?: boolean;
      showSubtitle?: boolean;
      subtitle?: string;
    }>(),
    { size: "md", showName: true, showSubtitle: false }
  );

  const gestorConfigStore = useGestorConfigStore();
  const { displayCompanyName, displayLogoUrl } = storeToRefs(gestorConfigStore);

  const logoBoxClass = computed(() => {
    const sizes = { sm: "w-8 h-8 min-w-8", md: "w-10 h-10 min-w-10", lg: "w-12 h-12 min-w-12" };
    return sizes[props.size];
  });

  const nameClass = computed(() => {
    const sizes = { sm: "text-lg", md: "text-xl", lg: "text-2xl" };
    return sizes[props.size];
  });
</script>
