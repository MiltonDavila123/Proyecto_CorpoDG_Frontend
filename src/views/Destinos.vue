<template>
  <section class="destinos-hero">
    <div class="hero-overlay"></div>
    <div class="hero-content">
      <h1>Nuestros Destinos</h1>
      <p>Explora los lugares más increíbles del mundo</p>
    </div>
  </section>

  <section class="destinos-grid">
    <div class="destino-card" v-for="destino in destinos" :key="destino.id">
      <div class="destino-img" :style="{ backgroundImage: `url(${destino.imagen})` }"></div>
      <div class="destino-info">
        <h3>{{ destino.nombre }}</h3>
        <p>{{ destino.descripcion }}</p>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue'

const destinos = ref([
  {
    id: 1,
    nombre: 'París, Francia',
    descripcion: 'La ciudad del amor y la luz',
    imagen: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600'
  },
  {
    id: 2,
    nombre: 'Tokio, Japón',
    descripcion: 'Tradición y modernidad en perfecta armonía',
    imagen: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=600'
  },
  {
    id: 3,
    nombre: 'Nueva York, USA',
    descripcion: 'La ciudad que nunca duerme',
    imagen: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=600'
  },
  {
    id: 4,
    nombre: 'Roma, Italia',
    descripcion: 'Historia y arte en cada esquina',
    imagen: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=600'
  }
])
</script>

<style scoped>
.destinos-hero {
  height: 85vh;
  background: url('https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1200') center/cover;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.hero-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
}

.hero-content {
  position: relative;
  z-index: 1;
  text-align: center;
  color: white;
}

.hero-content h1 {
  font-size: 3.5rem;
  margin-bottom: 1rem;
  font-weight: 700;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
}

.hero-content p {
  font-size: 1.4rem;
  opacity: 0.95;
  font-weight: 300;
}

.destinos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 30px;
  padding: 60px;
  background: #f5f5f5;
}

.destino-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.destino-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
}

.destino-img {
  height: 200px;
  background-size: cover;
  background-position: center;
}

.destino-info {
  padding: 20px;
}

.destino-info h3 {
  font-size: 1.3rem;
  color: #333;
  margin-bottom: 8px;
}

.destino-info p {
  color: #666;
  font-size: 0.95rem;
}
</style>
