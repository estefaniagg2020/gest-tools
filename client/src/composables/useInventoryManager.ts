import { ref, reactive, computed } from "vue";
import type { Product, Supplier } from "@/interfaces";
import { useAuthStore } from "@/stores/auth";
import { inventoryApi } from "@/infrastructure/inventoryApi";

export function useInventoryManager() {
  const authStore = useAuthStore();
  const products = ref<Product[]>([]);
  const suppliers = ref<Supplier[]>([]);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  // Modal State
  const isModalOpen = ref(false);
  const isEditing = ref(false);
  const activeProduct = ref<Product | null>(null);

  const form = reactive({
    name: "",
    sku: "",
    barcode: "",
    description: "",
    price: 0,
    cost: 0,
    stockLevel: 0,
    minStockLevel: 5,
    supplierId: "",
    isService: false,
  });

  const businessId = computed(() => authStore.user?.businessId);

  async function fetchProducts() {
    if (!businessId.value) return;
    isLoading.value = true;
    try {
      products.value = await inventoryApi.getProducts(businessId.value);
    } catch (e) {
      error.value = (e as Error).message;
    } finally {
      isLoading.value = false;
    }
  }

  async function fetchSuppliers() {
      if (!businessId.value) return;
      try {
          suppliers.value = await inventoryApi.getSuppliers(businessId.value);
      } catch (e) {
          console.error(e);
      }
  }

  function openCreateModal() {
    isEditing.value = false;
    activeProduct.value = null;
    resetForm();
    isModalOpen.value = true;
  }

  function editProduct(product: Product) {
    isEditing.value = true;
    activeProduct.value = product;
    Object.assign(form, {
      name: product.name,
      sku: product.sku || "",
      barcode: product.barcode || "",
      description: product.description || "",
      price: product.price,
      cost: product.cost,
      stockLevel: product.stockLevel, // Note: stockLevel is usually read-only in edit, adjusted via separate action
      minStockLevel: product.minStockLevel,
      supplierId: product.supplierId || "",
      isService: product.isService,
    });
    isModalOpen.value = true;
  }

  function closeModal() {
    isModalOpen.value = false;
    resetForm();
  }

  function resetForm() {
    Object.assign(form, {
      name: "",
      sku: "",
      barcode: "",
      description: "",
      price: 0,
      cost: 0,
      stockLevel: 0,
      minStockLevel: 5,
      supplierId: "",
      isService: false,
    });
  }

  async function saveProduct() {
     if (!businessId.value) return;
     
     const payload = { ...form, businessId: businessId.value };
     
     try {
         if (isEditing.value && activeProduct.value) {
             await inventoryApi.updateProduct(activeProduct.value.id, payload);
         } else {
             await inventoryApi.createProduct(payload);
         }

         await fetchProducts(); // Refresh list
         closeModal();
     } catch (e) {
         error.value = (e as Error).message;
         alert("Error saving product: " + error.value);
     }
  }
  
  async function confirmDelete(id: string) {
      if(!confirm("Are you sure you want to delete this product?")) return;
      
      try {
          await inventoryApi.deleteProduct(id);
          await fetchProducts();
      } catch (e) {
          alert("Error deleting product");
      }
  }

  return {
    products,
    suppliers,
    isLoading,
    error,
    isModalOpen,
    isEditing,
    form,
    fetchProducts,
    fetchSuppliers,
    openCreateModal,
    editProduct,
    closeModal,
    saveProduct,
    confirmDelete
  };
}
