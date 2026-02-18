<template>
  <div class="h-full flex flex-col p-6 overflow-y-auto">
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
      <div>
        <h1 class="text-2xl font-bold text-app-title">{{ $t('clients.title') }}</h1>
        <p class="text-app-text/70 text-sm mt-1">
          {{ $t('clients.subtitle') }}
        </p>
      </div>
      <BaseButton
        variant="primary"
        @click="openCreateModal"
      >
        <template #icon>
          <span class="text-lg leading-none">+</span>
        </template>
        {{ $t('clients.addClient') }}
      </BaseButton>
    </div>

    <div
      v-if="clientStore.clients.length > 0"
      class="mb-6"
    >
      <label for="clients-search" class="sr-only">{{ $t('clients.searchLabel') }}</label>
      <input
        id="clients-search"
        v-model="searchQuery"
        type="search"
        :placeholder="$t('clients.searchPlaceholder')"
        class="input-modern w-full max-w-md rounded-xl border border-app-border bg-app-bg/50 px-4 py-2.5 text-app-title placeholder:text-app-text/60 transition-colors focus:border-brand-accent focus:bg-app-surface focus:outline-none focus:ring-2 focus:ring-brand-accent/20"
      />
    </div>

    <div
      v-if="filteredClients.length > 0"
      class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
    >
      <div
        v-for="client in filteredClients"
        :key="client.id"
        class="flex items-start justify-between gap-3 p-4 rounded-xl border border-app-border-subtle bg-app-surface shadow-card hover:border-brand-accent/30 transition-colors"
      >
        <div class="min-w-0 flex-1">
          <h3 class="font-semibold text-app-title truncate">{{ client.name }}</h3>
          <p v-if="client.email" class="text-sm text-app-text/70 truncate mt-0.5">{{ client.email }}</p>
          <p v-if="client.phone" class="text-sm text-app-text/70 truncate">{{ client.phone }}</p>
        </div>
        <div class="flex gap-1 shrink-0">
          <RouterLink
            :to="{ name: 'client-detail', params: { id: client.id } }"
            class="p-2 text-app-text/70 hover:text-brand-accent hover:bg-brand-accent/10 rounded-lg transition-colors"
            :title="$t('clients.viewHistory')"
          >
            📋
          </RouterLink>
          <button
            type="button"
            class="p-2 text-app-text/70 hover:text-brand-accent hover:bg-brand-accent/10 rounded-lg transition-colors"
            :title="$t('servicios.edit')"
            @click="editClient(client)"
          >
            ✏️
          </button>
          <button
            type="button"
            class="p-2 text-app-text/70 hover:text-red-500 hover:bg-red-500/10 dark:hover:bg-red-500/20 rounded-lg transition-colors"
            :title="$t('servicios.delete')"
            @click="confirmDelete(client.id)"
          >
            🗑️
          </button>
        </div>
      </div>
    </div>
    <p
      v-else
      class="text-sm text-app-text/70 py-8 text-center"
    >
      {{ searchQuery ? $t('clients.noClientsSearch') : $t('clients.noClientsEmpty') }}
    </p>

    <Modal
      :is-open="isModalOpen"
      :title="isEditing ? $t('clients.modalTitleEdit') : $t('clients.modalTitleNew')"
      @close="closeModal"
    >
      <form
        class="space-y-4"
        @submit.prevent="saveClient"
      >
        <div>
          <label class="block text-sm font-medium text-app-title mb-1">{{ $t('clients.nameLabel') }}</label>
          <input
            v-model="form.name"
            type="text"
            required
            class="input-modern w-full rounded-xl border border-app-border bg-app-bg/50 px-4 py-2.5 text-app-title placeholder:text-app-text/60 transition-colors focus:border-brand-accent focus:bg-app-surface focus:outline-none focus:ring-2 focus:ring-brand-accent/20"
            :placeholder="$t('clients.namePlaceholder')"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-app-title mb-1">{{ $t('clients.emailLabel') }}</label>
          <input
            v-model="form.email"
            type="email"
            class="input-modern w-full rounded-xl border border-app-border bg-app-bg/50 px-4 py-2.5 text-app-title placeholder:text-app-text/60 transition-colors focus:border-brand-accent focus:bg-app-surface focus:outline-none focus:ring-2 focus:ring-brand-accent/20"
            :placeholder="$t('clients.emailPlaceholder')"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-app-title mb-1">{{ $t('clients.phoneLabel') }}</label>
          <input
            v-model="form.phone"
            type="tel"
            class="input-modern w-full rounded-xl border border-app-border bg-app-bg/50 px-4 py-2.5 text-app-title placeholder:text-app-text/60 transition-colors focus:border-brand-accent focus:bg-app-surface focus:outline-none focus:ring-2 focus:ring-brand-accent/20"
            :placeholder="$t('clients.phonePlaceholder')"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-app-title mb-1">{{ $t('clients.notesLabel') }}</label>
          <textarea
            v-model="form.notes"
            rows="2"
            class="input-modern w-full rounded-xl border border-app-border bg-app-bg/50 px-4 py-2.5 text-app-title placeholder:text-app-text/60 transition-colors focus:border-brand-accent focus:bg-app-surface focus:outline-none focus:ring-2 focus:ring-brand-accent/20"
            :placeholder="$t('clients.notesPlaceholder')"
          />
        </div>
        <div class="flex justify-end gap-3 pt-4">
          <BaseButton
            variant="secondary"
            type="button"
            @click="closeModal"
          >
            {{ $t('common.cancel') }}
          </BaseButton>
          <BaseButton
            variant="primary"
            type="submit"
          >
            {{ isEditing ? $t('clients.saveChanges') : $t('clients.createClient') }}
          </BaseButton>
        </div>
      </form>
    </Modal>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed } from "vue";
  import { RouterLink } from "vue-router";
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

  const searchQuery = ref("");

  const filteredClients = computed(() => {
    const q = searchQuery.value.trim().toLowerCase();
    if (!q) return clientStore.clients;
    return clientStore.clients.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        (c.email?.toLowerCase().includes(q)) ||
        (c.phone?.replace(/\s/g, "").includes(q)),
    );
  });
</script>
