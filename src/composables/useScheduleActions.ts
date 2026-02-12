import { useAuthStore } from "@/stores/auth";
import { useScheduleStore } from "@/stores/schedule";
import { useToast } from "@/composables/useToast";
import { SCHEDULER_CONSTANTS } from "@/data/constants";
import { AUTH_CONFIG } from "@/data/authConfig";
import type { ScheduleBlock, ScheduleBlockType } from "@/interfaces";

type BlockStatus = NonNullable<ScheduleBlock["status"]>;

export const useScheduleActions = () => {
  const authStore = useAuthStore();
  const scheduleStore = useScheduleStore();
  const { addToast } = useToast();

  const createDateAtTime = (baseDate: Date, timeStr: string): Date => {
    const [hours, minutes] = timeStr.split(":").map(Number);
    const date = new Date(baseDate);
    date.setHours(hours, minutes, 0, 0);
    return date;
  };

  const notify = () => {
    const isManager = authStore.currentRole === AUTH_CONFIG.ROLE_MANAGER;
    const message = isManager ? SCHEDULER_CONSTANTS.SAVE_SUCCESS_MSG : SCHEDULER_CONSTANTS.SAVE_PENDING_MSG;
    const type = isManager ? "success" : "info";
    addToast(message, type);
  };

  const updateExistingBlock = (editingBlock: ScheduleBlock, data: Partial<ScheduleBlock>, status: BlockStatus) => {
    const baseDate = new Date(editingBlock.start);
    const start = createDateAtTime(baseDate, data.start as string);
    const end = createDateAtTime(baseDate, data.end as string);

    scheduleStore.updateBlock(editingBlock.id, {
      ...data,
      start: start.toISOString(),
      end: end.toISOString(),
      status,
    });
  };

  const createNewBlock = (therapistId: string, baseDate: Date, data: Partial<ScheduleBlock>, status: BlockStatus) => {
    const start = createDateAtTime(baseDate, data.start as string);
    const end = createDateAtTime(baseDate, data.end as string);

    const blockType: ScheduleBlockType = data.type ?? "work";

    scheduleStore.addBlock({
      therapistId,
      type: blockType,
      title: data.title ?? SCHEDULER_CONSTANTS.DEFAULT_EVENT_TITLE,
      description: data.description,
      start: start.toISOString(),
      end: end.toISOString(),
      status,
    });
  };

  const saveBlock = (params: {
    data: Partial<ScheduleBlock>;
    therapistId: string;
    currentDate: Date;
    selectedDate?: Date;
    editingBlock?: ScheduleBlock;
    onSuccess: () => void;
  }) => {
    const { data, therapistId, currentDate, selectedDate, editingBlock, onSuccess } = params;

    if (!therapistId) return;

    const newStatus: BlockStatus =
      authStore.currentRole === AUTH_CONFIG.ROLE_MANAGER
        ? SCHEDULER_CONSTANTS.STATUS_CONFIRMED
        : SCHEDULER_CONSTANTS.STATUS_PENDING;
    notify();

    if (editingBlock) {
      updateExistingBlock(editingBlock, data, newStatus);
    } else {
      const baseDate = selectedDate ? new Date(selectedDate) : new Date(currentDate);
      createNewBlock(therapistId, baseDate, data, newStatus);
    }

    onSuccess();
  };

  return {
    saveBlock,
  };
};
