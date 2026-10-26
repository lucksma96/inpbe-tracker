import { createRouter, createWebHistory } from 'vue-router'

import CurriculumView from '../views/CurriculumView.vue'
import SettingsView from '../views/SettingsView.vue'
import AboutView from '../views/AboutView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', component: CurriculumView },
    { path: '/settings', component: SettingsView },
    { path: '/about', component: AboutView },
  ],
})

export default router
