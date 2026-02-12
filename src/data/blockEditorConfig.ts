import type { ScheduleBlockType } from "@/interfaces";

export const BLOCK_EDITOR_LABELS = {
  MODAL_TITLE_EDIT: "Editar Bloque",
  MODAL_TITLE_NEW: "Nuevo Bloque",
  LABEL_TITLE: "Título",
  PLACEHOLDER_TITLE: "ej. Turno Mañana",
  LABEL_ACTIVITY_TYPE: "Tipo de Actividad",
  LABEL_DATE: "Día",
  LABEL_START: "Inicio",
  LABEL_END: "Fin",
  LABEL_NOTES: "Notas (Opcional)",
  BTN_DELETE: "Eliminar",
  BTN_CANCEL: "Cancelar",
  BTN_SAVE: "Guardar",
  BTN_ADD: "Añadir",
  ERROR_END_BEFORE_START: "La hora de fin debe ser posterior a la de inicio",
  DEFAULT_EVENT_LABEL: "Evento",
} as const;

export interface BlockEditorTypeOption {
  value: ScheduleBlockType;
  label: string;
  icon: string;
  activeClass: string;
}

export const BLOCK_EDITOR_TYPE_OPTIONS: BlockEditorTypeOption[] = [
  { value: "work", label: "Trabajo", icon: "💼", activeClass: "border-[#017074] bg-[#017074]/10 text-[#017074]" },
  {
    value: "vacation",
    label: "Vacaciones",
    icon: "🏖️",
    activeClass: "border-[#db7f50] bg-[#db7f50]/10 text-[#db7f50]",
  },
  { value: "training", label: "Formación", icon: "📚", activeClass: "border-[#7f8563] bg-[#7f8563]/10 text-[#7f8563]" },
  { value: "admin", label: "Admin", icon: "⚙️", activeClass: "border-[#f6c8ae] bg-[#f6c8ae]/20 text-[#db7f50]" },
];
