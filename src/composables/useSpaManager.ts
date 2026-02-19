import { ref, reactive, onMounted } from "vue";
import { useSpaStore } from "@/stores/spa";
import { useTeamStore } from "@/stores/team";
import { useServiceStore } from "@/stores/service";
import { useToast } from "@/composables/useToast";
import { useConfirmDialog } from "@/composables/useConfirmDialog";
import type { Spa } from "@/interfaces";

const DEFAULT_THEME = "teal";

export const useSpaManager = () => {
  const spaStore = useSpaStore();
  const teamStore = useTeamStore();
  const serviceStore = useServiceStore();
  const { addToast } = useToast();
  const { show: showConfirm } = useConfirmDialog();

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

  const getMemberCount = (spaId: string): number =>
    teamStore.members.filter((m) => m.spaId === spaId).length;

  const getMembersForSpa = (spaId: string) =>
    teamStore.members.filter((m) => m.spaId === spaId);

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

  const confirmDelete = async (id: string) => {
    const count = getMemberCount(id);
    if (count > 0) {
      alert(
        `No puedes eliminar esta ubicación porque tiene ${count} miembros asignados. Reasígnalos primero.`,
      );
      return;
    }
    const ok = await showConfirm({
      title: "Eliminar ubicación",
      message: "¿Estás seguro de eliminar esta ubicación? Esta acción no se puede deshacer.",
      confirmLabel: "Eliminar",
      variant: "danger",
    });
    if (ok) {
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

  const initialize = async () => {
    spaStore.initialize();
    await teamStore.initialize();
  };

  onMounted(() => {
    void initialize();
  });

  return {
    spaStore,
    teamStore,
    serviceStore,
    isModalOpen,
    isEditing,
    isServiceModalOpen,
    editingSpaId,
    selectedServiceIds,
    form,
    getMemberCount,
    getMembersForSpa,
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
