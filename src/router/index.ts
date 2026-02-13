import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "@/stores/auth";
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
          component: () => import("../views/ConfigWizardView.vue"),
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
          name: "spas",
          component: () => import("../views/SpaManagerView.vue"),
        },
        {
          path: "config",
          name: "config",
          component: () => import("../views/ConfigHubView.vue"),
        },
        {
          path: "config/wizard",
          name: "config-wizard",
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
          path: "config/notificaciones",
          name: "config-notificaciones",
          component: () => import("../views/ConfigNotificacionesView.vue"),
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
  return true;
});

export default router;
