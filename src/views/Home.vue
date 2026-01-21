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
      <h2>Haz de tu viaje una experiencia única<br />con nosotros</h2>
      
    </div>
  </section>

  <!-- Sección blanca de contenido -->
  <section class="content-section">
    <div class="content-wrapper">
      <div class="card">
        
        <h3>Activities</h3>
        <p>A small river named Duden flows by their place and supplies</p>
      </div>
      <div class="card">
        
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
/* ===== VARIABLES DE COLORES Y FUENTES ===== */
.hero {
  /* Colores */
  --color-overlay: rgba(0, 0, 0, 0.35);       /* Overlay oscuro sobre imagen */
  --color-text-light: white;                   /* Texto claro */
  --color-background-section: #fff;            /* Fondo sección blanca */
  --color-heading-dark: #333;                  /* Títulos oscuros */
  --color-text-gray: #666;                     /* Texto gris */
  
  /* Fuentes */
  --font-heading: 'Georgia', serif;            /* Títulos principales */
  --font-body: 'Arial', sans-serif;            /* Texto normal */
  --font-subtitle: 'Verdana', sans-serif;      /* Subtítulos */
}
/* ========================================== */

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
  background: var(--color-overlay);
  z-index: 1;
}

.content {
  position: relative;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: var(--color-text-light);
  text-align: center;
  padding: 0 20px;
  z-index: 2;
}

h2 {
  font-size: 3rem;
  margin-top: 10px;
  font-weight: 400;
  font-style: italic;
  font-family: var(--font-heading);
}

.subtitle {
  font-size: 1rem;
  opacity: 0.95;
  color: var(--color-text-light);
  font-family: var(--font-heading);
}


/* Sección blanca */
.content-section {
  background: var(--color-background-section);
  padding: 80px 100px;
  display: flex;
  flex-direction: column;
  gap: 80px;
  margin-top: -50px;
  position: relative;
  z-index: 10;
  box-shadow: 0 -10px 30px rgba(0, 0, 0, 0.1);
}

.content-wrapper {
  display: flex;
  gap: 80px;
  justify-content: center;
  align-items: stretch;
}

.card {
  flex: 1;
  max-width: 400px;
  text-align: center;
  padding: 40px 30px;
  background: #fafafa;
  border-radius: 10px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.342);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.card:hover {
  transform: translateY(-10px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.card-icon {
  font-size: 4rem;
  margin-bottom: 15px;
}

.card h3 {
  font-size: 1.5rem;
  color: var(--color-heading-dark);
  margin-bottom: 15px;
  font-family: var(--font-heading);
  font-weight: 600;
}

.card p {
  color: var(--color-text-gray);
  font-size: 1rem;
  line-height: 1.8;
  font-family: var(--font-body);
}

.adventure-text {
  text-align: center;
  padding: 40px 0;
}

.adventure-text h2 {
  font-size: 3rem;
  color: var(--color-heading-dark);
  font-style: normal;
  font-family: var(--font-heading);
  line-height: 1.3;
}

.adventure-text .bold {
  font-weight: bold;
  font-size: 3.5rem;
  display: block;
  margin-top: 10px;
}
</style>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

// ==========================================
// 🖼️ AGREGA O ELIMINA IMÁGENES AQUÍ
// ==========================================
const imagenes = [
  '/src/assets/images/imagen2.jpg',
  '/src/assets/images/avion.jpg',
  // Agrega más imágenes aquí:
  // '/src/assets/images/imagen3.jpg',
  // '/src/assets/images/imagen4.jpg',
]

// ⏱️ Tiempo entre cambios en milisegundos 5000 = 5 segundos
const tiempoEntreCambios = 6500

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