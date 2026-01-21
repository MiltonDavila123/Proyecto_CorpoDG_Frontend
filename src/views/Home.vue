<template>
  <section class="hero">
    
    <div 
      v-for="(imagen, index) in imagenes" 
      :key="index"
      class="hero-bg"
      :class="{ active: index === imagenActual }"
      :style="{ backgroundImage: `url(${imagen})` }"
    ></div>
    <div class="hero-overlay"></div>
    <div class="logo">
       <img :src="logoUrl"  class="logo-img" />
    </div>
    <div class="content">
      <p class="subtitle">
        ¡Viaja a cualquier lado del mundo!
      </p>
      <h2>Haz de tu viaje una experiencia única<br />con nosotros</h2>
    </div>
  </section>

  <!-- Sección blanca de contenido -->
  <section class="content-section">
    <div class="content-wrapper">
      <div class="card">
        <div class="card-icon">🌿</div>
        <h3>Activities</h3>
        <p>A small river named Duden flows by their place and supplies</p>
      </div>
      <div class="card">
        <div class="card-icon">📍</div>
        <h3>Travel Arrangements</h3>
        <p>A small river named Duden flows by their place and supplies</p>
      </div>
    </div>
    <div class="adventure-text">
      <h2>It's time to start your<br><span class="bold">adventure</span></h2>
    </div>
  </section>
</template>

<style scoped>
.hero {
  height: 100vh;
  position: relative;
  margin-top: 0;
  overflow: hidden;
}

/* Imágenes de fondo con transición fade y zoom */
.hero-bg {
  position: absolute;
  inset: 0;
  background-size: cover;
  background-position: center;
  opacity: 0;
  transform: scale(1);
  transition: opacity 1.5s ease-in-out, transform 6s ease-in-out;
  z-index: 0;
}

.hero-bg.active {
  opacity: 1;
  transform: scale(1.08);
}

.hero-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.35);
  z-index: 1;
}

.content {
  position: relative;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: white;
  text-align: center;
  padding: 0 20px;
  z-index: 2;
}

h2 {
  font-size: 3rem;
  margin-top: 10px;
  font-weight: 400;
  font-style: italic;
}

.subtitle {
  font-size: 1rem;
  opacity: 0.95;
  color: white;
}


/* Sección blanca */
.content-section {
  background: #fff;
  padding: 60px;
  display: flex;
  gap: 60px;
  align-items: center;
  justify-content: space-between;
  margin-top: -80px;
  position: relative;
  z-index: 10;
}

.content-wrapper {
  display: flex;
  gap: 40px;
  flex: 1;
}

.card {
  flex: 1;
  text-align: center;
}

.card-icon {
  font-size: 4rem;
  margin-bottom: 15px;
}

.card h3 {
  font-size: 1.2rem;
  color: #333;
  margin-bottom: 10px;
}

.card p {
  color: #666;
  font-size: 0.95rem;
  line-height: 1.6;
}

.adventure-text {
  flex: 1;
}

.adventure-text h2 {
  font-size: 2.5rem;
  color: #333;
  font-style: normal;
}

.adventure-text .bold {
  font-weight: bold;
  font-size: 3rem;
}
</style>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

// ==========================================
// 🖼️ AGREGA O ELIMINA IMÁGENES AQUÍ
// ==========================================
const imagenes = [
  '/src/assets/images/imagen2.jpg',
  '/src/assets/images/imagen1.jpg',
  // Agrega más imágenes aquí:
  // '/src/assets/images/imagen3.jpg',
  // '/src/assets/images/imagen4.jpg',
]

// ⏱️ Tiempo entre cambios en milisegundos 5000 = 5 segundos
const tiempoEntreCambios = 7500

// ==========================================

const imagenActual = ref(0)
let intervalo = null

const cambiarImagen = () => {
  imagenActual.value = (imagenActual.value + 1) % imagenes.length
}

onMounted(() => {
  intervalo = setInterval(cambiarImagen, tiempoEntreCambios)
})

onUnmounted(() => {
  if (intervalo) clearInterval(intervalo)
})
</script>