<template>
  <div class="flex flex-col h-full agenda-grid-bg rounded-xl overflow-hidden border border-app-border-subtle shadow-(--shadow-card)">
    <div class="flex border-b border-app-border-subtle bg-app-surface">
      <div class="w-16 shrink-0 border-r border-app-border-subtle bg-app-surface z-20"></div>
      <div class="flex-1 flex overflow-hidden">
        <div
          v-for="member in members"
          :key="member.id"
          class="flex-1 py-3 text-center border-r border-app-border-subtle last:border-0 min-w-[150px]"
          :style="{ backgroundColor: member.color || 'var(--color-app-bg)', color: 'var(--color-app-title)' }"
        >
          <div class="font-semibold truncate px-2 text-app-title">{{ member.name.split(" ")[0] }}</div>
          <div class="text-xs text-app-text/80">{{ member.weeklyHours }}h</div>
        </div>
      </div>
    </div>

    <div class="flex-1 min-h-0 overflow-y-auto relative custom-scrollbar">
      <div
        class="flex relative"
        :style="{ height: gridContentHeight + 'px' }"
      >
        <div
          v-if="workingHoursStyle"
          class="absolute left-0 right-0 z-0 pointer-events-none bg-brand-primary/4"
          :style="workingHoursStyle"
        />
        <div
          v-if="currentTimeStyle"
          class="absolute left-0 right-0 z-5 h-0.5 bg-brand-primary pointer-events-none"
          :style="currentTimeStyle"
        >
          <span class="absolute -top-1 left-0 w-2 h-2 rounded-full bg-brand-primary" />
        </div>
        <div class="w-16 shrink-0 border-r border-app-border-subtle agenda-grid-bg z-10 sticky left-0">
          <div
            v-for="slotStart in gridSlotStarts"
            :key="slotStart"
            class="absolute w-full text-center text-xs text-app-text/70 -mt-2.5"
            :style="{ top: topOffset + (slotStart - props.startHour) * props.pixelsPerHour + 'px' }"
          >
            {{ grid.formatSlotLabel(slotStart) }}
          </div>
        </div>
        <div class="flex-1 flex relative z-2">
          <div
            v-for="(member, memberIndex) in members"
            :key="member.id"
            :ref="(el) => setMemberRef(el as HTMLElement | null, memberIndex)"
            class="flex-1 relative border-r border-app-border-subtle last:border-0 min-w-[150px] group cursor-default"
            @click="handleGridClick($event, member.id)"
            @pointermove="scheduleDrag.update($event)"
          >
            <div
              v-for="slotStart in gridSlotStarts"
              :key="slotStart"
              class="absolute w-full border-b border-app-border-subtle pointer-events-none"
              :style="{ top: topOffset + (slotStart - props.startHour) * props.pixelsPerHour + 'px' }"
            ></div>

            <BlockCard
              v-for="item in filterAgendaItemsByDayAndMember(props.items, props.date, member.id)"
              :key="item.id"
              :item="item"
              :start-hour="props.startHour"
              :pixels-per-hour="props.pixelsPerHour"
              :top-offset="topOffset"
              :overlap-left="overlapMap.get(item.id)?.left"
              :overlap-width="overlapMap.get(item.id)?.width"
              @click.stop="$emit('item-click', item)"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed, onMounted, onUnmounted, ref } from "vue";
  import { useScheduleGrid } from "@/composables/useScheduleGrid";
  import { filterAgendaItemsByDayAndMember } from "@/composables/useScheduleBlocks";
  import { computeOverlapLayout } from "@/composables/useOverlapLayout";
  import { isToday } from "@/composables/useScheduleDates";
  import { useScheduleDrag } from "@/composables/useScheduleDrag";
  import type { AgendaItem, TeamMember } from "@/interfaces";
  import { isAppointment, isScheduleBlock } from "@/interfaces";
  import BlockCard from "./BlockCard.vue";

  const WORK_START = 8;
  const WORK_END = 20;

  const props = withDefaults(
    defineProps<{
      date: Date;
      items: AgendaItem[];
      members: TeamMember[];
      startHour?: number;
      endHour?: number;
      pixelsPerHour?: number;
      slotDurationMinutes?: number;
    }>(),
    { startHour: 8, endHour: 22, pixelsPerHour: 90, slotDurationMinutes: 60 },
  );

  const emit = defineEmits<{
    (e: "item-click", item: AgendaItem): void;
    (e: "grid-click", data: { date: Date; hour: number; memberId: string }): void;
    (e: "appointment-move", data: { appointmentId: string; date: Date; hour: number; memberId: string }): void;
    (e: "block-move", data: { blockId: string; date: Date; hour: number; memberId: string }): void;
  }>();

  const grid = useScheduleGrid(
    () => props.startHour,
    () => props.endHour,
    () => props.pixelsPerHour,
    () => props.slotDurationMinutes,
  );

  const TOP_OFFSET_PX = 12;
  const topOffset = TOP_OFFSET_PX;

  const gridSlotStarts = computed((): number[] => grid.slotStarts.value);
  const gridContentHeight = computed(() => grid.totalHeight.value + topOffset);
  const scheduleDrag = useScheduleDrag();

  const overlapMap = computed(() => {
    const result = new Map<string, { left: number; width: number }>();
    for (const member of props.members) {
      const memberItems = filterAgendaItemsByDayAndMember(props.items, props.date, member.id);
      computeOverlapLayout(memberItems).forEach((info, id) => result.set(id, info));
    }
    return result;
  });

  const workingHoursStyle = computed(() => {
    const start = Math.max(props.startHour, WORK_START);
    const end = Math.min(props.endHour, WORK_END);
    if (start >= end) return null;
    const top = topOffset + (start - props.startHour) * props.pixelsPerHour;
    const height = (end - start) * props.pixelsPerHour;
    return { top: `${top}px`, height: `${height}px`, left: 0, right: 0 };
  });

  const currentTimeStyle = computed(() => {
    if (!isToday(props.date)) return null;
    const now = new Date();
    const currentHour = now.getHours() + now.getMinutes() / 60 + now.getSeconds() / 3600;
    if (currentHour < props.startHour || currentHour >= props.endHour) return null;
    const top = topOffset + (currentHour - props.startHour) * props.pixelsPerHour;
    return { top: `${top}px`, left: 0, right: 0 };
  });

  const memberColRefs = ref<(HTMLElement | null)[]>([]);
  const setMemberRef = (el: HTMLElement | null, index: number) => {
    memberColRefs.value[index] = el;
  };

  const getHourFromPoint = (clientY: number, el: HTMLElement): number | null => {
    const rect = el.getBoundingClientRect();
    const y = clientY - rect.top - topOffset;
    if (y < 0) return null;
    const step = (props.slotDurationMinutes ?? 60) / 60;
    const slotIndex = Math.floor(y / props.pixelsPerHour / step);
    const hour = props.startHour + slotIndex * step;
    if (hour >= props.startHour && hour < props.endHour) return Math.round(hour * 100) / 100;
    return null;
  };

  const handleGridClick = (event: MouseEvent, memberId: string) => {
    if (scheduleDrag.moving.value) return;
    const hour = grid.getSlotStartFromClick(event, topOffset);
    if (hour !== null) {
      emit("grid-click", { date: props.date, hour, memberId });
    }
  };

  const onDocumentPointerUp = (e: PointerEvent) => {
    const { item, moved } = scheduleDrag.end();
    if (!item || !moved) return;

    for (let i = 0; i < props.members.length; i++) {
      const el = memberColRefs.value[i];
      if (!el) continue;
      const rect = el.getBoundingClientRect();
      if (
        e.clientX >= rect.left && e.clientX <= rect.right &&
        e.clientY >= rect.top && e.clientY <= rect.bottom
      ) {
        const hour = getHourFromPoint(e.clientY, el);
        const memberId = props.members[i].id;
        if (hour !== null) {
          if (isScheduleBlock(item)) {
            emit("block-move", { blockId: item.id, date: props.date, hour, memberId });
          } else if (isAppointment(item)) {
            emit("appointment-move", { appointmentId: item.id, date: props.date, hour, memberId });
          }
        }
        break;
      }
    }
  };

  onMounted(() => document.addEventListener("pointerup", onDocumentPointerUp));
  onUnmounted(() => document.removeEventListener("pointerup", onDocumentPointerUp));
</script>

<style scoped>
  .custom-scrollbar::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: var(--color-app-border-subtle);
    border-radius: 3px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: var(--color-app-border);
  }
</style>
