import { createApp } from 'vue'

import App from './App.vue'
import router from './router'
import VueFullscreen from 'vue-fullscreen'

const app = createApp(App)

app.use(router)
app.use(VueFullscreen)

app.mount('#app')
