import { ref, reactive, onMounted } from "vue";
import { useSpaStore } from "@/stores/spa";
import { useTherapistStore } from "@/stores/therapist";
import { useServiceStore } from "@/stores/service";
import { useToast } from "@/composables/useToast";
import type { Spa } from "@/interfaces";

const DEFAULT_THEME = "teal";

export const useSpaManager = () => {
  const spaStore = useSpaStore();
  const therapistStore = useTherapistStore();
  const serviceStore = useServiceStore();
  const { addToast } = useToast();

  const isModalOpen = ref(false);
  const isEditing = ref(false);
  const editingId = ref<string | null>(null);

  const isServiceModalOpen = ref(false);
  const editingSpaId = ref<string | null>(null);
  const selectedServiceIds = ref<string[]>([]);

  const form = reactive({
    name: "",
    themeColor: DEFAULT_THEME,
  });

  const getTherapistCount = (spaId: string): number =>
    therapistStore.therapists.filter((t) => t.spaId === spaId).length;

  const getTherapistsForSpa = (spaId: string) =>
    therapistStore.therapists.filter((t) => t.spaId === spaId);

  const getServicesForSpaByCategory = (spa: Spa, category: string) => {
    if (!spa.serviceIds) return [];
    return serviceStore
      .getServicesByCategory(category)
      .filter((s) => spa.serviceIds?.includes(s.id));
  };

  const resetForm = () => {
    form.name = "";
    form.themeColor = DEFAULT_THEME;
  };

  const openCreateModal = () => {
    isEditing.value = false;
    editingId.value = null;
    resetForm();
    isModalOpen.value = true;
  };

  const editSpa = (spa: Spa) => {
    isEditing.value = true;
    editingId.value = spa.id;
    form.name = spa.name;
    form.themeColor = spa.themeColor || DEFAULT_THEME;
    isModalOpen.value = true;
  };

  const closeModal = () => {
    isModalOpen.value = false;
    resetForm();
    editingId.value = null;
    isEditing.value = false;
  };

  const saveSpa = () => {
    if (isEditing.value && editingId.value) {
      spaStore.updateSpa(editingId.value, { ...form });
      addToast("Spa actualizado correctamente", "success");
    } else {
      spaStore.addSpa({ ...form, themeColor: form.themeColor });
      addToast("Spa creado con éxito", "success");
    }
    closeModal();
  };

  const confirmDelete = (id: string) => {
    const count = getTherapistCount(id);
    if (count > 0) {
      alert(
        `No puedes eliminar este Spa porque tiene ${count} terapeutas asignados. Reasígnalos primero.`,
      );
      return;
    }
    if (confirm("¿Estás seguro de eliminar este Spa?")) {
      spaStore.deleteSpa(id);
      addToast("Spa eliminado", "success");
    }
  };

  const toggleServiceModal = (spa: Spa) => {
    editingSpaId.value = spa.id;
    selectedServiceIds.value = [...(spa.serviceIds || [])];
    isServiceModalOpen.value = true;
  };

  const closeServiceModal = () => {
    isServiceModalOpen.value = false;
    editingSpaId.value = null;
    selectedServiceIds.value = [];
  };

  const saveServices = () => {
    if (editingSpaId.value) {
      spaStore.updateSpa(editingSpaId.value, {
        serviceIds: selectedServiceIds.value,
      });
      addToast("Servicios actualizados", "success");
      closeServiceModal();
    }
  };

  const initialize = () => {
    spaStore.initialize();
    therapistStore.initialize();
  };

  onMounted(initialize);

  return {
    spaStore,
    therapistStore,
    serviceStore,
    isModalOpen,
    isEditing,
    isServiceModalOpen,
    editingSpaId,
    selectedServiceIds,
    form,
    getTherapistCount,
    getTherapistsForSpa,
    getServicesForSpaByCategory,
    openCreateModal,
    editSpa,
    closeModal,
    saveSpa,
    confirmDelete,
    toggleServiceModal,
    closeServiceModal,
    saveServices,
  };
};
