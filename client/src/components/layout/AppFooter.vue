<template>
  <footer
    class="footer-bokio shrink-0 mx-3 mb-2 w-auto rounded-xl border border-brand-accent/25 bg-brand-accent/20 px-3 py-2 text-brand-accent md:mx-0 md:mb-0 md:w-full md:rounded-none md:border-x-0 md:border-b-0 md:border-t md:border-(--chrome-border) md:bg-(--chrome-surface) md:px-6 md:py-0 md:text-(--chrome-text) md:h-[56px] lg:px-8"
  >
    <div class="w-full flex flex-row items-center justify-between gap-2 md:flex-row md:items-center md:gap-4 md:min-h-0">
      <div class="flex shrink-0 items-center gap-2 md:contents">
        <div class="flex shrink-0 items-center gap-2 md:flex-1 md:min-w-0 md:justify-start">
          <BokioLogoSvg size="sm" />
        </div>
        <div
          class="hidden shrink-0 items-center gap-1.5 text-xs md:flex md:text-sm tabular-nums opacity-90 md:text-app-text/80"
          aria-live="polite"
          :aria-label="$t('footer.currentTime')"
        >
          <span aria-hidden="true">🕐</span>
          <span>{{ currentTime }}</span>
        </div>
      </div>
      <nav
        class="flex flex-1 min-w-0 flex-wrap items-center justify-start gap-x-1.5 gap-y-0.5 text-[9px] leading-tight font-medium text-[#716268] md:flex-nowrap md:flex-1 md:justify-end md:min-w-0 md:gap-x-6 md:gap-y-0 md:text-sm md:text-app-text/80"
        :aria-label="$t('footer.legalLinks')"
      >
        <RouterLink
          to="/privacy"
          class="hover:text-[#5f525f] transition-colors underline decoration-transparent hover:decoration-current underline-offset-2 md:hover:text-brand-accent shrink-0"
        >
          {{ $t('footer.privacyPolicy') }}
        </RouterLink>
        <RouterLink
          to="/terms"
          class="hover:text-[#5f525f] transition-colors underline decoration-transparent hover:decoration-current underline-offset-2 md:hover:text-brand-accent shrink-0"
        >
          {{ $t('footer.termsOfUse') }}
        </RouterLink>
        <RouterLink
          to="/legal-notice"
          class="hover:text-[#5f525f] transition-colors underline decoration-transparent hover:decoration-current underline-offset-2 md:hover:text-brand-accent shrink-0"
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
