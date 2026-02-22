<!-- HIDDEN_FEATURE: informes - Panel Generar informes (oculto en ConfigHubView, pendiente implementar) -->
<template>
  <section class="rounded-2xl border border-app-border-subtle bg-app-surface shadow-sm overflow-hidden">
    <div class="p-4 sm:p-5 border-b border-app-border-subtle bg-app-bg/50">
      <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 class="text-base font-semibold text-app-title">
            {{ $t('configReports.title') }}
          </h2>
          <p class="text-sm text-app-text/70 mt-0.5">
            {{ $t('configReports.subtitle') }}
          </p>
        </div>
        <button
          type="button"
          class="inline-flex items-center gap-2 rounded-xl bg-brand-accent px-4 py-2 text-sm font-semibold text-white shadow-sm hover:opacity-95 transition-opacity shrink-0"
          @click="isOpen ? close() : open()"
        >
          <span aria-hidden="true">📈</span>
          {{ isOpen ? $t('configReports.hide') : $t('configReports.show') }}
        </button>
      </div>
    </div>

    <div v-if="isOpen" class="p-4 sm:p-5 space-y-6">
      <div class="rounded-xl border border-app-border-subtle bg-app-bg/30 overflow-hidden">
        <table class="w-full text-left text-sm">
          <thead>
            <tr class="border-b border-app-border-subtle bg-app-surface">
              <th class="px-4 py-3 font-semibold text-app-title">
                {{ $t('configReports.tableType') }}
              </th>
              <th class="px-4 py-3 font-semibold text-app-title hidden sm:table-cell">
                {{ $t('configReports.tablePeriod') }}
              </th>
              <th class="px-4 py-3 font-semibold text-app-title hidden md:table-cell">
                {{ $t('configReports.tableContent') }}
              </th>
              <th class="px-4 py-3 font-semibold text-app-title text-right w-28">
                {{ $t('configReports.tableAction') }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="row in reportRows"
              :key="row.id"
              class="border-b border-app-border-subtle last:border-0 hover:bg-app-bg/50 transition-colors"
            >
              <td class="px-4 py-3 text-app-title font-medium">
                {{ row.label }}
              </td>
              <td class="px-4 py-3 text-app-text/80 hidden sm:table-cell">
                {{ row.periodLabel }}
              </td>
              <td class="px-4 py-3 text-app-text/70 hidden md:table-cell">
                {{ row.description }}
              </td>
              <td class="px-4 py-3 text-right">
                <button
                  type="button"
                  class="inline-flex items-center gap-1.5 rounded-lg bg-brand-accent px-3 py-1.5 text-xs font-medium text-white hover:opacity-90 transition-opacity disabled:opacity-50"
                  :disabled="loading"
                  @click="selectReport(row)"
                >
                  <span v-if="loading">⏳</span>
                  <span v-else>⬇️</span>
                  {{ loading ? $t('common.loading') : $t('configReports.obtain') }}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <p v-if="loading" class="text-sm text-app-text/70">
        {{ $t('configReports.loading') }}
      </p>
      <p v-else-if="error" class="text-sm text-red-600">
        {{ error }}
      </p>

      <div
        v-else
        class="rounded-2xl border border-app-border-subtle bg-app-bg/50 p-4 sm:p-5 space-y-4"
      >
        <h3 class="text-sm font-semibold text-app-title">
          {{ $t('configReports.resultTitle') }}
        </h3>
        <div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <article class="rounded-xl border border-app-border-subtle bg-app-surface p-4">
            <p class="text-[11px] uppercase tracking-wide text-app-text/60">
              {{ periodSalesLabel }}
            </p>
            <p class="mt-1 text-2xl font-bold text-app-title">
              {{ formatCurrency(salesInPeriod) }}
            </p>
          </article>
          <article class="rounded-xl border border-app-border-subtle bg-app-surface p-4">
            <p class="text-[11px] uppercase tracking-wide text-app-text/60">
              {{ periodAppointmentsLabel }}
            </p>
            <p class="mt-1 text-2xl font-bold text-app-title">
              {{ appointmentsInPeriod.length }}
            </p>
          </article>
          <article class="rounded-xl border border-app-border-subtle bg-app-surface p-4">
            <p class="text-[11px] uppercase tracking-wide text-app-text/60">
              {{ $t('configReports.totalClients') }}
            </p>
            <p class="mt-1 text-2xl font-bold text-app-title">
              {{ totalClients }}
            </p>
          </article>
          <article class="rounded-xl border border-app-border-subtle bg-app-surface p-4">
            <p class="text-[11px] uppercase tracking-wide text-app-text/60">
              {{ $t('configReports.totalUsers') }}
            </p>
            <p class="mt-1 text-2xl font-bold text-app-title">
              {{ totalUsers }}
            </p>
          </article>
        </div>

        <div class="rounded-xl border border-app-border-subtle bg-app-surface p-4">
          <div class="mb-3 flex items-center justify-between gap-2">
            <h4 class="text-sm font-semibold text-app-title">
              {{ $t('configReports.topServices') }}
            </h4>
            <span class="text-xs text-app-text/70">
              {{ $t('configReports.top5') }}
            </span>
          </div>
          <div v-if="topServicesInPeriod.length === 0" class="text-sm text-app-text/70">
            {{ $t('configReports.noData') }}
          </div>
          <div v-else class="space-y-2.5">
            <div
              v-for="item in topServicesInPeriod"
              :key="item.serviceName"
              class="space-y-1"
            >
              <div class="flex items-center justify-between gap-2 text-sm">
                <span class="min-w-0 truncate text-app-title">{{ item.serviceName }}</span>
                <span class="font-semibold text-brand-accent tabular-nums">{{ item.count }}</span>
              </div>
              <div class="h-2.5 rounded-full bg-app-border-subtle overflow-hidden">
                <div
                  class="h-full rounded-full bg-brand-accent"
                  :style="{ width: `${serviceBarWidth(item.count)}%` }"
                />
              </div>
            </div>
          </div>
        </div>

        <div class="rounded-xl border border-app-border-subtle bg-app-surface p-4">
          <h4 class="text-sm font-semibold text-app-title mb-2">
            {{ $t('configReports.dashboardHighlights') }}
          </h4>
          <div class="grid gap-2 sm:grid-cols-2 xl:grid-cols-4 text-sm">
            <div class="rounded-lg border border-app-border-subtle bg-app-bg/60 px-3 py-2">
              <span class="text-app-text/70">{{ $t('configReports.reservasSemana') }}</span>
              <strong class="ml-1 text-app-title">{{ dashboardHighlights.reservasSemana }}</strong>
            </div>
            <div class="rounded-lg border border-app-border-subtle bg-app-bg/60 px-3 py-2">
              <span class="text-app-text/70">{{ $t('configReports.reservasMes') }}</span>
              <strong class="ml-1 text-app-title">{{ dashboardHighlights.reservasMes }}</strong>
            </div>
            <div class="rounded-lg border border-app-border-subtle bg-app-bg/60 px-3 py-2">
              <span class="text-app-text/70">{{ $t('configReports.beneficioHoy') }}</span>
              <strong class="ml-1 text-app-title">{{ formatCurrency(dashboardHighlights.beneficioHoy) }}</strong>
            </div>
            <div class="rounded-lg border border-app-border-subtle bg-app-bg/60 px-3 py-2">
              <span class="text-app-text/70">{{ $t('configReports.ingresosMes') }}</span>
              <strong class="ml-1 text-app-title">{{ formatCurrency(dashboardHighlights.ingresosMes) }}</strong>
            </div>
          </div>
        </div>

        <div class="flex flex-wrap gap-2 pt-2">
          <button
            type="button"
            class="inline-flex items-center gap-2 rounded-xl border border-app-border bg-app-surface px-3 py-2 text-sm font-medium text-app-title hover:border-brand-accent/40 transition-colors"
            @click="exportCsv"
          >
            <span aria-hidden="true">🧾</span>
            {{ $t('configReports.exportCsv') }}
          </button>
          <button
            type="button"
            class="inline-flex items-center gap-2 rounded-xl border border-app-border bg-app-surface px-3 py-2 text-sm font-medium text-app-title hover:border-brand-accent/40 transition-colors"
            @click="exportExcel"
          >
            <span aria-hidden="true">📊</span>
            {{ $t('configReports.exportExcel') }}
          </button>
          <button
            type="button"
            class="inline-flex items-center gap-2 rounded-xl border border-app-border bg-app-surface px-3 py-2 text-sm font-medium text-app-title hover:border-brand-accent/40 transition-colors"
            @click="load"
          >
            <span aria-hidden="true">↻</span>
            {{ $t('configReports.refresh') }}
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
  import { computed } from "vue";
  import { useI18n } from "vue-i18n";
  import { useBusinessSummary, type SummaryPeriod } from "@/composables/useBusinessSummary";

  const { t } = useI18n();
  const summary = useBusinessSummary();

  const {
    isOpen,
    loading,
    error,
    appointmentsInPeriod,
    salesInPeriod,
    totalClients,
    totalUsers,
    topServicesInPeriod,
    dashboardHighlights,
    periodSalesLabel,
    periodAppointmentsLabel,
    open,
    close,
    load,
    exportCsv,
    exportExcel,
    downloadReport,
  } = summary;

  const reportRows = computed(() => [
    {
      id: "daily",
      period: "daily" as SummaryPeriod,
      label: t("configReports.reportDaily"),
      periodLabel: t("configReports.periodDaily"),
      description: t("configReports.descDaily"),
      format: "CSV",
    },
    {
      id: "weekly",
      period: "weekly" as SummaryPeriod,
      label: t("configReports.reportWeekly"),
      periodLabel: t("configReports.periodWeekly"),
      description: t("configReports.descWeekly"),
      format: "CSV",
    },
    {
      id: "monthly",
      period: "monthly" as SummaryPeriod,
      label: t("configReports.reportMonthly"),
      periodLabel: t("configReports.periodMonthly"),
      description: t("configReports.descMonthly"),
      format: "CSV",
    },
    {
      id: "clients",
      period: "monthly" as SummaryPeriod,
      label: t("configReports.reportClients"),
      periodLabel: t("configReports.periodMonthly"),
      description: t("configReports.descClients"),
      format: "CSV",
    },
    {
      id: "sales",
      period: "monthly" as SummaryPeriod,
      label: t("configReports.reportSales"),
      periodLabel: t("configReports.periodMonthly"),
      description: t("configReports.descSales"),
      format: "CSV",
    },
    {
      id: "all",
      period: "monthly" as SummaryPeriod,
      label: t("configReports.reportAll"),
      periodLabel: t("configReports.periodMonthly"),
      description: t("configReports.descAll"),
      format: "CSV",
    },
  ]);

  const selectReport = async (row: { id: string; period: SummaryPeriod }) => {
    await downloadReport(row.id, row.period);
  };

  const formatCurrency = (value: number): string =>
    new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(value);

  const maxTopServiceCount = computed(() =>
    topServicesInPeriod.value.length > 0
      ? Math.max(...topServicesInPeriod.value.map((item) => item.count))
      : 1,
  );

  const serviceBarWidth = (count: number): number =>
    Math.max(6, Math.round((count / maxTopServiceCount.value) * 100));
</script>
