<template>
  <div class="flex-1 min-h-0 flex flex-col overflow-hidden">
    <TherapistManagerHeader
      class="shrink-0"
      @create="openCreateModal"
    />

    <div class="min-h-0 flex-1 overflow-y-auto md:hidden flex flex-col">
      <div class="grid grid-cols-3 sm:grid-cols-4 gap-3 pb-4 flex-1 content-start">
        <TherapistAvatarTile
          v-for="therapist in paginatedTherapists"
          :key="therapist.id"
          :therapist="therapist"
          @edit="editTherapist(therapist)"
          @delete="deleteTherapist(therapist.id)"
        />
      </div>
      <TherapistPagination
        v-if="totalPages > 1"
        :current-page="currentPage"
        :total-pages="totalPages"
        :total="orderedTherapists.length"
        :page-size="PAGE_SIZE"
        class="shrink-0 py-3 md:hidden"
        @page="currentPage = $event"
      />
    </div>

    <div class="hidden md:flex flex-1 min-h-0 overflow-y-auto flex-col">
      <div class="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 pb-4 w-full self-start">
        <TherapistCard
          v-for="therapist in paginatedTherapists"
          :key="therapist.id"
          :therapist="therapist"
          :spa-name="getSpaName(therapist.spaId)"
          @edit="editTherapist(therapist)"
          @delete="deleteTherapist(therapist.id)"
        />
      </div>
      <TherapistPagination
        v-if="totalPages > 1"
        :current-page="currentPage"
        :total-pages="totalPages"
        :total="orderedTherapists.length"
        :page-size="PAGE_SIZE"
        class="shrink-0 py-4 hidden md:block"
        @page="currentPage = $event"
      />
    </div>

    <TherapistEditorModal
      :is-open="isModalOpen"
      :is-editing="isEditing"
      :form="form"
      :spas="spaStore.spas"
      @close="closeModal"
      @save="saveTherapist"
    />
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, watch } from "vue";
  import TherapistManagerHeader from "@/components/therapist/TherapistManagerHeader.vue";
  import TherapistCard from "@/components/therapist/TherapistCard.vue";
  import TherapistAvatarTile from "@/components/therapist/TherapistAvatarTile.vue";
  import TherapistEditorModal from "@/components/therapist/TherapistEditorModal.vue";
  import TherapistPagination from "@/components/therapist/TherapistPagination.vue";
  import { useTherapistManager } from "@/composables/useTherapistManager";

  const PAGE_SIZE = 10;

  const {
    orderedTherapists,
    isModalOpen,
    isEditing,
    form,
    spaStore,
    openCreateModal,
    editTherapist,
    closeModal,
    saveTherapist,
    deleteTherapist,
    getSpaName,
  } = useTherapistManager();

  const currentPage = ref(1);

  const totalPages = computed(() => Math.max(1, Math.ceil(orderedTherapists.value.length / PAGE_SIZE)));

  const paginatedTherapists = computed(() => {
    const list = orderedTherapists.value;
    const start = (currentPage.value - 1) * PAGE_SIZE;
    return list.slice(start, start + PAGE_SIZE);
  });

  watch(totalPages, () => {
    if (currentPage.value > totalPages.value) {
      currentPage.value = 1;
    }
  });
</script>
