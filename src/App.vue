<template>
  <Navbar v-if="!ocultarNavbar" />
  <router-view />
  <Footer_Info v-if="!ocultarNavbar" />
</template>

<script setup>
  import { computed } from 'vue'
  import { useRoute } from 'vue-router'
  import Navbar from './components/Navbar.vue'
  import Footer_Info from './components/Footer_Info.vue'

  const route = useRoute()
  const ocultarNavbar = computed(() => route.path.startsWith('/vuelos/resultados'))
</script>
