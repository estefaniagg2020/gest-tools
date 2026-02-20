<template>
  <label
    class="toggle-switch flex cursor-pointer items-center gap-4 rounded-xl border border-app-border-subtle bg-app-surface/50 p-4 transition-colors hover:bg-app-surface hover:border-app-border focus-within:ring-2 focus-within:ring-brand-accent/30 focus-within:ring-offset-2"
    :class="{ 'opacity-60 cursor-not-allowed': disabled }"
    @click.prevent="toggle"
  >
    <div class="flex-1 min-w-0">
      <span class="block text-sm font-medium text-app-title">
        {{ label }}
      </span>
      <p v-if="description" class="mt-0.5 text-xs text-app-text/70">
        {{ description }}
      </p>
    </div>
    <button
      type="button"
      role="switch"
      :aria-checked="modelValue"
      :disabled="disabled"
      class="toggle-switch__track relative inline-flex h-7 w-12 shrink-0 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-brand-accent focus:ring-offset-2 disabled:pointer-events-none"
      :class="modelValue ? 'bg-brand-accent' : 'bg-app-border-subtle'"
      @click.stop="toggle"
    >
      <span
        class="toggle-switch__thumb absolute top-1 left-1 h-5 w-5 rounded-full bg-white shadow-md transition-transform duration-200"
        :class="modelValue ? 'translate-x-5' : 'translate-x-0'"
      />
    </button>
  </label>
</template>

<script setup lang="ts">
  const props = defineProps<{
    modelValue: boolean;
    label: string;
    description?: string;
    disabled?: boolean;
  }>();

  const emit = defineEmits<{
    "update:modelValue": [value: boolean];
  }>();

  const toggle = () => {
    if (props.disabled) return;
    emit("update:modelValue", !props.modelValue);
  };
</script>
