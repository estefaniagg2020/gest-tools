<template>
  <div class="min-h-full py-6 px-4 sm:px-6 lg:px-8">
    <div class="mx-auto max-w-2xl">
      <ConfigPageHeader
        :title="$t('configBonos.title')"
        :description="$t('configBonos.description')"
        :back-to="{ name: 'config' }"
        :back-label="$t('common.backToConfig')"
      />

      <div class="mt-8 flex justify-end">
        <BaseButton
          variant="primary"
          @click="openCreate"
        >
          <template #icon>
            <span class="text-lg leading-none">+</span>
          </template>
          {{ $t('configBonos.addBono') }}
        </BaseButton>
      </div>

      <ul
        v-if="templates.length > 0"
        class="mt-6 space-y-3"
      >
        <li
          v-for="template in templates"
          :key="template.id"
          class="flex items-center justify-between gap-4 rounded-xl border border-app-border-subtle bg-app-surface p-4 shadow-sm"
        >
          <div class="min-w-0">
            <p class="font-semibold text-app-title">{{ template.name }}</p>
            <p class="text-sm text-app-text/70 mt-0.5">
              <template v-if="template.type === 'pack'">
                {{ template.packTotalSessions }} sesiones · {{ template.packPrice }}€
              </template>
              <template v-else>
                Cada {{ template.loyaltyTriggerEvery }} usos → {{ template.loyaltyRewardSessions }} gratis
              </template>
            </p>
          </div>
          <div class="flex gap-2 shrink-0">
            <BaseButton
              variant="outline"
              @click="openEdit(template)"
            >
              {{ $t('configBonos.edit') }}
            </BaseButton>
            <BaseButton
              variant="secondary"
              class="text-red-600 hover:bg-red-50"
              @click="confirmRemove(template.id)"
            >
              {{ $t('configBonos.delete') }}
            </BaseButton>
          </div>
        </li>
      </ul>
      <p
        v-else
        class="mt-6 text-sm text-app-text/70"
      >
        {{ $t('configBonos.noBonos') }}
      </p>

      <Modal
        :is-open="isModalOpen"
        :title="isEditing ? $t('configBonos.modalEdit') : $t('configBonos.modalCreate')"
        @close="closeModal"
      >
        <form
          class="space-y-4"
          @submit.prevent="save"
        >
          <div>
            <label class="block text-sm font-medium text-app-title mb-1">{{ $t('configBonos.nameLabel') }}</label>
            <input
              v-model="form.name"
              type="text"
              required
              class="input-modern w-full rounded-xl border border-app-border bg-app-bg/50 px-4 py-2.5 text-app-title placeholder:text-app-text/60 focus:border-brand-accent focus:bg-app-surface focus:outline-none focus:ring-2 focus:ring-brand-accent/20"
              :placeholder="form.type === 'loyalty' ? $t('configBonos.namePlaceholderLoyalty') : $t('configBonos.namePlaceholder')"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-app-title mb-2">{{ $t('configBonos.typePack') }} / {{ $t('configBonos.typeLoyalty') }}</label>
            <div class="flex gap-4">
              <label class="flex items-center gap-2 cursor-pointer">
                <input
                  v-model="form.type"
                  type="radio"
                  value="pack"
                  class="h-4 w-4 text-brand-accent focus:ring-brand-accent"
                />
                <span class="text-sm text-app-title">{{ $t('configBonos.typePack') }}</span>
              </label>
              <label class="flex items-center gap-2 cursor-pointer">
                <input
                  v-model="form.type"
                  type="radio"
                  value="loyalty"
                  class="h-4 w-4 text-brand-accent focus:ring-brand-accent"
                />
                <span class="text-sm text-app-title">{{ $t('configBonos.typeLoyalty') }}</span>
              </label>
            </div>
          </div>
          <template v-if="form.type === 'pack'">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-app-title mb-1">{{ $t('configBonos.packSessions') }}</label>
                <input
                  v-model.number="form.packTotalSessions"
                  type="number"
                  min="1"
                  class="input-modern w-full rounded-xl border border-app-border bg-app-bg/50 px-4 py-2.5 text-app-title focus:border-brand-accent focus:outline-none focus:ring-2 focus:ring-brand-accent/20"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-app-title mb-1">{{ $t('configBonos.packPrice') }}</label>
                <input
                  v-model.number="form.packPrice"
                  type="number"
                  min="0"
                  step="0.01"
                  class="input-modern w-full rounded-xl border border-app-border bg-app-bg/50 px-4 py-2.5 text-app-title focus:border-brand-accent focus:outline-none focus:ring-2 focus:ring-brand-accent/20"
                />
              </div>
            </div>
          </template>
          <template v-else>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-app-title mb-1">{{ $t('configBonos.loyaltyTrigger') }}</label>
                <input
                  v-model.number="form.loyaltyTriggerEvery"
                  type="number"
                  min="1"
                  class="input-modern w-full rounded-xl border border-app-border bg-app-bg/50 px-4 py-2.5 text-app-title focus:border-brand-accent focus:outline-none focus:ring-2 focus:ring-brand-accent/20"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-app-title mb-1">{{ $t('configBonos.loyaltyReward') }}</label>
                <input
                  v-model.number="form.loyaltyRewardSessions"
                  type="number"
                  min="1"
                  class="input-modern w-full rounded-xl border border-app-border bg-app-bg/50 px-4 py-2.5 text-app-title focus:border-brand-accent focus:outline-none focus:ring-2 focus:ring-brand-accent/20"
                />
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-app-title mb-1">{{ $t('configBonos.optionalService') }}</label>
              <select
                v-model="form.serviceId"
                class="input-modern w-full rounded-xl border border-app-border bg-app-bg/50 px-4 py-2.5 text-app-title focus:border-brand-accent focus:outline-none focus:ring-2 focus:ring-brand-accent/20"
              >
                <option :value="null">{{ $t('configBonos.anyService') }}</option>
                <option
                  v-for="s in serviceStore.services"
                  :key="s.id"
                  :value="s.id"
                >
                  {{ s.name }}
                </option>
              </select>
            </div>
          </template>
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
              {{ $t('configBonos.save') }}
            </BaseButton>
          </div>
        </form>
      </Modal>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { onMounted } from "vue";
  import ConfigPageHeader from "@/components/config/ConfigPageHeader.vue";
  import BaseButton from "@/components/common/BaseButton.vue";
  import Modal from "@/components/common/Modal.vue";
  import { useBonosManager } from "@/composables/useBonosManager";
  import { useConfirmDialog } from "@/composables/useConfirmDialog";
  import { useBonoStore } from "@/stores/bono";
  import { useServiceStore } from "@/stores/service";

  const bonoStore = useBonoStore();
  const serviceStore = useServiceStore();
  const {
    isModalOpen,
    isEditing,
    form,
    templates,
    openCreate,
    openEdit,
    closeModal,
    save,
    remove,
  } = useBonosManager();

  const { show: showConfirm } = useConfirmDialog();

  const confirmRemove = async (id: string) => {
    const ok = await showConfirm({
      title: "Eliminar bono",
      message: "¿Eliminar este bono? Se quitarán también las asignaciones a clientes.",
      confirmLabel: "Eliminar",
      variant: "danger",
    });
    if (!ok) return;
    remove(id);
  };

  onMounted(() => {
    bonoStore.initialize();
    serviceStore.initialize();
  });
</script>
