<template>
  <section class="paquetes-hero">
    <div class="hero-overlay"></div>
    <div class="hero-content">
      <h1>Paquetes Turísticos</h1>
      <p>Descubre los mejores destinos del mundo</p>
    </div>
  </section>

  <!-- VISTA DE REGIONES -->
  <section v-if="vistaActual === 'regiones'" class="regiones-section">
    <div class="section-header">
      <h2>Selecciona una Región</h2>
    </div>
    
    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      <p>Cargando regiones...</p>
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

  <!-- VISTA DE PAÍSES -->
  <section v-if="vistaActual === 'paises'" class="paises-section">
    <div class="section-header">
      <h2>{{ regionSeleccionada?.nombre_display }}</h2>
    </div>

    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      <p>Cargando países...</p>
    </div>

    <div v-else-if="paisesConPaquetes.length === 0" class="no-paquetes">
      <div class="no-paquetes-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/>
          <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
        </svg>
      </div>
      <h3>No hay destinos disponibles</h3>
      <p>Actualmente no tenemos paquetes para esta región. ¡Vuelve pronto!</p>
    </div>

    <div v-else class="paises-grid">
      <div 
        v-for="pais in paisesConPaquetes" 
        :key="pais.id" 
        class="pais-card"
        @click="seleccionarPais(pais)"
      >
        <div class="pais-bandera">
          <img 
            v-if="pais.bandera_url" 
            :src="pais.bandera_url" 
            :alt="pais.nombre"
          />
          <div v-else class="pais-bandera-placeholder">
            {{ pais.nombre.charAt(0) }}
          </div>
        </div>
        <div class="pais-info">
          <h3>{{ pais.nombre }}</h3>
        </div>
      </div>
    </div>

    <!-- Botón flotante de volver -->
    <button class="btn-back-floating" @click="volverARegiones">
      <span class="arrow">←</span> Volver a Regiones
    </button>
  </section>

  <!-- VISTA DE PAQUETES -->
  <section v-if="vistaActual === 'paquetes'" class="paquetes-section">
    <div class="section-header">
      <h2>Paquetes a {{ paisSeleccionado?.nombre }}</h2>
    </div>

    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      <p>Cargando paquetes...</p>
    </div>

    <div v-else-if="paquetes.length === 0" class="no-paquetes">
      <div class="no-paquetes-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
          <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
          <line x1="12" y1="22.08" x2="12" y2="12"/>
        </svg>
      </div>
      <h3>No hay paquetes disponibles</h3>
      <p>Actualmente no tenemos paquetes para este destino. ¡Vuelve pronto!</p>
    </div>

    <div v-else class="paquetes-grid">
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
            <button class="btn-ver-oferta" @click="verOferta(paquete)">
              VER OFERTA
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Botón flotante de volver -->
    <button class="btn-back-floating" @click="volverAPaises">
      <span class="arrow">←</span> {{ textoBotonVolver }}
    </button>
  </section>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { getRegiones, getPaisesByRegion, getPaquetes } from '../services/api.js'

// Estado
const vistaActual = ref('regiones') // 'regiones' | 'paises' | 'paquetes'
const loading = ref(false)

// Datos
const regiones = ref([])
const paises = ref([])
const paquetes = ref([])
const paquetesRegion = ref([]) // Paquetes de la región para filtrar países

// Selecciones
const regionSeleccionada = ref(null)
const paisSeleccionado = ref(null)

// Computed: países que tienen al menos un paquete
const paisesConPaquetes = computed(() => {
  if (paquetesRegion.value.length === 0) return []
  
  // Obtener IDs de países que tienen paquetes
  const paisesConPaquetesIds = new Set(
    paquetesRegion.value.map(p => p.pais_destino)
  )
  
  // Filtrar solo países que tienen paquetes
  return paises.value.filter(pais => paisesConPaquetesIds.has(pais.id))
})

// Computed: texto del botón de volver (para Ecuador va directo a Regiones)
const textoBotonVolver = computed(() => {
  if (regionSeleccionada.value?.nombre === 'ecuador') {
    return 'Volver a Regiones'
  }
  return `Volver a ${regionSeleccionada.value?.nombre_display || 'Regiones'}`
})

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
  ecuador: 'https://media.istockphoto.com/id/481766414/es/foto/bandera-y-church-en-guayaquil.jpg?s=612x612&w=0&k=20&c=88OO2aWG6rnqRBpJyzhqsWEBX5YXxnbiJ2r-JlghsuA='
}

const getImagenRegion = (nombre) => {
  return imagenesRegiones[nombre] || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800'
}

// Cargar regiones al iniciar
onMounted(async () => {
  await cargarRegiones()
})

const cargarRegiones = async () => {
  loading.value = true
  try {
    regiones.value = await getRegiones()
  } catch (error) {
    console.error('Error cargando regiones:', error)
  } finally {
    loading.value = false
  }
}

const seleccionarRegion = async (region) => {
  regionSeleccionada.value = region
  loading.value = true
  
  // Excepción especial para Ecuador: ir directo a paquetes sin mostrar países
  if (region.nombre === 'ecuador') {
    vistaActual.value = 'paquetes'
    
    try {
      const paquetesData = await getPaquetes({ region: region.id })
      paquetes.value = paquetesData
      
      // Establecer un país ficticio para Ecuador
      paisSeleccionado.value = { 
        id: null, 
        nombre: 'Ecuador',
        region_nombre: 'Ecuador'
      }
    } catch (error) {
      console.error('Error cargando paquetes de Ecuador:', error)
    } finally {
      loading.value = false
    }
    return
  }
  
  // Flujo normal para otras regiones
  vistaActual.value = 'paises'
  
  try {
    // Cargar países y paquetes de la región en paralelo
    const [paisesData, paquetesData] = await Promise.all([
      getPaisesByRegion(region.id),
      getPaquetes({ region: region.id })
    ])
    
    paises.value = paisesData
    paquetesRegion.value = paquetesData
  } catch (error) {
    console.error('Error cargando países:', error)
  } finally {
    loading.value = false
  }
}

const seleccionarPais = async (pais) => {
  paisSeleccionado.value = pais
  loading.value = true
  vistaActual.value = 'paquetes'
  
  try {
    paquetes.value = await getPaquetes({ 
      region: regionSeleccionada.value.id,
      pais: pais.id 
    })
  } catch (error) {
    console.error('Error cargando paquetes:', error)
  } finally {
    loading.value = false
  }
}

const volverARegiones = () => {
  vistaActual.value = 'regiones'
  regionSeleccionada.value = null
  paises.value = []
  paquetesRegion.value = []
  paisSeleccionado.value = null
  paquetes.value = []
}

const volverAPaises = () => {
  // Si es Ecuador, volver directo a regiones (no hay vista de países)
  if (regionSeleccionada.value?.nombre === 'ecuador') {
    volverARegiones()
    return
  }
  
  // Flujo normal para otras regiones
  vistaActual.value = 'paises'
  paisSeleccionado.value = null
  paquetes.value = []
}

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

const verOferta = (paquete) => {
  // Por ahora solo mostramos en consola, después se implementará la navegación
  console.log('Ver oferta:', paquete)
  alert(`Ver oferta: ${paquete.titulo}`)
}
</script>

<style scoped>
/* ===== VARIABLES ===== */
.paquetes-hero,
.regiones-section,
.paises-section,
.paquetes-section {
  --color-primary: #b5931ae2;
  --color-primary-dark: #8a7015;
  --color-primary-light: #d4b82c;
  --color-dark: #23221e;
  --color-text: #333;
  --color-text-light: #666;
  --color-background: #f5f5f5;
  --color-white: #fff;
  --color-border: #e0e0e0;
  --color-success: #28a745;
  --color-info: #17a2b8;
  --color-warning: #ffc107;
  --color-danger: #dc3545;
  --shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.1);
  --shadow-md: 0 4px 15px rgba(0, 0, 0, 0.15);
  --shadow-lg: 0 8px 30px rgba(0, 0, 0, 0.2);
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
}

/* ===== HERO ===== */
.paquetes-hero {
  height: 85vh;
  background: url('https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1400') center/cover;
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
  padding: 0 2rem;
}

.hero-content h1 {
  font-size: 3.5rem;
  margin-bottom: 1rem;
  font-weight: 700;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
}

.hero-content p {
  font-size: 1.5rem;
  opacity: 0.95;
  font-weight: 300;
}

/* ===== SECTION HEADER ===== */
.section-header {
  text-align: center;
  margin-bottom: 40px;
}

.section-header h2 {
  font-size: 2.2rem;
  color: var(--color-dark);
  margin-bottom: 10px;
  font-weight: 600;
}

.section-header p {
  font-size: 1.1rem;
  color: var(--color-text-light);
}

/* Botón flotante de volver */
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

/* ===== REGIONES SECTION ===== */
.regiones-section {
  padding: 60px;
  background: var(--color-background);
}

.regiones-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 25px;
  max-width: 1400px;
  margin: 0 auto;
}

.region-card {
  cursor: pointer;
  border-radius: var(--radius-md);
  overflow: hidden;
  box-shadow: var(--shadow-md);
  transition: all 0.3s ease;
}

.region-card:hover {
  transform: translateY(-8px);
  box-shadow: var(--shadow-lg);
}

.region-img {
  height: 200px;
  background-size: cover;
  background-position: center;
  position: relative;
  display: flex;
  align-items: flex-end;
}

.region-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 60%);
}

.region-info {
  position: relative;
  z-index: 1;
  padding: 20px;
  color: white;
  width: 100%;
}

.region-info h3 {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 5px;
}

.region-count {
  font-size: 0.9rem;
  opacity: 0.9;
}

/* ===== PAISES SECTION ===== */
.paises-section {
  padding: 60px;
  background: var(--color-background);
}

.paises-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 20px;
  max-width: 1400px;
  margin: 0 auto;
}

.pais-card {
  background: white;
  border-radius: var(--radius-md);
  padding: 25px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  cursor: pointer;
  box-shadow: var(--shadow-sm);
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.pais-card:hover {
  transform: translateY(-5px);
  box-shadow: var(--shadow-md);
  border-color: var(--color-primary);
}

.pais-bandera {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  overflow: hidden;
  margin-bottom: 15px;
  border: 3px solid var(--color-border);
}

.pais-bandera img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.pais-bandera-placeholder {
  width: 100%;
  height: 100%;
  background: var(--color-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 2rem;
  font-weight: 700;
}

.pais-info h3 {
  font-size: 1.2rem;
  color: var(--color-dark);
  margin-bottom: 5px;
}

.pais-count {
  font-size: 0.9rem;
  color: var(--color-text-light);
}

/* ===== PAQUETES SECTION ===== */
.paquetes-section {
  padding: 60px;
  background: var(--color-background);
}

.no-paquetes {
  text-align: center;
  padding: 80px 20px;
  background: white;
  border-radius: var(--radius-lg);
  max-width: 500px;
  margin: 0 auto;
}

.no-paquetes-icon {
  width: 80px;
  height: 80px;
  margin: 0 auto 20px;
  color: var(--color-primary);
  opacity: 0.7;
}

.no-paquetes-icon svg {
  width: 100%;
  height: 100%;
}

.no-paquetes h3 {
  color: var(--color-dark);
  margin-bottom: 10px;
}

.no-paquetes p {
  color: var(--color-text-light);
}

.paquetes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(360px, 1fr));
  gap: 30px;
  max-width: 1400px;
  margin: 0 auto;
}

/* ===== PAQUETE CARD ===== */
.paquete-card {
  background: white;
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-md);
  transition: all 0.3s ease;
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

.paquete-proveedor {
  position: absolute;
  bottom: 15px;
  left: 15px;
  color: white;
  font-size: 0.85rem;
  text-shadow: 1px 1px 2px rgba(0,0,0,0.5);
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
@media (max-width: 768px) {
  .hero-content h1 {
    font-size: 2.5rem;
  }
  
  .hero-content p {
    font-size: 1.1rem;
  }
  
  .regiones-section,
  .paises-section,
  .paquetes-section {
    padding: 40px 20px;
  }
  
  .section-header h2 {
    font-size: 1.8rem;
  }
  
  .regiones-grid,
  .paises-grid {
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 15px;
  }
  
  .paquetes-grid {
    grid-template-columns: 1fr;
  }
  
  .paquete-tipo-duracion,
  .paquete-salida-aerolinea {
    flex-direction: column;
    gap: 10px;
  }
  
  .detalle-item.aerolinea {
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
  .paquetes-hero {
    height: 60vh;
  }
  
  .hero-content h1 {
    font-size: 2rem;
  }
  
  .paquete-header {
    flex-direction: column;
    gap: 10px;
  }
  
  .paquete-precio {
    text-align: left;
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
