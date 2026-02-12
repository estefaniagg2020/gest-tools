<template>
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="isOpen"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto"
      >
        <div
          class="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] flex flex-col overflow-hidden transform transition-all my-auto"
        >
          <div class="p-4 border-b border-gray-100 flex justify-between items-center gap-2 bg-gray-50 shrink-0">
            <h3 class="text-lg font-semibold text-gray-800 min-w-0 truncate">
              <slot name="title">Modal Title</slot>
            </h3>
            <button
              type="button"
              @click="$emit('close')"
              class="text-gray-400 hover:text-gray-600 font-bold text-xl shrink-0 p-1"
            >
              &times;
            </button>
          </div>
          <div class="p-6 flex-1 min-h-0 overflow-y-auto">
            <slot />
          </div>
          <div
            v-if="$slots.footer"
            class="p-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-2"
          >
            <slot name="footer" />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
  import type { ModalProps } from "@/interfaces/components";

  defineProps<ModalProps>();

  defineEmits(["close"]);
</script>

<style scoped>
  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 0.2s ease;
  }

  .fade-enter-from,
  .fade-leave-to {
    opacity: 0;
  }
</style>
