import { createApp } from "vue";
import { VueQueryPlugin } from "@tanstack/vue-query";
import { createPinia } from "pinia";

import App from "./App.vue";
import "./assets/main.css";
import router from "./router";
import { queryClient } from "./lib/queryClient";
import { useAuthStore } from "@/stores/auth";
import { useThemeStore } from "@/stores/theme";

const app = createApp(App);
const pinia = createPinia();
app.use(pinia);
useThemeStore(pinia);
app.use(router);
app.use(VueQueryPlugin, { queryClient });

const authStore = useAuthStore();
authStore.initialize().then(() => {
  app.mount("#app");
});
