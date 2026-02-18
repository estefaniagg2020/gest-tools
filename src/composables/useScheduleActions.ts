import { useI18n } from "vue-i18n";
import { useAuthStore } from "@/stores/auth";
import { useScheduleStore } from "@/stores/schedule";
import { useToast } from "@/composables/useToast";
import { AUTH_CONFIG } from "@/data/authConfig";
import type { ScheduleBlock, ScheduleBlockType } from "@/interfaces";

type BlockStatus = NonNullable<ScheduleBlock["status"]>;

export const useScheduleActions = () => {
  const { t } = useI18n();
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
    const message = isManager ? t("scheduler.saveSuccess") : t("scheduler.savePending");
    const type = isManager ? "success" : "info";
    addToast(message, type);
  };

  const updateExistingBlock = (
    editingBlock: ScheduleBlock,
    data: Partial<ScheduleBlock>,
    status: BlockStatus,
    selectedDate?: Date,
  ) => {
    const baseDate = selectedDate ?? new Date(editingBlock.start);
    const start = createDateAtTime(baseDate, data.start as string);
    const end = createDateAtTime(baseDate, data.end as string);

    scheduleStore.updateBlock(editingBlock.id, {
      ...data,
      start: start.toISOString(),
      end: end.toISOString(),
      status,
      serviceId: data.serviceId,
    });
  };

  const createNewBlock = (memberId: string, baseDate: Date, data: Partial<ScheduleBlock>, status: BlockStatus) => {
    const start = createDateAtTime(baseDate, data.start as string);
    const end = createDateAtTime(baseDate, data.end as string);

    const blockType: ScheduleBlockType = data.type ?? "work";

    scheduleStore.addBlock({
      memberId,
      type: blockType,
      title: data.title ?? t("scheduler.defaultEventTitle"),
      description: data.description,
      start: start.toISOString(),
      end: end.toISOString(),
      status,
      serviceId: data.serviceId,
    });
  };

  const saveBlock = (params: {
    data: Partial<ScheduleBlock>;
    memberId: string;
    currentDate: Date;
    selectedDate?: Date;
    editingBlock?: ScheduleBlock;
    onSuccess: () => void;
  }) => {
    const { data, memberId, currentDate, selectedDate, editingBlock, onSuccess } = params;

    if (!memberId) return;

    const newStatus: BlockStatus =
      authStore.currentRole === AUTH_CONFIG.ROLE_MANAGER
        ? ("confirmed" as const)
        : ("pending" as const);
    notify();

    if (editingBlock) {
      updateExistingBlock(editingBlock, data, newStatus, selectedDate);
    } else {
      const baseDate = selectedDate ? new Date(selectedDate) : new Date(currentDate);
      createNewBlock(memberId, baseDate, data, newStatus);
    }

    onSuccess();
  };

  return {
    saveBlock,
  };
};
