import { describe, it, expect } from "vitest";
import { BLOCK_EDITOR_LABELS, BLOCK_EDITOR_TYPE_OPTIONS } from "@/data/blockEditorConfig";

describe("blockEditorConfig", () => {
  describe("BLOCK_EDITOR_LABELS", () => {
    it("should_have_modal_titles", () => {
      expect(BLOCK_EDITOR_LABELS.MODAL_TITLE_EDIT).toBe("Editar Bloque");
      expect(BLOCK_EDITOR_LABELS.MODAL_TITLE_NEW).toBe("Nuevo Bloque");
    });

    it("should_have_error_message_for_end_before_start", () => {
      expect(BLOCK_EDITOR_LABELS.ERROR_END_BEFORE_START).toBe("La hora de fin debe ser posterior a la de inicio");
    });
  });

  describe("BLOCK_EDITOR_TYPE_OPTIONS", () => {
    it("should_include_work_vacation_training_admin", () => {
      const values = BLOCK_EDITOR_TYPE_OPTIONS.map((o) => o.value);
      expect(values).toContain("work");
      expect(values).toContain("vacation");
      expect(values).toContain("training");
      expect(values).toContain("admin");
    });

    it("should_have_label_icon_and_activeClass_per_option", () => {
      for (const opt of BLOCK_EDITOR_TYPE_OPTIONS) {
        expect(opt).toHaveProperty("value");
        expect(opt).toHaveProperty("label");
        expect(opt).toHaveProperty("icon");
        expect(opt).toHaveProperty("activeClass");
      }
    });
  });
});
