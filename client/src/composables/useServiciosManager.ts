import { ref, reactive, computed, onMounted, watch } from "vue";
import { storeToRefs } from "pinia";
import { useServiceStore } from "@/stores/service";
import { useConfirmDialog } from "@/composables/useConfirmDialog";
import { useServiceCategoryStore } from "@/stores/serviceCategory";
import { useGestorConfigStore } from "@/stores/gestorConfig";
import { useToast } from "@/composables/useToast";
import { useAuthStore } from "@/stores/auth";
import type { Service } from "@/interfaces";

const buildDefaultForm = (firstCategoryId: string) => ({
  name: "",
  categoryId: firstCategoryId,
  duration: 60,
  price: 0,
  description: "",
});

export const useServiciosManager = () => {
  const serviceStore = useServiceStore();
  const categoryStore = useServiceCategoryStore();
  const { show: showConfirm } = useConfirmDialog();
  const configStore = useGestorConfigStore();
  const authStore = useAuthStore();
  const { categories: userCategories } = storeToRefs(categoryStore);
  const { catalog } = storeToRefs(serviceStore);
  const { businessType } = storeToRefs(configStore);
  const { addToast } = useToast();

  const categories = computed(() => {
    const catalogIds = new Set(catalog.value.map((c) => c.id));
    const userOnly = userCategories.value.filter((c) => !catalogIds.has(c.id));
    return [
      ...catalog.value.map((c) => ({ id: c.id, label: c.label, icon: c.icon })),
      ...userOnly,
    ];
  });

  const isModalOpen = ref(false);
  const isEditing = ref(false);
  const editingId = ref<string | null>(null);

  const firstCategoryId = computed(
    () => categories.value[0]?.id ?? "general"
  );

  const form = reactive(buildDefaultForm("general"));

  const resetForm = () => {
    Object.assign(form, buildDefaultForm(firstCategoryId.value));
  };

  const openCreateModal = () => {
    isEditing.value = false;
    editingId.value = null;
    resetForm();
    isModalOpen.value = true;
  };

  const editService = (service: Service) => {
    isEditing.value = true;
    editingId.value = service.id;
    form.name = service.name;
    form.categoryId = service.categoryId;
    form.duration = service.duration;
    form.price = service.price;
    form.description = service.description ?? "";
    isModalOpen.value = true;
  };

  const closeModal = () => {
    isModalOpen.value = false;
    resetForm();
    editingId.value = null;
    isEditing.value = false;
  };

  const saveService = async () => {
    const payload = {
      name: form.name.trim(),
      categoryId: form.categoryId,
      duration: form.duration,
      price: form.price,
      description: form.description.trim() || undefined,
    };
    if (isEditing.value && editingId.value) {
      await serviceStore.updateService(editingId.value, payload);
      addToast("Servicio actualizado correctamente", "success");
    } else {
      await serviceStore.addService(payload);
      addToast("Servicio creado con éxito", "success");
    }
    closeModal();
  };

  const confirmDelete = async (id: string) => {
    const ok = await showConfirm({
      title: "Eliminar servicio",
      message: "¿Estás seguro de eliminar este servicio? Esta acción no se puede deshacer.",
      confirmLabel: "Eliminar",
      variant: "danger",
    });
    if (!ok) return;
    await serviceStore.deleteService(id);
    addToast("Servicio eliminado", "success");
  };

  const isCategoryModalOpen = ref(false);
  const categoryForm = reactive({ label: "", icon: "📋" });

  const openCategoryModal = () => {
    categoryForm.label = "";
    categoryForm.icon = "📋";
    isCategoryModalOpen.value = true;
  };

  const closeCategoryModal = () => {
    isCategoryModalOpen.value = false;
    categoryForm.label = "";
    categoryForm.icon = "📋";
  };

  const saveCategory = () => {
    const label = categoryForm.label.trim();
    if (!label) return;
    categoryStore.addCategory({ label, icon: categoryForm.icon || "📋" });
    addToast("Categoría creada", "success");
    closeCategoryModal();
  };

  onMounted(async () => {
    const userId = authStore.currentUserId ?? "local";
    const businessId = authStore.user?.businessId ?? null;
    await configStore.initialize(userId, businessId);
    categoryStore.initialize();
    await serviceStore.initialize();
  });

  watch(businessType, async (newType, oldType) => {
    if (!newType || newType === oldType) return;
    const businessId = authStore.user?.businessId ?? null;
    if (!businessId) return;
    await new Promise((r) => setTimeout(r, 300));
    await serviceStore.initialize();
  });

  return {
    serviceStore,
    categoryStore,
    categories,
    isModalOpen,
    isEditing,
    form,
    openCreateModal,
    editService,
    closeModal,
    saveService,
    confirmDelete,
    isCategoryModalOpen,
    categoryForm,
    openCategoryModal,
    closeCategoryModal,
    saveCategory,
  };
};
