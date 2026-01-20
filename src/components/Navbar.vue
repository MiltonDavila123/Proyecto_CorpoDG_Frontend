<template>
  <header class="navbar">
    <div class="logo">
       <img :src="logoUrl"  class="logo-img" />
      <span class="logo-text">TRAVEL AGENCY</span>
    </div>

    <nav>
      <a href="#" class="active">Inicio</a>
      <a href="#">Sobre Nosotros</a>
      <a href="#">Destinos</a>
    </nav>

    <button class="btn">Contáctanos</button>
  </header>
</template>

<script setup>
import logoUrl from '../assets/images/logo.png'
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
  width: 100px;
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

nav a {
  margin: 0 15px;
  color: white;
  text-decoration: none;
  font-size: 0.95rem;
}

nav a.active {
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
