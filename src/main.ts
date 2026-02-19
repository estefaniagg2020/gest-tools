import { createApp } from "vue";
import { VueQueryPlugin } from "@tanstack/vue-query";
import { createPinia } from "pinia";

import App from "./App.vue";
import "./assets/main.css";
import router from "./router";
import { queryClient } from "./lib/queryClient";
import { i18n } from "@/i18n";
import { useAuthStore } from "@/stores/auth";
import { useThemeStore } from "@/stores/theme";

const app = createApp(App);
app.use(i18n);
const pinia = createPinia();
app.use(pinia);
useThemeStore(pinia);
app.use(router);
app.use(VueQueryPlugin, { queryClient });

const authStore = useAuthStore();
const mountApp = () => app.mount("#app");
const initWithTimeout = () =>
  Promise.race([
    authStore.initialize(),
    new Promise<void>((resolve) => setTimeout(resolve, 8000)),
  ]).then(mountApp);
initWithTimeout();
