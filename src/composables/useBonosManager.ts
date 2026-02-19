import { ref, computed } from "vue";
import type { BonoTemplate, BonoType } from "@/interfaces/bono";
import { useBonoStore } from "@/stores/bono";

export const useBonosManager = () => {
  const bonoStore = useBonoStore();
  const isModalOpen = ref(false);
  const isEditing = ref(false);
  const editingId = ref<string | null>(null);

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

  const openEdit = (template: BonoTemplate) => {
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
    isModalOpen.value = false;
    editingId.value = null;
  };

  const save = () => {
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
    if (isEditing.value && editingId.value) {
      bonoStore.updateTemplate(editingId.value, payload);
    } else {
      bonoStore.addTemplate(payload);
    }
    closeModal();
  };

  const remove = (id: string) => {
    bonoStore.deleteTemplate(id);
  };

  return {
    isModalOpen,
    isEditing,
    form,
    templates,
    openCreate,
    openEdit,
    closeModal,
    save,
    remove,
  };
};
