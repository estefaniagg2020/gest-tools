<template>
  <footer
    class="footer-bokio shrink-0 w-full border-t border-(--chrome-border) bg-[var(--color-brand-primary)] text-white md:bg-(--chrome-surface) md:text-(--chrome-text) px-4 py-3 md:py-0 md:h-[56px] md:px-6 lg:px-8"
  >
    <div
      class="w-full flex flex-col gap-3 md:flex-row md:items-center md:gap-4 md:min-h-0"
    >
      <div class="flex shrink-0 items-center justify-between md:contents">
        <div class="flex shrink-0 items-center md:flex-1 md:min-w-0 md:justify-start">
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
      </div>
      <nav
        class="flex flex-wrap items-center gap-x-4 gap-y-1 md:flex-nowrap md:flex-1 md:justify-end md:min-w-0 md:gap-x-6 text-xs md:text-sm font-medium text-white/90 md:text-app-text/80"
        :aria-label="$t('footer.legalLinks')"
      >
        <RouterLink
          to="/privacy"
          class="hover:text-white transition-colors underline decoration-transparent hover:decoration-current underline-offset-2 md:hover:text-brand-accent shrink-0"
        >
          {{ $t('footer.privacyPolicy') }}
        </RouterLink>
        <RouterLink
          to="/terms"
          class="hover:text-white transition-colors underline decoration-transparent hover:decoration-current underline-offset-2 md:hover:text-brand-accent shrink-0"
        >
          {{ $t('footer.termsOfUse') }}
        </RouterLink>
        <RouterLink
          to="/legal-notice"
          class="hover:text-white transition-colors underline decoration-transparent hover:decoration-current underline-offset-2 md:hover:text-brand-accent shrink-0"
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

