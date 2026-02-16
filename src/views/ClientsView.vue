<template>
  <div class="h-full flex flex-col p-6 overflow-y-auto">
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
      <div>
        <h1 class="text-2xl font-bold text-app-title">Clientes</h1>
        <p class="text-app-text/70 text-sm mt-1">
          Añade y gestiona clientes para asignarles servicios y empleados en la agenda.
        </p>
      </div>
      <BaseButton
        variant="primary"
        @click="openCreateModal"
      >
        <template #icon>
          <span class="text-lg leading-none">+</span>
        </template>
        Añadir cliente
      </BaseButton>
    </div>

    <div
      v-if="clientStore.clients.length > 0"
      class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
    >
      <div
        v-for="client in clientStore.clients"
        :key="client.id"
        class="flex items-start justify-between gap-3 p-4 rounded-xl border border-gray-100 bg-white shadow-sm hover:border-gray-200 transition-colors"
      >
        <div class="min-w-0 flex-1">
          <h3 class="font-semibold text-gray-900 truncate">{{ client.name }}</h3>
          <p v-if="client.email" class="text-sm text-gray-500 truncate mt-0.5">{{ client.email }}</p>
          <p v-if="client.phone" class="text-sm text-gray-500 truncate">{{ client.phone }}</p>
        </div>
        <div class="flex gap-1 shrink-0">
          <button
            type="button"
            class="p-2 text-gray-400 hover:text-spa-teal hover:bg-gray-50 rounded-lg transition-colors"
            title="Editar"
            @click="editClient(client)"
          >
            ✏️
          </button>
          <button
            type="button"
            class="p-2 text-gray-400 hover:text-red-500 hover:bg-gray-50 rounded-lg transition-colors"
            title="Eliminar"
            @click="confirmDelete(client.id)"
          >
            🗑️
          </button>
        </div>
      </div>
    </div>
    <p
      v-else
      class="text-sm text-gray-500 py-8 text-center"
    >
      No hay clientes. Añade el primero para poder asignarles citas en la agenda.
    </p>

    <Modal
      :is-open="isModalOpen"
      :title="isEditing ? 'Editar cliente' : 'Nuevo cliente'"
      @close="closeModal"
    >
      <form
        class="space-y-4"
        @submit.prevent="saveClient"
      >
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
          <input
            v-model="form.name"
            type="text"
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-spa-teal/20 focus:border-spa-teal"
            placeholder="Nombre del cliente"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Email (opcional)</label>
          <input
            v-model="form.email"
            type="email"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-spa-teal/20 focus:border-spa-teal"
            placeholder="email@ejemplo.com"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Teléfono (opcional)</label>
          <input
            v-model="form.phone"
            type="tel"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-spa-teal/20 focus:border-spa-teal"
            placeholder="+34 600 000 000"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Notas (opcional)</label>
          <textarea
            v-model="form.notes"
            rows="2"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-spa-teal/20 focus:border-spa-teal"
            placeholder="Notas internas"
          />
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
            {{ isEditing ? 'Guardar cambios' : 'Crear cliente' }}
          </BaseButton>
        </div>
      </form>
    </Modal>
  </div>
</template>

<script setup lang="ts">
  import BaseButton from "@/components/common/BaseButton.vue";
  import Modal from "@/components/common/Modal.vue";
  import { useClientsManager } from "@/composables/useClientsManager";

  const {
    clientStore,
    isModalOpen,
    isEditing,
    form,
    openCreateModal,
    editClient,
    closeModal,
    saveClient,
    confirmDelete,
  } = useClientsManager();
</script>
