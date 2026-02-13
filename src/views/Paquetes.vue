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

    <!-- Usar el componente CarruselPaquetes -->
    <CarruselPaquetes 
      v-else
      :paquetes="paquetes"
      :items-per-slide="3"
      @ver-oferta="verOferta"
    />

    <!-- Botón flotante de volver -->
    <button class="btn-back-floating" @click="volverAPaises">
      <span class="arrow">←</span> {{ textoBotonVolver }}
    </button>
  </section>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { getRegiones, getPaisesByRegion, getPaquetes } from '../services/api.js'
import CarruselPaquetes from '../components/CarruselPaquetes.vue'

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
    const regionesData = await getRegiones()
    // Ordenar para que Ecuador esté primero
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
  margin-bottom: 5px;
  text-shadow: 1px 1px 3px rgba(0,0,0,0.5);
}

.region-count {
  font-size: 0.9rem;
  opacity: 0.9;
}

/* ===== PAISES SECTION ===== */
.paises-section {
  padding: 2rem;
  min-height: 50vh;
  position: relative;
  padding-bottom: 100px;
}

.paises-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 20px;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
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
