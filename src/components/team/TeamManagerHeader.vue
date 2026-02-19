<template>
  <div class="flex flex-col md:flex-row md:items-end justify-between gap-6">
    <div class="min-w-0">
      <p class="text-xs font-semibold uppercase tracking-widest text-brand-accent mb-1">
        {{ $t('team.kicker') }}
      </p>
      <h1 class="text-3xl font-bold tracking-tight text-app-title sm:text-4xl">{{ $t('team.title') }}</h1>
      <p class="mt-2 text-app-text/80 max-w-xl">{{ $t('team.subtitle') }}</p>
    </div>
    <div class="flex flex-col sm:flex-row sm:items-center gap-2 shrink-0">
      <label for="team-search" class="sr-only">{{ $t('team.searchLabel') }}</label>
      <input
        id="team-search"
        :value="searchQuery"
        type="search"
        :placeholder="$t('team.searchPlaceholder')"
        class="input-modern w-full sm:w-56 rounded-xl border border-app-border bg-app-bg/50 px-4 py-2.5 text-app-title placeholder:text-app-text/60 transition-colors focus:border-brand-accent focus:bg-app-surface focus:outline-none focus:ring-2 focus:ring-brand-accent/20"
        @input="$emit('update:searchQuery', ($event.target as HTMLInputElement).value)"
      />
      <div
        v-if="canManage"
        class="flex flex-wrap gap-2"
      >
        <BaseButton
          v-if="showClearButton"
          type="button"
          variant="outline"
          class="shrink-0 text-app-text/80 hover:text-red-600 hover:border-red-200"
          @click="$emit('clear')"
        >
          {{ $t('team.clearTeam') }}
        </BaseButton>
        <BaseButton
          class="shrink-0"
          @click="$emit('create')"
        >
          <template #icon><span>+</span></template>
          {{ $t('team.newMember') }}
        </BaseButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import BaseButton from "@/components/common/BaseButton.vue";

  defineProps<{ showClearButton?: boolean; searchQuery?: string; canManage?: boolean }>();
  defineEmits<{ create: []; clear: []; "update:searchQuery": [value: string] }>();
</script>
