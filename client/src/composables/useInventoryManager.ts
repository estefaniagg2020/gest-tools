import { ref, reactive, computed } from "vue";
import type { Product, Supplier } from "@/interfaces";
import { useAuthStore } from "@/stores/auth";

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
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/inventory?businessId=${businessId.value}`);
      if (!res.ok) throw new Error("Failed to fetch products");
      products.value = await res.json();
    } catch (e) {
      error.value = (e as Error).message;
    } finally {
      isLoading.value = false;
    }
  }

  async function fetchSuppliers() {
      if (!businessId.value) return;
      try {
          const res = await fetch(`${import.meta.env.VITE_API_URL}/api/inventory/suppliers?businessId=${businessId.value}`);
          if (res.ok) {
              suppliers.value = await res.json();
          }
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
         let res;
         if (isEditing.value && activeProduct.value) {
             // Update
             res = await fetch(`${import.meta.env.VITE_API_URL}/api/inventory/${activeProduct.value.id}`, {
                 method: "PUT",
                 headers: { "Content-Type": "application/json" },
                 body: JSON.stringify(payload),
             });
         } else {
             // Create
             res = await fetch(`${import.meta.env.VITE_API_URL}/api/inventory`, {
                 method: "POST",
                 headers: { "Content-Type": "application/json" },
                 body: JSON.stringify(payload),
             });
         }
         
         if (!res.ok) throw new Error("Failed to save product");
         
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
          const res = await fetch(`${import.meta.env.VITE_API_URL}/api/inventory/${id}`, {
              method: "DELETE"
          });
          if (!res.ok) throw new Error("Failed to delete");
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
