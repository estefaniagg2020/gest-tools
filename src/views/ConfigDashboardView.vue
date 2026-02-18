<template>
  <div class="min-h-full py-6 px-4 sm:px-6 lg:px-8">
    <div class="mx-auto max-w-4xl">
      <BackLink
        to="/config"
        :label="$t('common.backToConfig')"
      />
      <h1 class="text-2xl font-bold tracking-tight text-app-title transition-colors duration-200">
        {{ $t('config.dashboard.title') }}
      </h1>
      <p class="mt-1 text-sm text-app-text/70 transition-colors duration-200">
        {{ $t('config.dashboard.description') }}
      </p>

      <div class="mt-6 flex flex-wrap gap-2">
        <BaseButton
          variant="outline"
          @click="selectAll"
        >
          Seleccionar todas
        </BaseButton>
        <BaseButton
          variant="outline"
          @click="selectNone"
        >
          Ninguna
        </BaseButton>
      </div>

      <div class="mt-6 grid gap-4 sm:grid-cols-2">
        <button
          v-for="widget in DASHBOARD_WIDGET_MODULES"
          :key="widget.id"
          type="button"
          class="group relative rounded-2xl border-2 p-5 text-left transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-accent focus:ring-offset-2"
          :class="[
            selectedIds.has(widget.id)
              ? 'border-brand-accent bg-brand-accent/5 shadow-sm'
              : 'border-app-border-subtle bg-app-surface hover:border-app-border hover:shadow-sm',
            widget.size === 'large' ? 'sm:col-span-2' : widget.size === 'medium' ? 'sm:col-span-2' : '',
          ]"
          @click="toggle(widget.id)"
        >
          <div class="flex items-start justify-between gap-3 mb-3">
            <div class="flex items-center gap-2.5">
              <span class="text-2xl" aria-hidden="true">{{ widget.icon }}</span>
              <div>
                <p class="text-sm font-semibold text-app-title">{{ widget.title }}</p>
                <p class="text-xs text-app-text/60 mt-0.5">{{ widget.description }}</p>
              </div>
            </div>
            <span
              class="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition-colors duration-200"
              :class="selectedIds.has(widget.id)
                ? 'border-brand-accent bg-brand-accent text-white'
                : 'border-gray-300 bg-app-surface'"
              aria-hidden="true"
            >
              <svg
                v-if="selectedIds.has(widget.id)"
                class="h-3 w-3"
                viewBox="0 0 12 12"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M2 6l3 3 5-5" />
              </svg>
            </span>
          </div>

          <div
            class="rounded-xl border p-3 transition-colors duration-200"
            :class="selectedIds.has(widget.id)
              ? 'border-brand-accent/20 bg-app-surface'
              : 'border-app-border-subtle bg-app-bg/40'"
          >
            <!-- Reservas del mes -->
            <div v-if="widget.id === 'reservas-mes'" class="flex items-end justify-between">
              <div>
                <p class="text-[10px] font-medium text-brand-accent uppercase tracking-wider">Reservas del mes</p>
                <p class="mt-1 text-xl font-bold text-brand-accent tabular-nums">42</p>
              </div>
              <div class="flex items-end gap-0.5 h-8">
                <span v-for="(h, i) in [40, 60, 35, 80, 55, 70, 90]" :key="i" class="w-1.5 rounded-full bg-brand-accent/40" :style="{ height: h + '%' }" />
              </div>
            </div>

            <!-- Reservas de la semana -->
            <div v-else-if="widget.id === 'reservas-semana'" class="flex items-end justify-between">
              <div>
                <p class="text-[10px] font-medium text-brand-accent uppercase tracking-wider">Reservas de la semana</p>
                <p class="mt-1 text-xl font-bold text-brand-accent tabular-nums">12</p>
              </div>
              <div class="flex items-end gap-0.5 h-8">
                <span v-for="(h, i) in [70, 50, 85, 60, 90]" :key="i" class="w-2 rounded-full bg-brand-accent/40" :style="{ height: h + '%' }" />
              </div>
            </div>

            <!-- Beneficio diario -->
            <div v-else-if="widget.id === 'beneficio-diario'">
              <p class="text-[10px] font-medium text-brand-accent uppercase tracking-wider">Beneficio diario</p>
              <div class="flex items-baseline gap-1 mt-1">
                <p class="text-xl font-bold text-brand-accent tabular-nums">185,00 €</p>
                <span class="text-[10px] font-medium text-emerald-500">+12%</span>
              </div>
            </div>

            <!-- Ingresos del mes -->
            <div v-else-if="widget.id === 'ingresos-mes'">
              <p class="text-[10px] font-medium text-brand-accent uppercase tracking-wider">Ingresos del mes</p>
              <p class="mt-1 text-xl font-bold text-brand-accent tabular-nums">3.420,00 €</p>
              <div class="mt-1.5 flex items-end gap-0.5 h-6">
                <span v-for="(h, i) in [30, 45, 55, 40, 65, 50, 70, 80, 60, 75, 85, 90]" :key="i" class="flex-1 rounded-sm bg-brand-accent/30" :style="{ height: h + '%' }" />
              </div>
            </div>

            <!-- Reservas canceladas -->
            <div v-else-if="widget.id === 'reservas-canceladas'">
              <p class="text-[10px] font-medium text-app-text/60 uppercase tracking-wider">Reservas canceladas</p>
              <p class="mt-1 text-xl font-bold text-app-title tabular-nums">3</p>
              <div class="mt-1.5 flex gap-1">
                <span v-for="i in 5" :key="i" class="h-1 flex-1 rounded-full" :class="i <= 3 ? 'bg-red-400/60' : 'bg-app-border-subtle'" />
              </div>
            </div>

            <!-- Tasa de cancelación -->
            <div v-else-if="widget.id === 'tasa-cancelacion'">
              <p class="text-[10px] font-medium text-app-text/60 uppercase tracking-wider">Tasa de cancelación</p>
              <p class="mt-1 text-xl font-bold text-emerald-500 tabular-nums">7%</p>
              <div class="mt-1.5 h-1.5 rounded-full bg-app-border-subtle overflow-hidden">
                <div class="h-full rounded-full bg-emerald-400/70 w-[7%]" />
              </div>
            </div>

            <!-- Reservas por persona -->
            <div v-else-if="widget.id === 'grafica-reservas-persona'">
              <p class="text-[10px] font-medium text-brand-accent uppercase tracking-wider mb-2">Reservas por persona</p>
              <div class="space-y-1.5">
                <div v-for="(person, i) in SAMPLE_PEOPLE" :key="i" class="flex items-center gap-2">
                  <span class="text-[11px] text-app-title truncate w-14">{{ person.name }}</span>
                  <div class="flex-1 h-1.5 rounded-full bg-app-border-subtle overflow-hidden">
                    <div class="h-full rounded-full bg-brand-accent/70" :style="{ width: person.pct + '%' }" />
                  </div>
                  <span class="text-[10px] font-semibold text-brand-accent tabular-nums w-4 text-right">{{ person.count }}</span>
                </div>
              </div>
            </div>

            <!-- Empleado con más reservas -->
            <div v-else-if="widget.id === 'empleado-mas-reservas'">
              <p class="text-[10px] font-medium text-brand-accent uppercase tracking-wider">Empleado con más reservas</p>
              <div class="mt-2 flex items-center gap-3">
                <span class="text-2xl" aria-hidden="true">🏆</span>
                <div>
                  <p class="text-base font-bold text-app-title">María</p>
                  <p class="text-sm font-semibold text-brand-accent tabular-nums">24 reservas</p>
                </div>
              </div>
            </div>

            <!-- Ventas por empleado -->
            <div v-else-if="widget.id === 'ventas-por-empleado'">
              <p class="text-[10px] font-medium text-brand-accent uppercase tracking-wider mb-2">Ventas por empleado</p>
              <div class="space-y-1.5">
                <div v-for="(emp, i) in SAMPLE_VENTAS_EMPLEADO" :key="i" class="flex items-center gap-2">
                  <span class="text-[10px] font-semibold text-app-text/40 w-3 shrink-0">{{ i + 1 }}</span>
                  <span class="text-[11px] text-app-title truncate flex-1">{{ emp.name }}</span>
                  <div class="w-12 h-1.5 rounded-full bg-app-border-subtle overflow-hidden shrink-0">
                    <div class="h-full rounded-full bg-brand-accent/70" :style="{ width: emp.pct + '%' }" />
                  </div>
                  <span class="text-[10px] font-semibold text-brand-accent tabular-nums w-12 text-right">{{ emp.amount }}</span>
                </div>
              </div>
            </div>

            <!-- Servicios más solicitados -->
            <div v-else-if="widget.id === 'servicios-populares'">
              <p class="text-[10px] font-medium text-brand-accent uppercase tracking-wider mb-2">Servicios más solicitados</p>
              <div class="space-y-1.5">
                <div v-for="(srv, i) in SAMPLE_SERVICES" :key="i" class="flex items-center gap-2">
                  <span class="text-[10px] font-semibold text-app-text/40 w-3 shrink-0">{{ i + 1 }}</span>
                  <span class="text-[11px] text-app-title truncate flex-1">{{ srv.name }}</span>
                  <div class="w-12 h-1.5 rounded-full bg-app-border-subtle overflow-hidden shrink-0">
                    <div class="h-full rounded-full bg-brand-accent/70" :style="{ width: srv.pct + '%' }" />
                  </div>
                  <span class="text-[10px] font-semibold text-brand-accent tabular-nums w-4 text-right">{{ srv.count }}</span>
                </div>
              </div>
            </div>

            <!-- Clientes nuevos -->
            <div v-else-if="widget.id === 'clientes-nuevos'">
              <p class="text-[10px] font-medium text-brand-accent uppercase tracking-wider">Clientes nuevos</p>
              <div class="flex items-baseline gap-1 mt-1">
                <p class="text-xl font-bold text-brand-accent tabular-nums">8</p>
                <span class="text-[10px] text-app-text/50">este mes</span>
              </div>
              <div class="mt-1.5 flex gap-0.5">
                <span v-for="i in 8" :key="i" class="h-2 w-2 rounded-full bg-brand-accent/50" />
                <span v-for="i in 4" :key="'e' + i" class="h-2 w-2 rounded-full bg-app-border-subtle" />
              </div>
            </div>

            <!-- Próximas citas de hoy -->
            <div v-else-if="widget.id === 'proximas-citas-hoy'">
              <p class="text-[10px] font-medium text-brand-accent uppercase tracking-wider mb-2">Próximas citas</p>
              <div class="space-y-1.5">
                <div v-for="(cita, i) in SAMPLE_CITAS" :key="i" class="flex items-center gap-2">
                  <span class="text-[10px] font-bold text-brand-accent tabular-nums shrink-0 w-10">{{ cita.hour }}</span>
                  <span class="text-[11px] text-app-title truncate flex-1">{{ cita.service }}</span>
                  <span class="text-[10px] text-app-text/50 truncate shrink-0">{{ cita.person }}</span>
                </div>
              </div>
            </div>

            <!-- Ocupación semanal -->
            <div v-else-if="widget.id === 'ocupacion-semanal'">
              <p class="text-[10px] font-medium text-brand-accent uppercase tracking-wider">Ocupación semanal</p>
              <p class="mt-1 text-xl font-bold text-brand-accent tabular-nums">68%</p>
              <div class="mt-1.5 h-2 rounded-full bg-app-border-subtle overflow-hidden">
                <div class="h-full rounded-full bg-brand-accent/70 w-[68%]" />
              </div>
            </div>

            <!-- Horas trabajadas -->
            <div v-else-if="widget.id === 'horas-trabajadas'">
              <p class="text-[10px] font-medium text-brand-accent uppercase tracking-wider">Horas trabajadas</p>
              <div class="flex items-baseline gap-1 mt-1">
                <p class="text-xl font-bold text-brand-accent tabular-nums">32.5</p>
                <span class="text-[10px] text-app-text/50">h esta semana</span>
              </div>
              <div class="mt-1.5 flex items-end gap-0.5 h-6">
                <span v-for="(h, i) in [80, 90, 70, 85, 60]" :key="i" class="flex-1 rounded-sm bg-brand-accent/40" :style="{ height: h + '%' }" />
                <span v-for="i in 2" :key="'w' + i" class="flex-1 rounded-sm bg-app-border-subtle h-[10%]" />
              </div>
            </div>

            <!-- Productos bajo stock -->
            <div v-else-if="widget.id === 'productos-bajo-stock'">
              <p class="text-[10px] font-medium text-amber-500 uppercase tracking-wider mb-2">Productos bajo stock</p>
              <div class="space-y-1.5">
                <div v-for="(prod, i) in SAMPLE_PRODUCTS" :key="i" class="flex items-center gap-2">
                  <span class="text-[11px] text-app-title truncate flex-1">{{ prod.name }}</span>
                  <div class="w-10 h-1.5 rounded-full bg-app-border-subtle overflow-hidden shrink-0">
                    <div class="h-full rounded-full" :class="prod.stock <= 0 ? 'bg-red-400' : 'bg-amber-400'" :style="{ width: Math.max(10, (prod.stock / prod.min) * 100) + '%' }" />
                  </div>
                  <span class="text-[10px] font-semibold tabular-nums shrink-0" :class="prod.stock <= 0 ? 'text-red-500' : 'text-amber-500'">{{ prod.stock }}</span>
                </div>
              </div>
            </div>
          </div>
        </button>
      </div>

      <p class="mt-6 text-xs text-app-text/50 transition-colors duration-200">
        Los datos de las previews son solo de ejemplo. Pulsa una tarjeta para activar o desactivar el widget.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed } from "vue";
  import { storeToRefs } from "pinia";
  import { DASHBOARD_WIDGET_MODULES, DASHBOARD_WIDGET_IDS } from "@/data/dashboardWidgetModules";
  import { DEFAULT_DASHBOARD_MODULE_IDS } from "@/interfaces";
  import { useLayoutStore } from "@/stores/layout";
  import BackLink from "@/components/common/BackLink.vue";
  import BaseButton from "@/components/common/BaseButton.vue";

  const SAMPLE_VENTAS_EMPLEADO = [
    { name: "María", amount: "1.240 €", pct: 100 },
    { name: "Carlos", amount: "890 €", pct: 72 },
    { name: "Laura", amount: "520 €", pct: 42 },
  ];

  const SAMPLE_PEOPLE = [
    { name: "María", count: 14, pct: 100 },
    { name: "Carlos", count: 9, pct: 64 },
    { name: "Laura", count: 6, pct: 43 },
  ];

  const SAMPLE_SERVICES = [
    { name: "Masaje relajante", count: 18, pct: 100 },
    { name: "Corte + peinado", count: 12, pct: 67 },
    { name: "Manicura", count: 9, pct: 50 },
    { name: "Facial hidratante", count: 5, pct: 28 },
  ];

  const SAMPLE_CITAS = [
    { hour: "11:00", service: "Masaje relajante", person: "María" },
    { hour: "11:30", service: "Corte + peinado", person: "Carlos" },
    { hour: "12:00", service: "Manicura", person: "Laura" },
  ];

  const SAMPLE_PRODUCTS = [
    { name: "Aceite esencial lavanda", stock: 2, min: 10 },
    { name: "Crema hidratante 500ml", stock: 1, min: 5 },
    { name: "Toallas desechables", stock: 0, min: 20 },
  ];

  const layoutStore = useLayoutStore();
  const { dashboardModuleIds } = storeToRefs(layoutStore);

  const selectedIds = computed(() => new Set(dashboardModuleIds.value));

  const toggle = (id: string) => {
    const current = new Set(dashboardModuleIds.value);
    if (current.has(id)) {
      current.delete(id);
    } else {
      current.add(id);
    }
    const ordered = DEFAULT_DASHBOARD_MODULE_IDS.filter((defaultId) => current.has(defaultId));
    layoutStore.setDashboardModuleIds(ordered);
  };

  const selectAll = () => {
    layoutStore.setDashboardModuleIds([...DASHBOARD_WIDGET_IDS]);
  };

  const selectNone = () => {
    layoutStore.setDashboardModuleIds([]);
  };
</script>
