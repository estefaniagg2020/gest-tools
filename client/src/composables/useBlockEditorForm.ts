import { reactive, ref, computed, watch } from "vue";
import type { ScheduleBlock, ScheduleBlockType } from "@/interfaces";
import type { BlockEditorModalProps } from "@/interfaces/components";
import { BLOCK_EDITOR_LABELS, BLOCK_EDITOR_TYPE_OPTIONS } from "@/data/blockEditorConfig";
import { useServiceStore } from "@/stores/service";

export interface BlockEditorFormState {
  title: string;
  type: ScheduleBlockType;
  memberId: string;
  startTime: string;
  endTime: string;
  description: string;
  serviceId: string;
}

const getInitialForm = (modalProps: BlockEditorModalProps): BlockEditorFormState => {
  const members = modalProps.members ?? [];
  const firstMemberId = members[0]?.id ?? "";
  if (modalProps.editBlock) {
    const start = new Date(modalProps.editBlock.start);
    const end = new Date(modalProps.editBlock.end);
    return {
      title: modalProps.editBlock.title,
      type: modalProps.editBlock.type,
      memberId: modalProps.editBlock.memberId ?? firstMemberId,
      description: modalProps.editBlock.description || "",
      startTime: start.toTimeString().slice(0, 5),
      endTime: end.toTimeString().slice(0, 5),
      serviceId: modalProps.editBlock.serviceId ?? "",
    };
  }
  const hour = modalProps.initialHour ?? 9;
  const formatDecimalHour = (hours: number) => {
    const integerHours = Math.floor(hours);
    const minutes = Math.round((hours - integerHours) * 60);
    return `${String(integerHours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
  };
  return {
    title: "",
    type: "work",
    memberId: firstMemberId,
    description: "",
    startTime: formatDecimalHour(hour),
    endTime: formatDecimalHour(hour + 1),
    serviceId: "",
  };
};

export const useBlockEditorForm = (
  props: BlockEditorModalProps,
  emit: { (e: "save", data: Partial<ScheduleBlock>): void },
) => {
  const serviceStore = useServiceStore();
  const form = reactive<BlockEditorFormState>(getInitialForm(props));
  const error = ref("");

  watch(
    () => [props.editBlock, props.initialHour, props.members],
    () => {
      Object.assign(form, getInitialForm(props));
      error.value = "";
    },
    { deep: true },
  );

  const isEditing = computed(() => !!props.editBlock);
  const modalTitle = computed(() =>
    isEditing.value ? BLOCK_EDITOR_LABELS.MODAL_TITLE_EDIT : BLOCK_EDITOR_LABELS.MODAL_TITLE_NEW,
  );
  const submitLabel = computed(() => (isEditing.value ? BLOCK_EDITOR_LABELS.BTN_SAVE : BLOCK_EDITOR_LABELS.BTN_ADD));

  const save = () => {
    if (form.startTime >= form.endTime) {
      error.value = BLOCK_EDITOR_LABELS.ERROR_END_BEFORE_START;
      return;
    }
    const label =
      BLOCK_EDITOR_TYPE_OPTIONS.find((o) => o.value === form.type)?.label ?? BLOCK_EDITOR_LABELS.DEFAULT_EVENT_LABEL;
    emit("save", {
      title: form.title || label,
      type: form.type,
      memberId: form.memberId || undefined,
      description: form.description,
      start: form.startTime,
      end: form.endTime,
      serviceId: form.serviceId.trim() || undefined,
    });
  };

  const members = computed(() => props.members ?? []);

  const memberOptions = computed(() =>
    members.value.map((m) => ({ value: m.id, label: m.name })),
  );

  const serviceOptions = computed(() =>
    serviceStore.services.map((s) => ({
      value: s.id,
      label: `${s.name} (${s.duration} min)`,
    })),
  );

  return {
    form,
    error,
    isEditing,
    modalTitle,
    submitLabel,
    types: BLOCK_EDITOR_TYPE_OPTIONS,
    labels: BLOCK_EDITOR_LABELS,
    serviceStore,
    members,
    memberOptions,
    serviceOptions,
    save,
  };
};
