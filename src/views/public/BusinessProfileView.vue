<template>
  <div class="min-h-screen bg-gray-50 font-sans text-slate-800">
    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center min-h-screen">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="flex flex-col items-center justify-center min-h-screen p-4">
      <div class="text-6xl mb-4">🏪</div>
      <h1 class="text-2xl font-bold text-gray-800 mb-2">Negocio no encontrado</h1>
      <p class="text-gray-600">{{ error }}</p>
    </div>

    <!-- Content -->
    <div v-else class="max-w-md mx-auto bg-white min-h-screen shadow-xl relative pb-24">
      
      <!-- Hero Header -->
      <header class="relative h-64 bg-gray-900 text-white overflow-hidden">
        <img 
          v-if="business?.gestorConfig?.logoUrl" 
          :src="business.gestorConfig.logoUrl" 
          class="absolute inset-0 w-full h-full object-cover opacity-60 blur-sm scale-110"
        />
        <div class="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
        
        <div class="absolute bottom-0 left-0 w-full p-6">
            <div class="flex items-center gap-4 mb-3">
                 <div v-if="business?.gestorConfig?.logoUrl" class="w-16 h-16 rounded-full border-2 border-white overflow-hidden bg-white shadow-lg">
                    <img :src="business.gestorConfig.logoUrl" class="w-full h-full object-cover" />
                 </div>
                 <div v-else class="w-16 h-16 rounded-full border-2 border-white bg-indigo-600 flex items-center justify-center text-2xl font-bold shadow-lg">
                    {{ business?.name.charAt(0) }}
                 </div>
            </div>
            <h1 class="text-3xl font-bold leading-tight mb-1">{{ business?.name }}</h1>
            <p v-if="business?.contact?.address" class="text-sm text-gray-300 flex items-center gap-1">
                <span class="i-heroicons-map-pin w-4 h-4"></span> {{ business.contact.address }}
            </p>
        </div>
      </header>

      <!-- Description -->
      <section v-if="business?.description" class="p-6 border-b border-gray-100">
          <p class="text-gray-600 leading-relaxed">{{ business.description }}</p>
      </section>

      <!-- Services List -->
      <section class="p-6">
        <h2 class="text-xl font-bold mb-4 flex items-center gap-2">
            <span class="i-heroicons-sparkles text-indigo-500"></span> Servicios
        </h2>
        
        <div class="space-y-4">
            <div v-for="service in business?.services" :key="service.id" 
                 class="group bg-white rounded-xl border border-gray-100 p-4 shadow-sm hover:shadow-md transition-all cursor-pointer flex justify-between items-center active:scale-95 duration-200"
            >
                <div>
                    <h3 class="font-semibold text-gray-900">{{ service.name }}</h3>
                    <p class="text-sm text-gray-500">{{ service.duration }} min • {{ formatPrice(service.price) }}</p>
                </div>
                <button class="bg-indigo-50 text-indigo-600 p-2 rounded-full group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
                    </svg>
                </button>
            </div>
        </div>
      </section>

      <!-- FAB Book Button -->
      <div class="fixed bottom-6 left-0 w-full px-6 flex justify-center pointer-events-none">
          <button class="bg-gray-900 text-white px-8 py-4 rounded-full font-bold shadow-2xl flex items-center gap-2 pointer-events-auto hover:bg-black transition-transform hover:scale-105 active:scale-95">
              Reservar Cita
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd" />
              </svg>
          </button>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';

// Define Interface locally (or import)
interface BusinessPublic {
    id: string;
    name: string;
    slug: string;
    description?: string;
    gestorConfig?: { logoUrl?: string };
    contact?: { address?: string };
    services: Array<{
        id: string;
        name: string;
        duration: number;
        price: number;
    }>;
}

const route = useRoute();
const loading = ref(true);
const error = ref<string | null>(null);
const business = ref<BusinessPublic | null>(null);

const fetchBusiness = async () => {
    loading.value = true;
    try {
        const slug = route.params.slug;
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/public/business/${slug}`);
        if (!res.ok) throw new Error('No se pudo cargar el negocio');
        business.value = await res.json();
    } catch (e: any) {
        error.value = e.message;
    } finally {
        loading.value = false;
    }
};

const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(price);
};

onMounted(() => {
    fetchBusiness();
});
</script>
