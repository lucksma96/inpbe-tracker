import { createRouter, createWebHistory } from 'vue-router'

import CurriculumView from '../views/CurriculumView.vue'
import AboutView from '../views/AboutView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', component: CurriculumView },
    { path: '/about', component: AboutView },
  ],
})

export default router
