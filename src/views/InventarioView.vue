<template>
  <div class="min-h-full py-6 px-4 sm:px-6 lg:px-8">
    <div class="mx-auto max-w-2xl text-center">
      <h1 class="text-xl font-semibold text-app-title">{{ $t('inventory.title') }}</h1>
      <p class="mt-2 text-sm text-app-text/70">
        {{ $t('inventory.subtitle') }}
      </p>
      <RouterLink
        :to="{ name: 'dashboard' }"
        class="mt-4 inline-block text-sm font-medium text-brand-accent hover:underline"
      >
        {{ $t('inventory.backToControlPanel') }}
      </RouterLink>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { RouterLink } from "vue-router";
</script>
