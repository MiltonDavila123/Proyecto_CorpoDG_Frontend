import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/destinos',
    name: 'Destinos',
    component: () => import('../views/Destinos.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
