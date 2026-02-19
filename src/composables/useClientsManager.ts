import { ref, reactive, onMounted } from "vue";
import { useClientStore } from "@/stores/client";
import { useToast } from "@/composables/useToast";
import { useConfirmDialog } from "@/composables/useConfirmDialog";
import type { Client } from "@/interfaces";

const getDefaultForm = (): Omit<Client, "id"> => ({
  name: "",
  email: "",
  phone: "",
  notes: "",
});

export const useClientsManager = () => {
  const clientStore = useClientStore();
  const { addToast } = useToast();
  const { show: showConfirm } = useConfirmDialog();

  const isModalOpen = ref(false);
  const isEditing = ref(false);
  const editingId = ref<string | null>(null);

  const form = reactive(getDefaultForm());

  const resetForm = () => {
    Object.assign(form, getDefaultForm());
  };

  const openCreateModal = () => {
    isEditing.value = false;
    editingId.value = null;
    resetForm();
    isModalOpen.value = true;
  };

  const editClient = (client: Client) => {
    isEditing.value = true;
    editingId.value = client.id;
    form.name = client.name;
    form.email = client.email ?? "";
    form.phone = client.phone ?? "";
    form.notes = client.notes ?? "";
    isModalOpen.value = true;
  };

  const closeModal = () => {
    isModalOpen.value = false;
    resetForm();
    editingId.value = null;
    isEditing.value = false;
  };

  const saveClient = () => {
    const payload = {
      name: form.name.trim(),
      email: (form.email ?? "").trim() || undefined,
      phone: (form.phone ?? "").trim() || undefined,
      notes: (form.notes ?? "").trim() || undefined,
    };
    if (isEditing.value && editingId.value) {
      clientStore.updateClient(editingId.value, payload);
      addToast("Cliente actualizado correctamente", "success");
    } else {
      clientStore.addClient(payload);
      addToast("Cliente creado con éxito", "success");
    }
    closeModal();
  };

  const confirmDelete = async (id: string) => {
    const ok = await showConfirm({
      title: "Eliminar cliente",
      message: "¿Estás seguro de eliminar este cliente? Esta acción no se puede deshacer.",
      confirmLabel: "Eliminar",
      variant: "danger",
    });
    if (ok) {
      clientStore.deleteClient(id);
      addToast("Cliente eliminado", "success");
    }
  };

  const initialize = () => {
    clientStore.initialize();
  };

  onMounted(initialize);

  return {
    clientStore,
    isModalOpen,
    isEditing,
    form,
    openCreateModal,
    editClient,
    closeModal,
    saveClient,
    confirmDelete,
  };
};
