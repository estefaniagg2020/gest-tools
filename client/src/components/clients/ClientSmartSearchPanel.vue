<template>
  <div class="space-y-5">
    <div class="relative group">
      <div
        class="absolute -inset-0.5 bg-linear-to-r from-brand-accent/20 via-brand-soft/40 to-brand-accent/20 rounded-2xl blur-sm opacity-0 group-focus-within:opacity-100 transition-opacity duration-500"
        aria-hidden="true"
      />
      <div class="relative flex items-center gap-3 px-4 py-3.5 rounded-2xl border border-app-border-subtle bg-app-surface shadow-card transition-all duration-300 group-focus-within:border-brand-accent/40 group-focus-within:shadow-lg">
        <span
          class="text-brand-accent/70 transition-colors group-focus-within:text-brand-accent"
          aria-hidden="true"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5">
            <path d="M10 1a.75.75 0 0 1 .65.38l1.34 2.32 2.32 1.34a.75.75 0 0 1 0 1.3l-2.32 1.34-1.34 2.32a.75.75 0 0 1-1.3 0L8.01 8.68 5.69 7.34a.75.75 0 0 1 0-1.3L8.01 4.7l1.34-2.32A.75.75 0 0 1 10 1ZM3.5 11a.75.75 0 0 1 .65.38l.67 1.16 1.16.67a.75.75 0 0 1 0 1.3l-1.16.67-.67 1.16a.75.75 0 0 1-1.3 0l-.67-1.16-1.16-.67a.75.75 0 0 1 0-1.3l1.16-.67.67-1.16A.75.75 0 0 1 3.5 11ZM14.5 13a.75.75 0 0 1 .65.38l.67 1.16 1.16.67a.75.75 0 0 1 0 1.3l-1.16.67-.67 1.16a.75.75 0 0 1-1.3 0l-.67-1.16-1.16-.67a.75.75 0 0 1 0-1.3l1.16-.67.67-1.16A.75.75 0 0 1 14.5 13Z" />
          </svg>
        </span>
        <input
          ref="inputRef"
          :value="query"
          type="text"
          :placeholder="$t('clientSearch.placeholder')"
          class="flex-1 bg-transparent text-app-title placeholder:text-app-text/40 text-sm outline-none"
          @input="onInput"
          @keydown.escape="clearSearch"
        />
        <Transition name="fade">
          <span
            v-if="isSearching"
            class="shrink-0"
          >
            <span class="block w-4 h-4 border-2 border-brand-accent/30 border-t-brand-accent rounded-full animate-spin" />
          </span>
        </Transition>
        <button
          v-if="query"
          type="button"
          class="shrink-0 p-1 text-app-text/40 hover:text-app-text/70 rounded-lg transition-colors"
          @click="clearSearch"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4">
            <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
          </svg>
        </button>
      </div>
    </div>

    <Transition name="fade">
      <div
        v-if="(serviceHint.length > 0 || specialFilter) && hasSearched"
        class="flex flex-wrap items-center gap-2 px-1"
      >
        <template v-if="specialFilter === 'debt'">
          <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 text-[11px] font-medium border border-amber-200/60 dark:border-amber-500/20">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="w-3 h-3">
              <path fill-rule="evenodd" d="M15 8A7 7 0 1 1 1 8a7 7 0 0 1 14 0ZM9 5a1 1 0 1 1-2 0 1 1 0 0 1 2 0ZM6.75 8a.75.75 0 0 0 0 1.5h.75v1.75a.75.75 0 0 0 1.5 0v-2.5A.75.75 0 0 0 8.25 8h-1.5Z" clip-rule="evenodd" />
            </svg>
            {{ $t('clientSearch.filterDebt') }}
          </span>
        </template>
        <template v-else-if="specialFilter === 'no_show'">
          <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 text-[11px] font-medium border border-red-200/60 dark:border-red-500/20">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="w-3 h-3">
              <path fill-rule="evenodd" d="M8 15A7 7 0 1 0 8 1a7 7 0 0 0 0 14ZM6.28 5.22a.75.75 0 0 0-1.06 1.06L6.94 8l-1.72 1.72a.75.75 0 1 0 1.06 1.06L8 9.06l1.72 1.72a.75.75 0 1 0 1.06-1.06L9.06 8l1.72-1.72a.75.75 0 0 0-1.06-1.06L8 6.94 6.28 5.22Z" clip-rule="evenodd" />
            </svg>
            {{ $t('clientSearch.filterNoShow') }}
          </span>
        </template>
        <template v-if="serviceHint.length > 0">
          <span class="text-[11px] text-app-text/50">{{ $t('clientSearch.detectedService') }}</span>
          <span
            v-for="hint in serviceHint"
            :key="hint"
            class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-brand-accent/10 text-brand-accent text-[11px] font-medium"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="w-3 h-3">
              <path d="M10 1a.75.75 0 0 1 .65.38l1.34 2.32 2.32 1.34a.75.75 0 0 1 0 1.3l-2.32 1.34-1.34 2.32a.75.75 0 0 1-1.3 0L8.01 8.68 5.69 7.34a.75.75 0 0 1 0-1.3L8.01 4.7l1.34-2.32A.75.75 0 0 1 10 1Z" />
            </svg>
            {{ hint }}
          </span>
        </template>
      </div>
    </Transition>

    <TransitionGroup
      name="list"
      tag="div"
      class="space-y-3"
    >
      <div
        v-for="(item, index) in results"
        :key="item.client.id"
        :style="{ animationDelay: `${index * 60}ms` }"
        class="animate-fade-in-up"
      >
        <RouterLink
          :to="{ name: 'client-detail', params: { id: item.client.id } }"
          class="block rounded-xl border border-app-border-subtle bg-app-surface p-4 shadow-card transition-all duration-200 hover:border-brand-accent/30 hover:shadow-lg hover:-translate-y-0.5 cursor-pointer"
        >
          <div class="flex items-start gap-3.5">
            <div
              class="shrink-0 w-10 h-10 rounded-full bg-linear-to-br from-brand-accent to-brand-secondary flex items-center justify-center text-white font-bold text-sm shadow-sm"
            >
              {{ item.client.name.charAt(0).toUpperCase() }}
            </div>

            <div class="flex-1 min-w-0 space-y-2">
              <div class="flex items-center justify-between gap-2">
                <h3 class="font-semibold text-app-title truncate">{{ item.client.name }}</h3>
                <div class="flex items-center gap-1.5 shrink-0">
                  <span
                    v-if="item.pendingAmount > 0"
                    class="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-200/40 dark:border-amber-500/15"
                    :title="$t('clientSearch.debtTitle')"
                  >
                    {{ $t('clientSearch.debtBadge', { amount: item.pendingAmount.toFixed(2) }) }}
                  </span>
                  <span
                    v-if="item.noShowCount > 0"
                    class="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border border-red-200/40 dark:border-red-500/15"
                    :title="$t('clientSearch.noShowTitle')"
                  >
                    {{ $t('clientSearch.noShowBadge', { count: item.noShowCount }) }}
                  </span>
                  <span
                    v-if="item.totalVisits > 0"
                    class="text-[11px] font-medium px-2 py-0.5 rounded-full bg-app-bg text-app-text/60"
                  >
                    {{ $t('clientSearch.visits', { count: item.totalVisits }) }}
                  </span>
                </div>
              </div>

              <div
                v-if="item.pendingAmount > 0 && specialFilter === 'debt'"
                class="flex items-start gap-2 px-3 py-2 rounded-lg bg-amber-50/80 dark:bg-amber-500/5 border border-amber-200/30 dark:border-amber-500/10"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="w-3.5 h-3.5 mt-0.5 text-amber-600 dark:text-amber-400 shrink-0">
                  <path fill-rule="evenodd" d="M15 8A7 7 0 1 1 1 8a7 7 0 0 1 14 0ZM9 5a1 1 0 1 1-2 0 1 1 0 0 1 2 0ZM6.75 8a.75.75 0 0 0 0 1.5h.75v1.75a.75.75 0 0 0 1.5 0v-2.5A.75.75 0 0 0 8.25 8h-1.5Z" clip-rule="evenodd" />
                </svg>
                <p class="text-xs text-amber-700 dark:text-amber-300 leading-relaxed">
                  {{ $t('clientSearch.debtInsight', { amount: item.pendingAmount.toFixed(2) }) }}
                </p>
              </div>

              <div
                v-if="item.noShowCount > 0 && specialFilter === 'no_show'"
                class="flex items-start gap-2 px-3 py-2 rounded-lg bg-red-50/80 dark:bg-red-500/5 border border-red-200/30 dark:border-red-500/10"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="w-3.5 h-3.5 mt-0.5 text-red-500 dark:text-red-400 shrink-0">
                  <path fill-rule="evenodd" d="M8 15A7 7 0 1 0 8 1a7 7 0 0 0 0 14ZM6.28 5.22a.75.75 0 0 0-1.06 1.06L6.94 8l-1.72 1.72a.75.75 0 1 0 1.06 1.06L8 9.06l1.72 1.72a.75.75 0 1 0 1.06-1.06L9.06 8l1.72-1.72a.75.75 0 0 0-1.06-1.06L8 6.94 6.28 5.22Z" clip-rule="evenodd" />
                </svg>
                <p class="text-xs text-red-600 dark:text-red-300 leading-relaxed">
                  {{ $t('clientSearch.noShowInsight', { count: item.noShowCount, rate: item.noShowRate }) }}
                </p>
              </div>

              <div
                v-if="item.lastVisit"
                class="flex items-center gap-1.5 text-xs text-app-text/70"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="w-3.5 h-3.5 text-app-text/40">
                  <path fill-rule="evenodd" d="M4 1.75a.75.75 0 0 1 1.5 0V3h5V1.75a.75.75 0 0 1 1.5 0V3a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2V1.75ZM4.5 7a.5.5 0 0 0 0 1h7a.5.5 0 0 0 0-1h-7Z" clip-rule="evenodd" />
                </svg>
                <span>
                  {{ $t('clientSearch.lastVisit') }}
                  <span class="font-medium text-app-title">{{ formatRelativeDate(item.lastVisit) }}</span>
                  <span v-if="item.lastVisitServiceName" class="text-app-text/50"> · {{ item.lastVisitServiceName }}</span>
                  <span v-if="item.lastVisitMemberName" class="text-app-text/40"> {{ $t('clientSearch.withMember', { name: item.lastVisitMemberName }) }}</span>
                </span>
              </div>
              <div
                v-else
                class="text-xs text-app-text/40 italic"
              >
                {{ $t('clientSearch.noVisitsYet') }}
              </div>

              <Transition name="fade">
                <div
                  v-if="item.matchedServiceHistory"
                  class="flex items-start gap-2 px-3 py-2 rounded-lg bg-brand-accent/5 border border-brand-accent/10"
                >
                  <span class="mt-0.5 text-brand-accent">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="w-3.5 h-3.5">
                      <path d="M10 1a.75.75 0 0 1 .65.38l1.34 2.32 2.32 1.34a.75.75 0 0 1 0 1.3l-2.32 1.34-1.34 2.32a.75.75 0 0 1-1.3 0L8.01 8.68 5.69 7.34a.75.75 0 0 1 0-1.3L8.01 4.7l1.34-2.32A.75.75 0 0 1 10 1Z" />
                    </svg>
                  </span>
                  <p class="text-xs text-brand-accent/90 leading-relaxed">
                    {{ $t('clientSearch.matchedInsight', {
                      service: item.matchedServiceHistory.serviceName,
                      date: formatRelativeDate(item.matchedServiceHistory.lastDate),
                      count: item.matchedServiceHistory.totalTimes
                    }) }}
                  </p>
                </div>
              </Transition>

              <div
                v-if="item.topServices.length > 0"
                class="flex flex-wrap gap-1.5"
              >
                <span
                  v-for="svc in item.topServices"
                  :key="svc.name"
                  class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-app-bg text-[11px] text-app-text/60 font-medium"
                >
                  {{ svc.name }}
                  <span class="text-app-text/30">{{ svc.count }}x</span>
                </span>
              </div>
            </div>
          </div>
        </RouterLink>
      </div>
    </TransitionGroup>

    <Transition name="fade">
      <div
        v-if="hasSearched && results.length === 0 && !isSearching"
        class="flex flex-col items-center py-10 text-center gap-3"
      >
        <div class="w-12 h-12 rounded-full bg-app-bg flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-6 h-6 text-app-text/30">
            <path fill-rule="evenodd" d="M9 3.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11ZM2 9a7 7 0 1 1 12.452 4.391l3.328 3.329a.75.75 0 1 1-1.06 1.06l-3.329-3.328A7 7 0 0 1 2 9Z" clip-rule="evenodd" />
          </svg>
        </div>
        <p class="text-sm text-app-text/50">{{ $t('clientSearch.noResults') }}</p>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
  import { ref } from "vue";
  import { RouterLink } from "vue-router";
  import { useI18n } from "vue-i18n";
  import type { ClientSearchResult, SpecialFilter } from "@/interfaces";

  defineProps<{
    query: string;
    results: ClientSearchResult[];
    serviceHint: string[];
    specialFilter: SpecialFilter;
    isSearching: boolean;
    hasSearched: boolean;
  }>();

  const emit = defineEmits<{
    (e: "update:query", value: string): void;
    (e: "clear"): void;
  }>();

  const { locale } = useI18n();
  const inputRef = ref<HTMLInputElement | null>(null);

  const onInput = (event: Event) => {
    const value = (event.target as HTMLInputElement).value;
    emit("update:query", value);
  };

  const clearSearch = () => {
    emit("clear");
    inputRef.value?.focus();
  };

  const formatRelativeDate = (isoStr: string): string => {
    const date = new Date(isoStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    const rtf = new Intl.RelativeTimeFormat(locale.value || "es", { numeric: "auto" });

    if (diffDays === 0) return rtf.format(0, "day");
    if (diffDays < 7) return rtf.format(-diffDays, "day");
    if (diffDays < 30) return rtf.format(-Math.floor(diffDays / 7), "week");
    if (diffDays < 365) return rtf.format(-Math.floor(diffDays / 30), "month");
    return rtf.format(-Math.floor(diffDays / 365), "year");
  };
</script>

<style scoped>
  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 0.2s ease;
  }
  .fade-enter-from,
  .fade-leave-to {
    opacity: 0;
  }

  .list-enter-active {
    transition: all 0.3s ease;
  }
  .list-leave-active {
    transition: all 0.2s ease;
  }
  .list-enter-from {
    opacity: 0;
    transform: translateY(8px);
  }
  .list-leave-to {
    opacity: 0;
    transform: translateY(-4px);
  }

  @keyframes fade-in-up {
    from {
      opacity: 0;
      transform: translateY(12px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  .animate-fade-in-up {
    animation: fade-in-up 0.35s ease-out both;
  }
</style>
