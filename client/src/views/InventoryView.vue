<template>
  <div class="min-h-full overflow-y-auto">
    <div class="relative px-6 pt-8 pb-10">
      <div
        class="absolute inset-0 bg-linear-to-br from-app-bg via-app-surface to-brand-soft/30 dark:from-app-bg dark:via-app-bg dark:to-app-border-subtle/50 pointer-events-none"
        aria-hidden="true"
      />

      <div class="relative flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div>
          <p class="text-xs font-semibold uppercase tracking-widest text-brand-accent mb-1">
            {{ $t('inventory.kicker') }}
          </p>
          <h1 class="text-3xl font-bold tracking-tight text-app-title sm:text-4xl">
            {{ $t('inventory.title') }}
          </h1>
          <p class="mt-2 text-app-text/80 max-w-xl">
            {{ $t('inventory.subtitle') }}
          </p>
        </div>
        <BaseButton variant="primary" @click="openCreateModal">
          <template #icon>+</template>
          {{ $t('inventory.addProduct') }}
        </BaseButton>
      </div>

    <div class="relative grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
       <div class="bg-app-surface p-4 rounded-xl border border-app-border shadow-sm">
           <h3 class="text-sm font-medium text-app-text/70">{{ $t('inventory.totalProducts') }}</h3>
           <p class="text-2xl font-bold text-app-title mt-1">{{ products.length }}</p>
       </div>
        <div class="bg-app-surface p-4 rounded-xl border border-app-border shadow-sm">
           <h3 class="text-sm font-medium text-app-text/70">{{ $t('inventory.lowStock') }}</h3>
           <p class="text-2xl font-bold text-red-500 mt-1">{{ lowStockCount }}</p>
       </div>
       <div class="bg-app-surface p-4 rounded-xl border border-app-border shadow-sm">
           <h3 class="text-sm font-medium text-app-text/70">{{ $t('inventory.totalValue') }}</h3>
           <p class="text-2xl font-bold text-app-title mt-1">{{ totalValue.toFixed(2) }}€</p>
       </div>
    </div>

    <div class="relative mb-4">
       <input 
         v-model="searchQuery" 
         type="text" 
         :placeholder="$t('inventory.searchPlaceholder')" 
         class="input-modern w-full max-w-md rounded-xl border border-app-border bg-app-bg/50 px-4 py-2"
       />
    </div>

    <div class="relative bg-app-surface rounded-xl border border-app-border shadow-sm overflow-hidden">
      <table class="min-w-full divide-y divide-app-border">
        <thead class="bg-app-bg/50">
          <tr>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-app-text/70 uppercase tracking-wider">{{ $t('inventory.productName') }}</th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-app-text/70 uppercase tracking-wider">{{ $t('inventory.sku') }}</th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-app-text/70 uppercase tracking-wider">{{ $t('inventory.stock') }}</th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-app-text/70 uppercase tracking-wider">{{ $t('inventory.price') }}</th>
            <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-app-text/70 uppercase tracking-wider">{{ $t('common.actions') }}</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-app-border bg-app-surface">
          <tr v-for="product in filteredProducts" :key="product.id" class="hover:bg-app-bg/30">
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-app-title">{{ product.name }}</div>
                <div class="text-xs text-app-text/60">{{ product.description }}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-app-text/80">{{ product.sku || '-' }}</td>
             <td class="px-6 py-4 whitespace-nowrap">
                <span 
                  class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                  :class="product.stockLevel <= product.minStockLevel ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'"
                >
                  {{ product.stockLevel }}
                </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-app-title">{{ product.price.toFixed(2) }}€</td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
               <button @click="editProduct(product)" class="text-brand-accent hover:text-brand-accent/80 mr-3">
                   {{ $t('common.edit') }}
               </button>
               <button @click="confirmDelete(product.id)" class="text-red-600 hover:text-red-900">
                   {{ $t('common.delete') }}
               </button>
            </td>
          </tr>
           <tr v-if="filteredProducts.length === 0">
              <td colspan="5" class="px-6 py-10 text-center text-sm text-app-text/60">
                  {{ $t('inventory.noProducts') }}
              </td>
          </tr>
        </tbody>
      </table>
    </div>

    <Modal :is-open="isModalOpen" :title="isEditing ? $t('inventory.editProduct') : $t('inventory.newProduct')" @close="closeModal">
        <ProductForm :form="form" :is-editing="isEditing" @save="saveProduct" @cancel="closeModal" />
    </Modal>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useBillingConfig } from "@/composables/useBillingConfig";
import { useInventoryManager } from "@/composables/useInventoryManager";
import BaseButton from "@/components/common/BaseButton.vue";
import Modal from "@/components/common/Modal.vue";
import ProductForm from "@/components/inventory/ProductForm.vue";

const router = useRouter();
const { load: loadBillingConfig, inventarioEnabled } = useBillingConfig();
const { 
    products, 
    fetchProducts, 
    isModalOpen, 
    openCreateModal, 
    editProduct, 
    saveProduct, 
    closeModal, 
    form, 
    isEditing, 
    confirmDelete 
} = useInventoryManager();

const searchQuery = ref("");

onMounted(async () => {
    await loadBillingConfig();
    // HIDDEN_FEATURE: inventario - Redirige a config si inventarioEnabled=false
    if (!inventarioEnabled.value) {
        router.replace({ name: "config" });
        return;
    }
    fetchProducts();
});

const filteredProducts = computed(() => {
    if (!searchQuery.value) return products.value;
    const q = searchQuery.value.toLowerCase();
    return products.value.filter(p => 
        p.name.toLowerCase().includes(q) || 
        p.sku?.toLowerCase().includes(q) ||
        p.barcode?.includes(q)
    );
});

const lowStockCount = computed(() => products.value.filter(p => p.stockLevel <= p.minStockLevel).length);
const totalValue = computed(() => products.value.reduce((acc, p) => acc + (p.stockLevel * p.cost), 0));

</script>
