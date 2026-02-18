<template>
  <footer
    class="footer-bokio shrink-0 border-t border-(--chrome-border) bg-(--chrome-surface) text-(--chrome-text) py-5 px-4 md:px-6 lg:px-8"
  >
    <div
      class="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4"
    >
      <div class="bokio-logo-wrap flex items-center">
        <BokioLogoSvg
          size="lg"
          :main-color="footerLogoColor"
          :check-color="footerCheckColor"
        />
      </div>
      <nav
        class="flex flex-wrap items-center justify-center gap-x-6 gap-y-1 text-sm font-medium opacity-90 hover:opacity-100"
        :aria-label="$t('footer.legalLinks')"
      >
        <RouterLink
          to="/privacy"
          class="hover:text-brand-secondary transition-colors underline decoration-transparent hover:decoration-current underline-offset-2"
        >
          {{ $t('footer.privacyPolicy') }}
        </RouterLink>
        <RouterLink
          to="/terms"
          class="hover:text-brand-secondary transition-colors underline decoration-transparent hover:decoration-current underline-offset-2"
        >
          {{ $t('footer.termsOfUse') }}
        </RouterLink>
        <RouterLink
          to="/legal-notice"
          class="hover:text-brand-secondary transition-colors underline decoration-transparent hover:decoration-current underline-offset-2"
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

  const footerLogoColor = "var(--color-brand-secondary)";
  const footerCheckColor = "#e8dcc8";
</script>

