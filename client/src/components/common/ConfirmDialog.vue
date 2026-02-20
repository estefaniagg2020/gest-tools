<template>
  <Teleport to="body">
    <Transition name="dialog-fade">
      <div
        v-if="dialog.visible.value"
        class="fixed inset-0 z-[9998] flex items-center justify-center p-4"
      >
        <div
          class="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
          @click="dialog.respond(false)"
        />
        <div class="relative bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 space-y-4">
          <h3 class="text-base font-semibold text-gray-900">
            {{ dialog.config.value.title }}
          </h3>
          <p class="text-sm text-gray-600 leading-relaxed">
            {{ dialog.config.value.message }}
          </p>
          <div class="flex justify-end gap-2 pt-1">
            <button
              type="button"
              class="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
              @click="dialog.respond(false)"
            >
              {{ dialog.config.value.cancelLabel ?? 'Cancelar' }}
            </button>
            <button
              type="button"
              class="px-4 py-2 rounded-lg text-sm font-semibold text-white transition-colors"
              :class="confirmClass"
              @click="dialog.respond(true)"
            >
              {{ dialog.config.value.confirmLabel ?? 'Confirmar' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
  import { computed } from "vue";
  import { useConfirmDialog } from "@/composables/useConfirmDialog";

  const dialog = useConfirmDialog();

  const confirmClass = computed(() =>
    dialog.config.value.variant === "danger"
      ? "bg-red-500 hover:bg-red-600"
      : "bg-brand-primary hover:opacity-90",
  );
</script>

<style scoped>
  .dialog-fade-enter-active,
  .dialog-fade-leave-active {
    transition: opacity 0.15s ease;
  }
  .dialog-fade-enter-from,
  .dialog-fade-leave-to {
    opacity: 0;
  }
</style>
