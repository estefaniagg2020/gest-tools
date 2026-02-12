import { describe, it, expect, beforeEach } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import { useTherapistStore } from "@/stores/therapist";

const STORAGE_KEY = "spa-therapists-final";

describe("useTherapistStore", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    localStorage.removeItem(STORAGE_KEY);
  });

  it("should_initialize_with_default_therapists_when_nothing_stored", () => {
    const store = useTherapistStore();
    store.initialize();
    expect(store.therapists.length).toBeGreaterThan(0);
  });

  it("should_add_therapist_with_generated_id_and_color", () => {
    const store = useTherapistStore();
    store.initialize();
    const before = store.therapists.length;
    store.addTherapist({
      name: "New Therapist",
      photoUrl: "",
      phoneNumber: "",
      email: "new@test.com",
      weeklyHours: 40,
      spaId: "spa-1",
    });
    expect(store.therapists).toHaveLength(before + 1);
    const added = store.therapists[store.therapists.length - 1];
    expect(added.id).toBeDefined();
    expect(added.color).toBeDefined();
    expect(added.role).toBe("therapist");
  });

  it("should_update_therapist", () => {
    const store = useTherapistStore();
    store.initialize();
    const id = store.therapists[0]?.id ?? "";
    store.updateTherapist(id, { name: "Updated Name" });
    expect(store.getTherapistById(id)?.name).toBe("Updated Name");
  });

  it("should_delete_therapist", () => {
    const store = useTherapistStore();
    store.initialize();
    const id = store.therapists[0]?.id ?? "";
    const before = store.therapists.length;
    store.deleteTherapist(id);
    expect(store.therapists).toHaveLength(before - 1);
  });

  it("should_get_therapist_by_id", () => {
    const store = useTherapistStore();
    store.initialize();
    const id = store.therapists[0]?.id ?? "";
    const t = store.getTherapistById(id);
    expect(t?.id).toBe(id);
  });
});
