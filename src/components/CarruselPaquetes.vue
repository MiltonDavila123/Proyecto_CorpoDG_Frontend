<template>
  <div class="paquetes-carousel-container">
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
    <div class="paquetes-carousel-wrapper">
      <div 
        class="paquetes-carousel" 
        :style="{ transform: `translateX(-${currentSlide * slideWidth}%)` }"
      >
        <div 
          v-for="paquete in paquetes" 
          :key="paquete.id" 
          class="paquete-card"
        >
          <!-- Imagen del paquete -->
          <div class="paquete-imagen">
            <img :src="paquete.imagen_url" :alt="paquete.titulo" />
            <div class="paquete-destino-badge">
              {{ paquete.pais_nombre }}<span v-if="paquete.ciudad_nombre"> - {{ paquete.ciudad_nombre }}</span>
            </div>
          </div>
          
          <!-- Título del paquete -->
          <div class="paquete-titulo">
            <h3>{{ paquete.titulo }}</h3>
          </div>

          <!-- Info básica: Salidas y precio -->
          <div class="paquete-header">
            <div class="paquete-salidas">
              <strong>SALIDAS {{ obtenerAnioSalida(paquete) }}</strong>
              <span>{{ obtenerMesSalida(paquete) }}</span>
            </div>
            <div class="paquete-precio">
              <span class="precio-badge">DESDE</span>
              <span class="precio-valor">${{ formatearPrecio(paquete.precio) }}</span>
            </div>
          </div>

          <!-- Detalles del paquete -->
          <div class="paquete-detalles">
            <div class="paquete-tipo-duracion">
              <div class="detalle-item">
                <span class="label">TIPO:</span>
                <span class="value tipo">{{ paquete.tipo_paquete_display || 'CULTURAL' }}</span>
              </div>
              <div class="detalle-item">
                <span class="label">DURACIÓN:</span>
                <span class="value">{{ paquete.duracion_dias }} DÍAS / {{ paquete.duracion_noches }} NOCHES</span>
              </div>
            </div>
            
            <div class="paquete-salida-aerolinea">
              <div class="detalle-item">
                <span class="label">SALIDA:</span>
                <span class="value">{{ paquete.salidas }}</span>
              </div>
              <div class="detalle-item aerolinea">
                <span class="label">AEROLINEA:</span>
                <img 
                  v-if="paquete.aerolinea_logo" 
                  :src="paquete.aerolinea_logo" 
                  :alt="paquete.aerolinea_nombre"
                  class="aerolinea-logo"
                />
                <span v-else class="value">{{ paquete.aerolinea_nombre }}</span>
              </div>
            </div>

            <!-- Descripción -->
            <div class="paquete-descripcion">
              <p>{{ paquete.descripcion_corta }}</p>
            </div>

            <!-- Paquete incluye -->
            <div class="paquete-incluye">
              <span class="incluye-titulo">PAQUETE INCLUYE</span>
              <div class="incluye-icons">
                <div v-if="paquete.paquete_incluye?.vuelo" class="icon-item" title="Vuelo">
                  <svg viewBox="0 0 24 24" fill="currentColor"><path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/></svg>
                </div>
                <div v-if="paquete.paquete_incluye?.hotel" class="icon-item" title="Hotel">
                  <svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 13c1.66 0 3-1.34 3-3S8.66 7 7 7s-3 1.34-3 3 1.34 3 3 3zm12-6h-8v7H3V5H1v15h2v-3h18v3h2v-9c0-2.21-1.79-4-4-4z"/></svg>
                </div>
                <div v-if="paquete.paquete_incluye?.alimentacion" class="icon-item" title="Alimentación">
                  <svg viewBox="0 0 24 24" fill="currentColor"><path d="M11 9H9V2H7v7H5V2H3v7c0 2.12 1.66 3.84 3.75 3.97V22h2.5v-9.03C11.34 12.84 13 11.12 13 9V2h-2v7zm5-3v8h2.5v8H21V2c-2.76 0-5 2.24-5 4z"/></svg>
                </div>
                <div v-if="paquete.paquete_incluye?.traslados" class="icon-item" title="Traslados">
                  <svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/></svg>
                </div>
                <div v-if="paquete.paquete_incluye?.tours" class="icon-item" title="Tours">
                  <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 10.9c-.61 0-1.1.49-1.1 1.1s.49 1.1 1.1 1.1c.61 0 1.1-.49 1.1-1.1s-.49-1.1-1.1-1.1zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm2.19 12.19L6 18l3.81-8.19L18 6l-3.81 8.19z"/></svg>
                </div>
                <div v-if="paquete.paquete_incluye?.seguro" class="icon-item" title="Seguro">
                  <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/></svg>
                </div>
              </div>
            </div>

            <!-- Botón Ver Oferta -->
            <div class="paquete-actions">
              <button class="btn-ver-oferta" @click="$emit('ver-oferta', paquete)">
                VER OFERTA
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
  paquetes: {
    type: Array,
    required: true,
    default: () => []
  },
  itemsPerSlide: {
    type: Number,
    default: 3
  }
})

// Emits
defineEmits(['ver-oferta'])

// Estado del carrusel
const currentSlide = ref(0)
const slideWidth = computed(() => 100)

const totalPages = computed(() => {
  if (props.paquetes.length <= props.itemsPerSlide) return 1
  return Math.ceil(props.paquetes.length / props.itemsPerSlide)
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

// Reset carrusel cuando cambian los paquetes
watch(() => props.paquetes, () => {
  currentSlide.value = 0
})

// Utilidades de formato
const obtenerAnioSalida = (paquete) => {
  if (paquete.fecha_salidas_texto) {
    const match = paquete.fecha_salidas_texto.match(/\d{4}/)
    return match ? match[0] : '2026'
  }
  return '2026'
}

const obtenerMesSalida = (paquete) => {
  if (paquete.fecha_salidas_texto) {
    const meses = paquete.fecha_salidas_texto.replace(/\d{4}/, '').trim()
    return meses || 'Todo el año'
  }
  return paquete.subtitulo || 'Todo el año'
}

const formatearPrecio = (precio) => {
  return parseFloat(precio).toLocaleString('en-US', { 
    minimumFractionDigits: 0, 
    maximumFractionDigits: 0 
  })
}
</script>

<style scoped>
/* ===== VARIABLES ===== */
:root {
  --color-primary: #b5931ae2;
  --color-primary-dark: #8a7015;
  --color-primary-light: #d4b82c;
  --color-dark: #23221e;
  --color-text: #333;
  --color-text-light: #666;
  --color-border: #e0e0e0;
  --shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.1);
  --shadow-md: 0 4px 15px rgba(0, 0, 0, 0.15);
  --shadow-lg: 0 8px 30px rgba(0, 0, 0, 0.2);
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
}

/* ===== CARRUSEL DE PAQUETES ===== */
.paquetes-carousel-container {
  position: relative;
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 60px;
}

.paquetes-carousel-wrapper {
  overflow: hidden;
  border-radius: var(--radius-md);
}

.paquetes-carousel {
  display: flex;
  transition: transform 0.5s ease;
}

.paquetes-carousel .paquete-card {
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

/* ===== PAQUETE CARD ===== */
.paquete-card {
  background: white;
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-md);
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.paquete-card:hover {
  transform: translateY(-5px);
  box-shadow: var(--shadow-lg);
}

/* Imagen del paquete */
.paquete-imagen {
  position: relative;
  height: 220px;
  overflow: hidden;
}

.paquete-imagen img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.paquete-card:hover .paquete-imagen img {
  transform: scale(1.05);
}

.paquete-destino-badge {
  position: absolute;
  top: 15px;
  left: 15px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 600;
  text-transform: uppercase;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  letter-spacing: 0.5px;
}

/* Título del paquete */
.paquete-titulo {
  padding: 14px 18px;
  background: linear-gradient(135deg, #f8f5e8 0%, #fff 100%);
  border-bottom: 2px solid var(--color-primary);
  position: relative;
  overflow: hidden;
}

.paquete-titulo::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  width: 4px;
  height: 100%;
  background: linear-gradient(180deg, var(--color-primary) 0%, var(--color-primary-light) 100%);
}

.paquete-titulo h3 {
  margin: 0;
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--color-dark);
  line-height: 1.4;
  padding-left: 8px;
  text-transform: uppercase;
}

/* Header del paquete */
.paquete-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 12px 18px;
  background: linear-gradient(135deg, #fafafa 0%, #f5f5f5 100%);
  border-bottom: 1px solid var(--color-border);
}

.paquete-salidas strong {
  display: block;
  font-size: 0.8rem;
  color: var(--color-dark);
  font-weight: 700;
  letter-spacing: 0.3px;
}

.paquete-salidas span {
  font-size: 0.85rem;
  color: var(--color-text-light);
}

.paquete-precio {
  text-align: right;
}

.precio-badge {
  display: inline-block;
  background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
  color: white;
  font-size: 0.6rem;
  padding: 3px 8px;
  border-radius: 4px;
  font-weight: 700;
  margin-right: 4px;
  box-shadow: 0 2px 4px rgba(231, 76, 60, 0.3);
}

.precio-valor {
  display: block;
  font-size: 1.9rem;
  font-weight: 800;
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-light) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-top: 2px;
  letter-spacing: -1px;
}

/* Detalles del paquete */
.paquete-detalles {
  padding: 14px 18px 18px;
  border: 3px solid var(--color-primary);
  border-top: none;
  margin: 0;
  border-radius: 0 0 var(--radius-lg) var(--radius-lg);
  background: linear-gradient(180deg, #fff 0%, #fafafa 100%);
}

.paquete-tipo-duracion,
.paquete-salida-aerolinea {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  padding-bottom: 8px;
  border-bottom: 1px solid #f0f0f0;
}

.detalle-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.detalle-item .label {
  font-size: 0.7rem;
  color: var(--color-text-light);
  font-weight: 600;
  letter-spacing: 0.3px;
}

.detalle-item .value {
  font-size: 0.88rem;
  color: var(--color-dark);
  font-weight: 600;
}

.detalle-item .value.tipo {
  color: var(--color-primary);
  text-transform: uppercase;
  font-weight: 700;
}

.detalle-item.aerolinea {
  align-items: flex-end;
}

.aerolinea-logo {
  height: 25px;
  width: auto;
  max-width: 80px;
  object-fit: contain;
}

/* Descripción */
.paquete-descripcion {
  margin-bottom: 12px;
  padding: 10px 12px;
  background: linear-gradient(135deg, #fffbf0 0%, #f8f9fa 100%);
  border-radius: var(--radius-sm);
  border-left: 3px solid var(--color-primary);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.paquete-descripcion p {
  font-size: 0.82rem;
  color: var(--color-text);
  line-height: 1.5;
  margin: 0;
}

/* Paquete incluye */
.paquete-incluye {
  margin-bottom: 14px;
}

.incluye-titulo {
  display: block;
  font-size: 0.7rem;
  color: var(--color-text-light);
  font-weight: 600;
  margin-bottom: 8px;
  letter-spacing: 0.5px;
}

.incluye-icons {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.icon-item {
  width: 38px;
  height: 38px;
  background: linear-gradient(135deg, #f8f5e8 0%, #f0f0f0 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-primary);
  transition: all 0.3s ease;
  cursor: pointer;
  position: relative;
  border: 2px solid transparent;
}

.icon-item:hover {
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-light) 100%);
  color: white;
  transform: scale(1.15);
  border-color: var(--color-primary-light);
  box-shadow: 0 4px 12px rgba(181, 147, 26, 0.4);
}

.icon-item svg {
  width: 19px;
  height: 19px;
}

/* Tooltip para iconos */
.icon-item::after {
  content: attr(title);
  position: absolute;
  bottom: 110%;
  left: 50%;
  transform: translateX(-50%) translateY(-5px);
  background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
  color: white;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 0.7rem;
  font-weight: 600;
  white-space: nowrap;
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s ease;
  pointer-events: none;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  z-index: 10;
  letter-spacing: 0.3px;
}

.icon-item::before {
  content: '';
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  border: 6px solid transparent;
  border-top-color: #2c3e50;
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s ease;
  z-index: 10;
}

.icon-item:hover::after,
.icon-item:hover::before {
  opacity: 1;
  visibility: visible;
  transform: translateX(-50%) translateY(0);
}

/* Botón Ver Oferta */
.paquete-actions {
  display: flex;
  justify-content: flex-end;
}

.btn-ver-oferta {
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-light) 100%);
  color: white;
  border: none;
  padding: 11px 28px;
  border-radius: var(--radius-sm);
  font-size: 0.9rem;
  font-weight: 700;
  cursor: pointer;
  text-transform: uppercase;
  letter-spacing: 1.2px;
  box-shadow: 0 4px 15px rgba(181, 147, 26, 0.35);
  transition: all 0.3s ease;
}

.btn-ver-oferta:hover {
  background: linear-gradient(135deg, var(--color-primary-dark) 0%, var(--color-primary) 100%);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(181, 147, 26, 0.5);
}

/* ===== RESPONSIVE ===== */
@media (max-width: 1200px) {
  .paquetes-carousel .paquete-card {
    flex: 0 0 calc(50% - 20px);
    min-width: calc(50% - 20px);
  }
}

@media (max-width: 768px) {
  /* Carrusel en móvil */
  .paquetes-carousel-container {
    padding: 0 50px;
  }

  .paquetes-carousel .paquete-card {
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
  
  .paquete-tipo-duracion,
  .paquete-salida-aerolinea {
    flex-direction: column;
    gap: 10px;
  }
  
  .detalle-item.aerolinea {
    align-items: flex-start;
  }
}

@media (max-width: 480px) {
  .paquete-header {
    flex-direction: column;
    gap: 10px;
  }
  
  .paquete-precio {
    text-align: left;
  }
}
</style>
