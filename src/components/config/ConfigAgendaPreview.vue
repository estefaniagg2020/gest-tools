<template>
  <div
    class="rounded-2xl border-2 border-brand-accent/20 overflow-hidden transition-colors duration-200"
    :style="{ backgroundColor: colors.agendaBg }"
  >
    <div class="px-3 py-2 border-b border-gray-200/80 flex items-center justify-between gap-2">
      <span class="text-xs font-semibold text-app-title">Vista previa</span>
      <span class="text-[10px] text-app-text/70 capitalize">{{ viewLabel }}</span>
    </div>
    <div class="p-2 min-h-[120px]">
      <template v-if="previewView === 'day'">
        <div class="flex gap-1">
          <div class="w-8 shrink-0 text-[9px] text-app-text/60 space-y-1">
            <div v-for="h in [9, 10, 11, 12]" :key="h">{{ h }}:00</div>
          </div>
          <div class="flex-1 flex flex-col gap-0.5">
            <div
              v-for="(name, i) in agendaNamesSlice"
              :key="i"
              class="text-[9px] font-medium truncate py-0.5 border-b border-gray-100"
              :style="{ color: getAgendaColor(i).markedDaysColor }"
            >
              {{ name || `Agenda ${i + 1}` }}
            </div>
            <div
              class="mt-1 rounded border-l-4 py-1 px-1.5 text-[9px] font-medium truncate"
              :style="{
                backgroundColor: `${getAgendaColor(0).markedDaysColor}20`,
                borderLeftColor: getAgendaColor(0).markedDaysColor,
                color: getAgendaColor(0).markedDaysColor,
              }"
            >
              Turno mañana
            </div>
            <div
              class="rounded border-l-4 py-1 px-1.5 text-[9px] font-medium truncate"
              :style="{
                backgroundColor: `${getAgendaColor(0).vacationColor}20`,
                borderLeftColor: getAgendaColor(0).vacationColor,
                color: getAgendaColor(0).vacationColor,
              }"
            >
              Vacaciones
            </div>
          </div>
        </div>
      </template>
      <template v-else-if="previewView === 'week'">
        <div class="grid grid-cols-4 gap-0.5 text-[9px]">
          <div
            v-for="i in 4"
            :key="i"
            class="font-medium text-center py-1 border-b border-gray-200/80"
            :style="{ color: getAgendaColor(0).markedDaysColor }"
          >
            {{ dayLabels[i - 1] }}
          </div>
          <div
            v-for="i in 8"
            :key="'cell-' + i"
            class="h-4 rounded-sm"
            :style="{ backgroundColor: `${getAgendaColor(0).agendaBg}` }"
          />
          <div
            class="col-span-2 rounded py-1 px-1 border-l-4 text-[9px] font-medium truncate"
            :style="{
              backgroundColor: `${getAgendaColor(0).markedDaysColor}25`,
              borderLeftColor: getAgendaColor(0).markedDaysColor,
              color: getAgendaColor(0).markedDaysColor,
            }"
          >
            Trabajo
          </div>
          <div
            class="col-span-2 rounded py-1 px-1 border-l-4 text-[9px] font-medium truncate"
            :style="{
              backgroundColor: `${getAgendaColor(0).vacationColor}25`,
              borderLeftColor: getAgendaColor(0).vacationColor,
              color: getAgendaColor(0).vacationColor,
            }"
          >
            Vacaciones
          </div>
        </div>
      </template>
      <template v-else>
        <div class="grid grid-cols-7 gap-px text-[8px]">
          <div
            v-for="d in ['L', 'M', 'X', 'J', 'V', 'S', 'D']"
            :key="d"
            class="text-center font-semibold py-0.5"
            :style="{ color: getAgendaColor(0).markedDaysColor }"
          >
            {{ d }}
          </div>
          <div
            v-for="i in 14"
            :key="'m-' + i"
            class="h-3 rounded-sm"
            :style="{ backgroundColor: i === 5 ? getAgendaColor(0).markedDaysColor : i === 8 ? getAgendaColor(0).vacationColor : 'transparent' }"
          />
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed } from "vue";
  import type { AgendaColorSet } from "@/interfaces/agendaColors";
  import type { DefaultViewType } from "@/interfaces";

  const props = withDefaults(
    defineProps<{
      previewView: DefaultViewType;
      agendaNames: string[];
      sameColorsForAll: boolean;
      globalSet: AgendaColorSet;
      perAgendaColors: AgendaColorSet[];
      getColorsForAgenda: (index: number) => AgendaColorSet;
    }>(),
    {},
  );

  const dayLabels = ["Lun", "Mar", "Mié", "Jue"];
  const viewLabel = computed(() => {
    if (props.previewView === "day") return "Día";
    if (props.previewView === "week") return "Semana";
    return "Mes";
  });

  const agendaNamesSlice = computed(() => props.agendaNames.slice(0, 3));
  const colors = computed(() => props.globalSet);
  const getAgendaColor = (index: number) => props.getColorsForAgenda(index);
</script>
