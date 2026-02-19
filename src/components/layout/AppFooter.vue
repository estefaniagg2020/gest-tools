<template>
  <footer
    class="footer-bokio shrink-0 w-full flex items-center border-t border-(--chrome-border) bg-[var(--color-brand-primary)] text-white md:bg-(--chrome-surface) md:text-(--chrome-text) h-[56px] px-4 md:px-6 lg:px-8"
  >
    <div
      class="w-full flex flex-row items-center gap-4"
    >
      <div class="bokio-logo-wrap flex flex-1 items-center justify-start min-w-0">
        <BokioLogoSvg size="sm" />
      </div>
      <div
        class="flex shrink-0 items-center gap-1.5 text-xs md:text-sm tabular-nums opacity-90 text-white md:text-app-text/80"
        aria-live="polite"
        :aria-label="$t('footer.currentTime')"
      >
        <span aria-hidden="true">🕐</span>
        <span>{{ currentTime }}</span>
      </div>
      <nav
        class="flex flex-1 items-center justify-end text-right gap-x-3 md:gap-x-6 text-xs md:text-sm font-medium text-white/90 md:text-app-text/80 min-w-0 overflow-x-auto whitespace-nowrap"
        :aria-label="$t('footer.legalLinks')"
      >
        <RouterLink
          to="/privacy"
          class="hover:text-white transition-colors underline decoration-transparent hover:decoration-current underline-offset-2 md:hover:text-brand-accent"
        >
          {{ $t('footer.privacyPolicy') }}
        </RouterLink>
        <RouterLink
          to="/terms"
          class="hover:text-white transition-colors underline decoration-transparent hover:decoration-current underline-offset-2 md:hover:text-brand-accent"
        >
          {{ $t('footer.termsOfUse') }}
        </RouterLink>
        <RouterLink
          to="/legal-notice"
          class="hover:text-white transition-colors underline decoration-transparent hover:decoration-current underline-offset-2 md:hover:text-brand-accent"
        >
          {{ $t('footer.legalNotice') }}
        </RouterLink>
      </nav>
    </div>
  </footer>
</template>

<script setup lang="ts">
  import { RouterLink } from "vue-router";
  import BokioLogoSvg from "@/components/common/BokioLogoSvg.vue";
  import { useCurrentTime } from "@/composables/useCurrentTime";

  const { currentTime } = useCurrentTime();
</script>

