<template>
  <div class="flex flex-col gap-6 pb-6 lg:hidden">
    <section
      v-for="day in weekDays"
      :key="day.toISOString()"
      class="flex flex-col gap-3"
    >
      <h3
        class="text-sm font-bold uppercase tracking-wider sticky top-0 z-10 py-2 bg-[var(--chrome-surface)] border-b border-[var(--chrome-border)] cursor-pointer touch-manipulation select-none rounded-t-lg -mx-1 px-1 hover:bg-app-bg/50 active:bg-app-bg transition-colors"
        :class="dates.isToday(day) ? 'text-brand-accent' : 'text-app-text/70'"
        role="button"
        tabindex="0"
        :aria-label="$t('scheduler.addAppointmentOnDay', { day: dates.formatDayName(day), date: day.getDate() })"
        @click="emit('day-click', day)"
        @keydown.enter="emit('day-click', day)"
        @keydown.space.prevent="emit('day-click', day)"
      >
        {{ dates.formatDayName(day) }} {{ day.getDate() }}
      </h3>

      <div class="relative pl-4 space-y-3">
        <div
          class="absolute left-[7px] top-2 bottom-2 w-0.5 bg-gray-200 rounded-full"
          aria-hidden="true"
        />
        <article
          v-for="item in sortedItemsByDay(day)"
          :key="item.id"
          class="relative flex gap-3 rounded-xl border-0 border-l-4 bg-white shadow-sm overflow-hidden cursor-pointer transition-shadow hover:shadow-md active:scale-[0.99]"
          :class="itemClass(item)"
          @click="onItemClick(item)"
        >
          <div class="flex-1 min-w-0 p-3">
            <div class="flex items-start justify-between gap-2">
              <div class="flex flex-col min-w-0 flex-1">
                <h4 class="font-bold text-[#333333] truncate">{{ itemTitle(item) }}</h4>
                <p v-if="itemSubtitle(item)" class="text-xs text-[#333333] opacity-90 truncate mt-0.5">{{ itemSubtitle(item) }}</p>
              </div>
              <span
                v-if="isBlock(item) && item.status === 'pending'"
                class="shrink-0 text-[10px] bg-white/70 px-1.5 py-0.5 rounded"
                :title="$t('scheduler.pendingConfirmation')"
              >
                ⏳
              </span>
              <span
                v-else-if="isAppointment(item)"
                class="shrink-0 flex items-center gap-0.5"
              >
                <span v-if="item.status === 'confirmed'" class="text-green-600">✓</span>
                <span v-else-if="item.status === 'cancelled'" class="text-red-500">✕</span>
                <span v-else class="text-gray-500">⏳</span>
                <span v-if="item.paymentStatus === 'paid'">💰</span>
              </span>
            </div>
            <p
              v-if="itemDescription(item)"
              class="text-xs text-[#333333] opacity-80 mt-0.5 line-clamp-2"
            >
              {{ itemDescription(item) }}
            </p>
            <p class="text-xs text-gray-600 mt-1.5">
              {{ formatTime(item.start) }} – {{ formatTime(item.end) }}
            </p>
            <p class="text-[10px] text-gray-400 mt-0.5">
              {{ formatDuration(item.start, item.end) }}
            </p>
            <div
              v-if="personForItem(item)"
              class="flex items-center gap-2 mt-2"
            >
              <Avatar
                :name="personForItem(item)!.name"
                :src="personForItem(item)!.photoUrl || undefined"
                :size="24"
                class="ring-1 ring-white shrink-0"
              />
              <span class="text-xs text-gray-600 truncate">{{ personForItem(item)!.name }}</span>
            </div>
          </div>
        </article>
        <button
          v-if="sortedItemsByDay(day).length === 0"
          type="button"
          class="w-full text-left text-xs text-brand-primary py-3 pl-2 rounded-lg border border-dashed border-brand-primary/40 hover:bg-brand-primary/5 hover:border-brand-primary/60 transition-colors touch-manipulation"
          @click="emit('day-click', day)"
        >
          + {{ $t('scheduler.newAppointment') }}
        </button>
      </div>
    </section>
    <div class="h-4 shrink-0" aria-hidden="true" />
  </div>
</template>

<script setup lang="ts">
  import { filterAgendaItemsByDay } from "@/composables/useScheduleBlocks";
  import { useScheduleDates } from "@/composables/useScheduleDates";
  import { getBlockTypeCardStyle } from "@/data/scheduleBlockTypes";
  import type { ScheduleBlock, TeamMember, AgendaItem } from "@/interfaces";
  import { isAppointment } from "@/interfaces";
  import { useClientStore } from "@/stores/client";
  import { useServiceStore } from "@/stores/service";
  import Avatar from "@/components/common/Avatar.vue";

  const props = defineProps<{
    weekDays: Date[];
    items: AgendaItem[];
    members: TeamMember[];
  }>();

  const emit = defineEmits<{
    (e: "block-click", block: ScheduleBlock): void;
    (e: "item-click", item: AgendaItem): void;
    (e: "day-click", day: Date): void;
  }>();

  const dates = useScheduleDates();
  const { formatTime, formatDuration } = dates;
  const clientStore = useClientStore();
  const serviceStore = useServiceStore();

  const typeStyle = (type: ScheduleBlock["type"]) => getBlockTypeCardStyle(type);
  const mobileBlockTypeClass = (type: ScheduleBlock["type"]) => {
    if (type === "work") return "agenda-block-work";
    if (type === "vacation") return "agenda-block-vacation";
    return typeStyle(type).border;
  };

  const sortedItemsByDay = (day: Date): AgendaItem[] => {
    const dayItems = filterAgendaItemsByDay(props.items, day);
    return [...dayItems].sort(
      (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime(),
    );
  };

  const isBlock = (item: AgendaItem): item is ScheduleBlock =>
    "type" in item;

  const itemClass = (item: AgendaItem) => {
    if (isBlock(item)) {
      const base = "border-gray-200";
      const typeClass = mobileBlockTypeClass(item.type);
      const pending = item.status === "pending" ? "border-dashed ring-1 ring-gray-200" : "";
      return [base, typeClass, pending];
    }
    const apt = item as import("@/interfaces").Appointment;
    if (apt.status === "cancelled") return "border-red-200 bg-red-50/50 opacity-75";
    if (apt.isVIP) return "border-purple-300 bg-purple-50/50";
    if (apt.isAtHome) return "border-amber-300 bg-amber-50/50";
    return "border-blue-200 bg-blue-50/30";
  };

  const itemTitle = (item: AgendaItem): string => {
    if (isBlock(item)) return item.title;
    const apt = item as import("@/interfaces").Appointment;
    const serviceName = apt.serviceId
      ? (serviceStore.getServiceById(apt.serviceId)?.name ?? "—")
      : "";
    if (serviceName && serviceName !== "—") return serviceName;
    const clientName = apt.clientId
      ? (clientStore.getClientById(apt.clientId)?.name ?? "—")
      : (apt.clientName ?? "");
    if (clientName && clientName !== "—") return clientName;
    return apt.isAtHome ? "En domicilio" : "—";
  };

  const itemSubtitle = (item: AgendaItem): string | undefined => {
    if (isBlock(item)) return undefined;
    const apt = item as import("@/interfaces").Appointment;
    if (apt.clientId) {
      const name = clientStore.getClientById(apt.clientId)?.name;
      return name && name !== "—" ? name : undefined;
    }
    return apt.clientName ?? undefined;
  };

  const itemDescription = (item: AgendaItem): string | undefined => {
    if (isBlock(item)) return item.description;
    const apt = item as import("@/interfaces").Appointment;
    return apt.notes ?? undefined;
  };

  const personForItem = (item: AgendaItem): { name: string; photoUrl: string } | null => {
    const memberId = "memberId" in item ? item.memberId : undefined;
    if (memberId) {
      const member = props.members.find((m) => m.id === memberId);
      return member ? { name: member.name, photoUrl: member.photoUrl } : null;
    }
    if (isAppointment(item) && item.clientId) {
      const client = clientStore.getClientById(item.clientId);
      return client ? { name: client.name, photoUrl: "" } : null;
    }
    return null;
  };

  const onItemClick = (item: AgendaItem) => {
    if (isBlock(item)) emit("block-click", item);
    else emit("item-click", item);
  };
</script>
