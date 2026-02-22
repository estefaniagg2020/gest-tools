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
            {{ $t('clients.kicker') }}
          </p>
          <h1 class="text-3xl font-bold tracking-tight text-app-title sm:text-4xl">
            {{ $t('clients.title') }}
          </h1>
          <p class="mt-2 text-app-text/80 max-w-xl">
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

      <div class="relative mb-8 max-w-2xl">
        <ClientSmartSearchPanel
          :query="searchState.query.value"
          :results="searchState.results.value"
          :service-hint="searchState.serviceHint.value"
          :special-filter="searchState.specialFilter.value"
          :is-searching="searchState.isSearching.value"
          :has-searched="searchState.hasSearched.value"
          @update:query="searchState.onQueryChange"
          @clear="searchState.clearSearch"
        />
      </div>

      <div
        v-if="!searchState.hasSearched.value"
        class="relative"
      >
        <div
          v-if="clientStore.clients.length > 0 && bonosEnabled"
          class="mb-4"
        >
          <label class="flex items-center gap-2 cursor-pointer text-sm text-app-title select-none touch-manipulation">
            <input
              v-model="filterActiveBono"
              type="checkbox"
              class="h-4 w-4 min-w-4 min-h-4 rounded border-app-border-subtle text-brand-accent focus:ring-brand-accent"
            />
            {{ $t('clients.filterActiveBono') }}
          </label>
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
              <div class="flex items-center gap-2">
                <h3 class="font-semibold text-app-title truncate">{{ client.name }}</h3>
                <span
                  v-if="bonosEnabled && bonoStore.hasActiveBono(client.id)"
                  class="shrink-0 text-xs font-medium px-2 py-0.5 rounded-full bg-brand-accent/15 text-brand-accent"
                  :title="$t('clientBonos.sectionTitle')"
                >
                  🎫
                </span>
              </div>
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
                class="p-2 text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-500/20 dark:hover:bg-red-500/30 rounded-lg transition-colors"
                :title="$t('servicios.delete')"
                @click="confirmDelete(client.id)"
              >
                🗑️
              </button>
            </div>
          </div>
        </div>
        <div
          v-else
          class="flex flex-col items-center justify-center py-16 px-4 text-center gap-4"
        >
          <span class="text-5xl">👥</span>
          <p class="text-base font-semibold text-app-title">
            {{
              filterActiveBono
                ? $t('clients.noClientsWithActiveBono')
                : $t('clients.noClientsEmpty')
            }}
          </p>
          <BaseButton
            v-if="!filterActiveBono"
            variant="primary"
            @click="openCreateModal"
          >
            <template #icon>
              <span class="text-lg leading-none">+</span>
            </template>
            {{ $t('clients.addClient') }}
          </BaseButton>
        </div>
      </div>

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
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted } from "vue";
  import { RouterLink } from "vue-router";
  import BaseButton from "@/components/common/BaseButton.vue";
  import Modal from "@/components/common/Modal.vue";
  import ClientSmartSearchPanel from "@/components/clients/ClientSmartSearchPanel.vue";
  import { useClientsManager } from "@/composables/useClientsManager";
  import { useClientSearch } from "@/composables/useClientSearch";
  import { useBillingConfig } from "@/composables/useBillingConfig";
  import { useBonoStore } from "@/stores/bono";

  const { bonosEnabled, load: loadBillingConfig } = useBillingConfig();
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

  const searchState = useClientSearch();
  const bonoStore = useBonoStore();
  const filterActiveBono = ref(false);

  const filteredClients = computed(() => {
    let list = clientStore.clients;
    if (filterActiveBono.value) {
      list = list.filter((c) => bonoStore.hasActiveBono(c.id));
    }
    return list;
  });

  onMounted(async () => {
    await loadBillingConfig();
    bonoStore.initialize();
  });
</script>
