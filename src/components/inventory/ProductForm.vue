<template>
  <form @submit.prevent="emit('save')" class="space-y-4">
    <div class="grid grid-cols-2 gap-4">
      <div>
        <label class="block text-sm font-medium text-app-title mb-1">
          {{ $t('inventory.productName') }}
        </label>
        <input
          v-model="form.name"
          type="text"
          required
          class="input-modern w-full rounded-xl border border-app-border bg-app-bg/50 px-4 py-2.5 text-app-title placeholder:text-app-text/60 transition-colors focus:border-brand-accent focus:bg-app-surface focus:outline-none focus:ring-2 focus:ring-brand-accent/20"
          :placeholder="$t('inventory.productNamePlaceholder')"
        />
      </div>
       <div>
        <label class="block text-sm font-medium text-app-title mb-1">
          {{ $t('inventory.sku') }}
        </label>
        <input
          v-model="form.sku"
          type="text"
          class="input-modern w-full rounded-xl border border-app-border bg-app-bg/50 px-4 py-2.5 text-app-title placeholder:text-app-text/60 transition-colors focus:border-brand-accent focus:bg-app-surface focus:outline-none focus:ring-2 focus:ring-brand-accent/20"
          placeholder="SKU-123"
        />
      </div>
    </div>

    <div class="grid grid-cols-2 gap-4">
      <div>
        <label class="block text-sm font-medium text-app-title mb-1">
          {{ $t('inventory.price') }} ({{ $t('common.currency') }})
        </label>
        <input
          v-model.number="form.price"
          type="number"
          min="0"
          step="0.01"
          required
          class="input-modern w-full rounded-xl border border-app-border bg-app-bg/50 px-4 py-2.5 text-app-title placeholder:text-app-text/60 transition-colors focus:border-brand-accent focus:bg-app-surface focus:outline-none focus:ring-2 focus:ring-brand-accent/20"
        />
      </div>
      <div>
        <label class="block text-sm font-medium text-app-title mb-1">
          {{ $t('inventory.cost') }} ({{ $t('common.currency') }})
        </label>
        <input
          v-model.number="form.cost"
          type="number"
          min="0"
          step="0.01"
          class="input-modern w-full rounded-xl border border-app-border bg-app-bg/50 px-4 py-2.5 text-app-title placeholder:text-app-text/60 transition-colors focus:border-brand-accent focus:bg-app-surface focus:outline-none focus:ring-2 focus:ring-brand-accent/20"
        />
      </div>
    </div>

     <div class="grid grid-cols-2 gap-4">
      <div>
        <label class="block text-sm font-medium text-app-title mb-1">
          {{ $t('inventory.stockLevel') }}
        </label>
        <input
          v-model.number="form.stockLevel"
          type="number"
          min="0"
          :disabled="isEditing" 
          class="input-modern w-full rounded-xl border border-app-border bg-app-bg/50 px-4 py-2.5 text-app-title placeholder:text-app-text/60 transition-colors focus:border-brand-accent focus:bg-app-surface focus:outline-none focus:ring-2 focus:ring-brand-accent/20 disabled:opacity-50"
        />
         <p v-if="isEditing" class="text-xs text-app-text/60 mt-1">{{ $t('inventory.stockEditHint') }}</p>
      </div>
      <div>
        <label class="block text-sm font-medium text-app-title mb-1">
          {{ $t('inventory.minStockLevel') }}
        </label>
        <input
          v-model.number="form.minStockLevel"
          type="number"
          min="0"
          class="input-modern w-full rounded-xl border border-app-border bg-app-bg/50 px-4 py-2.5 text-app-title placeholder:text-app-text/60 transition-colors focus:border-brand-accent focus:bg-app-surface focus:outline-none focus:ring-2 focus:ring-brand-accent/20"
        />
      </div>
    </div>

     <div>
        <label class="block text-sm font-medium text-app-title mb-1">
          {{ $t('inventory.description') }}
        </label>
        <textarea
          v-model="form.description"
          rows="2"
          class="input-modern w-full rounded-xl border border-app-border bg-app-bg/50 px-4 py-2.5 text-app-title placeholder:text-app-text/60 transition-colors focus:border-brand-accent focus:bg-app-surface focus:outline-none focus:ring-2 focus:ring-brand-accent/20"
        />
      </div>
      
      <div class="flex items-center gap-2">
           <input type="checkbox" v-model="form.isService" id="isService" class="rounded border-app-border text-brand-accent focus:ring-brand-accent" />
           <label for="isService" class="text-sm text-app-title">{{ $t('inventory.isServiceProduct') }}</label>
      </div>

    <div class="flex justify-end gap-3 pt-4">
      <BaseButton
        variant="secondary"
        type="button"
        @click="emit('cancel')"
      >
        {{ $t('common.cancel') }}
      </BaseButton>
      <BaseButton
        variant="primary"
        type="submit"
      >
        {{ isEditing ? $t('common.saveChanges') : $t('inventory.createProduct') }}
      </BaseButton>
    </div>
  </form>
</template>

<script setup lang="ts">
import BaseButton from "@/components/common/BaseButton.vue";

defineProps<{
  form: any;
  isEditing: boolean;
}>();

const emit = defineEmits(['save', 'cancel']);
</script>
