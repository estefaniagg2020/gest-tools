import { ref, reactive, computed, onMounted } from "vue";
import { storeToRefs } from "pinia";
import { useServiceStore } from "@/stores/service";
import { useServiceCategoryStore } from "@/stores/serviceCategory";
import { useGestorConfigStore } from "@/stores/gestorConfig";
import { useToast } from "@/composables/useToast";
import { useAuthStore } from "@/stores/auth";
import {
  getServiceTemplates,
  getBusinessServiceDefaults,
  type ServiceTemplate,
} from "@/data/serviceTemplates";
import type { Service } from "@/interfaces";

const buildDefaultForm = (firstCategoryId: string) => ({
  name: "",
  category: firstCategoryId,
  duration: 60,
  price: 0,
  description: "",
});

export const useServiciosManager = () => {
  const serviceStore = useServiceStore();
  const categoryStore = useServiceCategoryStore();
  const configStore = useGestorConfigStore();
  const authStore = useAuthStore();
  const { categories } = storeToRefs(categoryStore);
  const { addToast } = useToast();

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
    form.category = service.category;
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

  const saveService = () => {
    const businessDefaults = getBusinessServiceDefaults(configStore.businessType);
    const payload = {
      name: form.name.trim(),
      category: form.category,
      duration: form.duration,
      price: form.price,
      description: form.description.trim() || undefined,
      requiresCabin: businessDefaults.requiresCabin,
      requiresTherapist: businessDefaults.requiresStaff,
      employeesCount: businessDefaults.requiresStaff ? 1 : undefined,
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

  const suggestedTemplates = computed(() =>
    getServiceTemplates(configStore.businessType)
  );

  const ensureCategoryExists = (id: string, label: string, icon: string): string => {
    const existing = categoryStore.getCategoryById(id);
    if (existing) return existing.id;
    const byLabel = categories.value.find(
      (c) => c.label.toLowerCase() === label.toLowerCase()
    );
    if (byLabel) return byLabel.id;
    return categoryStore.addCategory({ label, icon }).id;
  };

  const quickAddFromTemplate = (template: ServiceTemplate) => {
    const businessDefaults = getBusinessServiceDefaults(configStore.businessType);
    const categoryId = ensureCategoryExists(
      template.suggestedCategory,
      template.suggestedCategory,
      template.suggestedCategoryIcon,
    );
    serviceStore.addService({
      name: template.name,
      category: categoryId,
      duration: template.duration,
      price: template.price,
      description: template.description,
      requiresCabin: businessDefaults.requiresCabin,
      requiresTherapist: businessDefaults.requiresStaff,
      employeesCount: businessDefaults.requiresStaff ? 1 : undefined,
    });
    addToast(`"${template.name}" añadido`, "success");
  };

  const quickAddAllTemplates = () => {
    const templates = suggestedTemplates.value;
    if (!templates) return;
    templates.categories.forEach((cat) => ensureCategoryExists(cat.id, cat.label, cat.icon));
    templates.services.forEach((template) => {
      const alreadyExists = serviceStore.services.some(
        (s) => s.name.toLowerCase() === template.name.toLowerCase()
      );
      if (!alreadyExists) quickAddFromTemplate(template);
    });
    addToast("Servicios sugeridos añadidos", "success");
  };

  const isTemplateAdded = (template: ServiceTemplate) =>
    serviceStore.services.some(
      (s) => s.name.toLowerCase() === template.name.toLowerCase()
    );

  onMounted(() => {
    const userId = authStore.currentUserId ?? "local";
    configStore.initialize(userId);
    categoryStore.initialize();
    serviceStore.initialize();
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
    suggestedTemplates,
    quickAddFromTemplate,
    quickAddAllTemplates,
    isTemplateAdded,
  };
};
