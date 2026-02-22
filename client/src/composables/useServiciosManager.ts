import { ref, reactive, computed, onMounted, watch } from "vue";
import { storeToRefs } from "pinia";
import { useServiceStore } from "@/stores/service";
import { useConfirmDialog } from "@/composables/useConfirmDialog";
import { useServiceCategoryStore } from "@/stores/serviceCategory";
import { useGestorConfigStore } from "@/stores/gestorConfig";
import { useToast } from "@/composables/useToast";
import { useAuthStore } from "@/stores/auth";
import {
  getServiceTemplates,
  getBusinessServiceDefaults,
  type ServiceTemplate,
} from "@/data/serviceTemplates";
import type { Service, ServiceCategoryDefinition } from "@/interfaces";
import { markSystemServiceRemoved } from "@/infrastructure/serviceSystemRemovedStorage";

const buildDefaultForm = (firstCategoryId: string) => ({
  name: "",
  categoryId: firstCategoryId,
  duration: 60,
  price: 0,
  description: "",
});

const buildServicePayload = ({
  name,
  categoryId,
  categoryLabel,
  duration,
  price,
  description,
  requiresCabin,
  requiresTherapist,
}: {
  name: string;
  categoryId: string;
  categoryLabel: string;
  duration: number;
  price: number;
  description?: string;
  requiresCabin: boolean;
  requiresTherapist: boolean;
}) => ({
  name,
  categoryId,
  category: categoryLabel,
  duration,
  price,
  description,
  requiresCabin,
  requiresTherapist,
  employeesCount: requiresTherapist ? 1 : undefined,
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
    const businessDefaults = getBusinessServiceDefaults(configStore.businessType);
    const selectedCategory = categories.value.find((category) => category.id === form.categoryId);
    const payload = buildServicePayload({
      name: form.name.trim(),
      categoryId: form.categoryId,
      categoryLabel: selectedCategory?.label ?? form.categoryId,
      duration: form.duration,
      price: form.price,
      description: form.description.trim() || undefined,
      requiresCabin: businessDefaults.requiresCabin,
      requiresTherapist: businessDefaults.requiresStaff,
    });
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
    const businessId = authStore.user?.businessId ?? null;
    if (!businessId) {
      const service = serviceStore.getServiceById(id);
      const businessType = configStore.businessType || "estetica";
      const templates = getServiceTemplates(businessType);
      if (service && templates?.services.some((t) => t.name.toLowerCase() === service.name.toLowerCase())) {
        await markSystemServiceRemoved({ businessId: null, businessType, serviceName: service.name });
      }
    }
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

  const suggestedTemplates = computed(() =>
    getServiceTemplates(configStore.businessType)
  );

  const ensureCategoryExists = async (id: string, label: string, icon: string): Promise<ServiceCategoryDefinition> => {
    const existing = categoryStore.getCategoryById(id);
    if (existing) return existing;
    const byLabel = categories.value.find(
      (c) => c.label.toLowerCase() === label.toLowerCase()
    );
    if (byLabel) {
      return {
        id: byLabel.id,
        label: byLabel.label,
        icon: byLabel.icon,
      };
    }
    return categoryStore.addCategoryWithId({ id, label, icon });
  };

  const quickAddFromTemplate = async (template: ServiceTemplate) => {
    const businessDefaults = getBusinessServiceDefaults(configStore.businessType);
    const category = await ensureCategoryExists(
      template.suggestedCategory,
      template.suggestedCategory,
      template.suggestedCategoryIcon,
    );
    await serviceStore.addService(buildServicePayload({
      name: template.name,
      categoryId: category.id,
      categoryLabel: category.label,
      duration: template.duration,
      price: template.price,
      description: template.description,
      requiresCabin: businessDefaults.requiresCabin,
      requiresTherapist: businessDefaults.requiresStaff,
    }));
    addToast(`"${template.name}" añadido`, "success");
  };

  const quickAddAllTemplates = async () => {
    const templates = suggestedTemplates.value;
    if (!templates) return;
    for (const category of templates.categories) {
      await ensureCategoryExists(category.id, category.label, category.icon);
    }
    for (const template of templates.services) {
      const alreadyExists = serviceStore.services.some(
        (s) => s.name.toLowerCase() === template.name.toLowerCase()
      );
      if (!alreadyExists) await quickAddFromTemplate(template);
    }
    addToast("Servicios sugeridos añadidos", "success");
  };

  const isTemplateAdded = (template: ServiceTemplate) =>
    serviceStore.services.some(
      (s) => s.name.toLowerCase() === template.name.toLowerCase()
    );

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
    suggestedTemplates,
    quickAddFromTemplate,
    quickAddAllTemplates,
    isTemplateAdded,
  };
};
