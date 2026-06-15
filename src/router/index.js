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
    component: () => import ('../views/PaquetesLayout.vue')
  },
  {
    path: '/paquetes/reserva/confirmada',
    name: 'ReservaPaqueteConfirmada',
    component: () => import('../views/ReservaPaqueteConfirmada.vue')
  },
  {
    path: '/paquetes/reserva/cancelada',
    name: 'ReservaPaqueteCancelada',
    component: () => import('../views/ReservaPaqueteCancelada.vue')
  },
  {
    path: '/paquetes/:id',
    name: 'PaqueteDetalle',
    component: () => import('../views/DetallePaquete.vue'),
    props: true
  },
  {
    path: '/boletos',
    name: 'Boletos',
    component: () => import('../views/Boletos.vue')
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
  },
  {
    path: '/vuelos/resultados',
    name: 'ResultadosVuelos',
    component: () => import('../views/ResultadosVuelos.vue')
  },
  {
    path: '/reserva/confirmada',
    name: 'ReservaConfirmada',
    component: () => import('../views/ReservaConfirmada.vue')
  },
  {
    path: '/reserva/cancelada',
    name: 'ReservaCancelada',
    component: () => import('../views/ReservaCancelada.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router

