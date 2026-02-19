<template>
  <div
    class="bg-app-surface rounded-xl shadow-card border border-app-border-subtle overflow-hidden hover:shadow-card-hover transition-shadow group relative min-w-0 flex flex-col w-full"
  >
    <div class="flex items-center gap-3 p-3 min-w-0">
      <div class="relative shrink-0">
        <Avatar
          :src="member.photoUrl"
          :name="member.name"
          :size="44"
          :href="member.linkedInUrl"
        />
        <span
          v-if="isManager"
          class="absolute -top-0.5 -right-0.5 text-sm leading-none"
          :title="$t('team.manager')"
          aria-hidden
        >{{ CROWN }}</span>
      </div>

      <div class="flex-1 min-w-0 pr-12">
        <h3
          class="text-sm font-bold text-app-title truncate"
          :title="member.name"
        >{{ member.name }}</h3>
        <span
          class="text-[11px] font-medium px-1.5 py-0.5 rounded-full inline-flex items-center gap-1 mt-0.5"
          :class="isManager
            ? 'bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-100'
            : 'bg-app-bg text-app-text/60 dark:bg-app-border-subtle dark:text-app-text'"
        >
          <span v-if="isManager" aria-hidden>{{ CROWN }}</span>
          {{ member.specialty || roleLabel }}
        </span>
        <div
          v-if="member.email || member.phoneNumber"
          class="mt-1 flex flex-col gap-0.5 text-[11px] text-app-text/60"
        >
          <span v-if="member.email" class="truncate">📧 {{ member.email }}</span>
          <span v-if="member.phoneNumber" class="truncate">📱 {{ member.phoneNumber }}</span>
        </div>
      </div>

      <div
        v-if="canManage"
        class="absolute top-2 right-2 flex gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity z-10"
      >
        <button
          type="button"
          @click="$emit('edit')"
          class="p-1.5 bg-app-bg rounded-full text-app-text/70 hover:text-brand-accent dark:bg-app-border-subtle"
        >✏️</button>
        <button
          type="button"
          @click="$emit('delete')"
          class="p-1.5 bg-app-bg rounded-full text-red-400 hover:text-red-600 dark:bg-app-border-subtle dark:hover:text-red-400"
        >🗑️</button>
      </div>
    </div>

    <div
      class="h-1 w-full shrink-0"
      :style="{ backgroundColor: member.color }"
    />
  </div>
</template>

<script setup lang="ts">
  import { computed } from "vue";
  import type { TeamMember } from "@/interfaces";
  import Avatar from "@/components/common/Avatar.vue";
  import { useI18n } from "vue-i18n";

  const { t } = useI18n();

  const props = defineProps<{
    member: TeamMember;
    canManage?: boolean;
  }>();

  defineEmits<{ edit: []; delete: [] }>();

  const CROWN = "\u{1F451}";
  const isManager = computed(() => props.member.role === "manager");

  const roleLabel = computed(() =>
    isManager.value ? t("team.manager") : t("team.employee"),
  );
</script>
