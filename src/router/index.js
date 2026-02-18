import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';
import HatimDetailView from '../views/HatimDetailView.vue';

const routes = [
    {
        path: '/',
        name: 'home',
        component: HomeView
    },
    {
        path: '/hatim/:id',
        name: 'detail',
        component: HatimDetailView
    }
];

const router = createRouter({
    history: createWebHistory(),
    routes
});

export default router;
