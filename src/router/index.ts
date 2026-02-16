import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { useGestorConfigStore } from "@/stores/gestorConfig";
import { setFavicon } from "@/utils/favicon";
import AppLayout from "../components/layout/AppLayout.vue";
import SchedulerView from "../views/SchedulerView.vue";
import TherapistManagerView from "../views/TherapistManagerView.vue";

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
          path: "therapists",
          name: "therapists",
          component: TherapistManagerView,
        },
        {
          path: "spas",
          redirect: { name: "servicios" },
        },
        {
          path: "servicios",
          name: "servicios",
          component: () => import("../views/ServiciosView.vue"),
        },
        {
          path: "clientes",
          name: "clientes",
          component: () => import("../views/ClientsView.vue"),
        },
        {
          path: "inventario",
          name: "inventario",
          component: () => import("../views/InventarioView.vue"),
        },
        {
          path: "config",
          name: "config",
          component: () => import("../views/ConfigHubView.vue"),
        },
        {
          path: "config/datos",
          name: "config-datos",
          component: () => import("../views/ConfigWizardView.vue"),
        },
        {
          path: "config/temas",
          name: "config-temas",
          component: () => import("../views/ConfigTemasView.vue"),
        },
        {
          path: "config/grid",
          name: "config-grid",
          component: () => import("../views/ConfigGridView.vue"),
        },
        {
          path: "config/agenda",
          name: "config-agenda",
          component: () => import("../views/ConfigAgendaView.vue"),
        },
        {
          path: "config/notificaciones",
          name: "config-notificaciones",
          component: () => import("../views/ConfigNotificacionesView.vue"),
        },
        {
          path: "config/iconos",
          name: "config-iconos",
          component: () => import("../views/ConfigIconosView.vue"),
        },
        {
          path: "settings",
          name: "settings",
          component: () => import("../views/SettingsView.vue"),
        },
      ],
    },
  ],
});

const PUBLIC_NAMES = ["login", "forgot-password", "setup"] as const;

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
    if (userId) {
      const gestorConfigStore = useGestorConfigStore();
      gestorConfigStore.initialize(userId);
      if (!gestorConfigStore.onboardingComplete) {
        return { name: "config" };
      }
    }
  }
  return true;
});

export default router;
