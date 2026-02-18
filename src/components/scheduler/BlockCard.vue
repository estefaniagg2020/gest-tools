<template>
  <div
    class="absolute inset-x-1 rounded-md px-2 py-1 text-xs font-medium border-l-4 overflow-hidden cursor-pointer transition-all hover:brightness-95 hover:z-10 shadow-sm"
    :class="[
      itemClass,
      position.isSmall ? 'flex items-center justify-center p-0' : '',
      !isAppointmentItem && block && block.status === 'pending' ? 'opacity-70 border-dashed border-l-4! ring-2 ring-app-border ring-offset-1' : '',
      isAppointmentItem && isAppointmentCancelled ? 'opacity-60 border-gray-400 bg-gray-100!' : '',
    ]"
    :style="cardStyleValue"
    @click.stop="$emit('click')"
  >
    <template v-if="isAppointmentItem">
      <div
        v-if="!position.isSmall"
        class="flex flex-col h-full gap-0.5"
      >
        <div class="flex items-center justify-between w-full gap-1">
          <span class="font-semibold truncate" :class="{ 'line-through': isAppointmentCancelled }">{{ clientName }}</span>
          <span class="text-[10px] opacity-80 shrink-0">{{ appointmentItem ? formatTime(appointmentItem.start) : '' }}</span>
        </div>
        <div class="truncate text-[10px] opacity-90" :class="{ 'line-through': isAppointmentCancelled }">{{ serviceName }}</div>
        <div v-if="isAppointmentCancelled && cancellationReason" class="truncate text-[9px] opacity-80 italic">
          {{ cancellationReason }}
        </div>
        <div class="flex items-center justify-between w-full mt-0.5 flex-wrap gap-x-1.5">
          <span class="text-[10px] font-medium opacity-90" :class="{ 'line-through': isAppointmentCancelled }">{{ servicePriceFormatted }}</span>
          <span class="text-[9px] px-1 rounded font-medium" :class="isAppointmentCancelled ? 'bg-red-100 text-red-600' : 'bg-white/60'">{{ appointmentStatusLabel }}</span>
        </div>
      </div>
      <span v-else class="truncate text-[10px]" :class="{ 'line-through': isAppointmentCancelled }">{{ clientName }}</span>
    </template>
    <template v-else-if="block">
      <div
        v-if="!position.isSmall"
        class="flex flex-col h-full"
      >
        <div class="flex items-center justify-between w-full">
          <span class="font-bold truncate">{{ block.title }}</span>
          <span
            v-if="block.status === 'pending'"
            class="text-[10px] bg-white/50 px-1 rounded"
            :title="$t('scheduler.pendingConfirmation')"
          >⏳</span>
          <span
            v-else
            class="opacity-70 text-[10px]"
          >{{ formatTime(block.start) }}</span>
        </div>
        <div
          v-if="block.description || blockServiceName"
          class="truncate text-[10px] opacity-90 mt-0.5"
        >
          {{ blockServiceName || block.description }}
        </div>
      </div>
      <span v-else class="truncate text-[10px]">{{ block.title }}</span>
    </template>
  </div>
</template>

<script setup lang="ts">
  import { computed } from "vue";
  import type { ScheduleBlock, AgendaItem } from "@/interfaces";
  import { isAppointment } from "@/interfaces";
  import { useClientStore } from "@/stores/client";
  import { useServiceStore } from "@/stores/service";
  import { getBlockTypeCardStyles } from "@/composables/useBlockTypeStyles";
  import { useBlockPosition } from "@/composables/useBlockPosition";
  import { formatTime } from "@/composables/useScheduleDates";

  interface BlockCardProps {
    item: AgendaItem;
    startHour: number;
    pixelsPerHour: number;
    topOffset?: number;
  }

  const props = withDefaults(defineProps<BlockCardProps>(), { topOffset: 0 });

  defineEmits<{ (e: "click"): void }>();

  const clientStore = useClientStore();
  const serviceStore = useServiceStore();

  const isAppointmentItem = computed(() => isAppointment(props.item));
  const appointmentItem = computed(() => (isAppointment(props.item) ? props.item : null));
  const block = computed(() => (isAppointmentItem.value ? null : (props.item as ScheduleBlock)));

  const clientName = computed(() => {
    const apt = appointmentItem.value;
    if (!apt) return "";
    if (!apt.clientId) return "—";
    const c = clientStore.getClientById(apt.clientId);
    return c?.name ?? "—";
  });

  const serviceName = computed(() => {
    const apt = appointmentItem.value;
    if (!apt) return "";
    if (!apt.serviceId) return "—";
    const s = serviceStore.getServiceById(apt.serviceId);
    return s?.name ?? "—";
  });

  const blockServiceName = computed(() => {
    const b = block.value;
    const id = b?.serviceId;
    if (!id) return "";
    const s = serviceStore.getServiceById(id);
    return s ? `📋 ${s.name}` : "";
  });

  const servicePrice = computed(() => {
    const apt = appointmentItem.value;
    if (!apt || !apt.serviceId) return 0;
    const s = serviceStore.getServiceById(apt.serviceId);
    return s?.price ?? 0;
  });

  const servicePriceFormatted = computed(() =>
    servicePrice.value > 0 ? `${servicePrice.value} €` : "",
  );

  const isAppointmentCancelled = computed(() => (appointmentItem.value?.status ?? "") === "cancelled");

  const cancellationReason = computed(() => appointmentItem.value?.cancellationReason ?? "");

  const appointmentStatusLabel = computed(() =>
    isAppointmentCancelled.value ? "Cancelada" : "Confirmada",
  );

  const itemClass = computed(() => {
    if (isAppointment(props.item)) {
      return "bg-emerald-100 border-emerald-500 text-emerald-900 dark:bg-emerald-500/20 dark:border-emerald-400 dark:text-emerald-100";
    }
    const b = props.item as ScheduleBlock;
    const colorClass = getBlockTypeCardStyles(b.type);
    return [colorClass.bg, colorClass.border, colorClass.text];
  });

  const position = useBlockPosition(
    () => props.item,
    () => props.startHour,
    () => props.pixelsPerHour,
    () => props.topOffset,
  );

  const cardStyleValue = computed(() => position.cardStyle.value);
</script>
