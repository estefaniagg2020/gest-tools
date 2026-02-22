<template>
  <div class="servicios-gestor min-h-full overflow-y-auto">
    <div class="relative px-6 pt-8 pb-10">
      <div
        class="absolute inset-0 bg-linear-to-br from-app-bg via-app-surface to-brand-soft/30 dark:from-app-bg dark:via-app-bg dark:to-app-border-subtle/50 pointer-events-none"
        aria-hidden="true"
      />

      <div class="relative flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div>
          <p class="text-xs font-semibold uppercase tracking-widest text-brand-accent mb-1">
            {{ $t('servicios.catalog') }}
          </p>
          <h1 class="text-3xl font-bold tracking-tight text-app-title sm:text-4xl">
            {{ $t('servicios.title') }}
          </h1>
          <p class="mt-2 text-app-text/80 max-w-xl">
            {{ $t('servicios.subtitle') }}
          </p>
        </div>
        <div class="flex flex-col sm:flex-row gap-4 sm:items-center shrink-0">
          <label for="servicios-search" class="sr-only">{{ $t('servicios.searchLabel') }}</label>
          <input
            id="servicios-search"
            v-model="searchQuery"
            type="search"
            :placeholder="$t('servicios.searchPlaceholder')"
            class="input-modern w-full sm:w-64 rounded-xl border border-app-border bg-app-bg/50 px-4 py-2.5 text-app-title placeholder:text-app-text/60 transition-colors focus:border-brand-accent focus:bg-app-surface focus:outline-none focus:ring-2 focus:ring-brand-accent/20"
          />
          <div class="flex flex-wrap gap-2">
          <BaseButton
            variant="outline"
            class="rounded-xl px-5 py-2.5"
            @click="openCategoryModal"
          >
            {{ $t('servicios.categories') }}
          </BaseButton>
          <BaseButton
            variant="accent"
            class="rounded-xl px-5 py-2.5"
            @click="openCreateModal"
          >
            <template #icon>
              <span class="text-lg leading-none">+</span>
            </template>
            {{ $t('servicios.addService') }}
          </BaseButton>
          </div>
        </div>
      </div>

      <div class="relative space-y-8">
        <section
          v-for="(category, catIndex) in filteredCategoriesWithServices"
          :key="category.id"
          class="bg-app-surface/90 dark:bg-app-surface backdrop-blur rounded-2xl shadow-card border border-app-border-subtle overflow-hidden"
        >
          <div
            class="flex items-center gap-3 px-6 py-4 border-b border-app-border-subtle bg-app-bg/80"
          >
            <span
              class="flex h-9 w-9 items-center justify-center rounded-xl text-base font-medium shadow-sm"
              :class="getCategoryAccent(catIndex)"
            >
              {{ category.icon }}
            </span>
            <h2 class="text-sm font-bold uppercase tracking-wider text-app-text/80">
              {{ category.label }}
            </h2>
          </div>
          <div class="p-6">
            <div
              v-if="getFilteredServicesForCategory(category.id).length > 0"
              class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
            >
              <div
                v-for="service in getFilteredServicesForCategory(category.id)"
                :key="service.id"
                class="group flex items-start justify-between gap-3 rounded-xl border border-app-border-subtle bg-app-surface p-5 shadow-sm transition-all duration-200 hover:border-brand-accent/30 hover:shadow-md hover:shadow-brand-accent/10"
                :class="getCategoryBorder(catIndex)"
              >
                <div class="min-w-0 flex-1">
                  <h3 class="font-semibold text-app-title truncate">
                    {{ service.name }}
                  </h3>
                  <p class="mt-1 text-sm font-medium text-brand-accent">
                    {{ service.duration }} min · {{ formatServicePrice(service.price) }}
                  </p>
                  <p
                    v-if="service.description"
                    class="mt-1.5 text-xs text-app-text/70 line-clamp-2"
                  >
                    {{ service.description }}
                  </p>
                </div>
                <div class="flex gap-1 shrink-0 opacity-70 group-hover:opacity-100 transition-opacity">
                  <button
                    type="button"
                    class="rounded-lg p-2.5 text-app-text/70 transition-colors hover:bg-brand-accent/10 hover:text-brand-accent"
                    :title="$t('servicios.edit')"
                    @click="editService(service)"
                  >
                    <span aria-hidden="true">✏️</span>
                  </button>
                  <button
                    type="button"
                    class="rounded-lg p-2.5 text-app-text/70 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/20 dark:hover:text-red-400"
                    :title="$t('servicios.delete')"
                    @click="confirmDelete(service.id)"
                  >
                    <span aria-hidden="true">🗑️</span>
                  </button>
                </div>
              </div>
            </div>
            <p
              v-else
              class="py-6 text-center text-sm italic text-app-text/70"
            >
              {{ searchQuery ? $t('servicios.noServicesSearch') : $t('servicios.noServicesInCategory') }}
            </p>
          </div>
        </section>
      </div>
    </div>

    <Modal
      :is-open="isModalOpen"
      :title="isEditing ? $t('servicios.modalTitleEdit') : $t('servicios.modalTitleNew')"
      variant="modern"
      @close="closeModal"
    >
      <form
        class="space-y-5"
        @submit.prevent="saveService"
      >
        <div>
          <label class="mb-1.5 block text-sm font-medium text-app-title">
            {{ $t('servicios.categoryLabel') }}
          </label>
          <select
            v-model="form.categoryId"
            required
            class="input-modern w-full rounded-xl border border-app-border bg-app-bg/50 px-4 py-2.5 text-app-title transition-colors focus:border-brand-accent focus:bg-app-surface focus:outline-none focus:ring-2 focus:ring-brand-accent/20"
          >
            <option
              v-for="cat in categories"
              :key="cat.id"
              :value="cat.id"
            >
              {{ cat.icon }} {{ cat.label }}
            </option>
          </select>
          <p
            v-if="categories.length === 0"
            class="mt-1 text-xs text-amber-600 dark:text-amber-400"
          >
            {{ $t('servicios.noCategoriesHint') }}
          </p>
        </div>

        <div>
          <label class="mb-1.5 block text-sm font-medium text-app-title">
            {{ $t('servicios.nameLabel') }}
          </label>
          <input
            v-model="form.name"
            type="text"
            required
            class="input-modern w-full rounded-xl border border-app-border bg-app-bg/50 px-4 py-2.5 text-app-title placeholder:text-app-text/60 transition-colors focus:border-brand-accent focus:bg-app-surface focus:outline-none focus:ring-2 focus:ring-brand-accent/20"
            :placeholder="$t('servicios.namePlaceholder')"
          />
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="mb-1.5 block text-sm font-medium text-app-title">
              {{ $t('servicios.durationLabel') }}
            </label>
            <input
              v-model.number="form.duration"
              type="number"
              min="1"
              required
              class="input-modern w-full rounded-xl border border-app-border bg-app-bg/50 px-4 py-2.5 text-app-title transition-colors focus:border-brand-accent focus:bg-app-surface focus:outline-none focus:ring-2 focus:ring-brand-accent/20"
            />
          </div>
          <div>
            <label class="mb-1.5 block text-sm font-medium text-app-title">
              {{ $t('servicios.priceLabel') }}
            </label>
            <input
              v-model.number="form.price"
              type="number"
              min="0"
              step="0.01"
              required
              class="input-modern w-full rounded-xl border border-app-border bg-app-bg/50 px-4 py-2.5 text-app-title transition-colors focus:border-brand-accent focus:bg-app-surface focus:outline-none focus:ring-2 focus:ring-brand-accent/20"
            />
          </div>
        </div>

        <div>
          <label class="mb-1.5 block text-sm font-medium text-app-title">
            {{ $t('servicios.descriptionLabel') }}
          </label>
          <textarea
            v-model="form.description"
            rows="2"
            class="input-modern w-full rounded-xl border border-app-border bg-app-bg/50 px-4 py-2.5 text-app-title placeholder:text-app-text/60 transition-colors focus:border-brand-accent focus:bg-app-surface focus:outline-none focus:ring-2 focus:ring-brand-accent/20"
            :placeholder="$t('servicios.placeholderDesc')"
          />
        </div>

        <div class="flex justify-end gap-3 pt-2">
          <BaseButton
            variant="outline"
            type="button"
            class="rounded-xl"
            @click="closeModal"
          >
            {{ $t('common.cancel') }}
          </BaseButton>
          <BaseButton
            variant="accent"
            type="submit"
            class="rounded-xl"
          >
            {{ isEditing ? $t('servicios.saveChanges') : $t('servicios.createService') }}
          </BaseButton>
        </div>
      </form>
    </Modal>

    <Modal
      :is-open="isCategoryModalOpen"
      :title="isCategoryModalOpen ? $t('servicios.newCategory') : $t('servicios.modalTitleNew')"
      variant="modern"
      @close="closeCategoryModal"
    >
      <form
        class="space-y-5"
        @submit.prevent="saveCategory"
      >
        <div>
          <label class="mb-1.5 block text-sm font-medium text-app-title">
            {{ $t('servicios.categoryNameLabel') }}
          </label>
          <input
            v-model="categoryForm.label"
            type="text"
            required
            class="input-modern w-full rounded-xl border border-app-border bg-app-bg/50 px-4 py-2.5 text-app-title placeholder:text-app-text/60 transition-colors focus:border-brand-accent focus:bg-app-surface focus:outline-none focus:ring-2 focus:ring-brand-accent/20"
            :placeholder="$t('servicios.categoryNamePlaceholder')"
          />
        </div>
        <div>
          <label class="mb-1.5 block text-sm font-medium text-app-title">
            {{ $t('servicios.iconLabel') }}
          </label>
          <input
            v-model="categoryForm.icon"
            type="text"
            maxlength="4"
            class="input-modern w-20 text-2xl text-center rounded-xl border border-app-border bg-app-bg/50 px-4 py-2.5 text-app-title transition-colors focus:border-brand-accent focus:bg-app-surface focus:outline-none focus:ring-2 focus:ring-brand-accent/20"
            placeholder="📋"
          />
        </div>
        <div class="flex justify-end gap-3 pt-2">
          <BaseButton
            variant="outline"
            type="button"
            class="rounded-xl"
            @click="closeCategoryModal"
          >
            {{ $t('common.cancel') }}
          </BaseButton>
          <BaseButton
            variant="accent"
            type="submit"
            class="rounded-xl"
          >
            {{ $t('servicios.createCategory') }}
          </BaseButton>
        </div>
      </form>
    </Modal>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted } from "vue";
  import { useRouter } from "vue-router";
  import { useI18n } from "vue-i18n";
  import BaseButton from "@/components/common/BaseButton.vue";
  import Modal from "@/components/common/Modal.vue";
  import { useBillingConfig } from "@/composables/useBillingConfig";
  import { useServiciosManager } from "@/composables/useServiciosManager";
  import type { ServiceCategoryDefinition } from "@/interfaces";
  import {
    getCategoryAccentClass,
    getCategoryBorderClass,
  } from "@/data/serviceCategoryDefaults";

  const { t } = useI18n();
  const router = useRouter();
  const { defaultVatPercent, priceWithVat, load: loadBillingConfig, serviciosEnabled } = useBillingConfig();

  onMounted(async () => {
    await loadBillingConfig();
    if (!serviciosEnabled.value) router.replace({ name: "config" });
  });

  const formatServicePrice = (price: number) => {
    if (defaultVatPercent.value === 0) return `${price}€`;
    const total = priceWithVat(price);
    return `${price}€ (${total.toFixed(2)}€ ${t("servicios.priceWithVatSuffix")})`;
  };

  const {
    serviceStore,
    categories,
    isModalOpen,
    isEditing,
    form,
    openCreateModal,
    editService,
    closeModal,
    saveService,
    confirmDelete,
    isCategoryModalOpen,
    categoryForm,
    openCategoryModal,
    closeCategoryModal,
    saveCategory,
  } = useServiciosManager();

  const searchQuery = ref("");

  const getFilteredServicesForCategory = (categoryId: string) => {
    const services = serviceStore.getServicesByCategory(categoryId);
    const q = searchQuery.value.trim().toLowerCase();
    if (!q) return services;
    return services.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        (s.description?.toLowerCase().includes(q)),
    );
  };

  const filteredCategoriesWithServices = computed(() => {
    const q = searchQuery.value.trim().toLowerCase();
    const list = categories.value;
    if (!q) return list;
    return list.filter(
      (cat: ServiceCategoryDefinition) => getFilteredServicesForCategory(cat.id).length > 0,
    );
  });

  const getCategoryAccent = (index: number) => getCategoryAccentClass(index);
  const getCategoryBorder = (index: number) => getCategoryBorderClass(index);
</script>

<style scoped>
  .servicios-gestor {
    font-family: "Inter", ui-sans-serif, system-ui, sans-serif;
    font-feature-settings: "ss01", "ss02", "cv01", "cv02";
  }
</style>
