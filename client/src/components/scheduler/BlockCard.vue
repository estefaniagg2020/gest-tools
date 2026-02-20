<template>
  <div
    ref="cardRef"
    class="absolute z-5 rounded-md px-2 py-1 text-xs font-medium border-l-4 overflow-hidden transition-all shadow-sm select-none"
    :class="[
      'agenda-block-card',
      itemClass,
      position.isSmall ? 'flex items-center justify-start px-2 py-1' : '',
      !isAppointmentItem && block && block.status === 'pending' ? 'opacity-70 border-dashed border-l-4! ring-2 ring-app-border ring-offset-1' : '',
      isAppointmentItem && (isAppointmentCancelled || isAppointmentNoShow) ? 'opacity-60' : '',
      isBeingDragged ? 'opacity-20 scale-[0.97] pointer-events-none' : '',
      canDrag ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer',
    ]"
    :style="cardStyleWithColors"
    @pointerdown="onPointerDown"
    @pointermove="onPointerMove"
    @mouseenter="onMouseEnter"
    @mouseleave="onMouseLeave"
    @click="onClick"
  >
    <template v-if="isAppointmentItem">
      <div
        v-if="!position.isSmall"
        class="flex flex-col h-full gap-0.5"
      >
        <div class="flex items-center justify-between w-full gap-1">
          <div class="flex flex-col min-w-0 flex-1">
            <span class="font-bold truncate text-[#333333] text-sm leading-tight" :class="{ 'line-through': isAppointmentCancelled }">
              <span v-if="isAppointmentAtHome" class="mr-0.5" title="En domicilio">🏠</span>
              {{ clientName && clientName !== '—' ? clientName : serviceName }}
            </span>
            <span class="truncate text-[10px] text-[#333333] opacity-85" :class="{ 'line-through': isAppointmentCancelled }">
              {{ clientName && clientName !== '—' ? serviceName : (memberName ? `👤 ${memberName}` : '') }}
            </span>
            <span v-if="clientName && clientName !== '—' && memberName" class="truncate text-[10px] text-[#333333] opacity-70">👤 {{ memberName }}</span>
          </div>
          <span class="text-xs shrink-0 text-[#333333]">{{ appointmentItem ? formatTime(appointmentItem.start) : '' }}</span>
        </div>
        <div v-if="isAppointmentCancelled && cancellationReason" class="truncate text-xs italic">
          {{ cancellationReason }}
        </div>
        <div class="flex items-center justify-between w-full mt-0.5 flex-wrap gap-x-1.5">
          <span class="text-xs font-medium text-[#333333]" :class="{ 'line-through': isAppointmentCancelled }">{{ servicePriceFormatted }}</span>
          <span class="flex items-center gap-1">
            <span
              v-if="!position.isSmall"
              class="shrink-0"
              :class="{ 'text-green-600': isAppointmentConfirmed }"
              :title="appointmentStatusLabel"
            >{{ appointmentStatusIcon }}</span>
            <span v-if="isAppointmentPaid && !position.isSmall" class="shrink-0" title="Cobrada">💰</span>
            <span
              v-if="isUnpaidPast && !position.isSmall"
              class="shrink-0 text-red-600"
              :title="t('scheduler.unpaidPastHint')"
            >💸</span>
            <span class="text-xs px-1 rounded font-medium" :class="[
              isAppointmentCancelled || isAppointmentNoShow ? 'bg-red-100 text-red-600' : isAppointmentCompleted ? 'bg-emerald-100 text-emerald-700' : 'bg-white/60'
            ]">{{ appointmentStatusLabel }}</span>
          </span>
        </div>
      </div>
      <span v-else class="flex flex-col gap-0.5 text-xs min-w-0 overflow-hidden" :class="{ 'line-through': isAppointmentCancelled }">
        <span class="flex items-center gap-1 min-w-0">
          <span class="truncate min-w-0 flex-1 font-bold text-[#333333]">{{ clientName && clientName !== '—' ? clientName : serviceName }}</span>
          <span v-if="isAppointmentAtHome" class="shrink-0" title="En domicilio">🏠</span>
          <span
            class="shrink-0"
            :class="{ 'text-green-600': isAppointmentConfirmed }"
          >{{ appointmentStatusIcon }}</span>
          <span v-if="isAppointmentPaid" class="shrink-0">💰</span>
          <span v-if="isUnpaidPast" class="shrink-0 text-red-600" :title="t('scheduler.unpaidPastHint')">💸</span>
        </span>
        <span
          v-if="(clientName && clientName !== '—' && serviceName !== '—') || memberName"
          class="truncate text-[10px] text-[#333333] opacity-90"
        >{{ clientName && clientName !== '—' ? serviceName : (memberName ? `👤 ${memberName}` : '') }}</span>
      </span>
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
            class="text-xs bg-white/50 px-1 rounded"
            :title="$t('scheduler.pendingConfirmation')"
          >⏳</span>
          <span
            v-else
            class="opacity-70 text-xs"
          >{{ formatTime(block.start) }}</span>
        </div>
        <div
          v-if="block.description || blockServiceName"
          class="truncate text-xs opacity-90 mt-0.5"
        >
          {{ blockServiceName || block.description }}
        </div>
        <span v-if="memberName" class="truncate text-[10px] opacity-70 mt-0.5">👤 {{ memberName }}</span>
      </div>
      <span v-else class="truncate text-xs">{{ block.title }}</span>
    </template>

    <Teleport to="body">
      <div
        v-show="showInfoPopover"
        ref="popoverRef"
        class="agenda-card-info-popover fixed z-[100] max-w-[min(90vw,320px)] rounded-lg border border-app-border bg-[var(--chrome-surface)] px-3 py-2.5 shadow-lg"
        :style="popoverStyle"
        role="tooltip"
        @click.stop
      >
        <template v-if="isAppointmentItem">
          <div class="space-y-1.5 text-left">
            <div class="font-semibold text-[#333333]">
              {{ clientName && clientName !== '—' ? clientName : serviceName }}
            </div>
            <div class="text-xs text-[#333333] opacity-90">
              {{ serviceName !== '—' ? serviceName : '' }}
            </div>
            <div v-if="memberName" class="text-xs text-[#333333] opacity-80">👤 {{ memberName }}</div>
            <div class="text-xs text-[#333333] opacity-90">
              {{ appointmentItem ? formatTime(appointmentItem.start) : '' }}
              {{ appointmentItem ? ` – ${formatTime(appointmentItem.end)}` : '' }}
            </div>
            <div class="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs">
              <span class="font-medium text-[#333333]">{{ servicePriceFormatted }}</span>
              <span
                class="rounded px-1.5 font-medium"
                :class="isAppointmentCancelled ? 'bg-red-100 text-red-600' : 'bg-white/80 text-app-text'"
              >{{ appointmentStatusLabel }}</span>
              <span v-if="isAppointmentPaid" class="text-[#333333]">💰 {{ t('scheduler.paid') }}</span>
              <span v-if="isUnpaidPast" class="text-red-600 font-medium">💸 {{ t('scheduler.unpaidPastHint') }}</span>
              <span v-if="isAppointmentAtHome" class="text-[#333333]">🏠 {{ t('scheduler.atHome') }}</span>
            </div>
            <div v-if="isAppointmentCancelled && cancellationReason" class="text-xs italic text-red-600">
              {{ cancellationReason }}
            </div>
            <p v-if="appointmentItem?.notes" class="text-xs text-[#333333] opacity-80 line-clamp-2 pt-0.5">
              {{ appointmentItem.notes }}
            </p>
          </div>
        </template>
        <template v-else-if="block">
          <div class="space-y-1 text-left">
            <div class="font-semibold text-[#616161]">{{ block.title }}</div>
            <div class="text-xs text-[#616161] opacity-90">
              {{ formatTime(block.start) }} – {{ formatTime(block.end) }}
            </div>
            <div v-if="block.description || blockServiceName" class="text-xs text-[#616161] opacity-90">
              {{ blockServiceName || block.description }}
            </div>
            <div v-if="memberName" class="text-xs text-[#616161] opacity-80">👤 {{ memberName }}</div>
            <span
              v-if="block.status === 'pending'"
              class="inline-block mt-1 text-xs bg-white/70 px-1.5 py-0.5 rounded"
            >
              {{ $t('scheduler.pendingConfirmation') }}
            </span>
          </div>
        </template>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
  import { computed, ref, watch, onMounted, onUnmounted } from "vue";
  import type { ScheduleBlock, AgendaItem } from "@/interfaces";
  import { isAppointment } from "@/interfaces";
  import { useClientStore } from "@/stores/client";
  import { useServiceStore } from "@/stores/service";
  import { useTeamStore } from "@/stores/team";
  import { useI18n } from "vue-i18n";
  import { useBlockPosition } from "@/composables/useBlockPosition";
  import { formatTime } from "@/composables/useScheduleDates";
  import { useScheduleDrag } from "@/composables/useScheduleDrag";

  interface BlockCardProps {
    item: AgendaItem;
    startHour: number;
    pixelsPerHour: number;
    topOffset?: number;
    overlapLeft?: number;
    overlapWidth?: number;
  }

  const props = withDefaults(defineProps<BlockCardProps>(), { topOffset: 0 });

  const emit = defineEmits<{ (e: "click"): void }>();

  const { t } = useI18n();
  const clientStore = useClientStore();
  const serviceStore = useServiceStore();
  const teamStore = useTeamStore();
  const scheduleDrag = useScheduleDrag();

  const cardRef = ref<HTMLElement | null>(null);
  const popoverRef = ref<HTMLElement | null>(null);
  const showInfoPopover = ref(false);
  const popoverStyle = ref<Record<string, string>>({});
  const hoverTimeout = ref<ReturnType<typeof setTimeout> | null>(null);
  const openedByTouch = ref(false);

  const updatePopoverPosition = () => {
    const el = cardRef.value;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const gap = 8;
    const preferAbove = rect.top > window.innerHeight / 2;
    if (preferAbove) {
      popoverStyle.value = {
        bottom: `${window.innerHeight - rect.top + gap}px`,
        left: `${Math.max(8, Math.min(rect.left, window.innerWidth - 320))}px`,
      };
    } else {
      popoverStyle.value = {
        top: `${rect.bottom + gap}px`,
        left: `${Math.max(8, Math.min(rect.left, window.innerWidth - 320))}px`,
      };
    }
  };

  const openPopover = () => {
    if (isBeingDragged.value) return;
    updatePopoverPosition();
    showInfoPopover.value = true;
  };

  const closePopover = () => {
    showInfoPopover.value = false;
    openedByTouch.value = false;
    if (hoverTimeout.value) {
      clearTimeout(hoverTimeout.value);
      hoverTimeout.value = null;
    }
  };

  const onMouseEnter = () => {
    if (hoverTimeout.value) clearTimeout(hoverTimeout.value);
    hoverTimeout.value = setTimeout(openPopover, 400);
  };

  const onMouseLeave = () => {
    if (hoverTimeout.value) {
      clearTimeout(hoverTimeout.value);
      hoverTimeout.value = null;
    }
    if (!openedByTouch.value) showInfoPopover.value = false;
  };

  const handleClickOutside = (e: MouseEvent) => {
    const target = e.target as Node;
    if (
      showInfoPopover.value
      && popoverRef.value
      && !popoverRef.value.contains(target)
      && cardRef.value
      && !cardRef.value.contains(target)
    ) {
      closePopover();
    }
  };

  watch(showInfoPopover, (visible) => {
    if (visible) {
      requestAnimationFrame(updatePopoverPosition);
      document.addEventListener("click", handleClickOutside, true);
    } else {
      document.removeEventListener("click", handleClickOutside, true);
    }
  });

  onMounted(() => {
    window.addEventListener("scroll", updatePopoverPosition, true);
    window.addEventListener("resize", updatePopoverPosition);
  });

  onUnmounted(() => {
    closePopover();
    document.removeEventListener("click", handleClickOutside, true);
    window.removeEventListener("scroll", updatePopoverPosition, true);
    window.removeEventListener("resize", updatePopoverPosition);
  });

  const isAppointmentItem = computed(() => isAppointment(props.item));
  const appointmentItem = computed(() => (isAppointment(props.item) ? props.item : null));
  const block = computed(() => (isAppointmentItem.value ? null : (props.item as ScheduleBlock)));

  const clientName = computed(() => {
    const apt = appointmentItem.value;
    if (!apt) return "";
    if (apt.clientId) {
      const client = clientStore.getClientById(apt.clientId);
      return client?.name ?? "—";
    }
    return apt.clientName?.trim() ?? "—";
  });

  const serviceName = computed(() => {
    const apt = appointmentItem.value;
    if (!apt) return "";
    if (!apt.serviceId) return "—";
    const service = serviceStore.getServiceById(apt.serviceId);
    return service?.name ?? "—";
  });

  const blockServiceName = computed(() => {
    const currentBlock = block.value;
    const id = currentBlock?.serviceId;
    if (!id) return "";
    const service = serviceStore.getServiceById(id);
    return service ? `📋 ${service.name}` : "";
  });

  const memberName = computed(() => {
    const memberId = isAppointmentItem.value
      ? appointmentItem.value?.memberId
      : block.value?.memberId;
    if (!memberId) return "";
    return teamStore.members.find((member) => member.id === memberId)?.name ?? "";
  });

  const servicePrice = computed(() => {
    const apt = appointmentItem.value;
    if (!apt || !apt.serviceId) return 0;
    const service = serviceStore.getServiceById(apt.serviceId);
    return service?.price ?? 0;
  });

  const servicePriceFormatted = computed(() =>
    servicePrice.value > 0 ? `${servicePrice.value} €` : "",
  );

  const isAppointmentCancelled = computed(() => (appointmentItem.value?.status ?? "") === "cancelled");
  const isAppointmentConfirmed = computed(() => (appointmentItem.value?.status ?? "") === "confirmed");
  const isAppointmentNoShow = computed(() => appointmentItem.value?.status === "no_show");
  const isAppointmentCompleted = computed(() => appointmentItem.value?.status === "completed");
  const isAppointmentAtHome = computed(() => appointmentItem.value?.isAtHome === true);
  const isAppointmentPaid = computed(() => (appointmentItem.value?.paymentStatus ?? "pending") === "paid");
  const cancellationReason = computed(() => appointmentItem.value?.cancellationReason ?? "");

  const isUnpaidPast = computed(() => {
    const apt = appointmentItem.value;
    if (!apt) return false;
    const isPast = new Date(apt.end).getTime() < Date.now();
    const unpaid = (apt.paymentStatus ?? "pending") === "pending";
    const active = apt.status !== "cancelled" && apt.status !== "no_show";
    return isPast && unpaid && active;
  });

  const appointmentStatusLabel = computed(() => {
    if (isAppointmentCancelled.value) return t("scheduler.cancelled");
    if (isAppointmentNoShow.value) return t("scheduler.noShow");
    if (isAppointmentCompleted.value) return t("scheduler.completedStatus");
    return isAppointmentConfirmed.value ? t("scheduler.confirmed") : t("scheduler.pending");
  });

  const appointmentStatusIcon = computed(() => {
    if (isAppointmentCancelled.value) return "✕";
    if (isAppointmentNoShow.value) return "👤✕";
    if (isAppointmentCompleted.value) return "✓";
    if (isAppointmentConfirmed.value) return "✓";
    return "⏳";
  });

  const isItemCancelled = computed(() =>
    isAppointmentItem.value
      ? isAppointmentCancelled.value || isAppointmentNoShow.value
      : block.value?.status === "cancelled",
  );

  const canDrag = computed(() => !isItemCancelled.value);

  const isBeingDragged = computed(
    () => scheduleDrag.moving.value && scheduleDrag.item.value?.id === props.item.id,
  );

  const dragLabel = computed(() => {
    if (isAppointmentItem.value) {
      return clientName.value && clientName.value !== "—" ? clientName.value : serviceName.value;
    }
    return block.value?.title ?? "";
  });

  const onPointerDown = (e: PointerEvent) => {
    if (e.button !== 0 || !canDrag.value) return;
    e.preventDefault();
    scheduleDrag.begin(props.item, e, dragLabel.value);
  };

  const onPointerMove = (e: PointerEvent) => {
    scheduleDrag.update(e);
  };

  const onClick = (e: MouseEvent) => {
    e.stopPropagation();
    if (scheduleDrag.lastDraggedId.value === props.item.id) return;
    const canHover = window.matchMedia("(hover: hover)").matches;
    if (canHover) {
      emit("click");
      return;
    }
    if (showInfoPopover.value && openedByTouch.value) {
      closePopover();
      emit("click");
      return;
    }
    openedByTouch.value = true;
    openPopover();
  };

  const itemClass = computed(() => {
    if (isAppointment(props.item)) return "text-[#333333]";
    return "text-[#616161]";
  });

  const appointmentCardStyle = computed(() => {
    const apt = props.item as import("@/interfaces").Appointment;
    const resolveColor = () => {
      if (apt.status === "cancelled") return "var(--apt-cancelled-bg)";
      if (apt.status === "no_show") return "var(--apt-noshow-bg, #FED7AA)";
      if (apt.status === "completed") return "var(--apt-completed-bg, #BBF7D0)";
      if (apt.isVIP) return "var(--apt-vip-bg)";
      if (apt.isAtHome) return "var(--apt-athome-bg)";
      return "var(--apt-normal-bg)";
    };
    const bgColor = resolveColor();
    const dimmed = apt.status === "cancelled" || apt.status === "no_show";
    return {
      backgroundColor: bgColor,
      borderLeftColor: bgColor,
      color: dimmed ? "var(--apt-cancelled-text)" : "var(--apt-normal-text)",
    };
  });

  const blockCardStyle = computed(() => ({
    background: "repeating-linear-gradient(-45deg, #F5F5F5, #F5F5F5 4px, #EEEEEE 4px, #EEEEEE 8px)",
    borderLeftColor: "#EEEEEE",
    color: "var(--block-internal-text)",
  }));

  const GAP = 2; // px between overlapping cards

  const overlapStyle = computed(() => {
    if (props.overlapLeft === undefined || props.overlapWidth === undefined) {
      return { left: "4px", right: "4px" };
    }
    return {
      left: `calc(${props.overlapLeft * 100}% + ${GAP}px)`,
      width: `calc(${props.overlapWidth * 100}% - ${GAP * 2}px)`,
      right: "auto",
    };
  });

  const cardStyleWithColors = computed(() => {
    const base = position.cardStyle.value as Record<string, string>;
    const colors = isAppointment(props.item) ? appointmentCardStyle.value : blockCardStyle.value;
    return { ...base, ...colors, ...overlapStyle.value };
  });

  const position = useBlockPosition(
    () => props.item,
    () => props.startHour,
    () => props.pixelsPerHour,
    () => props.topOffset,
  );
</script>
