import { reactive, ref, computed, watch } from "vue";
import type { ScheduleBlock, ScheduleBlockType } from "@/interfaces";
import type { BlockEditorModalProps } from "@/interfaces/components";
import { BLOCK_EDITOR_LABELS, BLOCK_EDITOR_TYPE_OPTIONS } from "@/data/blockEditorConfig";

export interface BlockEditorFormState {
  title: string;
  type: ScheduleBlockType;
  startTime: string;
  endTime: string;
  description: string;
}

const getInitialForm = (modalProps: BlockEditorModalProps): BlockEditorFormState => {
  if (modalProps.editBlock) {
    const start = new Date(modalProps.editBlock.start);
    const end = new Date(modalProps.editBlock.end);
    return {
      title: modalProps.editBlock.title,
      type: modalProps.editBlock.type,
      description: modalProps.editBlock.description || "",
      startTime: start.toTimeString().slice(0, 5),
      endTime: end.toTimeString().slice(0, 5),
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
    description: "",
    startTime: formatDecimalHour(hour),
    endTime: formatDecimalHour(hour + 1),
  };
};

export const useBlockEditorForm = (
  props: BlockEditorModalProps,
  emit: { (e: "save", data: Partial<ScheduleBlock>): void },
) => {
  const form = reactive<BlockEditorFormState>(getInitialForm(props));
  const error = ref("");

  watch(
    () => [props.editBlock, props.initialHour],
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
      description: form.description,
      start: form.startTime,
      end: form.endTime,
    });
  };

  return {
    form,
    error,
    isEditing,
    modalTitle,
    submitLabel,
    types: BLOCK_EDITOR_TYPE_OPTIONS,
    labels: BLOCK_EDITOR_LABELS,
    save,
  };
};
