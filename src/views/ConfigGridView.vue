<template>
  <div class="min-h-full py-6 px-4 sm:px-6 lg:px-8">
    <div class="mx-auto max-w-4xl">
      <RouterLink
        to="/config"
        class="mb-6 inline-flex items-center gap-1 text-sm font-medium text-app-text/70 hover:text-spa-teal transition-colors duration-200"
      >
        ← Volver a configuración
      </RouterLink>
      <h1 class="text-2xl font-bold tracking-tight text-app-title transition-colors duration-200">
        Diseño de la cuadrícula
      </h1>
      <p class="mt-1 text-sm text-app-text/70 transition-colors duration-200">
        Coloca el menú donde quieras, elige si quieres barra superior y cómo ver la agenda. Los cambios se aplican al instante.
      </p>

      <section class="mt-8">
        <h2 class="text-lg font-semibold text-app-title mb-3">Vista previa</h2>
        <p class="text-sm text-app-text/70 mb-3">
          Así se verá tu gestor y la agenda con la configuración actual.
        </p>
        <LayoutPreview
          :sidebar-position="sidebarPosition"
          :show-navbar="showNavbar"
          :calendar-appearance="calendarAppearance"
          :ordered-modules="orderedModules"
          class="max-w-2xl"
        />
      </section>

      <section class="mt-10">
        <h2 class="text-lg font-semibold text-app-title mb-3">Barra lateral (menú)</h2>
        <div class="grid gap-4 sm:grid-cols-3">
          <LayoutOptionCard
            v-for="opt in sidebarOptions"
            :key="opt.value"
            :title="opt.label"
            :icon="opt.value === 'left' ? '▤' : opt.value === 'right' ? '▥' : '▦'"
            :is-selected="sidebarPosition === opt.value"
            @select="setSidebarPosition(opt.value)"
          />
        </div>
      </section>

      <section class="mt-10">
        <h2 class="text-lg font-semibold text-app-title mb-3">Barra de navegación superior</h2>
        <p class="text-sm text-app-text/70 mb-3">
          Mostrar enlaces principales en una barra horizontal arriba (además del menú lateral).
        </p>
        <div class="flex gap-4">
          <LayoutOptionCard
            title="Sí"
            description="Mostrar barra superior"
            icon="▬"
            :is-selected="showNavbar"
            @select="setShowNavbar(true)"
          />
          <LayoutOptionCard
            title="No"
            description="Solo menú lateral"
            icon="—"
            :is-selected="!showNavbar"
            @select="setShowNavbar(false)"
          />
        </div>
      </section>

      <section class="mt-10">
        <h2 class="text-lg font-semibold text-app-title mb-3">Aspecto del calendario</h2>
        <p class="text-sm text-app-text/70 mb-3">
          Cómo se muestran las franjas y bloques en la vista de agenda.
        </p>
        <div class="grid gap-4 sm:grid-cols-3">
          <LayoutOptionCard
            v-for="opt in calendarOptions"
            :key="opt.value"
            :title="opt.label"
            :description="opt.description"
            :is-selected="calendarAppearance === opt.value"
            @select="setCalendarAppearance(opt.value)"
          />
        </div>
      </section>

      <section class="mt-10">
        <h2 class="text-lg font-semibold text-app-title mb-3">Orden del menú</h2>
        <p class="text-sm text-app-text/70 mb-3">
          Arrastra los módulos para cambiar el orden en el menú lateral.
        </p>
        <div class="rounded-2xl border-2 border-spa-teal/20 bg-app-surface/50 p-4 max-w-md">
          <LayoutModulesList
            :ordered-modules="orderedModules"
            @reorder="reorderFromDrag"
          />
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
  import {
    useLayoutGrid,
    SIDEBAR_OPTIONS as sidebarOptions,
    CALENDAR_APPEARANCE_OPTIONS as calendarOptions,
  } from "@/composables/useLayoutGrid";
  import LayoutOptionCard from "@/components/config/LayoutOptionCard.vue";
  import LayoutModulesList from "@/components/config/LayoutModulesList.vue";
  import LayoutPreview from "@/components/config/LayoutPreview.vue";

  const {
    sidebarPosition,
    showNavbar,
    calendarAppearance,
    orderedModules,
    setSidebarPosition,
    setShowNavbar,
    setCalendarAppearance,
    reorderFromDrag,
  } = useLayoutGrid();
</script>
