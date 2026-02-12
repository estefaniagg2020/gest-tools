import { createApp } from "vue";
import { VueQueryPlugin } from "@tanstack/vue-query";
import { createPinia } from "pinia";

import App from "./App.vue";
import "./assets/main.css";
import router from "./router";
import { queryClient } from "./lib/queryClient";

const app = createApp(App);

app.use(createPinia());
app.use(router);
app.use(VueQueryPlugin, { queryClient });

app.mount("#app");
