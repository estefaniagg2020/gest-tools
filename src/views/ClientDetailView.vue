<template>
  <div class="h-full flex flex-col p-6 overflow-y-auto">
    <BackLink
      :to="{ name: 'clients' }"
      label="Clientes"
    />
    <template v-if="client">
      <div class="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-8">
        <div>
          <h1 class="text-2xl font-bold text-app-title">{{ client.name }}</h1>
          <p v-if="client.email" class="text-app-text/70 text-sm mt-1">{{ client.email }}</p>
          <p v-if="client.phone" class="text-app-text/70 text-sm">{{ client.phone }}</p>
          <p v-if="client.notes" class="text-app-text/70 text-sm mt-2">{{ client.notes }}</p>
        </div>
        <div class="flex gap-2 shrink-0">
          <BaseButton
            variant="outline"
            @click="editClient(client)"
          >
            Editar
          </BaseButton>
          <BaseButton
            variant="secondary"
            class="text-red-600 hover:bg-red-50"
            @click="handleDelete"
          >
            Eliminar
          </BaseButton>
        </div>
      </div>

      <section class="mt-8">
        <h2 class="text-lg font-semibold text-app-title mb-4">Historial de citas</h2>
        <ul
          v-if="historyEntries.length > 0"
          class="space-y-3"
        >
          <li
            v-for="entry in historyEntries"
            :key="entry.appointment.id"
            class="flex flex-wrap items-center gap-x-4 gap-y-1 p-4 rounded-xl border border-gray-100 bg-white shadow-sm"
          >
            <span class="text-sm font-medium text-gray-700 min-w-[140px]">
              {{ formatHistoryDate(entry.appointment.start) }}
            </span>
            <span class="text-sm text-gray-600">{{ entry.serviceName }}</span>
            <span class="text-sm text-gray-500">{{ entry.memberName }}</span>
            <span
              class="text-xs font-medium px-2 py-0.5 rounded"
              :class="entry.appointment.status === 'cancelled' ? 'bg-gray-200 text-gray-600' : 'bg-teal-100 text-teal-700'"
            >
              {{ entry.appointment.status === "cancelled" ? "Cancelada" : "Confirmada" }}
            </span>
          </li>
        </ul>
        <p
          v-else
          class="text-sm text-gray-500 py-6"
        >
          Este cliente no tiene citas registradas.
        </p>
      </section>
    </template>
    <p
      v-else
      class="text-sm text-gray-500 py-8"
    >
      Cliente no encontrado.
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
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-accent/20 focus:border-brand-accent"
            placeholder="Nombre del cliente"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Email (opcional)</label>
          <input
            v-model="form.email"
            type="email"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-accent/20 focus:border-brand-accent"
            placeholder="email@ejemplo.com"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Teléfono (opcional)</label>
          <input
            v-model="form.phone"
            type="tel"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-accent/20 focus:border-brand-accent"
            placeholder="+34 600 000 000"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Notas (opcional)</label>
          <textarea
            v-model="form.notes"
            rows="2"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-accent/20 focus:border-brand-accent"
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
            Guardar cambios
          </BaseButton>
        </div>
      </form>
    </Modal>
  </div>
</template>

<script setup lang="ts">
  import { onMounted } from "vue";
  import { useRouter } from "vue-router";
  import BaseButton from "@/components/common/BaseButton.vue";
  import BackLink from "@/components/common/BackLink.vue";
  import Modal from "@/components/common/Modal.vue";
  import { useClientStore } from "@/stores/client";
  import { useAppointmentStore } from "@/stores/appointment";
  import { useServiceStore } from "@/stores/service";
  import { useTeamStore } from "@/stores/team";
  import { useToast } from "@/composables/useToast";
  import { useClientHistory } from "@/composables/useClientHistory";
  import { useClientsManager } from "@/composables/useClientsManager";

  const router = useRouter();
  const clientStore = useClientStore();
  const appointmentStore = useAppointmentStore();
  const serviceStore = useServiceStore();
  const teamStore = useTeamStore();
  const { addToast } = useToast();

  const { client, historyEntries, formatHistoryDate } = useClientHistory();
  const {
    isModalOpen,
    isEditing,
    form,
    editClient,
    closeModal,
    saveClient,
  } = useClientsManager();

  const handleDelete = () => {
    if (!client.value) return;
    if (!confirm("¿Estás seguro de eliminar este cliente?")) return;
    clientStore.deleteClient(client.value.id);
    addToast("Cliente eliminado", "success");
    router.push({ name: "clients" });
  };

  const ensureStores = () => {
    clientStore.initialize();
    appointmentStore.initialize();
    serviceStore.initialize();
    teamStore.initialize();
  };

  onMounted(ensureStores);
</script>
