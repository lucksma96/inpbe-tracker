import { createRouter, createWebHistory } from 'vue-router';

const CurriculumView = () => import('@/views/CurriculumView.vue');
const SettingsView = () => import('@/views/SettingsView.vue');
const AboutView = () => import('@/views/AboutView.vue');

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        { path: '/', component: CurriculumView },
        { path: '/settings', component: SettingsView },
        { path: '/about', component: AboutView },
    ],
});

export default router;
