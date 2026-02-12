<template>
  <div class="h-full flex flex-col p-6 overflow-y-auto">
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
      <div>
        <h2 class="text-2xl font-bold text-gray-800">Gestión de Spas</h2>
        <p class="text-gray-500 text-sm">Administra las sucursales, equipos y servicios.</p>
      </div>
      <BaseButton
        variant="primary"
        icon="+"
        @click="openCreateModal"
      >
        Añadir Spa
      </BaseButton>
    </div>

    <div class="space-y-6">
      <div
        v-for="spa in spaStore.spas"
        :key="spa.id"
        class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
      >
        <div class="p-6 flex items-start justify-between bg-gray-50/30">
          <div class="flex items-center gap-4">
            <div
              class="w-14 h-14 rounded-xl flex items-center justify-center text-2xl font-bold text-white shadow-lg"
              :class="getThemeClasses(spa.themeColor)"
            >
              🏢
            </div>
            <div>
              <h3 class="text-xl font-bold text-gray-900">{{ spa.name }}</h3>
              <div class="flex gap-2 text-xs font-medium text-gray-500 mt-1">
                <span class="bg-gray-100 px-2 py-0.5 rounded-full">ID: {{ spa.id }}</span>
                <span class="bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full flex items-center gap-1">
                  👥 {{ getTherapistCount(spa.id) }} Terapeutas
                </span>
                <span class="bg-purple-50 text-purple-600 px-2 py-0.5 rounded-full flex items-center gap-1">
                  ✨ {{ (spa.serviceIds || []).length }} Servicios
                </span>
              </div>
            </div>
          </div>
          <div class="flex gap-2">
            <button
              @click="editSpa(spa)"
              class="p-2 text-gray-400 hover:text-spa-teal hover:bg-white rounded-lg transition-colors border border-transparent hover:border-gray-200"
              title="Editar"
            >
              ✏️
            </button>
            <button
              @click="confirmDelete(spa.id)"
              class="p-2 text-gray-400 hover:text-red-500 hover:bg-white rounded-lg transition-colors border border-transparent hover:border-gray-200"
              title="Eliminar"
            >
              🗑️
            </button>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-gray-100">
          <div class="p-6">
            <h4 class="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Equipo Asignado</h4>
            <div
              v-if="getTherapistsForSpa(spa.id).length > 0"
              class="flex flex-wrap gap-3"
            >
              <div
                v-for="therapist in getTherapistsForSpa(spa.id)"
                :key="therapist.id"
                class="flex items-center gap-2 p-2 bg-gray-50 rounded-lg border border-gray-100 w-full sm:w-auto"
              >
                <Avatar
                  :src="therapist.photoUrl"
                  :name="therapist.name"
                  :size="32"
                  :href="therapist.linkedInUrl"
                  class="border border-white shadow-sm"
                />
                <div class="text-sm">
                  <div class="font-medium text-gray-800">{{ therapist.name.split(" ")[0] }}</div>
                  <div class="text-[10px] text-gray-500">{{ therapist.role }}</div>
                </div>
              </div>
            </div>
            <div
              v-else
              class="text-sm text-gray-400 italic py-2"
            >
              No hay terapeutas asignados. Ve a "Gestión Terapeutas" para asignar.
            </div>
          </div>

          <div class="p-6">
            <div class="flex justify-between items-center mb-4">
              <h4 class="text-sm font-bold text-gray-400 uppercase tracking-wider">Servicios Ofrecidos</h4>
              <button
                @click="toggleServiceModal(spa)"
                class="text-xs text-spa-teal font-medium hover:underline"
              >
                + Gestionar Servicios
              </button>
            </div>

            <div class="space-y-3">
              <div
                v-for="category in categories"
                :key="category.value"
              >
                <div v-if="getServicesForSpaByCategory(spa, category.value).length > 0">
                  <h5 class="text-xs font-bold text-gray-500 mb-2 mt-3 flex items-center gap-1">
                    {{ category.icon }} {{ category.label }}
                  </h5>
                  <div class="flex flex-wrap gap-2">
                    <span
                      v-for="service in getServicesForSpaByCategory(spa, category.value)"
                      :key="service.id"
                      class="text-xs px-2 py-1 rounded border bg-white text-gray-600"
                      :class="category.borderClass"
                    >
                      {{ service.name }}
                    </span>
                  </div>
                </div>
              </div>
              <div
                v-if="!spa.serviceIds || spa.serviceIds.length === 0"
                class="text-sm text-gray-400 italic"
              >
                No hay servicios habilitados en este centro.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <Modal
      :is-open="isModalOpen"
      :title="isEditing ? 'Editar Spa' : 'Nuevo Spa'"
      @close="closeModal"
    >
      <form
        @submit.prevent="saveSpa"
        class="space-y-4"
      >
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Nombre del Spa</label>
          <input
            v-model="form.name"
            type="text"
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-spa-teal/20 focus:border-spa-teal"
            placeholder="Ej: Spa Madrid Centro"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Color del Tema</label>
          <div class="flex gap-3 mt-2">
            <button
              v-for="color in themeColors"
              :key="color.value"
              type="button"
              @click="form.themeColor = color.value"
              class="w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 flex items-center justify-center"
              :class="[
                color.bgClass,
                form.themeColor === color.value ? 'border-gray-600 scale-110' : 'border-transparent',
              ]"
              :title="color.label"
            >
              <span
                v-if="form.themeColor === color.value"
                class="text-white text-xs"
              >✓</span>
            </button>
          </div>
        </div>

        <div class="flex justify-end gap-3 pt-4">
          <BaseButton
            variant="secondary"
            type="button"
            @click="closeModal"
          >
            Cancelar
          </BaseButton>
          <BaseButton
            variant="primary"
            type="submit"
          >
            {{ isEditing ? "Guardar Cambios" : "Crear Spa" }}
          </BaseButton>
        </div>
      </form>
    </Modal>

    <Modal
      :is-open="isServiceModalOpen"
      title="Gestionar Servicios del Spa"
      @close="closeServiceModal"
    >
      <div class="max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
        <div
          v-for="category in categories"
          :key="category.value"
          class="mb-6"
        >
          <h5
            class="font-bold text-gray-800 mb-3 flex items-center gap-2 sticky top-0 bg-white py-2 z-10 border-b border-gray-100"
          >
            {{ category.icon }} {{ category.label }}
          </h5>
          <div class="space-y-2">
            <label
              v-for="service in serviceStore.getServicesByCategory(category.value)"
              :key="service.id"
              class="flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer hover:bg-gray-50"
              :class="selectedServiceIds.includes(service.id) ? 'border-spa-teal bg-spa-teal/5' : 'border-gray-200'"
            >
              <div class="flex items-start gap-3">
                <input
                  v-model="selectedServiceIds"
                  type="checkbox"
                  :value="service.id"
                  class="mt-1 rounded text-spa-teal focus:ring-spa-teal"
                />
                <div>
                  <div class="font-medium text-sm text-gray-900">{{ service.name }}</div>
                  <div class="text-xs text-gray-500">{{ service.duration }} min • {{ service.price }}€</div>
                </div>
              </div>
              <span
                v-if="service.requiresCabin"
                class="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded"
              >Cabina</span>
            </label>
          </div>
        </div>
      </div>
      <div class="flex justify-end gap-3 pt-4 border-t border-gray-100 mt-4">
        <BaseButton
          variant="secondary"
          @click="closeServiceModal"
        >
          Cancelar
        </BaseButton>
        <BaseButton
          variant="primary"
          @click="saveServices"
        >
          Guardar Selección
        </BaseButton>
      </div>
    </Modal>
  </div>
</template>

<script setup lang="ts">
  import BaseButton from "@/components/common/BaseButton.vue";
  import Modal from "@/components/common/Modal.vue";
  import Avatar from "@/components/common/Avatar.vue";
  import { useSpaManager } from "@/composables/useSpaManager";
  import {
    THEME_COLORS,
    SERVICE_CATEGORIES_FOR_SPA,
    getThemeClasses,
  } from "@/data/spaManagerConfig";

  const {
    spaStore,
    serviceStore,
    isModalOpen,
    isEditing,
    isServiceModalOpen,
    selectedServiceIds,
    form,
    getTherapistCount,
    getTherapistsForSpa,
    getServicesForSpaByCategory,
    openCreateModal,
    editSpa,
    closeModal,
    saveSpa,
    confirmDelete,
    toggleServiceModal,
    closeServiceModal,
    saveServices,
  } = useSpaManager();

  const themeColors = THEME_COLORS;
  const categories = SERVICE_CATEGORIES_FOR_SPA;
</script>

<style scoped>
  .custom-scrollbar::-webkit-scrollbar {
    width: 6px;
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    background: #f1f1f1;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: #d4d4d4;
    border-radius: 3px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: #c0c0c0;
  }
</style>
