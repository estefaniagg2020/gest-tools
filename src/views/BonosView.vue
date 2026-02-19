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
            {{ $t("bonosPage.kicker") }}
          </p>
          <h1 class="text-3xl font-bold tracking-tight text-app-title sm:text-4xl">
            {{ $t("bonosPage.title") }}
          </h1>
          <p class="mt-2 text-app-text/80 max-w-xl">
            {{ $t("bonosPage.subtitle") }}
          </p>
        </div>
      <div class="flex flex-col sm:flex-row gap-3 sm:items-center shrink-0">
        <label for="bonos-search" class="sr-only">{{ $t("bonosPage.searchLabel") }}</label>
        <input
          id="bonos-search"
          v-model="searchQuery"
          type="search"
          :placeholder="$t('bonosPage.searchPlaceholder')"
          class="input-modern w-full sm:w-72 rounded-xl border border-app-border bg-app-bg/50 px-4 py-2.5 text-app-title placeholder:text-app-text/60 transition-colors focus:border-brand-accent focus:bg-app-surface focus:outline-none focus:ring-2 focus:ring-brand-accent/20"
        />
        <BaseButton
          variant="primary"
          :disabled="bonoStore.templates.length === 0 || clientStore.clients.length === 0"
          @click="openBuyBonoModal"
        >
          {{ $t("bonosPage.buyBono") }}
        </BaseButton>
        <RouterLink
          :to="{ name: 'config-bonos' }"
          class="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border border-brand-accent/30 text-brand-accent bg-app-surface hover:bg-brand-accent/10 transition-colors"
        >
          ⚙️ {{ $t("bonosPage.manage") }}
        </RouterLink>
      </div>
    </div>

    <Modal
      class="relative"
      :is-open="isBuyBonoOpen"
      :title="$t('bonosPage.buyBonoModalTitle')"
      @close="closeBuyBonoModal"
    >
      <form
        class="space-y-4"
        @submit.prevent="submitBuyBono"
      >
        <div>
          <label class="block text-sm font-medium text-app-title mb-1">{{ $t('bonosPage.selectClient') }}</label>
          <SearchableSelect
            v-model="buyBonoClientId"
            :options="clientOptions"
            :placeholder="$t('bonosPage.selectClientPlaceholder')"
            :empty-option-label="$t('bonosPage.selectClientPlaceholder')"
            :disabled="clientStore.clients.length === 0"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-app-title mb-1">{{ $t('bonosPage.selectBono') }}</label>
          <SearchableSelect
            v-model="buyBonoTemplateId"
            :options="templateOptions"
            :placeholder="$t('bonosPage.selectBonoPlaceholder')"
            :empty-option-label="$t('bonosPage.selectBonoPlaceholder')"
            :disabled="bonoStore.templates.length === 0"
          />
        </div>
        <div class="flex justify-end gap-3 pt-4">
          <BaseButton
            variant="secondary"
            type="button"
            @click="closeBuyBonoModal"
          >
            {{ $t("common.cancel") }}
          </BaseButton>
          <BaseButton
            variant="primary"
            type="submit"
            :disabled="!buyBonoClientId || !buyBonoTemplateId"
          >
            {{ $t("bonosPage.buyBonoConfirm") }}
          </BaseButton>
        </div>
      </form>
    </Modal>

    <ul
      v-if="filteredTemplates.length > 0"
      class="relative space-y-3"
    >
      <li
        v-for="template in filteredTemplates"
        :key="template.id"
        class="p-4 rounded-xl border border-app-border-subtle bg-app-surface shadow-card"
      >
        <div class="flex items-start justify-between gap-4">
          <div class="min-w-0">
            <p class="font-semibold text-app-title truncate">{{ template.name }}</p>
            <p class="text-sm text-app-text/70 mt-1">
              <template v-if="template.type === 'pack'">
                {{ template.packTotalSessions ?? 0 }} {{ $t("bonosPage.sessions") }} · {{ template.packPrice ?? 0 }}€
              </template>
              <template v-else>
                {{ $t("bonosPage.every") }} {{ template.loyaltyTriggerEvery ?? 0 }} {{ $t("bonosPage.uses") }} → {{ template.loyaltyRewardSessions ?? 0 }} {{ $t("bonosPage.free") }}
                <span v-if="template.serviceId" class="text-app-text/60">
                  · {{ $t("bonosPage.onlyService") }}
                </span>
              </template>
            </p>
          </div>
          <span
            class="shrink-0 text-xs font-medium px-2 py-0.5 rounded-full"
            :class="template.type === 'pack' ? 'bg-brand-accent/15 text-brand-accent' : 'bg-violet-100 text-violet-700'"
          >
            {{ template.type === "pack" ? $t("bonosPage.typePack") : $t("bonosPage.typeLoyalty") }}
          </span>
        </div>
      </li>
    </ul>

    <p
      v-else
      class="relative text-sm text-app-text/70 py-8 text-center"
    >
      {{ searchQuery ? $t("bonosPage.noBonosSearch") : $t("bonosPage.noBonos") }}
    </p>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed, onMounted, ref } from "vue";
  import { RouterLink, useRouter } from "vue-router";
  import { useBillingConfig } from "@/composables/useBillingConfig";
  import { useBonoStore } from "@/stores/bono";
  import { useClientStore } from "@/stores/client";
  import { useI18n } from "vue-i18n";
  import { useToast } from "@/composables/useToast";
  import Modal from "@/components/common/Modal.vue";
  import SearchableSelect from "@/components/common/SearchableSelect.vue";
  import BaseButton from "@/components/common/BaseButton.vue";

  const { t } = useI18n();
  const bonoStore = useBonoStore();
  const clientStore = useClientStore();
  const { addToast } = useToast();
  const searchQuery = ref("");
  const isBuyBonoOpen = ref(false);
  const buyBonoClientId = ref("");
  const buyBonoTemplateId = ref("");

  const clientOptions = computed(() =>
    clientStore.clients.map((client) => ({ value: client.id, label: client.name })),
  );
  const templateOptions = computed(() =>
    bonoStore.templates.map((template) => ({ value: template.id, label: template.name })),
  );

  const filteredTemplates = computed(() => {
    const list = bonoStore.templates;
    const query = searchQuery.value.trim().toLowerCase();
    if (!query) return list;
    return list.filter((template) => template.name.toLowerCase().includes(query));
  });

  const openBuyBonoModal = () => {
    buyBonoClientId.value = "";
    buyBonoTemplateId.value = bonoStore.templates[0]?.id ?? "";
    isBuyBonoOpen.value = true;
  };

  const closeBuyBonoModal = () => {
    isBuyBonoOpen.value = false;
  };

  const submitBuyBono = () => {
    const clientId = buyBonoClientId.value;
    const templateId = buyBonoTemplateId.value;
    if (!clientId || !templateId) return;
    bonoStore.assignBonoToClient(clientId, templateId);
    addToast(t("bonosPage.bonoAssignedSuccess"), "success");
    closeBuyBonoModal();
  };

  const { load: loadBillingConfig, bonosEnabled } = useBillingConfig();
  const router = useRouter();

  onMounted(async () => {
    await loadBillingConfig();
    if (!bonosEnabled.value) {
      router.replace({ name: "config" });
      return;
    }
    bonoStore.initialize();
    clientStore.initialize();
  });
</script>

