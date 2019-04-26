import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import fullscreen from 'vue-fullscreen'

Vue.use(require('vue-shortkey'))
Vue.use(fullscreen)

Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
