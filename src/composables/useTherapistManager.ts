import { ref, reactive, computed, onMounted } from "vue";
import { useTherapistStore } from "@/stores/therapist";
import { useSpaStore } from "@/stores/spa";
import type { Therapist } from "@/interfaces";
import { THERAPIST_MANAGER } from "@/data/constants";
import { getRandomAnimalAvatarUrl } from "@/utils/avatar";

const DEFAULT_IDS_ORDER = ["1", "2", "3", "4", "5", "6", "7", "8"];

export type TherapistFormState = {
  name: string;
  email: string;
  phoneNumber: string;
  weeklyHours: number;
  photoUrl: string;
  linkedInUrl: string | undefined;
  role: "therapist" | "manager";
  spaId: string;
  defaultWorkStartHour: number;
  defaultWorkEndHour: number;
};

const getInitialForm = (): TherapistFormState => ({
  name: "",
  email: "",
  phoneNumber: "",
  weeklyHours: 40,
  photoUrl: "",
  linkedInUrl: undefined,
  role: "therapist",
  spaId: "",
  defaultWorkStartHour: THERAPIST_MANAGER.DEFAULT_WORK_START_HOUR,
  defaultWorkEndHour: THERAPIST_MANAGER.DEFAULT_WORK_END_HOUR,
});

export const useTherapistManager = () => {
  const store = useTherapistStore();
  const spaStore = useSpaStore();

  const isModalOpen = ref(false);
  const isEditing = ref(false);
  const editingId = ref<string | null>(null);
  const form = reactive<TherapistFormState>(getInitialForm());

  const orderedTherapists = computed(() => {
    const orderIndex = new Map(DEFAULT_IDS_ORDER.map((id, i) => [id, i]));
    return [...store.therapists].sort((a, b) => {
      const ia = orderIndex.get(a.id) ?? Number.MAX_SAFE_INTEGER;
      const ib = orderIndex.get(b.id) ?? Number.MAX_SAFE_INTEGER;
      return ia - ib;
    });
  });

  const resetForm = () => {
    Object.assign(form, getInitialForm());
    form.spaId = spaStore.spas[0]?.id ?? "";
  };

  const openCreateModal = () => {
    isEditing.value = false;
    editingId.value = null;
    resetForm();
    form.photoUrl = getRandomAnimalAvatarUrl();
    isModalOpen.value = true;
  };

  const editTherapist = (therapist: Therapist) => {
    isEditing.value = true;
    editingId.value = therapist.id;
    form.name = therapist.name;
    form.email = therapist.email;
    form.phoneNumber = therapist.phoneNumber;
    form.weeklyHours = therapist.weeklyHours;
    form.photoUrl = therapist.photoUrl;
    form.linkedInUrl = therapist.linkedInUrl ?? "";
    form.role = therapist.role as "therapist" | "manager";
    form.spaId = therapist.spaId || (spaStore.spas[0]?.id ?? "");
    form.defaultWorkStartHour = therapist.defaultWorkStartHour ?? THERAPIST_MANAGER.DEFAULT_WORK_START_HOUR;
    form.defaultWorkEndHour = therapist.defaultWorkEndHour ?? THERAPIST_MANAGER.DEFAULT_WORK_END_HOUR;
    isModalOpen.value = true;
  };

  const closeModal = () => {
    isModalOpen.value = false;
  };

  const saveTherapist = () => {
    if (!form.spaId && spaStore.spas.length > 0) {
      form.spaId = spaStore.spas[0].id;
    }
    const startH = form.defaultWorkStartHour;
    const endH = form.defaultWorkEndHour <= startH ? startH + 1 : form.defaultWorkEndHour;
    const payload = {
      ...form,
      linkedInUrl: form.linkedInUrl?.trim() || undefined,
      defaultWorkStartHour: startH,
      defaultWorkEndHour: Math.min(24, endH),
    };
    if (isEditing.value && editingId.value) {
      store.updateTherapist(editingId.value, payload);
    } else {
      store.addTherapist(payload);
    }
    closeModal();
  };

  const deleteTherapist = (id: string) => {
    if (confirm(THERAPIST_MANAGER.DELETE_CONFIRM)) {
      store.deleteTherapist(id);
    }
  };

  const getSpaName = (id: string) => {
    const spa = spaStore.getSpaById(id);
    return spa ? spa.name : THERAPIST_MANAGER.NO_SPA;
  };

  onMounted(() => {
    store.initialize();
    spaStore.initialize();
  });

  return {
    orderedTherapists,
    isModalOpen,
    isEditing,
    form,
    spaStore,
    openCreateModal,
    editTherapist,
    closeModal,
    saveTherapist,
    deleteTherapist,
    getSpaName,
  };
};
