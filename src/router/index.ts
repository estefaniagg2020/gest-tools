import { createRouter, createWebHistory } from "vue-router";
import AppLayout from "../components/layout/AppLayout.vue";
import DashboardView from "../views/DashboardView.vue";
import SchedulerView from "../views/SchedulerView.vue";
import TherapistManagerView from "../views/TherapistManagerView.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      component: AppLayout,
      children: [
        {
          path: "",
          name: "dashboard",
          component: DashboardView,
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
      ],
    },
  ],
});

export default router;
