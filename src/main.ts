import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

import piniaPluginPersistedState from 'pinia-plugin-persistedstate'

import 'unfonts.css'
import '@mdi/font/css/materialdesignicons.css'

// Vuetify
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

const app = createApp(App)
const pinia = createPinia()
pinia.use(piniaPluginPersistedState)
const vuetify = createVuetify({
  components,
  directives
})

app.use(router)
app.use(pinia)
app.use(vuetify)

app.mount('#app')
