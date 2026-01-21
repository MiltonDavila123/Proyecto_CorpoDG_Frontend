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
/* ===== VARIABLES DE COLORES ===== */
.navbar-wrapper {
  --color-primary: #b5931ae2;        /* Amarillo/Dorado principal */
  --color-primary-hover-button: #544a28;  /* Amarillo/Dorado hover */
  --color-dark: #ebeae7e0;           /* Azul oscuro/Negro para textos */
  --color-background: #23221ee8;     /* Fondo navbar scroll */
  --color-hover-nav: #ac9749;
  
  /* ===== VARIABLES DE FUENTES ===== */
  --font-heading: 'Arial', serif;              /* Para títulos y números grandes */
  --font-body: 'Arial', sans-serif;              /* Para textos normales */
  --font-menu: 'Verdana', sans-serif;            /* Para menú principal */
  --font-button: 'Trebuchet MS', sans-serif;     /* Para botones */
  --font-secondary: 'Arial', serif;    /* Para links secundarios */
}
/* ===================================== */

.navbar-wrapper {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 1000;
  transition: background-color 0.3s ease;
}

.navbar-wrapper.navbar-scrolled {
  background: var(--color-background);
}

.top-bar {
  display: flex;
  background: var(--color-primary);
  padding: 10px 60px;
  justify-content: center;
  align-items: center;
}

.phone-info {
  display: flex;
  align-items: center;
  gap: 10px;
  color: var(--color-dark);
}

.phone-info svg {
  color: var(--color-dark);
}

.phone-number {
  font-size: 1.8rem;
  font-weight: bold;
  color: var(--color-dark);
  font-family: var(--font-heading);
}

.phone-text {
  font-size: 1.0rem;
  font-weight: bold;
  color: var(--color-dark);
  margin-left: 10px;
  font-family: var(--font-body);
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
  font-family: var(--font-secondary);
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
  font-family: var(--font-button);
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
  font-family: var(--font-menu);
}

nav a:hover {
  color: var(--color-hover-nav);
}

nav .router-link-exact-active {
  color: white;
  font-weight: bold;
}

.btn {
  background: var(--color-primary);
  border: none;
  padding: 12px 28px;
  border-radius: 25px;
  cursor: pointer;
  font-weight: bold;
  font-size: 0.85rem;
  color: var(--color-dark);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  transition: all 0.3s ease;
  font-family: var(--font-button);
}

.btn:hover {
  background: var(--color-primary-hover-button);
}
</style>
