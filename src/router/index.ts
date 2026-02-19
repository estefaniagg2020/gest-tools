import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { useGestorConfigStore } from "@/stores/gestorConfig";
import { useLayoutStore } from "@/stores/layout";
import { setFavicon } from "@/utils/favicon";
import AppLayout from "../components/layout/AppLayout.vue";
import SchedulerView from "../views/SchedulerView.vue";
import TeamManagerView from "../views/TeamManagerView.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/login",
      name: "login",
      component: () => import("../views/LoginView.vue"),
    },
    {
      path: "/forgot-password",
      name: "forgot-password",
      component: () => import("../views/ForgotPasswordView.vue"),
    },
    {
      path: "/setup",
      name: "setup",
      component: () => import("../views/SetupView.vue"),
    },
    {
      path: "/",
      component: AppLayout,
      children: [
        {
          path: "",
          name: "dashboard",
          component: () => import("../views/DashboardView.vue"),
        },
        {
          path: "scheduler",
          name: "scheduler",
          component: SchedulerView,
        },
        {
          path: "team",
          name: "team",
          component: TeamManagerView,
        },
        {
          path: "spas",
          redirect: { name: "services" },
        },
        {
          path: "services",
          name: "services",
          component: () => import("../views/ServicesView.vue"),
        },
        {
          path: "clients",
          name: "clients",
          component: () => import("../views/ClientsView.vue"),
        },
        {
          path: "clients/:id",
          name: "client-detail",
          component: () => import("../views/ClientDetailView.vue"),
        },
        {
          path: "inventory",
          name: "inventory",
          component: () => import("../views/InventoryView.vue"),
        },
        {
          path: "bonos",
          name: "bonos",
          component: () => import("../views/BonosView.vue"),
        },
        {
          path: "config",
          name: "config",
          component: () => import("../views/ConfigHubView.vue"),
        },
        {
          path: "config/data",
          name: "config-data",
          component: () => import("../views/ConfigWizardView.vue"),
        },
        {
          path: "config/themes",
          name: "config-themes",
          component: () => import("../views/ConfigThemesView.vue"),
        },
        {
          path: "config/grid",
          name: "config-grid",
          component: () => import("../views/ConfigGridView.vue"),
        },
        {
          path: "config/dashboard",
          name: "config-dashboard",
          component: () => import("../views/ConfigDashboardView.vue"),
        },
        {
          path: "config/agenda",
          name: "config-agenda",
          component: () => import("../views/ConfigAgendaView.vue"),
        },
        {
          path: "config/notifications",
          name: "config-notifications",
          component: () => import("../views/ConfigNotificationsView.vue"),
        },
        {
          path: "config/icons",
          name: "config-icons",
          component: () => import("../views/ConfigIconsView.vue"),
        },
        {
          path: "config/language",
          name: "config-language",
          component: () => import("../views/ConfigLanguageView.vue"),
        },
        {
          path: "config/bonos",
          name: "config-bonos",
          component: () => import("../views/ConfigBonosView.vue"),
        },
        {
          path: "config/billing",
          name: "config-billing",
          component: () => import("../views/ConfigBillingView.vue"),
        },
        {
          path: "config/modules",
          name: "config-modules",
          component: () => import("../views/ConfigModulesView.vue"),
        },
        {
          path: "settings",
          name: "settings",
          component: () => import("../views/SettingsView.vue"),
        },
        {
          path: "privacy",
          name: "privacy",
          component: () => import("../views/PrivacyView.vue"),
        },
        {
          path: "terms",
          name: "terms",
          component: () => import("../views/TermsView.vue"),
        },
        {
          path: "legal-notice",
          name: "legal-notice",
          component: () => import("../views/LegalNoticeView.vue"),
        },
      ],
    },
    {
      path: "/b/:slug",
      name: "public-business",
      component: () => import("../views/public/BusinessProfileView.vue"),
      meta: { layout: "public" } 
    },
  ],
});

const PUBLIC_NAMES = ["login", "forgot-password", "setup", "public-business"] as const;

router.beforeEach(async (to) => {
  const authStore = useAuthStore();
  await authStore.initialize();

  const isPublic = to.name && PUBLIC_NAMES.includes(to.name as (typeof PUBLIC_NAMES)[number]);
  if (isPublic) {
    setFavicon(null);
  }
  if (authStore.isAuthenticated && isPublic) {
    return { name: "dashboard" };
  }
  if (!authStore.isAuthenticated && !isPublic) {
    if (authStore.hasAnyUser()) return { name: "login" };
    return { name: "setup" };
  }
  if (!authStore.isAuthenticated && to.name === "login" && !authStore.hasAnyUser()) {
    return { name: "setup" };
  }
  if (!authStore.isAuthenticated && to.name === "setup" && authStore.hasAnyUser()) {
    return { name: "login" };
  }
  if (authStore.isAuthenticated && to.name === "dashboard") {
    const userId = authStore.user?.id;
    const businessId = authStore.user?.businessId ?? null;
    if (userId) {
      const layoutStore = useLayoutStore();
      layoutStore.initialize(userId);
      const gestorConfigStore = useGestorConfigStore();
      await gestorConfigStore.initialize(userId, businessId);
      if (!gestorConfigStore.onboardingComplete) {
        return { name: "config" };
      }
    }
  }
  return true;
});

export default router;
