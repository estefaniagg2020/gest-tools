<template>
  <nav
    class="flex items-center justify-center gap-4"
    aria-label="Paginación de terapeutas"
  >
    <BaseButton
      variant="secondary"
      :disabled="currentPage <= 1"
      aria-label="Página anterior"
      @click="goTo(currentPage - 1)"
    >
      Anterior
    </BaseButton>
    <span class="text-sm text-gray-600 min-w-[140px] text-center">
      {{ rangeText }}
    </span>
    <BaseButton
      variant="secondary"
      :disabled="currentPage >= totalPages"
      aria-label="Página siguiente"
      @click="goTo(currentPage + 1)"
    >
      Siguiente
    </BaseButton>
  </nav>
</template>

<script setup lang="ts">
  import { computed } from "vue";
  import BaseButton from "@/components/common/BaseButton.vue";

  const props = defineProps<{
    currentPage: number;
    totalPages: number;
    total: number;
    pageSize: number;
  }>();

  const emit = defineEmits<{ page: [number] }>();

  const rangeText = computed(() => {
    const start = (props.currentPage - 1) * props.pageSize + 1;
    const end = Math.min(props.currentPage * props.pageSize, props.total);
    return `${start}-${end} de ${props.total}`;
  });

  const goTo = (page: number) => {
    if (page >= 1 && page <= props.totalPages) {
      emit("page", page);
    }
  };
</script>
