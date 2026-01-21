<template>
  <div class="navbar-wrapper" :class="{ 'navbar-scrolled': isScrolled }">
    <!-- Barra superior con teléfono -->
    <div class="top-bar">
      <div class="phone-info">
        <img src="https://raw.githubusercontent.com/MiltonDavila123/SVGs/refs/heads/main/Whatsapp%20Logo%20_%20parte%20_%20superior.svg"
          alt="Whatsapp Logo" width="30" height="30" />
        <span class="phone-number">095-980-7049</span>
        <span class="phone-text">Llámanos o escribenos</span>
      </div>
    </div>

    <!-- Navbar principal -->
    <header class="navbar">
      <div class="logo">
        <img :src="logoUrl" class="logo-img" />
      </div>

      <div class="nav-wrapper-right">
        <div class="top-section">
          <div class="top-links">
            <a href="#">Noticias</a>
            <a href="#">Galápagos</a>
            <a href="#">Descuentos</a>
            <button class="btn-advisor">Boton de prueba</button>
          </div>
        </div>
        <div class="line-top"></div>
        <div class="nav-content">
          <nav>
            <router-link to="/">Inicio</router-link>
            <router-link to="/">Boletos aéreos</router-link>
            <router-link to="/">Hoteles</router-link>
            <router-link to="/">Renta de autos</router-link>
            <router-link to="/destinos">Destinos</router-link>
          </nav>
          <button class="btn">Contáctanos</button>
        </div>
      </div>
    </header>
    <div class="navbar-bottom-line"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import logoUrl from '../assets/images/Logo_letras_blancas.png'

const isScrolled = ref(false)

const handleScroll = () => {
  isScrolled.value = window.scrollY > 0
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
  handleScroll()
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style scoped>
.navbar-wrapper {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 1000;
  transition: background-color 0.3s ease;
}

.navbar-wrapper.navbar-scrolled {
  background: #072741;
}

.top-bar {
  display: flex;
  background: #facc15;
  padding: 10px 60px;
  justify-content: center;
  align-items: center;
}

.phone-info {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #1a365d;
}

.phone-info svg {
  color: #1a365d;
}

.phone-number {
  font-size: 1.8rem;
  font-weight: bold;
  color: #1a365d;
}

.phone-text {
  font-size: 1.0rem;
  font-weight: bold;
  color: #1a365d;
  margin-left: 10px;
}

.navbar {
  width: 100%;
  padding: 15px 60px;
  display: flex;
  align-items: center;
  gap: 20px;
  color: white;
  background: transparent;
}

.navbar-bottom-line {
  width: calc(100% - 120px);
  height: 1.8px;
  background: rgba(255, 255, 255, 0.708);
  margin-left: 60px;
}

.logo {
  flex-shrink: 0;
  display: flex;
  align-items: center;
}

.logo-img {
  width: 180px;
  height: auto;
}

.nav-wrapper-right {
  flex: 1;
  display: flex;
  flex-direction: column;
  margin-top: 5px;
}
.top-section {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 8px;
}

.top-links {
  display: flex;
  align-items: center;
  gap: 25px;
}

.top-links a {
  color: white;
  text-decoration: none;
  font-size: 0.8rem;
  transition: color 0.3s;
}

.top-links a:hover {
  color: #facc15;
}

.btn-advisor {
  background: transparent;
  border: 1px solid white;
  padding: 6px 16px;
  border-radius: 3px;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.7rem;
  color: white;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  transition: all 0.3s;
}

.btn-advisor:hover {
  background: rgba(255, 255, 255, 0.1);
}
.line-top {
  width: 100%;
  height: 2px;
  background:  rgba(255, 255, 255, 0.708);
}

.nav-content {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding: 8px 0 0 0;
  gap: 20px;
}

nav {
  display: flex;
  align-items: center;
  gap: 10px;
}

nav a,
nav .router-link-active,
nav :deep(a) {
  margin: 0;
  padding: 0 15px;
  color: white;
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  transition: color 0.3s ease;
}

nav a:hover {
  color: #facc15;
}

nav .router-link-exact-active {
  color: white;
  font-weight: bold;
}

.btn {
  background: #facc15;
  border: none;
  padding: 12px 28px;
  border-radius: 25px;
  cursor: pointer;
  font-weight: bold;
  font-size: 0.85rem;
  color: #1a365d;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  transition: all 0.3s ease;
}

.btn:hover {
  background: #e6b800;
}
</style>
