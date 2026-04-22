<template>
  <Navbar v-if="!ocultarNavbar" />
  <router-view />
  <Footer_Info v-if="!ocultarNavbar" />
  <ChatBot />
</template>

<script setup>
  import { computed } from 'vue'
  import { useRoute } from 'vue-router'
  import Navbar from './components/Navbar.vue'
  import Footer_Info from './components/Footer_Info.vue'
  import ChatBot from './components/ChatBot.vue'

  const route = useRoute()
  const ocultarNavbar = computed(() => route.path.startsWith('/vuelos/resultados'))
</script>
