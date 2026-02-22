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
    <div v-else class="max-w-md mx-auto bg-white min-h-screen shadow-2xl relative pb-28">
      
      <!-- Hero Header -->
      <header class="relative h-72 bg-indigo-950 text-white overflow-hidden">
        <div v-if="business?.gestorConfig?.logoUrl" class="absolute inset-0">
          <img 
            :src="business.gestorConfig.logoUrl" 
            class="w-full h-full object-cover opacity-40 blur-[2px] scale-105"
          />
        </div>
        <div class="absolute inset-0 bg-linear-to-t from-indigo-950 via-indigo-950/60 to-transparent"></div>
        
        <div class="absolute bottom-0 left-0 w-full p-8">
            <div class="flex items-center gap-5 mb-4">
                 <div v-if="business?.gestorConfig?.logoUrl" class="w-20 h-20 rounded-2xl border-2 border-white/20 overflow-hidden bg-white shadow-2xl">
                    <img :src="business.gestorConfig.logoUrl" class="w-full h-full object-cover" />
                 </div>
                 <div v-else class="w-20 h-20 rounded-2xl border-2 border-white/20 bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-3xl font-bold shadow-2xl">
                    {{ business?.name.charAt(0) }}
                 </div>
                 <div class="flex-1 min-w-0">
                    <h1 class="text-3xl font-black tracking-tight leading-tight mb-1 truncate">{{ business?.name }}</h1>
                    <p v-if="business?.contact?.address" class="text-xs text-indigo-100/80 flex items-center gap-1.5 uppercase tracking-wider font-semibold">
                        <span class="i-heroicons-map-pin w-4 h-4 text-indigo-400"></span> {{ business.contact.address }}
                    </p>
                 </div>
            </div>
        </div>
      </header>

      <!-- Description & Info -->
      <section v-if="business?.description" class="px-8 py-6 -mt-4 relative bg-white rounded-t-3xl shadow-xs">
          <p class="text-slate-600 leading-relaxed text-sm font-medium">{{ business.description }}</p>
      </section>

      <!-- Services List -->
      <section class="px-6 py-4">
        <div class="flex items-center justify-between mb-6 px-2">
            <h2 class="text-lg font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                Servicios
                <span class="h-1.5 w-1.5 rounded-full bg-indigo-500"></span>
            </h2>
            <span class="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-md">
                {{ business?.services?.length || 0 }} DISPONIBLES
            </span>
        </div>
        
        <div class="grid gap-3">
            <div v-for="service in business?.services" :key="service.id" 
                 class="group bg-slate-50 rounded-2xl border border-slate-100 p-4 hover:bg-white hover:border-indigo-100 hover:shadow-xl hover:shadow-indigo-500/10 transition-all cursor-pointer flex justify-between items-center active:scale-[0.98] duration-300"
            >
                <div class="flex-1 min-w-0 pr-4">
                    <h3 class="font-bold text-slate-900 mb-0.5 group-hover:text-indigo-600 transition-colors">{{ service.name }}</h3>
                    <div class="flex items-center gap-3">
                        <span class="text-xs font-bold text-slate-500 flex items-center gap-1">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {{ service.duration }} min
                        </span>
                        <span class="text-xs font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                            {{ formatPrice(service.price) }}
                        </span>
                    </div>
                </div>
                <button class="bg-white text-slate-400 w-10 h-10 rounded-xl shadow-xs flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300 group-hover:rotate-90">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
                    </svg>
                </button>
            </div>
        </div>
      </section>

      <!-- FAB Book Button -->
      <div class="fixed bottom-8 left-0 w-full px-8 pointer-events-none">
          <button class="w-full max-w-sm mx-auto bg-slate-900 text-white py-5 rounded-2xl font-black text-sm uppercase tracking-widest shadow-2xl flex items-center justify-center gap-3 pointer-events-auto hover:bg-indigo-600 hover:-translate-y-1 transition-all active:scale-95 duration-300">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd" />
              </svg>
              Reservar ahora
          </button>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import {
  publicBusinessApi,
  type PublicBusiness,
} from "@/infrastructure/publicBusinessApi";

const route = useRoute();
const loading = ref(true);
const error = ref<string | null>(null);
const business = ref<PublicBusiness | null>(null);

const fetchBusiness = async () => {
  loading.value = true;
  try {
    const slug = String(route.params.slug ?? "");
    business.value = await publicBusinessApi.getBySlug(slug);
  } catch (e) {
    error.value = e instanceof Error ? e.message : "No se pudo cargar el negocio";
  } finally {
    loading.value = false;
  }
};

const formatPrice = (price: number) => {
  return new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(price);
};

onMounted(() => {
  fetchBusiness();
});
</script>
