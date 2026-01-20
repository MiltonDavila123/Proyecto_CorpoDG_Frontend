<template>
  <header class="navbar">
    <div class="logo">
       <img :src="logoUrl"  class="logo-img" />
    </div>

    <nav>
      <router-link to="/" class="active">Inicio</router-link>
      <router-link to="/">Sobre Nosotros</router-link>
      <router-link to="/destinos">Destinos</router-link>
    </nav>

    <button class="btn">Contáctanos</button>
  </header>
</template>

<script setup>
import logoUrl from '../assets/images/Logo_letras_blancas.png'
</script>

<style scoped>
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  padding: 0px 60px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: white;
  z-index: 1000;
  background: transparent;
}

.logo {
  background: #333;
  padding: 14px 18px;
  border-radius: 0px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.logo-img {
  width: 140px;
  height: auto;
  padding: 0px 10px;
  object-fit: contain;
}


.logo-text {
  font-size: .9rem;
  font-weight: bold;
  color: white;
}

.logo-sub {
  font-size: 0.6rem;
  color: #ccc;
  letter-spacing: 2px;
  text-transform: uppercase;
}

nav a,
nav .router-link-active,
nav :deep(a) {
  margin: 0 15px;
  color: white;
  text-decoration: none;
  font-size: 0.95rem;
}

nav a.active,
nav .router-link-exact-active {
  color: #facc15;
}

.btn {
  background: #facc15;
  border: none;
  padding: 12px 22px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  color: #333;
}
</style>
