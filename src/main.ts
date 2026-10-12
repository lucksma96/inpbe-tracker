import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'

import router from './router'

import piniaPluginPersistedState from 'pinia-plugin-persistedstate'

import 'unfonts.css'
import '@mdi/font/css/materialdesignicons.css'
import './assets/main.css'

// Vuetify
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import colors from 'vuetify/util/colors'

const app = createApp(App)
const pinia = createPinia()
pinia.use(piniaPluginPersistedState)
const vuetify = createVuetify({
  components,
  directives,
  theme: {
    themes: {
      light: {
        dark: false,
        colors: {
          primary: colors.red.lighten2,
          secondary: colors.amber.darken2,
          background: colors.grey.lighten3
        }
      },
      dark: {
        dark: true,
        colors: {
          primary: colors.red.darken2,
          secondary: colors.amber.darken4,
        }
      }
    },
  },
})

app.use(router)
app.use(pinia)
app.use(vuetify)

app.mount('#app')
