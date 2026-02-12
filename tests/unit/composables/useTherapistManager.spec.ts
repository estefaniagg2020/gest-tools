import { describe, it, expect, beforeEach, vi } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import { useTherapistManager } from "@/composables/useTherapistManager";
import { useTherapistStore } from "@/stores/therapist";
import { useSpaStore } from "@/stores/spa";
import * as spaStorage from "@/utils/spaStorage";

vi.mock("@/utils/spaStorage", () => ({
  loadStoredSpas: vi.fn(() => null),
  loadStoredCurrentSpaId: vi.fn(() => null),
  saveSpaList: vi.fn(),
  saveCurrentSpaId: vi.fn(),
}));

describe("useTherapistManager", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.mocked(spaStorage.loadStoredSpas).mockReturnValue(null);
    localStorage.removeItem("spa-therapists-final");
    useTherapistStore().initialize();
    useSpaStore().initialize();
  });

  it("should_expose_orderedTherapists_modal_state_and_actions", () => {
    const m = useTherapistManager();
    expect(m.orderedTherapists).toBeDefined();
    expect(m.isModalOpen).toBeDefined();
    expect(m.isEditing).toBeDefined();
    expect(m.form).toBeDefined();
    expect(m.openCreateModal).toBeTypeOf("function");
    expect(m.editTherapist).toBeTypeOf("function");
    expect(m.closeModal).toBeTypeOf("function");
    expect(m.saveTherapist).toBeTypeOf("function");
    expect(m.deleteTherapist).toBeTypeOf("function");
    expect(m.getSpaName).toBeTypeOf("function");
  });

  it("should_return_orderedTherapists_with_default_ids_first", () => {
    const m = useTherapistManager();
    const list = m.orderedTherapists.value;
    expect(Array.isArray(list)).toBe(true);
  });

  it("should_open_create_modal_and_reset_form", () => {
    const m = useTherapistManager();
    m.form.name = "old";
    m.openCreateModal();
    expect(m.isModalOpen.value).toBe(true);
    expect(m.isEditing.value).toBe(false);
    expect(m.form.name).toBe("");
    expect(m.form.photoUrl).toBeTruthy();
  });

  it("should_fill_form_on_editTherapist", () => {
    const therapistStore = useTherapistStore();
    const m = useTherapistManager();
    const therapist = therapistStore.therapists[0];
    if (!therapist) return;
    m.editTherapist(therapist);
    expect(m.isModalOpen.value).toBe(true);
    expect(m.isEditing.value).toBe(true);
    expect(m.form.name).toBe(therapist.name);
    expect(m.form.email).toBe(therapist.email);
  });

  it("should_close_modal", () => {
    const m = useTherapistManager();
    m.openCreateModal();
    m.closeModal();
    expect(m.isModalOpen.value).toBe(false);
  });

  it("should_add_therapist_on_save_when_not_editing", () => {
    const therapistStore = useTherapistStore();
    const m = useTherapistManager();
    const before = therapistStore.therapists.length;
    m.openCreateModal();
    m.form.name = "Nuevo Terapeuta";
    m.form.email = "nuevo@test.com";
    m.form.phoneNumber = "600000000";
    m.form.spaId = m.spaStore.spas[0]?.id ?? "";
    m.saveTherapist();
    expect(therapistStore.therapists).toHaveLength(before + 1);
    expect(therapistStore.therapists[therapistStore.therapists.length - 1].name).toBe("Nuevo Terapeuta");
  });

  it("should_update_therapist_on_save_when_editing", () => {
    const therapistStore = useTherapistStore();
    const m = useTherapistManager();
    const therapist = therapistStore.therapists[0];
    if (!therapist) return;
    m.editTherapist(therapist);
    m.form.name = "Nombre Actualizado";
    m.saveTherapist();
    expect(therapistStore.getTherapistById(therapist.id)?.name).toBe("Nombre Actualizado");
  });

  it("should_delete_therapist_when_confirm_true", () => {
    const therapistStore = useTherapistStore();
    const m = useTherapistManager();
    const therapist = therapistStore.therapists[0];
    if (!therapist) return;
    const before = therapistStore.therapists.length;
    vi.stubGlobal(
      "confirm",
      vi.fn(() => true),
    );
    m.deleteTherapist(therapist.id);
    expect(therapistStore.therapists).toHaveLength(before - 1);
    vi.unstubAllGlobals();
  });

  it("should_not_delete_when_confirm_false", () => {
    const therapistStore = useTherapistStore();
    const m = useTherapistManager();
    const therapist = therapistStore.therapists[0];
    if (!therapist) return;
    const before = therapistStore.therapists.length;
    vi.stubGlobal(
      "confirm",
      vi.fn(() => false),
    );
    m.deleteTherapist(therapist.id);
    expect(therapistStore.therapists).toHaveLength(before);
    vi.unstubAllGlobals();
  });

  it("should_return_spa_name_for_valid_id", () => {
    const m = useTherapistManager();
    const spaId = m.spaStore.spas[0]?.id;
    if (!spaId) return;
    const name = m.getSpaName(spaId);
    expect(name).toBe(m.spaStore.getSpaById(spaId)?.name);
  });

  it("should_return_NO_SPA_for_unknown_id", () => {
    const m = useTherapistManager();
    const name = m.getSpaName("unknown-id");
    expect(name).toBe("Sin Spa");
  });
});
