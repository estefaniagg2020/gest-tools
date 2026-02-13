import { createApp } from "vue";
import { VueQueryPlugin } from "@tanstack/vue-query";
import { createPinia } from "pinia";

import App from "./App.vue";
import "./assets/main.css";
import router from "./router";
import { queryClient } from "./lib/queryClient";
import { useAuthStore } from "@/stores/auth";

const app = createApp(App);

app.use(createPinia());
app.use(router);
app.use(VueQueryPlugin, { queryClient });

const authStore = useAuthStore();
authStore.initialize().then(() => {
  app.mount("#app");
});
