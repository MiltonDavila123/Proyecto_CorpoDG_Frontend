import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/paquetes',
    name: 'Paquetes',
    component: () => import ('../views/Paquetes.vue')
  },
  {
    path: '/paquetes/:id',
    name: 'PaqueteDetalle',
    component: () => import ('../views/Paquetes.vue'),
    props: true
  },
  {
    path: '/boletos',
    name: 'Boletos',
    component: () => import('../views/Boletos.vue')
  },
  {
    path: '/hoteles',
    name: 'Hoteles',
    component: () => import('../views/Hoteles.vue')
  },
  {
    path: '/renta_auto',
    name: 'Renta Auto',
    component: () => import('../views/Renta_Autos.vue')
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

