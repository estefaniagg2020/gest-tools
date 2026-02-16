import { ref, reactive, onMounted, computed } from "vue";
import { storeToRefs } from "pinia";
import { useServiceStore } from "@/stores/service";
import { useServiceCategoryStore } from "@/stores/serviceCategory";
import { useToast } from "@/composables/useToast";
import type { Service } from "@/interfaces";

const getDefaultForm = (firstCategoryId: string) => ({
  name: "",
  category: firstCategoryId,
  duration: 60,
  price: 0,
  description: "",
  requiresCabin: false,
  requiresTherapist: true,
  employeesCount: 1,
});

export const useServiciosManager = () => {
  const serviceStore = useServiceStore();
  const categoryStore = useServiceCategoryStore();
  const { categories } = storeToRefs(categoryStore);
  const { addToast } = useToast();

  const isModalOpen = ref(false);
  const isEditing = ref(false);
  const editingId = ref<string | null>(null);

  const firstCategoryId = computed(
    () => categories.value[0]?.id ?? "general"
  );

  const form = reactive(getDefaultForm("general"));

  const resetForm = () => {
    Object.assign(form, getDefaultForm(firstCategoryId.value));
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
    form.category = service.category;
    form.duration = service.duration;
    form.price = service.price;
    form.description = service.description ?? "";
    form.requiresCabin = service.requiresCabin ?? false;
    form.requiresTherapist = service.requiresTherapist ?? false;
    form.employeesCount = service.employeesCount ?? 1;
    isModalOpen.value = true;
  };

  const closeModal = () => {
    isModalOpen.value = false;
    resetForm();
    editingId.value = null;
    isEditing.value = false;
  };

  const saveService = () => {
    const payload = {
      name: form.name.trim(),
      category: form.category,
      duration: form.duration,
      price: form.price,
      description: form.description.trim() || undefined,
      requiresCabin: form.requiresCabin,
      requiresTherapist: form.requiresTherapist,
      employeesCount: form.requiresTherapist ? form.employeesCount : undefined,
    };
    if (isEditing.value && editingId.value) {
      serviceStore.updateService(editingId.value, payload);
      addToast("Servicio actualizado correctamente", "success");
    } else {
      serviceStore.addService(payload);
      addToast("Servicio creado con éxito", "success");
    }
    closeModal();
  };

  const confirmDelete = (id: string) => {
    if (confirm("¿Estás seguro de eliminar este servicio?")) {
      serviceStore.deleteService(id);
      addToast("Servicio eliminado", "success");
    }
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

  const initialize = () => {
    serviceStore.initialize();
  };

  onMounted(() => {
    categoryStore.initialize();
    initialize();
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
