import { ref, computed } from "vue";
import type { Bono, BonoType } from "@/interfaces/bono";
import { useToast } from "@/composables/useToast";
import { useBonoStore } from "@/stores/bono";

export const useBonosManager = () => {
  const bonoStore = useBonoStore();
  const { addToast } = useToast();
  const isModalOpen = ref(false);
  const isEditing = ref(false);
  const editingId = ref<string | null>(null);
  const saveError = ref<string | null>(null);

  const form = ref({
    name: "",
    type: "pack" as BonoType,
    packTotalSessions: 10,
    packPrice: 20,
    loyaltyTriggerEvery: 10,
    loyaltyRewardSessions: 1,
    serviceId: null as string | null,
  });

  const templates = computed(() => bonoStore.templates);

  const openCreate = () => {
    saveError.value = null;
    isEditing.value = false;
    editingId.value = null;
    form.value = {
      name: "",
      type: "pack",
      packTotalSessions: 10,
      packPrice: 20,
      loyaltyTriggerEvery: 10,
      loyaltyRewardSessions: 1,
      serviceId: null,
    };
    isModalOpen.value = true;
  };

  const openEdit = (template: Bono) => {
    saveError.value = null;
    isEditing.value = true;
    editingId.value = template.id;
    form.value = {
      name: template.name,
      type: template.type,
      packTotalSessions: template.packTotalSessions ?? 10,
      packPrice: template.packPrice ?? 20,
      loyaltyTriggerEvery: template.loyaltyTriggerEvery ?? 10,
      loyaltyRewardSessions: template.loyaltyRewardSessions ?? 1,
      serviceId: template.serviceId ?? null,
    };
    isModalOpen.value = true;
  };

  const closeModal = () => {
    saveError.value = null;
    isModalOpen.value = false;
    editingId.value = null;
  };

  const save = async () => {
    const payload = {
      name: form.value.name.trim(),
      type: form.value.type,
      packTotalSessions: form.value.type === "pack" ? form.value.packTotalSessions : undefined,
      packPrice: form.value.type === "pack" ? form.value.packPrice : undefined,
      loyaltyTriggerEvery:
        form.value.type === "loyalty" ? form.value.loyaltyTriggerEvery : undefined,
      loyaltyRewardSessions:
        form.value.type === "loyalty" ? form.value.loyaltyRewardSessions : undefined,
      serviceId: form.value.serviceId || null,
    };
    saveError.value = null;
    try {
      if (isEditing.value && editingId.value) {
        await bonoStore.updateTemplate(editingId.value, payload);
        addToast("Bono actualizado correctamente", "success");
      } else {
        await bonoStore.addTemplate(payload);
        addToast("Bono creado correctamente", "success");
      }
      closeModal();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Error al guardar el bono";
      saveError.value = msg;
      addToast(msg, "error");
    }
  };

  const remove = async (id: string) => {
    try {
      await bonoStore.deleteTemplate(id);
      addToast("Bono eliminado", "success");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Error al eliminar el bono";
      addToast(msg, "error");
    }
  };

  return {
    isModalOpen,
    isEditing,
    form,
    templates,
    saveError,
    openCreate,
    openEdit,
    closeModal,
    save,
    remove,
  };
};
