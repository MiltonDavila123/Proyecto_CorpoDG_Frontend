<template>
  <div class="vuelos-carousel-container">
    <!-- Flecha izquierda -->
    <button 
      class="carousel-arrow carousel-arrow-left" 
      @click="prevSlide"
      :disabled="currentSlide === 0"
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M15 18l-6-6 6-6"/>
      </svg>
    </button>

    <!-- Contenedor del carrusel -->
    <div class="vuelos-carousel-wrapper">
      <div 
        class="vuelos-carousel" 
        :style="{ transform: `translateX(-${currentSlide * slideWidth}%)` }"
      >
        <div 
          v-for="vuelo in vuelos" 
          :key="vuelo.id" 
          class="vuelo-card"
        >
          <!-- Imagen del vuelo -->
          <div class="vuelo-image">
            <img :src="getVueloImagen(vuelo)" :alt="`Vuelo a ${vuelo.destino_nombre}`" />
            <div class="vuelo-badge">{{ formatTipoVuelo(vuelo.tipo_vuelo) }}</div>
          </div>

          <!-- Información del vuelo -->
          <div class="vuelo-info">
            <!-- Ruta del vuelo -->
            <div class="vuelo-route">
              <div class="route-item">
                <span class="route-label">Desde</span>
                <h3>{{ vuelo.origen_nombre }}</h3>
                <span class="route-pais">{{ vuelo.origen_pais }}</span>
              </div>
              <div class="route-arrow">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
                </svg>
              </div>
              <div class="route-item">
                <span class="route-label">Hacia</span>
                <h3>{{ vuelo.destino_nombre }}</h3>
                <span class="route-pais">{{ vuelo.destino_pais }}</span>
              </div>
            </div>
            
            <!-- Detalles del vuelo -->
            <div class="vuelo-details">
              <div class="detail-item detail-airline">
                <img 
                  v-if="vuelo.aerolinea_logo" 
                  :src="vuelo.aerolinea_logo" 
                  :alt="vuelo.aerolinea_nombre"
                  class="airline-logo"
                />
                <span v-else class="airline-name">{{ vuelo.aerolinea_nombre }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
                  </svg>
                </span>
                <span>{{ vuelo.duracion }}</span>
              </div>
            </div>

            <!-- Pie del vuelo -->
            <div class="vuelo-footer">
              <div class="vuelo-price">
                <span class="price-label">Desde</span>
                <span class="price">${{ vuelo.precio }}</span>
                <span class="price-period">{{ vuelo.moneda || 'USD' }}</span>
              </div>
              <button class="btn-book" @click="$emit('reservar', vuelo)">
                Reservar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Flecha derecha -->
    <button 
      class="carousel-arrow carousel-arrow-right" 
      @click="nextSlide"
      :disabled="currentSlide >= maxSlide"
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M9 18l6-6-6-6"/>
      </svg>
    </button>

    <!-- Indicadores de página -->
    <div class="carousel-indicators" v-if="totalPages > 1">
      <button 
        v-for="page in totalPages" 
        :key="page" 
        class="carousel-dot" 
        :class="{ active: currentSlide === page - 1 }"
        @click="goToSlide(page - 1)"
      ></button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

// Props
const props = defineProps({
  vuelos: {
    type: Array,
    required: true,
    default: () => []
  },
  itemsPerSlide: {
    type: Number,
    default: 3
  },
  imagenDefault: {
    type: String,
    default: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800&h=400&fit=crop'
  }
})

// Emits
defineEmits(['reservar'])

// Estado del carrusel
const currentSlide = ref(0)
const slideWidth = computed(() => 100)

const totalPages = computed(() => {
  if (props.vuelos.length <= props.itemsPerSlide) return 1
  return Math.ceil(props.vuelos.length / props.itemsPerSlide)
})

const maxSlide = computed(() => Math.max(0, totalPages.value - 1))

// Métodos de navegación
const prevSlide = () => {
  if (currentSlide.value > 0) {
    currentSlide.value--
  }
}

const nextSlide = () => {
  if (currentSlide.value < maxSlide.value) {
    currentSlide.value++
  }
}

const goToSlide = (index) => {
  currentSlide.value = Math.max(0, Math.min(index, maxSlide.value))
}

// Reset carrusel cuando cambian los vuelos
watch(() => props.vuelos, () => {
  currentSlide.value = 0
})

// Utilidades de formato
const formatTipoVuelo = (tipo) => {
  const tipos = {
    'directo': 'Directo',
    'escala': '1 Escala',
    'escalas': 'Con escalas'
  }
  return tipos[tipo] || tipo
}

const getVueloImagen = (vuelo) => {
  return vuelo.imagen_url || props.imagenDefault
}
</script>

<style scoped>
/* ===== VARIABLES ===== */
:root {
  --color-primary: #b5931a;
  --color-primary-light: #d4af37;
  --color-primary-dark: #8a6f14;
  --color-text-dark: #333333;
  --color-text-medium: #555555;
  --color-text-light: #888888;
  --color-text-white: #ffffff;
  --color-border: #e0e0e0;
  --color-border-light: #f0f0f0;
  --color-background-white: #ffffff;
  --shadow-card: 0 4px 15px rgba(0,0,0,0.08);
  --shadow-card-hover: 0 12px 30px rgba(0,0,0,0.12);
  --shadow-md: 0 4px 15px rgba(0, 0, 0, 0.15);
  --radius-card: 16px;
  --radius-button: 8px;
  --radius-badge: 25px;
}

/* ===== CARRUSEL DE VUELOS ===== */
.vuelos-carousel-container {
  position: relative;
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 60px;
}

.vuelos-carousel-wrapper {
  overflow: hidden;
  border-radius: 12px;
}

.vuelos-carousel {
  display: flex;
  transition: transform 0.5s ease;
}

.vuelos-carousel .vuelo-card {
  flex: 0 0 calc(33.333% - 20px);
  margin: 0 10px;
  min-width: calc(33.333% - 20px);
}

/* Flechas de navegación */
.carousel-arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: white;
  border: 2px solid var(--color-primary);
  color: var(--color-primary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--shadow-md);
  transition: all 0.3s ease;
  z-index: 10;
}

.carousel-arrow:hover:not(:disabled) {
  background: var(--color-primary);
  color: white;
  transform: translateY(-50%) scale(1.1);
}

.carousel-arrow:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.carousel-arrow svg {
  width: 24px;
  height: 24px;
}

.carousel-arrow-left {
  left: 0;
}

.carousel-arrow-right {
  right: 0;
}

/* Indicadores de página */
.carousel-indicators {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-top: 25px;
}

.carousel-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 2px solid var(--color-primary);
  background: transparent;
  cursor: pointer;
  transition: all 0.3s ease;
  padding: 0;
}

.carousel-dot:hover {
  background: var(--color-primary-light);
}

.carousel-dot.active {
  background: var(--color-primary);
  transform: scale(1.2);
}

/* ===== TARJETA DE VUELO ===== */
.vuelo-card {
  background: var(--color-background-white);
  border-radius: var(--radius-card);
  overflow: hidden;
  box-shadow: var(--shadow-card);
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.vuelo-card:hover {
  transform: translateY(-8px);
  box-shadow: var(--shadow-card-hover);
}

/* Imagen del vuelo */
.vuelo-image {
  position: relative;
  height: 200px;
  overflow: hidden;
}

.vuelo-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.vuelo-card:hover .vuelo-image img {
  transform: scale(1.1);
}

.vuelo-badge {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: var(--color-primary);
  color: var(--color-text-white);
  padding: 0.5rem 1.2rem;
  border-radius: var(--radius-badge);
  font-size: 0.9rem;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(181, 147, 26, 0.4);
}

/* Información del vuelo */
.vuelo-info {
  padding: 1.5rem;
}

/* Ruta del vuelo */
.vuelo-route {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid var(--color-border-light);
}

.route-item {
  flex: 1;
  text-align: center;
}

.route-item h3 {
  font-size: 1.2rem;
  color: var(--color-text-dark);
  margin: 0.3rem 0;
  font-weight: 700;
}

.route-label {
  font-size: 0.8rem;
  color: var(--color-text-light);
  text-transform: uppercase;
  font-weight: 600;
  letter-spacing: 0.5px;
}

.route-pais {
  font-size: 0.85rem;
  color: var(--color-text-medium);
  display: block;
  margin-top: 0.2rem;
}

.route-arrow {
  width: 2.5rem;
  height: 2.5rem;
  color: var(--color-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.route-arrow svg {
  width: 100%;
  height: 100%;
}

/* Detalles del vuelo */
.vuelo-details {
  display: flex;
  justify-content: space-around;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: linear-gradient(135deg, #f8f9fa 0%, #f0f0f0 100%);
  border-radius: var(--radius-button);
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--color-text-medium);
  font-size: 0.95rem;
}

.detail-airline {
  flex: 1;
  justify-content: center;
  padding: 0.5rem;
  background: white;
  border-radius: 8px;
}

.airline-logo {
  height: 25px;
  width: auto;
  max-width: 80px;
  object-fit: contain;
}

.airline-name {
  font-size: 0.9rem;
  color: var(--color-text-medium);
  font-weight: 600;
}

.detail-icon {
  width: 1.3rem;
  height: 1.3rem;
  color: var(--color-primary);
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.detail-icon svg {
  width: 100%;
  height: 100%;
}

/* Pie del vuelo */
.vuelo-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 1rem;
  border-top: 1px solid var(--color-border-light);
}

.vuelo-price {
  display: flex;
  flex-direction: column;
}

.price-label {
  font-size: 0.85rem;
  color: var(--color-text-light);
  text-transform: uppercase;
  font-weight: 600;
  letter-spacing: 0.5px;
}

.price {
  font-size: 2rem;
  font-weight: 700;
  color: var(--color-primary);
  line-height: 1;
  margin: 0.2rem 0;
}

.price-period {
  font-size: 0.85rem;
  color: var(--color-text-medium);
  font-weight: 600;
}

.btn-book {
  padding: 0.8rem 1.8rem;
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-light) 100%);
  color: var(--color-text-white);
  border: none;
  border-radius: var(--radius-button);
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  box-shadow: 0 4px 12px rgba(181, 147, 26, 0.3);
}

.btn-book:hover {
  transform: scale(1.05);
  box-shadow: 0 6px 20px rgba(181, 147, 26, 0.5);
  background: linear-gradient(135deg, var(--color-primary-dark) 0%, var(--color-primary) 100%);
}

/* ===== RESPONSIVE ===== */
@media (max-width: 1200px) {
  .vuelos-carousel .vuelo-card {
    flex: 0 0 calc(50% - 20px);
    min-width: calc(50% - 20px);
  }
}

@media (max-width: 768px) {
  .vuelos-carousel-container {
    padding: 0 50px;
  }

  .vuelos-carousel .vuelo-card {
    flex: 0 0 calc(100% - 20px);
    min-width: calc(100% - 20px);
  }
  
  .carousel-arrow {
    width: 40px;
    height: 40px;
  }
  
  .carousel-arrow svg {
    width: 20px;
    height: 20px;
  }

  .route-item h3 {
    font-size: 1.1rem;
  }

  .vuelo-details {
    flex-direction: column;
    gap: 0.8rem;
  }

  .vuelo-footer {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }

  .btn-book {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .vuelo-route {
    flex-direction: column;
    gap: 1rem;
  }

  .route-arrow {
    transform: rotate(90deg);
  }

  .route-item h3 {
    font-size: 1rem;
  }

  .price {
    font-size: 1.7rem;
  }
}
</style>
