import Vue from 'vue'
import Router from 'vue-router'
import Setup from './views/Setup.vue'
import Timer from './views/Timer.vue'
import NotFoundComponent from './views/FileNotFound.vue'

Vue.use(Router)

export default new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/',
      name: 'setup',
      alias: '/setup',
      component: Setup
    },
    {
      path: '/timer',
      name: 'timer',
      component: Timer
    },
    { path: '*', component: NotFoundComponent }
  ]
})
