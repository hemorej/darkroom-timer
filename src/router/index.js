import { createRouter, createWebHistory } from "vue-router";

import SetupView from "../views/SetupView.vue";
import TimerView from "../views/TimerView.vue";
import TimesView from "../views/TimesView.vue";
import NotFoundComponent from "../views/FileNotFound.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "setup",
      alias: "/setup",
      component: SetupView,
    },
    {
      path: "/timer",
      name: "timer",
      component: TimerView,
    },
    {
      path: "/times",
      name: "times",
      component: TimesView,
    },
    {
      path: "/:pathMatch(.*)*",
      name: "not-found",
      component: NotFoundComponent,
    },
  ],
});

export default router;
