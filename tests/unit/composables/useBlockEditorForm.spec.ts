import { describe, it, expect, vi } from "vitest";
import { useBlockEditorForm } from "@/composables/useBlockEditorForm";
import type { BlockEditorModalProps } from "@/interfaces/components";

describe("useBlockEditorForm", () => {
  it("should_initialize_form_from_editBlock", () => {
    const emit = vi.fn();
    const props: BlockEditorModalProps = {
      isOpen: true,
      editBlock: {
        id: "b1",
        therapistId: "th-1",
        start: "2025-02-03T09:00:00.000Z",
        end: "2025-02-03T10:30:00.000Z",
        type: "work",
        title: "Turno Mañana",
        description: "Notas",
      },
    };
    const { form, isEditing, modalTitle } = useBlockEditorForm(props, emit);
    expect(form.title).toBe("Turno Mañana");
    expect(form.type).toBe("work");
    expect(form.description).toBe("Notas");
    expect(isEditing.value).toBe(true);
    expect(modalTitle.value).toContain("Editar");
  });

  it("should_initialize_form_from_initialHour_when_new_block", () => {
    const emit = vi.fn();
    const props: BlockEditorModalProps = { isOpen: true, initialHour: 14 };
    const { form, isEditing } = useBlockEditorForm(props, emit);
    expect(form.startTime).toMatch(/14:00/);
    expect(form.endTime).toMatch(/15:00/);
    expect(form.type).toBe("work");
    expect(isEditing.value).toBe(false);
  });

  it("should_set_error_when_startTime_after_endTime_on_save", () => {
    const emit = vi.fn();
    const props: BlockEditorModalProps = { isOpen: true, initialHour: 9 };
    const { form, save, error } = useBlockEditorForm(props, emit);
    form.startTime = "10:00";
    form.endTime = "09:00";
    save();
    expect(error.value).toBeTruthy();
    expect(emit).not.toHaveBeenCalled();
  });

  it("should_emit_save_with_form_data_when_valid", () => {
    const emit = vi.fn();
    const props: BlockEditorModalProps = { isOpen: true, initialHour: 9 };
    const { form, save } = useBlockEditorForm(props, emit);
    form.title = "Mi turno";
    form.type = "work";
    form.startTime = "09:00";
    form.endTime = "10:00";
    save();
    expect(emit).toHaveBeenCalledWith(
      "save",
      expect.objectContaining({
        title: "Mi turno",
        type: "work",
        start: "09:00",
        end: "10:00",
      }),
    );
  });
});
