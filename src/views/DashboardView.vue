<template>
  <div class="h-full flex flex-col p-5 overflow-hidden">
    <DashboardHeader
      :current-date="currentDate"
      :current-user-name="currentUserName"
      :current-user-photo="currentUserPhoto"
      :current-role="authStore.currentRole"
      :current-user-id="authStore.currentUserId"
      :therapists="therapistStore.therapists"
      @update:user="currentUserSelection = $event"
    />

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-5 shrink-0">
      <MetricCard
        v-for="metric in dashboardMetrics"
        :key="metric.title"
        :title="metric.title"
        :value="metric.value"
        :trend="metric.trend"
        :icon="metric.icon"
        :icon-bg-class="metric.iconBgClass"
        :decorator-class="metric.decoratorClass"
      />
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-5 flex-1 min-h-0">
      <div class="lg:col-span-2 flex flex-col gap-5 h-full min-h-0">
        <RevenueChart :data="chartData" />

        <div class="grid grid-cols-2 gap-4 shrink-0 h-24">
          <QuickActionCard
            v-for="action in quickActions"
            :key="action.to"
            :title="action.title"
            :subtitle="action.subtitle"
            :icon="action.icon"
            :variant="action.variant"
            @click="$router.push(action.to)"
          />
        </div>
      </div>

      <ActivityTimeline
        :activities="recentActivity"
        :tip="DASHBOARD_CONSTANTS.TIP_OF_THE_DAY"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed } from "vue";
  import { useRouter } from "vue-router";
  import { useDashboard } from "@/composables/useDashboard";
  import { DASHBOARD_CONSTANTS } from "@/data/constants";
  import type { MetricCardProps } from "@/interfaces/components";
  import DashboardHeader from "@/components/dashboard/DashboardHeader.vue";
  import MetricCard from "@/components/dashboard/MetricCard.vue";
  import RevenueChart from "@/components/dashboard/RevenueChart.vue";
  import ActivityTimeline from "@/components/dashboard/ActivityTimeline.vue";
  import QuickActionCard from "@/components/dashboard/QuickActionCard.vue";

  const $router = useRouter();
  const {
    authStore,
    therapistStore,
    currentUserName,
    currentUserPhoto,
    currentUserSelection,
    currentDate,
    chartData,
    recentActivity,
  } = useDashboard();

  const quickActions = [
    { title: "Centros", subtitle: "Salas y servicios", icon: "🏢", variant: "blue" as const, to: "/spas" },
    { title: "Equipo", subtitle: "Rendimiento", icon: "👥", variant: "purple" as const, to: "/therapists" },
  ];

  const dashboardMetrics = computed<MetricCardProps[]>(() => [
    {
      title: "Citas Hoy",
      value: 12,
      trend: 15,
      icon: "📅",
      iconBgClass: "bg-orange-100 text-orange-600",
      decoratorClass: "bg-orange-500",
    },
    {
      title: "Ingresos (Est.)",
      value: "1.250€",
      trend: 8,
      icon: "💶",
      iconBgClass: "bg-green-100 text-green-600",
      decoratorClass: "bg-green-500",
    },
    {
      title: "Terapeutas Activos",
      value: therapistStore.therapists.length,
      icon: "👥",
      iconBgClass: "bg-blue-100 text-blue-600",
      decoratorClass: "bg-blue-500",
    },
    {
      title: "Ocupación",
      value: "85%",
      trend: -2,
      icon: "📊",
      iconBgClass: "bg-purple-100 text-purple-600",
      decoratorClass: "bg-purple-500",
    },
  ]);
</script>
