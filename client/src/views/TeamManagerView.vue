<template>
  <div class="min-h-full overflow-y-auto">
    <div class="relative px-6 pt-8 pb-10">
      <div
        class="absolute inset-0 bg-linear-to-br from-app-bg via-app-surface to-brand-soft/30 dark:from-app-bg dark:via-app-bg dark:to-app-border-subtle/50 pointer-events-none"
        aria-hidden="true"
      />

      <TeamManagerHeader
        class="relative mb-8"
        :show-clear-button="orderedMembers.length > 0"
        :search-query="searchQuery"
        :can-manage="canManage"
        @create="openCreateModal"
        @clear="handleClearTeam"
        @update:search-query="searchQuery = $event"
      />

      <div class="relative md:hidden">
        <div class="grid grid-cols-3 sm:grid-cols-4 gap-3 pb-4">
          <TeamAvatarTile
            v-for="member in paginatedMembers"
            :key="member.id"
            :member="member"
            :can-manage="canManage"
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
          class="py-3"
          @page="currentPage = $event"
        />
      </div>

      <div class="relative hidden md:block">
        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 pb-4 w-full">
          <TeamCard
            v-for="member in paginatedMembers"
            :key="member.id"
            :member="member"
            :can-manage="canManage"
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
          class="py-4"
          @page="currentPage = $event"
        />
      </div>

      <TeamEditorModal
        :is-open="isModalOpen"
        :is-editing="isEditing"
        :is-saving="isSaving"
        :form="form"
        @close="closeModal"
        @save="saveMember"
      />
    </div>
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
  import { useConfirmDialog } from "@/composables/useConfirmDialog";
  import { useAuthStore } from "@/stores/auth";

  const PAGE_SIZE = 10;

  const {
    orderedMembers,
    isModalOpen,
    isEditing,
    isSaving,
    form,
    openCreateModal,
    editMember,
    closeModal,
    saveMember,
    deleteMember,
    clearMembers,
  } = useTeamManager();

  const { t } = useI18n();
  const { show: showConfirm } = useConfirmDialog();

  const authStore = useAuthStore();
  const canManage = computed(() => authStore.isAdmin);

  const handleClearTeam = async () => {
    const ok = await showConfirm({
      title: "Limpiar equipo",
      message: t("team.clearTeamConfirm"),
      confirmLabel: "Eliminar todos",
      variant: "danger",
    });
    if (ok) await clearMembers();
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
