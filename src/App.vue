<template>
  <Navbar />
  <router-view />
  <Footer_Info />

</template>

<script setup>
  import Navbar from './components/Navbar.vue'
  import Footer_Info from './components/Footer_Info.vue';
</script>
