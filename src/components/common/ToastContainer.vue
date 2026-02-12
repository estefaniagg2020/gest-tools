<template>
  <div class="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
    <TransitionGroup
      enter-active-class="transition ease-out duration-300"
      enter-from-class="transform translate-x-full opacity-0"
      enter-to-class="transform translate-x-0 opacity-100"
      leave-active-class="transition ease-in duration-200"
      leave-from-class="transform translate-x-0 opacity-100"
      leave-to-class="transform translate-x-full opacity-0"
      move-class="transition ease-in-out duration-300"
    >
      <div
        v-for="toast in toasts"
        :key="toast.id"
        class="pointer-events-auto min-w-[300px] max-w-sm rounded-xl shadow-lg border p-4 flex items-start gap-3 backdrop-blur-sm"
        :class="getParams(toast.type).classes"
      >
        <span class="text-xl leading-none pt-0.5">{{ getParams(toast.type).icon }}</span>
        <div class="flex-1">
          <h4
            class="font-bold text-sm"
            :class="getParams(toast.type).titleClass"
          >
            {{ getParams(toast.type).title }}
          </h4>
          <p class="text-xs text-gray-600 mt-0.5">{{ toast.message }}</p>
        </div>
        <button
          @click="removeToast(toast.id)"
          class="text-gray-400 hover:text-gray-600 transition-colors"
        >
          ✕
        </button>
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup lang="ts">
  import { useToast, type ToastType } from "@/composables/useToast";

  const { toasts, removeToast } = useToast();

  const getParams = (type: ToastType) => {
    switch (type) {
      case "success":
        return {
          classes: "bg-green-50/95 border-green-200",
          icon: "✅",
          title: "Éxito",
          titleClass: "text-green-800",
        };
      case "error":
        return {
          classes: "bg-red-50/95 border-red-200",
          icon: "❌",
          title: "Error",
          titleClass: "text-red-800",
        };
      case "warning":
        return {
          classes: "bg-yellow-50/95 border-yellow-200",
          icon: "⚠️",
          title: "Advertencia",
          titleClass: "text-yellow-800",
        };
      case "info":
      default:
        return {
          classes: "bg-blue-50/95 border-blue-200",
          icon: "ℹ️",
          title: "Información",
          titleClass: "text-blue-800",
        };
    }
  };
</script>
