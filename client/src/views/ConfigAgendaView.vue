<template>
  <div class="min-h-full pt-6 pb-12 px-4 sm:px-6 lg:px-8">
    <div class="mx-auto max-w-4xl">
      <BackLink
        to="/config"
        :label="CONFIG_AGENDA.BACK_TO_CONFIG"
      />
      <h1 class="text-2xl font-bold tracking-tight text-app-title transition-colors duration-200">
        {{ CONFIG_AGENDA.TITLE }}
      </h1>
      <p class="mt-1 text-sm text-app-text/70 transition-colors duration-200">
        {{ CONFIG_AGENDA.SUBTITLE }}
      </p>

      <section class="mt-8 p-4 rounded-2xl border-2 border-brand-accent/20 bg-app-surface/30">
        <div class="flex flex-wrap items-end gap-4">
          <div class="min-w-[120px]">
            <label class="text-sm text-app-text/70 block mb-1">{{ CONFIG_AGENDA.LABEL_NUM_AGENDAS }}</label>
            <input
              type="number"
              :min="agendas.minAgendas"
              :max="agendas.maxAgendas"
              :value="agendas.numberOfAgendas.value"
              @input="onNumberOfAgendasInput"
              class="w-full p-2.5 bg-app-surface border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent/30"
            />
          </div>
          <div class="min-w-[200px] flex-1">
            <label class="text-sm text-app-text/70 block mb-1">{{ CONFIG_AGENDA.LABEL_SELECT_AGENDA }}</label>
            <select
              :value="selectedAgendaIndex"
              @change="onSelectAgenda"
              class="w-full p-2.5 bg-app-surface border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent/30"
            >
              <option
                v-for="(entry, index) in agendas.agendas.value"
                :key="index"
                :value="index"
              >
                {{ index + 1 }}. {{ entry.name }}
              </option>
            </select>
          </div>
          <label
            class="flex items-center gap-3 cursor-pointer group p-3 rounded-xl border-2 transition-colors shrink-0"
            :class="agendaColors.sameColorsForAll.value ? 'border-brand-accent bg-brand-accent/5' : 'border-gray-200 bg-app-surface hover:border-gray-300'"
          >
            <span
              class="flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition-colors"
              :class="agendaColors.sameColorsForAll.value ? 'border-brand-accent bg-brand-accent text-white' : 'border-gray-300 bg-white'"
              aria-hidden="true"
            >
              <span v-if="agendaColors.sameColorsForAll.value" class="text-xs leading-none">✓</span>
            </span>
            <input
              type="checkbox"
              :checked="agendaColors.sameColorsForAll.value"
              @change="onSameColorsChange"
              class="sr-only"
            />
            <span class="text-sm font-medium text-app-text whitespace-nowrap">{{ AGENDA_COLORS.SAME_FOR_ALL }}</span>
          </label>
        </div>
      </section>

      <section class="mt-8">
        <h2 class="text-lg font-semibold text-app-title mb-3">{{ CONFIG_AGENDA.SECTION_PREVIEW }}</h2>
        <p class="text-sm text-app-text/70 mb-3">
          {{ CONFIG_AGENDA.SECTION_PREVIEW_DESC }}
        </p>
        <div class="mb-3">
          <label class="text-sm text-app-text/70 block mb-1">{{ CONFIG_AGENDA.LABEL_VISTA }}</label>
          <div class="flex gap-2">
            <button
              v-for="opt in viewOptions"
              :key="opt.value"
              type="button"
              :class="[
                'px-4 py-2 rounded-xl text-sm font-medium transition-colors',
                agenda.defaultView.value === opt.value
                  ? 'bg-brand-accent text-white'
                  : 'bg-app-surface text-app-text/70 hover:bg-gray-100 border border-gray-200',
              ]"
              @click="onDefaultViewChange(opt.value)"
            >
              {{ opt.label }}
            </button>
          </div>
        </div>
        <ConfigAgendaPreview
          :preview-view="agenda.defaultView.value"
          :agenda-names="agendas.agendaNames.value"
          :same-colors-for-all="agendaColors.sameColorsForAll.value"
          :global-set="agendaColors.globalSet.value"
          :per-agenda-colors="agendaColors.perAgendaColors.value"
          :get-colors-for-agenda="agendaColors.getColorsForAgenda"
        />
      </section>

      <section v-if="selectedEntry" class="mt-10">
        <h2 class="text-lg font-semibold text-app-title mb-3">
          {{ CONFIG_AGENDA.SECTION_AGENDAS }} — {{ selectedEntry.name }}
        </h2>
        <p class="text-sm text-app-text/70 mb-4">
          Configuración de esta agenda: nombre, horario, días laborables y colores.
        </p>

        <div class="space-y-6">
          <div>
            <label class="text-sm font-medium text-app-title block mb-1">{{ AGENDA_LIST.LABEL_AGENDA_NAME_CUSTOM }}</label>
            <p class="text-xs text-app-text/60 mb-2">Elige un nombre para identificar esta agenda (aparecerá en el selector y en la vista).</p>
            <input
              type="text"
              :value="selectedEntry.name"
              :placeholder="AGENDA_LIST.PLACEHOLDER_NAME_EXAMPLES"
              @input="(e) => onAgendaNameInput(selectedAgendaIndex, e)"
              class="w-full max-w-md p-2.5 bg-app-surface border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent/30"
            />
          </div>

          <div class="grid gap-4 sm:grid-cols-2">
            <div>
              <label class="text-sm text-app-text/70 block mb-1">{{ agendas.labelStartHour }}</label>
              <select
                :value="selectedEntry.startHour ?? ''"
                @change="(e) => onAgendaStartHourChange(selectedAgendaIndex, e)"
                class="w-full p-2.5 bg-app-surface border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent/30"
              >
                <option value="">{{ agendas.useGlobalHours }}</option>
                <option
                  v-for="opt in SCHEDULE_VIEW_SETTINGS.HOUR_OPTIONS"
                  :key="opt.value"
                  :value="opt.value"
                >
                  {{ opt.label }}
                </option>
              </select>
            </div>
            <div>
              <label class="text-sm text-app-text/70 block mb-1">{{ agendas.labelEndHour }}</label>
              <select
                :value="selectedEntry.endHour ?? ''"
                @change="(e) => onAgendaEndHourChange(selectedAgendaIndex, e)"
                class="w-full p-2.5 bg-app-surface border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent/30"
              >
                <option value="">{{ agendas.useGlobalHours }}</option>
                <option
                  v-for="opt in SCHEDULE_VIEW_SETTINGS.HOUR_OPTIONS"
                  :key="opt.value"
                  :value="opt.value"
                >
                  {{ opt.label }}
                </option>
              </select>
            </div>
          </div>

          <div>
            <label class="text-sm text-app-text/70 block mb-2">{{ CONFIG_AGENDA.SECTION_DIAS }}</label>
            <p class="text-xs text-app-text/60 mb-2">{{ CONFIG_AGENDA.SECTION_DIAS_DESC }}</p>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="d in SCHEDULE_VIEW_SETTINGS.WORK_DAYS_OPTIONS"
                :key="d"
                type="button"
                :class="[
                  'px-4 py-2 rounded-xl text-sm font-medium transition-colors',
                  (selectedEntry.workDaysPerWeek ?? agenda.workDaysPerWeek.value) === d
                    ? 'bg-brand-accent text-white'
                    : 'bg-app-surface text-app-text/70 hover:bg-gray-100 border border-gray-200',
                ]"
                @click="onWorkDaysChange(d)"
              >
                {{ d }} {{ d === 1 ? CONFIG_AGENDA.DAY : CONFIG_AGENDA.DAYS }}
              </button>
            </div>
          </div>

          <div>
            <h3 class="text-base font-semibold text-app-title mb-2">{{ AGENDA_COLORS.SECTION_TITLE }}</h3>
            <template v-if="agendaColors.sameColorsForAll.value">
              <p class="text-sm text-app-text/70 mb-3">Estos colores se aplican a todas las agendas.</p>
              <div class="grid gap-4 sm:grid-cols-3">
                <color-picker-row
                  :label="AGENDA_COLORS.LABEL_AGENDA_BG"
                  :value="agendaColors.agendaBg.value"
                  @input="(v: string) => agendaColors.updateColors({ agendaBg: v })"
                />
                <color-picker-row
                  :label="AGENDA_COLORS.LABEL_MARKED_DAYS"
                  :value="agendaColors.markedDaysColor.value"
                  @input="(v: string) => agendaColors.updateColors({ markedDaysColor: v })"
                />
                <color-picker-row
                  :label="AGENDA_COLORS.LABEL_VACATION"
                  :value="agendaColors.vacationColor.value"
                  @input="(v: string) => agendaColors.updateColors({ vacationColor: v })"
                />
              </div>
            </template>
            <template v-else>
              <p class="text-sm text-app-text/70 mb-3">Colores de esta agenda.</p>
              <div class="grid gap-4 sm:grid-cols-3">
                <color-picker-row
                  :label="AGENDA_COLORS.LABEL_AGENDA_BG"
                  :value="agendaColors.getColorsForAgenda(selectedAgendaIndex).agendaBg"
                  @input="(v: string) => onSelectedAgendaColor('agendaBg', v)"
                />
                <color-picker-row
                  :label="AGENDA_COLORS.LABEL_MARKED_DAYS"
                  :value="agendaColors.getColorsForAgenda(selectedAgendaIndex).markedDaysColor"
                  @input="(v: string) => onSelectedAgendaColor('markedDaysColor', v)"
                />
                <color-picker-row
                  :label="AGENDA_COLORS.LABEL_VACATION"
                  :value="agendaColors.getColorsForAgenda(selectedAgendaIndex).vacationColor"
                  @input="(v: string) => onSelectedAgendaColor('vacationColor', v)"
                />
              </div>
            </template>
            <button
              type="button"
              @click="agendaColors.resetToThemeDefaults()"
              class="mt-3 px-4 py-2 rounded-xl text-sm font-medium bg-app-surface border border-gray-200 text-app-text hover:bg-gray-50 transition-colors"
            >
              {{ AGENDA_COLORS.BTN_RESET_THEME }}
            </button>
          </div>
        </div>
      </section>

      <section class="mt-10">
        <h2 class="text-lg font-semibold text-app-title mb-3">{{ CONFIG_AGENDA.SECTION_HORARIO }}</h2>
        <p class="text-sm text-app-text/70 mb-3">
          {{ CONFIG_AGENDA.SECTION_HORARIO_DESC }}
        </p>
        <div class="grid gap-4 sm:grid-cols-3">
          <div>
            <label class="text-sm text-app-text/70 block mb-1">{{ CONFIG_AGENDA.LABEL_HORA_INICIO }}</label>
            <select
              :value="agenda.startHour.value"
              @change="onStartHourChange"
              class="w-full p-2.5 bg-app-surface border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent/30"
            >
              <option
                v-for="opt in SCHEDULE_VIEW_SETTINGS.HOUR_OPTIONS"
                :key="opt.value"
                :value="opt.value"
              >
                {{ opt.label }}
              </option>
            </select>
          </div>
          <div>
            <label class="text-sm text-app-text/70 block mb-1">{{ CONFIG_AGENDA.LABEL_HORA_FIN }}</label>
            <select
              :value="agenda.endHour.value"
              @change="onEndHourChange"
              class="w-full p-2.5 bg-app-surface border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent/30"
            >
              <option
                v-for="opt in SCHEDULE_VIEW_SETTINGS.HOUR_OPTIONS"
                :key="opt.value"
                :value="opt.value"
              >
                {{ opt.label }}
              </option>
            </select>
          </div>
          <div>
            <label class="text-sm text-app-text/70 block mb-1">{{ CONFIG_AGENDA.LABEL_DURACION_FRANJA }}</label>
            <select
              :value="agenda.slotDurationMinutes.value"
              @change="onSlotDurationChange"
              class="w-full p-2.5 bg-app-surface border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent/30"
            >
              <option
                v-for="opt in SCHEDULE_VIEW_SETTINGS.SLOT_DURATION_OPTIONS"
                :key="opt.value"
                :value="opt.value"
              >
                {{ opt.label }}
              </option>
            </select>
          </div>
        </div>
      </section>

      <section class="mt-10">
        <h2 class="text-lg font-semibold text-app-title mb-3">{{ CONFIG_AGENDA.SECTION_CAPACIDAD }}</h2>
        <p class="text-sm text-app-text/70 mb-3">
          {{ terminology.capacityDescription }}
        </p>
        <div class="max-w-xs">
          <label class="text-sm text-app-text/70 block mb-1">{{ CONFIG_AGENDA.LABEL_MAX_PERSONAS_FRANJA }}</label>
          <input
            type="number"
            :min="SCHEDULE_VIEW_SETTINGS.MAX_PEOPLE_PER_SLOT_MIN"
            :max="SCHEDULE_VIEW_SETTINGS.MAX_PEOPLE_PER_SLOT_MAX"
            :value="agenda.maxPeoplePerSlot.value"
            @input="onMaxPeopleInput"
            class="w-full p-2.5 bg-app-surface border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent/30"
          />
        </div>
      </section>

      <section class="mt-10 pt-10 border-t border-app-border-subtle">
        <h2 class="text-lg font-semibold text-app-title mb-3">Citas de las agendas</h2>
        <p class="text-sm text-app-text/70 mb-3">
          Borra todas las citas guardadas en este navegador. Las reservas en el servidor se borran con el script del backend.
        </p>
        <button
          type="button"
          class="px-4 py-2 rounded-xl text-sm font-medium border border-red-200 text-red-600 hover:bg-red-50 transition-colors"
          @click="handleClearAllAppointments"
        >
          Vaciar todas las citas
        </button>
        <p v-if="clearedMessage" class="mt-2 text-sm text-brand-accent">
          {{ clearedMessage }}
        </p>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, watch, onMounted } from "vue";
  import type { DefaultViewType } from "@/interfaces";
  import { useGestorConfigStore } from "@/stores/gestorConfig";
  import { useAuthStore } from "@/stores/auth";
  import { useConfigAgenda } from "@/composables/useConfigAgenda";
  import { useAgendaList } from "@/composables/useAgendaList";
  import { useAgendaColors } from "@/composables/useAgendaColors";
  import { useAppointmentStore } from "@/stores/appointment";
  import { SCHEDULE_VIEW_SETTINGS, AGENDA_COLORS, CONFIG_AGENDA, AGENDA_LIST } from "@/data/constants";
  import { useBusinessTerminology } from "@/composables/useBusinessTerminology";
  import { HEX_REGEX } from "@/interfaces/agendaColors";
  import ConfigAgendaPreview from "@/components/config/ConfigAgendaPreview.vue";
  import ColorPickerRow from "@/components/config/ColorPickerRow.vue";
  import BackLink from "@/components/common/BackLink.vue";
  import { useConfirmDialog } from "@/composables/useConfirmDialog";

  const authStore = useAuthStore();
  const gestorConfigStore = useGestorConfigStore();
  const agenda = useConfigAgenda();
  const appointmentStore = useAppointmentStore();
  const clearedMessage = ref("");
  const agendas = useAgendaList();
  const agendaColors = useAgendaColors();
  const terminology = useBusinessTerminology();

  const selectedAgendaIndex = ref(0);

  const selectedEntry = computed(() => agendas.getAgenda(selectedAgendaIndex.value));

  const viewOptions = [
    { value: "day" as DefaultViewType, label: CONFIG_AGENDA.LABEL_VISTA_DIA },
    { value: "week" as DefaultViewType, label: CONFIG_AGENDA.LABEL_VISTA_SEMANA },
    { value: "month" as DefaultViewType, label: CONFIG_AGENDA.LABEL_VISTA_MES },
  ];

  onMounted(async () => {
    const userId = authStore.user?.id;
    const businessId = authStore.user?.businessId ?? null;
    if (userId && businessId) {
      await gestorConfigStore.initialize(userId, businessId);
    }
    await agendaColors.initialize(businessId ?? null);
    agendas.initialize();
    if (selectedAgendaIndex.value >= agendas.numberOfAgendas.value) {
      selectedAgendaIndex.value = Math.max(0, agendas.numberOfAgendas.value - 1);
    }
  });

  watch(
    () => agendas.numberOfAgendas.value,
    (n) => {
      if (selectedAgendaIndex.value >= n) {
        selectedAgendaIndex.value = Math.max(0, n - 1);
      }
    },
  );

  const onSelectAgenda = (e: Event) => {
    const v = Number((e.target as HTMLSelectElement).value);
    if (!Number.isNaN(v) && v >= 0) selectedAgendaIndex.value = v;
  };

  const onDefaultViewChange = (value: DefaultViewType) => {
    agenda.updateSettings({ defaultView: value });
  };

  const onSameColorsChange = (e: Event) => {
    const checked = (e.target as HTMLInputElement).checked;
    agendaColors.updateColors({ sameColorsForAll: checked });
    if (!checked) {
      agendaColors.ensurePerAgendaColorsLength(agendas.numberOfAgendas.value);
    }
  };

  type ColorKey = "agendaBg" | "markedDaysColor" | "vacationColor";
  const onSelectedAgendaColor = (key: ColorKey, value: string) => {
    if (HEX_REGEX.test(value)) {
      agendaColors.setAgendaColorsForIndex(selectedAgendaIndex.value, { [key]: value });
    }
  };

  const onNumberOfAgendasInput = (e: Event) => {
    const n = Number((e.target as HTMLInputElement).value);
    if (!Number.isNaN(n) && n >= agendas.minAgendas && n <= agendas.maxAgendas) {
      agendas.updateAgendaList({ numberOfAgendas: n });
      if (!agendaColors.sameColorsForAll.value) {
        agendaColors.ensurePerAgendaColorsLength(n);
      }
      if (selectedAgendaIndex.value >= n) {
        selectedAgendaIndex.value = Math.max(0, n - 1);
      }
    }
  };

  const onAgendaNameInput = (index: number, e: Event) => {
    const value = (e.target as HTMLInputElement).value;
    agendas.setAgendaName(index, value);
  };

  const onAgendaStartHourChange = (index: number, e: Event) => {
    const v = (e.target as HTMLSelectElement).value;
    const n = v === "" ? undefined : Number(v);
    agendas.setAgendaHours(index, n, agendas.getAgenda(index)?.endHour);
  };

  const onAgendaEndHourChange = (index: number, e: Event) => {
    const v = (e.target as HTMLSelectElement).value;
    const n = v === "" ? undefined : Number(v);
    agendas.setAgendaHours(index, agendas.getAgenda(index)?.startHour, n);
  };

  const onWorkDaysChange = (d: number) => {
    agendas.setAgendaWorkDays(selectedAgendaIndex.value, d);
  };

  const onStartHourChange = (e: Event) => {
    const n = Number((e.target as HTMLSelectElement).value);
    if (!Number.isNaN(n)) agenda.updateSettings({ startHour: n });
  };

  const onEndHourChange = (e: Event) => {
    const n = Number((e.target as HTMLSelectElement).value);
    if (!Number.isNaN(n)) agenda.updateSettings({ endHour: n });
  };

  const onSlotDurationChange = (e: Event) => {
    const n = Number((e.target as HTMLSelectElement).value);
    if (!Number.isNaN(n) && [30, 60, 90, 120].includes(n)) {
      agenda.updateSettings({ slotDurationMinutes: n as 30 | 60 | 90 | 120 });
    }
  };

  const onMaxPeopleInput = (e: Event) => {
    const n = Number((e.target as HTMLInputElement).value);
    if (!Number.isNaN(n) && n >= 1 && n <= 20) {
      agenda.updateSettings({ maxPeoplePerSlot: n });
    }
  };

  const { show: showConfirm } = useConfirmDialog();

  const handleClearAllAppointments = async () => {
    const ok = await showConfirm({
      title: "Borrar todas las citas",
      message: "¿Borrar todas las citas de las agendas? Esta acción no se puede deshacer.",
      confirmLabel: "Borrar todo",
      variant: "danger",
    });
    if (!ok) return;
    appointmentStore.clearAll();
    clearedMessage.value = "Citas borradas. Recarga la agenda para ver el cambio.";
    setTimeout(() => {
      clearedMessage.value = "";
    }, 4000);
  };
</script>
