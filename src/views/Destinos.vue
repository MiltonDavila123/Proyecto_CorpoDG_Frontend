<template>
  <section class="destinos-hero">
    <div class="hero-overlay"></div>
    <div class="hero-content">
      <h1>Nuestros Destinos</h1>
      <p>Explora los lugares más increíbles del mundo</p>
    </div>

    <!-- Scroll indicator -->
    <div class="scroll-indicator" @click="$event.target.closest('.destinos-hero')?.nextElementSibling?.scrollIntoView({ behavior: 'smooth' })">
      <span>Explorar</span>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
    </div>
  </section>

  <!-- VISTA DE REGIONES -->
  <section v-if="vistaActual === 'regiones'" class="regiones-section">
    <div class="section-header">
      <h2>Selecciona una Región</h2>
    </div>

    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      <p>Cargando...</p>
    </div>

    <div v-else class="regiones-grid">
      <div
        v-for="region in regiones"
        :key="region.id"
        class="region-card"
        @click="seleccionarRegion(region)"
      >
        <div
          class="region-img"
          :style="{ backgroundImage: `url(${region.imagen_url || getImagenRegion(region.nombre)})` }"
        >
          <div class="region-overlay"></div>
          <div class="region-info">
            <h3>{{ region.nombre_display }}</h3>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- VISTA DE DESTINOS -->
  <section v-if="vistaActual === 'destinos'" class="destinos-section">
    <div class="section-header">
      <h2>Destinos en {{ regionSeleccionada?.nombre_display }}</h2>
    </div>

    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      <p>Cargando destinos...</p>
    </div>

    <div v-else-if="destinos.length === 0" class="no-resultados">
      <div class="no-resultados-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
          <circle cx="12" cy="10" r="3"/>
        </svg>
      </div>
      <h3>No hay destinos disponibles</h3>
      <p>Actualmente no tenemos destinos para esta región. ¡Vuelve pronto!</p>
    </div>

    <div v-else class="destinos-grid">
      <div class="destino-card" v-for="destino in destinos" :key="destino.id">
        <div class="destino-img" :style="{ backgroundImage: `url(${destino.imagen_url || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=600'})` }">
          <span v-if="destino.destacado" class="destino-badge">Destacado</span>
        </div>
        <div class="destino-info">
          <h3>{{ destino.nombre }}</h3>
          <span v-if="destino.pais_nombre" class="destino-pais">{{ destino.pais_nombre }}</span>
          <p>{{ destino.descripcion }}</p>
          <div class="destino-footer">
            <span class="destino-precio" v-if="destino.precio_desde">Desde ${{ destino.precio_desde }}</span>
            <div class="destino-acciones">
              <button v-if="destino.pdf_url" class="btn-ver-pdf" @click="abrirPdf(destino)">
                Ver PDF
              </button>
              <button class="btn-reservar" @click="abrirContacto(destino)">
                Reservar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <button class="btn-back-floating" @click="volverARegiones">
      <span class="arrow">←</span> Volver a Regiones
    </button>
  </section>

  <!-- Modales -->
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

<script setup>
import { ref, onMounted } from 'vue'
import { getRegiones, getPaisesByRegion, getDestinos } from '../services/api.js'
import ModalPdfViewer from '../components/ModalPdfViewer.vue'
import ModalContacto from '../components/ModalContacto.vue'

// Estado de navegación
const vistaActual = ref('regiones') // 'regiones' | 'destinos'
const loading = ref(false)

// Datos
const regiones = ref([])
const destinos = ref([])

// Selecciones
const regionSeleccionada = ref(null)

// Modales
const mostrarPdf = ref(false)
const pdfSeleccionado = ref({ url: '', titulo: '', subtitulo: '' })
const mostrarContacto = ref(false)
const mensajeReserva = ref('')
const destinoParaContacto = ref(null)

// Imágenes por defecto para regiones
const imagenesRegiones = {
  caribe: 'https://images.unsplash.com/photo-1580541631950-7282082b53ce?w=800',
  sudamerica: 'https://images.unsplash.com/photo-1526392060635-9d6019884377?w=800',
  centroamerica: 'https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?w=800',
  norteamerica: 'https://images.unsplash.com/photo-1485738422979-f5c462d49f74?w=800',
  europa: 'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=800',
  medio_oriente: 'https://images.unsplash.com/photo-1547483238-f400e65ccd56?w=800',
  africa: 'https://images.unsplash.com/photo-1489749798305-4fea3ae63d43?w=800',
  asia: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800',
  oceania: 'https://images.unsplash.com/photo-1523482580672-f109ba8cb9be?w=800',
  ecuador: 'https://media.istockphoto.com/id/481766414/es/foto/bandera-y-church-en-guayaquil.jpg?s=612x612&w=0&k=20&c=88OO2aWG6rnqRBpJyzhqsWEBX5YXxnbiJ2r-JlghsuA='
}

const getImagenRegion = (nombre) => {
  return imagenesRegiones[nombre] || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800'
}

// Cargar regiones al iniciar
onMounted(async () => {
  loading.value = true
  try {
    const regionesData = await getRegiones()
    regiones.value = regionesData.sort((a, b) => {
      if (a.nombre === 'ecuador') return -1
      if (b.nombre === 'ecuador') return 1
      return a.orden - b.orden
    })
  } catch (error) {
    console.error('Error cargando regiones:', error)
  } finally {
    loading.value = false
  }
})

// Seleccionar región → cargar destinos directamente
const seleccionarRegion = async (region) => {
  regionSeleccionada.value = region
  loading.value = true
  vistaActual.value = 'destinos'

  try {
    const paisesData = await getPaisesByRegion(region.id)
    const allDestinos = []
    for (const pais of paisesData) {
      const d = await getDestinos({ pais: pais.id })
      allDestinos.push(...d)
    }
    destinos.value = allDestinos
  } catch (error) {
    console.error('Error cargando destinos:', error)
  } finally {
    loading.value = false
  }
}

// Navegación
const volverARegiones = () => {
  vistaActual.value = 'regiones'
  regionSeleccionada.value = null
  destinos.value = []
}

// Modales
const abrirPdf = (destino) => {
  pdfSeleccionado.value = {
    url: destino.pdf_url,
    titulo: destino.nombre,
    subtitulo: destino.pais_nombre
  }
  destinoParaContacto.value = destino
  mostrarPdf.value = true
}

const abrirContacto = (destino) => {
  mensajeReserva.value = destino.mensaje_reserva || `Me interesa el destino ${destino.nombre}`
  destinoParaContacto.value = destino
  mostrarContacto.value = true
}

const contactarDesdePdf = () => {
  if (destinoParaContacto.value) {
    abrirContacto(destinoParaContacto.value)
  } else {
    mensajeReserva.value = ''
    mostrarContacto.value = true
  }
}
</script>

<style scoped>
/* ===== VARIABLES ===== */
.destinos-hero,
.regiones-section,
.destinos-section {
  --color-primary: #b5931ae2;
  --color-primary-dark: #8a7015;
  --color-dark: #23221e;
  --color-text-light: #666;
  --color-background: #f5f5f5;
  --color-border: #e0e0e0;
  --shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.1);
  --shadow-md: 0 4px 15px rgba(0, 0, 0, 0.15);
  --shadow-lg: 0 8px 30px rgba(0, 0, 0, 0.2);
  --radius-md: 12px;
  --radius-lg: 16px;
}

/* ===== HERO ===== */
.destinos-hero {
  min-height: 100vh;
  background: url('https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1200') center/cover;
  background-attachment: fixed;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100px 20px 80px;
}

.hero-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0.65) 0%,
    rgba(0, 0, 0, 0.45) 50%,
    rgba(0, 0, 0, 0.7) 100%
  );
}

.hero-content {
  position: relative;
  z-index: 1;
  text-align: center;
  color: white;
  padding: 0 2rem;
  animation: fadeInDown 0.8s ease-out;
}

@keyframes fadeInDown {
  from { opacity: 0; transform: translateY(-30px); }
  to { opacity: 1; transform: translateY(0); }
}

.hero-content h1 {
  font-size: 3.8rem;
  margin-bottom: 1.2rem;
  font-weight: 800;
  letter-spacing: -1px;
  text-shadow: 2px 2px 10px rgba(0,0,0,0.6), 0 0 30px rgba(181, 147, 26, 0.3);
}

.hero-content p {
  font-size: 1.5rem;
  opacity: 0.95;
  font-weight: 300;
  letter-spacing: 0.5px;
  text-shadow: 1px 1px 6px rgba(0,0,0,0.5);
}

/* ===== SECTION HEADER ===== */
.section-header {
  text-align: center;
  padding: 3rem 2rem 2rem;
}

.section-header h2 {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--color-dark);
  margin-bottom: 10px;
}

.section-header p {
  font-size: 1.1rem;
  color: var(--color-text-light);
}

/* ===== LOADING ===== */
.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px;
  color: var(--color-text-light);
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid var(--color-border);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 15px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* ===== NO RESULTADOS ===== */
.no-resultados {
  text-align: center;
  padding: 80px 20px;
  background: white;
  border-radius: var(--radius-lg);
  max-width: 500px;
  margin: 0 auto 40px;
}

.no-resultados-icon {
  width: 80px;
  height: 80px;
  margin: 0 auto 20px;
  color: var(--color-primary);
  opacity: 0.7;
}

.no-resultados-icon svg {
  width: 100%;
  height: 100%;
}

.no-resultados h3 {
  color: var(--color-dark);
  margin-bottom: 10px;
}

.no-resultados p {
  color: var(--color-text-light);
}

/* ===== REGIONES ===== */
.regiones-section {
  padding: 2rem;
  min-height: 50vh;
}

.regiones-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

.region-card {
  cursor: pointer;
  border-radius: var(--radius-md);
  overflow: hidden;
  transition: transform 0.3s, box-shadow 0.3s;
}

.region-card:hover {
  transform: translateY(-8px);
  box-shadow: var(--shadow-lg);
}

.region-img {
  position: relative;
  height: 200px;
  background-size: cover;
  background-position: center;
  display: flex;
  align-items: flex-end;
}

.region-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.2) 50%, transparent 100%);
}

.region-info {
  position: relative;
  z-index: 1;
  padding: 1.5rem;
  width: 100%;
}

.region-info h3 {
  color: white;
  font-size: 1.5rem;
  font-weight: 700;
  text-shadow: 1px 1px 3px rgba(0,0,0,0.5);
}

/* ===== DESTINOS ===== */
.destinos-section {
  padding: 2rem 60px 60px;
  background: var(--color-background);
  position: relative;
  padding-bottom: 100px;
}

.destinos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 30px;
  max-width: 1200px;
  margin: 0 auto;
}

.destino-card {
  background: white;
  border-radius: var(--radius-md);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  display: flex;
  flex-direction: column;
}

.destino-card:hover {
  transform: translateY(-8px);
  box-shadow: var(--shadow-md);
}

.destino-img {
  height: 200px;
  background-size: cover;
  background-position: center;
  position: relative;
}

.destino-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  background: var(--color-primary);
  color: white;
  padding: 4px 12px;
  border-radius: 15px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.destino-info {
  padding: 20px;
  display: flex;
  flex-direction: column;
  flex: 1;
}

.destino-info h3 {
  font-size: 1.3rem;
  color: #333;
  margin-bottom: 4px;
}

.destino-pais {
  font-size: 0.85rem;
  color: var(--color-primary);
  font-weight: 500;
  margin-bottom: 8px;
}

.destino-info p {
  color: #666;
  font-size: 0.95rem;
  flex: 1;
  margin-bottom: 15px;
}

.destino-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-top: auto;
}

.destino-precio {
  font-size: 1.1rem;
  font-weight: 700;
  color: #2c3e50;
}

.destino-acciones {
  display: flex;
  gap: 8px;
}

.btn-ver-pdf,
.btn-reservar {
  padding: 6px 14px;
  border: none;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-ver-pdf {
  background: #f0f0f0;
  color: #555;
}

.btn-ver-pdf:hover {
  background: #e0e0e0;
}

.btn-reservar {
  background: var(--color-primary);
  color: white;
}

.btn-reservar:hover {
  background: var(--color-primary-dark);
}

/* ===== BOTÓN FLOTANTE VOLVER ===== */
.btn-back-floating {
  position: fixed;
  bottom: 30px;
  left: 30px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: var(--color-primary);
  border: none;
  color: white;
  padding: 14px 24px;
  border-radius: 50px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 600;
  box-shadow: 0 4px 20px rgba(181, 147, 26, 0.4);
  transition: all 0.3s ease;
  z-index: 100;
}

.btn-back-floating:hover {
  background: var(--color-primary-dark);
  transform: translateY(-3px);
  box-shadow: 0 6px 25px rgba(181, 147, 26, 0.5);
}

.btn-back-floating .arrow {
  font-size: 1.3rem;
  transition: transform 0.3s ease;
}

.btn-back-floating:hover .arrow {
  transform: translateX(-4px);
}

/* Scroll Indicator */
.scroll-indicator {
  position: absolute;
  bottom: 30px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 2;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  animation: bounceDown 2s ease-in-out infinite;
}

.scroll-indicator span {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.7);
  letter-spacing: 1.5px;
  text-transform: uppercase;
  font-weight: 500;
}

.scroll-indicator svg {
  width: 28px;
  height: 28px;
  color: rgba(255, 255, 255, 0.7);
  transition: color 0.3s;
}

.scroll-indicator:hover svg,
.scroll-indicator:hover span {
  color: white;
}

@keyframes bounceDown {
  0%, 20%, 50%, 80%, 100% { transform: translateX(-50%) translateY(0); }
  40% { transform: translateX(-50%) translateY(10px); }
  60% { transform: translateX(-50%) translateY(5px); }
}

/* ===== RESPONSIVE ===== */
@media (max-width: 992px) {
  .destinos-hero {
    min-height: 100vh;
    padding: 100px 20px 80px;
  }

  .hero-content h1 {
    font-size: 3rem;
  }

  .hero-content p {
    font-size: 1.3rem;
  }

  .regiones-section,
  .destinos-section {
    padding: 40px 30px;
  }

  .section-header h2 {
    font-size: 2rem;
  }

  .regiones-grid {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  }
}

@media (max-width: 768px) {
  .destinos-hero {
    background-attachment: scroll;
    min-height: 100vh;
    padding: 90px 15px 70px;
  }

  .hero-content h1 {
    font-size: 2.5rem;
  }

  .hero-content p {
    font-size: 1.15rem;
  }

  .regiones-section,
  .destinos-section {
    padding: 40px 20px;
  }

  .section-header h2 {
    font-size: 1.8rem;
  }

  .regiones-grid {
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 15px;
  }

  .region-img {
    height: 170px;
  }

  .region-info h3 {
    font-size: 1.3rem;
  }

  .destinos-grid {
    grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
    gap: 20px;
  }

  .destino-img {
    height: 180px;
  }

  .destino-info {
    padding: 15px;
  }

  .destino-footer {
    flex-direction: column;
    align-items: flex-start;
  }

  .btn-back-floating {
    bottom: 20px;
    left: 20px;
    padding: 12px 20px;
    font-size: 0.95rem;
  }
}

@media (max-width: 480px) {
  .destinos-hero {
    min-height: 100vh;
    padding: 80px 12px 60px;
  }

  .hero-content h1 {
    font-size: 2rem;
    padding: 0 15px;
  }

  .hero-content p {
    font-size: 1rem;
    padding: 0 15px;
  }

  .regiones-section,
  .destinos-section {
    padding: 30px 15px;
    padding-bottom: 100px;
  }

  .section-header {
    padding: 2rem 1rem 1.5rem;
  }

  .section-header h2 {
    font-size: 1.5rem;
  }

  .regiones-grid {
    grid-template-columns: 1fr;
    padding: 0 0.5rem;
  }

  .region-img {
    height: 150px;
  }

  .region-info {
    padding: 1rem;
  }

  .region-info h3 {
    font-size: 1.2rem;
  }

  .destinos-grid {
    grid-template-columns: 1fr;
    gap: 15px;
  }

  .destino-img {
    height: 160px;
  }

  .btn-back-floating {
    bottom: 15px;
    left: 15px;
    padding: 10px 18px;
    font-size: 0.9rem;
  }

  .btn-back-floating .arrow {
    font-size: 1.1rem;
  }
}
</style>
