<template>
  <nav
    class="flex items-center justify-center gap-4"
    :aria-label="$t('team.paginationLabel')"
  >
    <BaseButton
      variant="secondary"
      :disabled="currentPage <= 1"
      :aria-label="$t('team.paginationPrev')"
      @click="goTo(currentPage - 1)"
    >
      {{ $t('team.paginationPrev') }}
    </BaseButton>
    <span class="text-sm text-gray-600 min-w-[140px] text-center">
      {{ rangeText }}
    </span>
    <BaseButton
      variant="secondary"
      :disabled="currentPage >= totalPages"
      :aria-label="$t('team.paginationNext')"
      @click="goTo(currentPage + 1)"
    >
      {{ $t('team.paginationNext') }}
    </BaseButton>
  </nav>
</template>

<script setup lang="ts">
  import { computed } from "vue";
  import { useI18n } from "vue-i18n";
  import BaseButton from "@/components/common/BaseButton.vue";

  const { t } = useI18n();

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
    return t("team.paginationRange", { start, end, total: props.total });
  });

  const goTo = (page: number) => {
    if (page >= 1 && page <= props.totalPages) {
      emit("page", page);
    }
  };
</script>
