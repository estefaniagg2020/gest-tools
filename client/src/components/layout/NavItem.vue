<template>
  <RouterLink
    :to="to"
    :title="iconOnly ? label : undefined"
    class="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300 group font-medium relative overflow-hidden"
    :class="[
      isActive
        ? activeClass || 'bg-brand-accent/10 text-brand-accent shadow-sm'
        : 'text-app-text/80 hover:bg-app-border-subtle hover:text-app-title',
      (collapsed || iconOnly) ? 'justify-center px-0' : '',
    ]"
  >
    <span class="text-xl group-hover:scale-110 transition-transform relative z-10">{{ icon }}</span>

    <span
      class="transition-all duration-300 whitespace-nowrap relative z-10"
      :class="(collapsed || iconOnly) ? 'opacity-0 w-0 hidden' : 'opacity-100 block'"
    >
      {{ label }}
    </span>

    <div
      v-if="isActive && !collapsed && !iconOnly"
      class="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-3/5 rounded-r-full bg-current opacity-20"
    ></div>
  </RouterLink>
</template>

<script setup lang="ts">
  import { computed } from "vue";
  import { useRoute, RouterLink } from "vue-router";
  import { ROUTE_HOME } from "@/data/navLinks";

  const props = defineProps<{
    to: string;
    icon: string;
    label: string;
    collapsed: boolean;
    iconOnly?: boolean;
    activeClass?: string;
  }>();

  const route = useRoute();

  const isActive = computed(() => {
    if (props.to === ROUTE_HOME) return route.path === ROUTE_HOME;
    return route.path.startsWith(props.to);
  });
</script>
