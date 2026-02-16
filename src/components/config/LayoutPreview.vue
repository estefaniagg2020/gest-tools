<template>
  <div
    class="rounded-2xl border-2 border-spa-teal/30 bg-app-surface shadow-lg overflow-hidden"
    aria-label="Vista previa del diseño"
  >
    <p class="px-4 py-2 text-xs font-medium text-app-text/60 border-b border-spa-teal/10 bg-app-bg/50">
      Vista previa — así se verá tu gestor
    </p>
    <div
      class="flex bg-app-bg"
      :class="sidebarRight ? 'flex-row-reverse' : 'flex-row'"
    >
      <aside
        v-if="sidebarPosition !== 'none'"
        class="w-14 shrink-0 flex flex-col border-app-text/10 bg-white/90 py-2"
        :class="sidebarRight ? 'border-l' : 'border-r'"
      >
        <div class="px-2 py-1.5 text-center text-[10px] font-semibold text-app-text/50 truncate">
          Logo
        </div>
        <nav class="flex-1 flex flex-col gap-0.5 px-1.5">
          <span
            v-for="mod in orderedModules"
            :key="mod.id"
            class="flex items-center justify-center w-8 h-8 rounded-lg bg-app-bg/80 text-base"
            :title="mod.label"
          >
            {{ mod.icon }}
          </span>
        </nav>
        <div class="h-6 shrink-0" />
      </aside>
      <div class="flex-1 min-w-0 flex flex-col">
        <nav
          v-if="showNavbar"
          class="flex items-center gap-1 px-2 py-1.5 border-b border-spa-teal/10 bg-app-surface/80 shrink-0"
        >
          <span
            v-for="mod in orderedModules.slice(0, 4)"
            :key="mod.id"
            class="text-[10px] text-app-text/70"
          >
            {{ mod.icon }}
          </span>
        </nav>
        <div class="flex-1 p-2 min-h-0">
          <div
            class="rounded-xl border border-spa-teal/20 bg-white overflow-hidden flex flex-col"
            :style="{ minHeight: previewCalendarHeight + 'px' }"
          >
            <div class="px-2 py-1.5 border-b border-gray-100 text-[10px] font-medium text-app-text/80 shrink-0">
              Agenda
            </div>
            <div class="flex flex-col overflow-hidden">
              <div
                v-for="h in slotHours"
                :key="h"
                class="border-b border-gray-100/80 last:border-b-0 flex items-center px-1.5 shrink-0"
                :style="{ height: slotHeightPx + 'px', minHeight: slotHeightPx + 'px' }"
              >
                <span class="text-[9px] text-app-text/50 w-5 shrink-0">{{ h }}:00</span>
                <div
                  v-if="h === 10"
                  class="ml-1 h-[80%] w-1/3 rounded bg-spa-teal/40 shrink-0"
                />
                <div
                  v-if="h === 14"
                  class="ml-1 h-[80%] w-1/4 rounded bg-orange-400/50 shrink-0"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed } from "vue";
  import type { LayoutModule } from "@/data/layoutModules";
  import type { SidebarPosition, CalendarAppearance } from "@/interfaces";

  const props = defineProps<{
    sidebarPosition: SidebarPosition;
    showNavbar: boolean;
    calendarAppearance: CalendarAppearance;
    orderedModules: LayoutModule[];
  }>();

  const sidebarRight = computed(() => props.sidebarPosition === "right");

  const slotHours = [8, 9, 10, 11, 12, 13, 14, 15, 16];

  const slotHeightPx = computed(() => {
    const a = props.calendarAppearance;
    return a === "compact" ? 18 : a === "spacious" ? 32 : 24;
  });

  const previewCalendarHeight = computed(
    () => 28 + slotHours.length * slotHeightPx.value,
  );
</script>
