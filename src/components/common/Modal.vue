<template>
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="isOpen"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md overflow-y-auto"
      >
        <div
          :class="[
            'w-full max-w-md max-h-[90vh] flex flex-col overflow-hidden transform transition-all my-auto bg-white',
            props.variant === 'modern'
              ? 'rounded-2xl shadow-2xl shadow-violet-500/10 ring-1 ring-slate-200/50'
              : 'rounded-2xl shadow-xl',
          ]"
        >
          <div
            :class="[
              'p-4 flex justify-between items-center gap-2 shrink-0',
              props.variant === 'modern'
                ? 'bg-linear-to-r from-violet-600 to-indigo-600'
                : 'border-b border-gray-100 bg-gray-50',
            ]"
          >
            <h3
              :class="[
                'text-lg font-semibold min-w-0 truncate',
                props.variant === 'modern' ? 'text-white' : 'text-gray-800',
              ]"
            >
              <slot name="title">{{ props.title}}</slot>
            </h3>
            <button
              type="button"
              @click="$emit('close')"
              :class="[
                'font-bold text-xl shrink-0 p-1 rounded-lg transition-colors',
                props.variant === 'modern'
                  ? 'text-white/90 hover:text-white hover:bg-white/10'
                  : 'text-gray-400 hover:text-gray-600',
              ]"
            >
              &times;
            </button>
          </div>
          <div
            :class="[
              'flex-1 min-h-0 overflow-y-auto',
              props.variant === 'modern' ? 'p-6' : 'p-6',
            ]"
          >
            <slot />
          </div>
          <div
            v-if="$slots.footer"
            :class="[
              'p-4 flex justify-end gap-2 shrink-0',
              props.variant === 'modern' ? 'border-t border-slate-100 bg-slate-50/80' : 'border-t border-gray-100 bg-gray-50',
            ]"
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

  const props = withDefaults(defineProps<ModalProps>(), { variant: "default" });

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
