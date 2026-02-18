<template>
  <div class="flex-1 min-h-0 flex flex-col overflow-hidden">
    <TeamManagerHeader
      class="shrink-0"
      :show-clear-button="orderedMembers.length > 0"
      :search-query="searchQuery"
      @create="openCreateModal"
      @clear="handleClearTeam"
      @update:search-query="searchQuery = $event"
    />

    <div class="min-h-0 flex-1 overflow-y-auto md:hidden flex flex-col">
      <div class="grid grid-cols-3 sm:grid-cols-4 gap-3 pb-4 flex-1 content-start">
        <TeamAvatarTile
          v-for="member in paginatedMembers"
          :key="member.id"
          :member="member"
          @edit="editMember(member)"
          @delete="deleteMember(member.id)"
        />
      </div>
      <TeamPagination
        v-if="totalPages > 1"
        :current-page="currentPage"
        :total-pages="totalPages"
        :total="filteredMembers.length"
        :page-size="PAGE_SIZE"
        class="shrink-0 py-3 md:hidden"
        @page="currentPage = $event"
      />
    </div>

    <div class="hidden md:flex flex-1 min-h-0 overflow-y-auto flex-col">
      <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 pb-4 w-full self-start">
        <TeamCard
          v-for="member in paginatedMembers"
          :key="member.id"
          :member="member"
          :location-name="getLocationName(member.spaId)"
          @edit="editMember(member)"
          @delete="deleteMember(member.id)"
        />
      </div>
      <TeamPagination
        v-if="totalPages > 1"
        :current-page="currentPage"
        :total-pages="totalPages"
        :total="filteredMembers.length"
        :page-size="PAGE_SIZE"
        class="shrink-0 py-4 hidden md:block"
        @page="currentPage = $event"
      />
    </div>

    <TeamEditorModal
      :is-open="isModalOpen"
      :is-editing="isEditing"
      :form="form"
      :spas="spaStore.spas"
      @close="closeModal"
      @save="saveMember"
    />
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, watch } from "vue";
  import { useI18n } from "vue-i18n";
  import TeamManagerHeader from "@/components/team/TeamManagerHeader.vue";
  import TeamCard from "@/components/team/TeamCard.vue";
  import TeamAvatarTile from "@/components/team/TeamAvatarTile.vue";
  import TeamEditorModal from "@/components/team/TeamEditorModal.vue";
  import TeamPagination from "@/components/team/TeamPagination.vue";
  import { useTeamManager } from "@/composables/useTeamManager";

  const PAGE_SIZE = 10;

  const {
    orderedMembers,
    isModalOpen,
    isEditing,
    form,
    spaStore,
    openCreateModal,
    editMember,
    closeModal,
    saveMember,
    deleteMember,
    clearMembers,
    getLocationName,
  } = useTeamManager();

  const { t } = useI18n();

  const handleClearTeam = () => {
    if (window.confirm(t("team.clearTeamConfirm"))) {
      clearMembers();
    }
  };

  const searchQuery = ref("");
  const currentPage = ref(1);

  const filteredMembers = computed(() => {
    const q = searchQuery.value.trim().toLowerCase();
    if (!q) return orderedMembers.value;
    return orderedMembers.value.filter((m) => m.name.toLowerCase().includes(q));
  });

  const totalPages = computed(() => Math.max(1, Math.ceil(filteredMembers.value.length / PAGE_SIZE)));

  const paginatedMembers = computed(() => {
    const list = filteredMembers.value;
    const start = (currentPage.value - 1) * PAGE_SIZE;
    return list.slice(start, start + PAGE_SIZE);
  });

  watch(totalPages, () => {
    if (currentPage.value > totalPages.value) {
      currentPage.value = 1;
    }
  });
</script>
