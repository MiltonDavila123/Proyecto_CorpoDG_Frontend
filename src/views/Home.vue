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
    <div class="content">
      <h2>Haz de tu viaje una experiencia única<br />con nosotros</h2>
      
    </div>
  </section>

  <!-- Sección de Destacados -->
  <section class="destacados-section">
    <!-- PAQUETES DESTACADOS -->
    <div class="destacados-bloque" v-if="paquetesDestacados.length > 0">
      <div class="destacados-header">
        <h2>Paquetes Destacados</h2>
        <p>Los mejores paquetes turísticos seleccionados para ti</p>
      </div>
      <CarruselPaquetes 
        :paquetes="paquetesDestacados" 
        @ver-oferta="verOfertaPaquete"
      />
    </div>

    <!-- VUELOS DESTACADOS -->
    <div class="destacados-bloque" v-if="vuelosDestacados.length > 0">
      <div class="destacados-header">
        <h2>Vuelos Destacados</h2>
        <p>Las mejores ofertas en vuelos para tu próximo viaje</p>
      </div>
      <CarruselVuelos 
        :vuelos="vuelosDestacados" 
        @reservar="handleReservarVuelo"
      />
    </div>

    <!-- DESTINOS DESTACADOS -->
    <div class="destacados-bloque" v-if="destinosDestacados.length > 0">
      <div class="destacados-header">
        <h2>Destinos Destacados</h2>
        <p>Descubre los destinos más increíbles del mundo</p>
      </div>
      <div class="destinos-carousel-container">
        <button 
          class="carousel-arrow carousel-arrow-left" 
          @click="prevDestino"
          :disabled="destinoSlide === 0"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M15 18l-6-6 6-6"/>
          </svg>
        </button>

        <div class="destinos-carousel-wrapper">
          <div 
            class="destinos-carousel" 
            :style="{ transform: `translateX(-${destinoSlide * destinoSlideWidth}%)` }"
          >
            <div 
              v-for="destino in destinosDestacados" 
              :key="destino.id" 
              class="destino-card-home"
            >
              <div class="destino-img-home" :style="{ backgroundImage: `url(${destino.imagen_url})` }">
                <span class="destino-badge-home">Destacado</span>
              </div>
              <div class="destino-info-home">
                <h3>{{ destino.nombre }}</h3>
                <span v-if="destino.pais_nombre" class="destino-pais-home">{{ destino.pais_nombre }}</span>
                <p>{{ destino.descripcion }}</p>
                <div class="destino-footer-home">
                  <span class="destino-precio-home" v-if="destino.precio_desde">Desde ${{ destino.precio_desde }}</span>
                  <div class="destino-acciones-home">
                    <button v-if="destino.pdf_url" class="btn-ver-pdf-home" @click="abrirPdfDestino(destino)">
                      Ver PDF
                    </button>
                    <button class="btn-reservar-home" @click="abrirContactoDestino(destino)">
                      Reservar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <button 
          class="carousel-arrow carousel-arrow-right" 
          @click="nextDestino"
          :disabled="destinoSlide >= maxDestinoSlide"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 18l6-6-6-6"/>
          </svg>
        </button>

        <div class="carousel-indicators" v-if="totalDestinoPages > 1">
          <button 
            v-for="page in totalDestinoPages" 
            :key="page" 
            class="carousel-dot" 
            :class="{ active: destinoSlide === page - 1 }"
            @click="destinoSlide = page - 1"
          ></button>
        </div>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="loading-destacados">
      <div class="spinner"></div>
      <p>Cargando destacados...</p>
    </div>
  </section>

  <!-- Modales -->
  <ModalReservaVuelo
    :visible="mostrarModalReserva"
    :vuelo="vueloSeleccionado"
    @cerrar="mostrarModalReserva = false"
    @buscar="handleBuscarDesdeModal"
  />

  <ModalPdfViewer
    v-model:visible="mostrarPdf"
    :pdf-url="pdfSeleccionado.url"
    :titulo="pdfSeleccionado.titulo"
    :subtitulo="pdfSeleccionado.subtitulo"
    @contactar="contactarDesdePdf"
  />

  <ModalContacto
    v-model:visible="mostrarContacto"
    :mensaje-predefinido="mensajeReserva"
    :mensaje-readonly="!!mensajeReserva"
  />
</template>

<style scoped>
/* ===== VARIABLES DE COLORES Y FUENTES ===== */
.hero {
  --color-overlay: rgba(0, 0, 0, 0.35);
  --color-text-light: white;
  --font-heading: 'Arial', serif;
  --font-body: 'Arial', serif;
}

.destacados-section {
  --color-primary: #b5931a;
  --color-primary-light: #d4af37;
  --color-primary-dark: #8a6f14;
  --color-primary-gradient: linear-gradient(135deg, #b5931a 0%, #d4af37 100%);
  --color-background: #f8f9fa;
  --color-background-white: #ffffff;
  --color-text-dark: #333333;
  --color-text-medium: #555555;
  --color-text-light: #888888;
  --color-text-white: #ffffff;
  --color-border: #e0e0e0;
  --color-border-light: #f0f0f0;
  --color-dark: #23221e;
  --color-text: #333;
  --font-heading: 'Arial', serif;
  --font-body: 'Arial', serif;
  --shadow-card: 0 4px 15px rgba(0,0,0,0.08);
  --shadow-card-hover: 0 12px 30px rgba(0,0,0,0.12);
  --shadow-button: 0 4px 12px rgba(181, 147, 26, 0.4);
  --shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.1);
  --shadow-md: 0 4px 15px rgba(0, 0, 0, 0.15);
  --shadow-lg: 0 8px 30px rgba(0, 0, 0, 0.2);
  --radius-card: 16px;
  --radius-button: 8px;
  --radius-badge: 25px;
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
}
/* ========================================== */

.hero {
  height: 100vh;
  position: relative;
  margin-top: 0;
  overflow: hidden;
}

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

.hero h2 {
  font-size: 3rem;
  margin-top: 10px;
  font-weight: 400;
  font-style: italic;
  font-family: 'Georgia', serif;
  color: white;
}

/* ===== SECCIÓN DESTACADOS ===== */
.destacados-section {
  background: var(--color-background);
  padding: 80px 0;
}

.destacados-bloque {
  margin-bottom: 80px;
}

.destacados-bloque:last-of-type {
  margin-bottom: 0;
}

.destacados-header {
  text-align: center;
  margin-bottom: 40px;
  padding: 0 20px;
}

.destacados-header h2 {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--color-dark);
  margin-bottom: 10px;
  font-family: 'Arial', serif;
  position: relative;
  display: inline-block;
}

.destacados-header h2::after {
  content: '';
  position: absolute;
  bottom: -8px;
  left: 50%;
  transform: translateX(-50%);
  width: 60px;
  height: 3px;
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-light) 100%);
  border-radius: 2px;
}

.destacados-header p {
  font-size: 1.1rem;
  color: var(--color-text-light);
  margin-top: 18px;
}

/* ===== CARRUSEL DESTINOS HOME ===== */
.destinos-carousel-container {
  position: relative;
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 60px;
}

.destinos-carousel-wrapper {
  overflow: hidden;
  border-radius: 12px;
}

.destinos-carousel {
  display: flex;
  transition: transform 0.5s ease;
}

.destino-card-home {
  flex: 0 0 calc(33.333% - 20px);
  min-width: calc(33.333% - 20px);
  margin: 0 10px;
  background: white;
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-md);
  transition: all 0.3s ease;
}

.destino-card-home:hover {
  transform: translateY(-8px);
  box-shadow: var(--shadow-lg);
}

.destino-img-home {
  height: 220px;
  background-size: cover;
  background-position: center;
  position: relative;
  transition: transform 0.5s ease;
}

.destino-card-home:hover .destino-img-home {
  transform: scale(1.03);
}

.destino-badge-home {
  position: absolute;
  top: 15px;
  right: 15px;
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-light) 100%);
  color: white;
  padding: 6px 16px;
  border-radius: 25px;
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  box-shadow: 0 2px 8px rgba(181, 147, 26, 0.4);
}

.destino-info-home {
  padding: 20px;
}

.destino-info-home h3 {
  font-size: 1.3rem;
  font-weight: 700;
  color: var(--color-dark);
  margin-bottom: 4px;
}

.destino-pais-home {
  display: inline-block;
  font-size: 0.85rem;
  color: var(--color-primary);
  font-weight: 600;
  margin-bottom: 10px;
}

.destino-info-home p {
  font-size: 0.9rem;
  color: var(--color-text-light);
  line-height: 1.6;
  margin-bottom: 15px;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.destino-footer-home {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 15px;
  border-top: 1px solid #f0f0f0;
}

.destino-precio-home {
  font-size: 1.3rem;
  font-weight: 700;
  color: var(--color-primary);
}

.destino-acciones-home {
  display: flex;
  gap: 8px;
}

.btn-ver-pdf-home {
  padding: 8px 16px;
  background: transparent;
  border: 2px solid var(--color-primary);
  color: var(--color-primary);
  border-radius: var(--radius-sm);
  font-weight: 600;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-ver-pdf-home:hover {
  background: var(--color-primary);
  color: white;
}

.btn-reservar-home {
  padding: 8px 16px;
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-light) 100%);
  color: white;
  border: none;
  border-radius: var(--radius-sm);
  font-weight: 600;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(181, 147, 26, 0.3);
}

.btn-reservar-home:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 15px rgba(181, 147, 26, 0.5);
}

/* Flechas del carrusel destinos */
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

/* Loading */
.loading-destacados {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
  padding: 60px 0;
}

.spinner {
  width: 45px;
  height: 45px;
  border: 4px solid #e0e0e0;
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-destacados p {
  color: var(--color-text-light);
  font-size: 1rem;
}

/* ===== RESPONSIVE ===== */
@media (max-width: 1200px) {
  .destino-card-home {
    flex: 0 0 calc(50% - 20px);
    min-width: calc(50% - 20px);
  }

  .destinos-carousel-container {
    padding: 0 55px;
  }

  .destacados-header h2 {
    font-size: 2.2rem;
  }
}

@media (max-width: 992px) {
  .hero h2 {
    font-size: 2.5rem;
  }

  .destacados-section {
    padding: 60px 0;
  }

  .destacados-bloque {
    margin-bottom: 60px;
  }

  .destacados-header h2 {
    font-size: 2rem;
  }
}

@media (max-width: 768px) {
  .hero {
    height: 90vh;
  }

  .hero h2 {
    font-size: 2rem;
    padding: 0 15px;
  }

  .destacados-section {
    padding: 50px 0;
  }

  .destacados-bloque {
    margin-bottom: 50px;
  }

  .destacados-header h2 {
    font-size: 1.8rem;
  }

  .destacados-header p {
    font-size: 1rem;
  }

  .destino-card-home {
    flex: 0 0 calc(100% - 20px);
    min-width: calc(100% - 20px);
  }

  .destinos-carousel-container {
    padding: 0 45px;
  }

  .carousel-arrow {
    width: 40px;
    height: 40px;
  }

  .carousel-arrow-left {
    left: 5px;
  }

  .carousel-arrow-right {
    right: 5px;
  }

  .carousel-arrow svg {
    width: 20px;
    height: 20px;
  }

  .destino-footer-home {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }

  .destino-acciones-home {
    width: 100%;
  }

  .btn-reservar-home,
  .btn-ver-pdf-home {
    flex: 1;
    text-align: center;
  }
}

@media (max-width: 480px) {
  .hero {
    height: 85vh;
  }

  .hero h2 {
    font-size: 1.6rem;
    line-height: 1.4;
  }

  .destacados-section {
    padding: 40px 0;
  }

  .destacados-bloque {
    margin-bottom: 40px;
  }

  .destacados-header h2 {
    font-size: 1.5rem;
  }

  .destacados-header p {
    font-size: 0.9rem;
  }

  .destinos-carousel-container {
    padding: 0 40px;
  }

  .carousel-arrow {
    width: 36px;
    height: 36px;
  }

  .carousel-indicators {
    gap: 6px;
  }

  .carousel-dot {
    width: 8px;
    height: 8px;
  }
}
</style>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import imagen2 from '../assets/images/imagen2.jpg'
import avion from '../assets/images/avion.jpg'
import imagenPlaya from '../assets/images/Imagen_Playa.jpg'

import CarruselPaquetes from '../components/CarruselPaquetes.vue'
import CarruselVuelos from '../components/CarruselVuelos.vue'
import ModalReservaVuelo from '../components/ModalReservaVuelo.vue'
import ModalPdfViewer from '../components/ModalPdfViewer.vue'
import ModalContacto from '../components/ModalContacto.vue'

import { getPaquetesDestacados, getVuelosDestacados, getDestinosDestacados } from '../services/api.js'

const router = useRouter()

// ==========================================
// HERO - Imágenes rotativas
// ==========================================
const imagenes = [
  imagen2,
  avion,
  imagenPlaya
]

const tiempoEntreCambios = 5600
const imagenActual = ref(0)
let intervalo = null

const cambiarImagen = () => {
  imagenActual.value = (imagenActual.value + 1) % imagenes.length
}

// ==========================================
// DATOS DESTACADOS
// ==========================================
const loading = ref(false)
const paquetesDestacados = ref([])
const vuelosDestacados = ref([])
const destinosDestacados = ref([])

// ==========================================
// CARRUSEL DE DESTINOS
// ==========================================
const destinoSlide = ref(0)
const destinoItemsPerView = ref(3)

const updateDestinoItemsPerView = () => {
  const width = window.innerWidth
  if (width <= 768) {
    destinoItemsPerView.value = 1
  } else if (width <= 1200) {
    destinoItemsPerView.value = 2
  } else {
    destinoItemsPerView.value = 3
  }
}

const destinoSlideWidth = computed(() => 100 / destinoItemsPerView.value)

const totalDestinoPages = computed(() => {
  if (destinosDestacados.value.length <= destinoItemsPerView.value) return 1
  return Math.ceil(destinosDestacados.value.length / destinoItemsPerView.value)
})

const maxDestinoSlide = computed(() => {
  return Math.ceil(destinosDestacados.value.length / destinoItemsPerView.value) - 1
})

const prevDestino = () => {
  if (destinoSlide.value > 0) destinoSlide.value--
}

const nextDestino = () => {
  if (destinoSlide.value < maxDestinoSlide.value) destinoSlide.value++
}

const handleDestinoResize = () => {
  updateDestinoItemsPerView()
  if (destinoSlide.value > maxDestinoSlide.value) {
    destinoSlide.value = maxDestinoSlide.value
  }
}

// ==========================================
// MODALES
// ==========================================
const mostrarModalReserva = ref(false)
const vueloSeleccionado = ref({})
const mostrarPdf = ref(false)
const pdfSeleccionado = ref({ url: '', titulo: '', subtitulo: '' })
const mostrarContacto = ref(false)
const mensajeReserva = ref('')
const destinoParaContacto = ref(null)

// ==========================================
// ACCIONES - PAQUETES
// ==========================================
const verOfertaPaquete = (paquete) => {
  router.push({ name: 'PaqueteDetalle', params: { id: paquete.id } })
}

// ==========================================
// ACCIONES - VUELOS
// ==========================================
const handleReservarVuelo = (vuelo) => {
  vueloSeleccionado.value = vuelo
  mostrarModalReserva.value = true
}

const handleBuscarDesdeModal = (datos) => {
  mostrarModalReserva.value = false
  router.push({
    name: 'ResultadosVuelos',
    query: {
      origin: datos.origen,
      destination: datos.destino,
      date: datos.fechaIda,
      return_date: datos.tipoViaje === 'idaVuelta' ? datos.fechaVuelta : '',
      adults: datos.adultos,
      children: datos.ninos,
      infants: datos.infantes,
      cabin_class: datos.clase,
      limit: datos.limite || 50,
      origenLabel: datos.origenLabel,
      destinoLabel: datos.destinoLabel,
      tipoViaje: datos.tipoViaje
    }
  })
}

// ==========================================
// ACCIONES - DESTINOS
// ==========================================
const abrirPdfDestino = (destino) => {
  pdfSeleccionado.value = {
    url: destino.pdf_url,
    titulo: destino.nombre,
    subtitulo: destino.pais_nombre
  }
  destinoParaContacto.value = destino
  mostrarPdf.value = true
}

const abrirContactoDestino = (destino) => {
  mensajeReserva.value = destino.mensaje_reserva || `Me interesa el destino ${destino.nombre}`
  destinoParaContacto.value = destino
  mostrarContacto.value = true
}

const contactarDesdePdf = () => {
  if (destinoParaContacto.value) {
    abrirContactoDestino(destinoParaContacto.value)
  } else {
    mensajeReserva.value = ''
    mostrarContacto.value = true
  }
}

// ==========================================
// LIFECYCLE
// ==========================================
onMounted(async () => {
  // Hero
  intervalo = setInterval(cambiarImagen, tiempoEntreCambios)

  // Destinos carousel resize
  updateDestinoItemsPerView()
  window.addEventListener('resize', handleDestinoResize)

  // Cargar datos destacados
  loading.value = true
  try {
    const [paquetes, vuelos, destinos] = await Promise.all([
      getPaquetesDestacados(),
      getVuelosDestacados(),
      getDestinosDestacados()
    ])
    paquetesDestacados.value = paquetes
    vuelosDestacados.value = vuelos
    destinosDestacados.value = destinos
  } catch (error) {
    console.error('Error cargando destacados:', error)
  } finally {
    loading.value = false
  }
})

onUnmounted(() => {
  if (intervalo) clearInterval(intervalo)
  window.removeEventListener('resize', handleDestinoResize)
})
</script>