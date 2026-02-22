<template>
  <button
    type="button"
    :disabled="disabled || saving"
    class="save-btn inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-brand-accent focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed bg-brand-accent text-white hover:brightness-95 shadow-md shadow-brand-accent/20"
    :class="{ 'save-btn--success': success }"
    @click="$emit('click', $event)"
  >
    <span
      v-if="success"
      class="save-btn__check flex shrink-0 items-center justify-center"
      aria-hidden="true"
    >
      <svg
        class="save-btn__check-icon"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <polyline points="20 6 9 17 4 12" />
      </svg>
    </span>
    <span
      v-else-if="saving"
      class="save-btn__spinner shrink-0 h-4 w-4 border-2 border-white/40 border-t-white rounded-full"
      aria-hidden="true"
    />
    <span class="save-btn__label">
      {{ label }}
    </span>
  </button>
</template>

<script setup lang="ts">
  import { computed } from "vue";

  const props = withDefaults(
    defineProps<{
      saving?: boolean;
      success?: boolean;
      disabled?: boolean;
      labelSave?: string;
      labelSaving?: string;
      labelSaved?: string;
    }>(),
    {
      saving: false,
      success: false,
      disabled: false,
      labelSave: "Guardar",
      labelSaving: "Guardando…",
      labelSaved: "Guardado",
    }
  );

  defineEmits<{
    click: [event: MouseEvent];
  }>();

  const label = computed(() => {
    if (props.success) return props.labelSaved;
    if (props.saving) return props.labelSaving;
    return props.labelSave;
  });
</script>

<style scoped>
  .save-btn__check {
    width: 1.25rem;
    height: 1.25rem;
  }

  .save-btn__check-icon {
    width: 100%;
    height: 100%;
    animation: save-check-in 0.35s ease-out;
  }

  .save-btn--success .save-btn__check {
    animation: save-check-pop 0.4s ease-out;
  }

  .save-btn__spinner {
    animation: save-spin 0.7s linear infinite;
  }

  @keyframes save-check-in {
    from {
      opacity: 0;
      transform: scale(0.5);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }

  @keyframes save-check-pop {
    0% {
      transform: scale(0.8);
    }
    50% {
      transform: scale(1.1);
    }
    100% {
      transform: scale(1);
    }
  }

  @keyframes save-spin {
    to {
      transform: rotate(360deg);
    }
  }
</style>
