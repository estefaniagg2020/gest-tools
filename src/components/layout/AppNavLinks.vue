<template>
  <nav class="hidden md:flex items-center gap-6">
    <RouterLink
      v-for="item in navItems"
      :key="item.to"
      :to="item.to"
      class="flex items-center gap-2 text-gray-600 hover:text-spa-teal font-medium transition-colors"
    >
      <span>{{ item.icon }}</span>
      {{ item.label }}
    </RouterLink>
  </nav>
</template>

<script setup lang="ts">
  import { RouterLink } from "vue-router";
  import { NAV_LINKS } from "@/data/navLinks";

  const navItems = NAV_LINKS;
</script>
