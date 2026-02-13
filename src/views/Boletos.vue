<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import ModalContacto from '../components/ModalContacto.vue'
import ModalPdfViewer from '../components/ModalPdfViewer.vue'
import CarruselVuelos from '../components/CarruselVuelos.vue'
import { getVuelos, getRegiones, getPaisesByRegion, getCiudades } from '../services/api.js'

// ===== ICONOS SVG PERSONALIZABLES =====
const iconos = {
  avion: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/></svg>`,
  aerolinea: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 7V3H2v18h20V7H12zM6 19H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4V9h2v2zm0-4H4V5h2v2zm4 12H8v-2h2v2zm0-4H8v-2h2v2zm0-4H8V9h2v2zm0-4H8V5h2v2zm10 12h-8v-2h2v-2h-2v-2h2v-2h-2V9h8v10zm-2-8h-2v2h2v-2zm0 4h-2v2h2v-2z"/></svg>`,
  reloj: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/></svg>`,
  calendario: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM9 10H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2zm-8 4H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2z"/></svg>`,
  documento: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/></svg>`,
  checkin: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/></svg>`,
  equipaje: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M17 6h-2V3c0-.55-.45-1-1-1h-4c-.55 0-1 .45-1 1v3H7c-1.1 0-2 .9-2 2v11c0 1.1.9 2 2 2 0 .55.45 1 1 1s1-.45 1-1h6c0 .55.45 1 1 1s1-.45 1-1c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zM9.5 18H8V9h1.5v9zm3.25 0h-1.5V9h1.5v9zm.75-12h-3V3.5h3V6zM16 18h-1.5V9H16v9z"/></svg>`
}

// ===== ESTADO DE NAVEGACIÓN =====
const vistaActual = ref('regiones') // 'regiones' | 'paises' | 'ciudades' | 'vuelos'
const loading = ref(false)
const error = ref(null)

// Datos de navegación
const regiones = ref([])
const paises = ref([])
const ciudades = ref([])
const vuelos = ref([])
const vuelosRegion = ref([]) // Vuelos de la región para filtrar países/ciudades

// Selecciones
const regionSeleccionada = ref(null)
const paisSeleccionado = ref(null)
const ciudadSeleccionada = ref(null)
const paisesDeRegion = ref([]) // Países que pertenecen a la región seleccionada

// ===== ESTADOS PARA LOS MODALES =====
const mostrarModalContacto = ref(false)
const mostrarModalPdf = ref(false)
const mensajeReserva = ref('')
const mensajeReadonly = ref(false)
const vueloSeleccionado = ref(null)

// Imagen por defecto para vuelos sin imagen
const imagenDefault = 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800&h=400&fit=crop'

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

// Computed: países que tienen vuelos Y pertenecen a la región seleccionada
const paisesConVuelos = computed(() => {
  if (vuelosRegion.value.length === 0 || paisesDeRegion.value.length === 0) return []
  
  // Obtener nombres de países de la región que tienen vuelos
  const paisesConVuelosNombres = new Set()
  
  vuelosRegion.value.forEach(vuelo => {
    paisesConVuelosNombres.add(vuelo.destino_pais)
  })
  
  // Filtrar países de la región que tienen vuelos (con todos sus datos incluyendo bandera)
  return paisesDeRegion.value.filter(pais => paisesConVuelosNombres.has(pais.nombre))
})

// Computed: ciudades que tienen vuelos en el país seleccionado
const ciudadesConVuelos = computed(() => {
  if (!paisSeleccionado.value || vuelosRegion.value.length === 0) return []
  
  const ciudadesUnicas = []
  const ciudadesVistas = new Set()
  
  vuelosRegion.value
    .filter(v => v.destino_pais === paisSeleccionado.value.nombre)
    .forEach(vuelo => {
      if (!ciudadesVistas.has(vuelo.destino_nombre)) {
        ciudadesVistas.add(vuelo.destino_nombre)
        ciudadesUnicas.push({
          nombre: vuelo.destino_nombre,
          id: vuelo.destino
        })
      }
    })
  
  return ciudadesUnicas
})

// Texto del botón de volver
const textoBotonVolver = computed(() => {
  if (vistaActual.value === 'vuelos' && ciudadSeleccionada.value) {
    return `Volver a ${paisSeleccionado.value?.nombre || 'Ciudades'}`
  }
  if (vistaActual.value === 'ciudades') {
    return `Volver a ${regionSeleccionada.value?.nombre_display || 'Países'}`
  }
  return 'Volver a Regiones'
})

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
  } catch (err) {
    console.error('Error cargando regiones:', err)
    error.value = 'No se pudieron cargar las regiones.'
  } finally {
    loading.value = false
  }
}

const seleccionarRegion = async (region) => {
  regionSeleccionada.value = region
  loading.value = true
  error.value = null
  
  try {
    // Cargar países de la región y todos los vuelos en paralelo
    const [paisesData, vuelosData] = await Promise.all([
      getPaisesByRegion(region.id),
      getVuelos()
    ])
    
    paisesDeRegion.value = paisesData
    vuelosRegion.value = vuelosData
    
    // Si es Ecuador, ir directo a vuelos con destino Ecuador
    if (region.nombre === 'ecuador') {
      vuelos.value = vuelosData.filter(v => v.destino_pais === 'Ecuador')
      paisSeleccionado.value = { nombre: 'Ecuador', id: null }
      vistaActual.value = 'vuelos'
    } else {
      // Mostrar países con vuelos disponibles
      vistaActual.value = 'paises'
    }
  } catch (err) {
    console.error('Error cargando vuelos:', err)
    error.value = 'No se pudieron cargar los vuelos.'
  } finally {
    loading.value = false
  }
}

const seleccionarPais = async (pais) => {
  paisSeleccionado.value = pais
  loading.value = true
  vistaActual.value = 'ciudades'
  loading.value = false
}

const seleccionarCiudad = async (ciudad) => {
  ciudadSeleccionada.value = ciudad
  loading.value = true
  vistaActual.value = 'vuelos'
  
  // Filtrar vuelos por ciudad de destino
  vuelos.value = vuelosRegion.value.filter(v => v.destino_nombre === ciudad.nombre)
  loading.value = false
}

const volverARegiones = () => {
  vistaActual.value = 'regiones'
  regionSeleccionada.value = null
  paisSeleccionado.value = null
  ciudadSeleccionada.value = null
  paisesDeRegion.value = []
  paises.value = []
  ciudades.value = []
  vuelos.value = []
  vuelosRegion.value = []
}

const volverAPaises = () => {
  if (vistaActual.value === 'vuelos' && ciudadSeleccionada.value) {
    vistaActual.value = 'ciudades'
    ciudadSeleccionada.value = null
    vuelos.value = []
    return
  }
  
  if (vistaActual.value === 'ciudades' || (vistaActual.value === 'vuelos' && regionSeleccionada.value?.nombre === 'ecuador')) {
    volverARegiones()
    return
  }
  
  vistaActual.value = 'paises'
  paisSeleccionado.value = null
  ciudadSeleccionada.value = null
  vuelos.value = []
}

// Función para formatear el tipo de vuelo
const formatTipoVuelo = (tipo) => {
  const tipos = {
    'directo': 'Directo',
    'escala': '1 Escala',
    'escalas': 'Con escalas'
  }
  return tipos[tipo] || tipo
}

// Obtener imagen del vuelo o usar la por defecto
const getVueloImagen = (vuelo) => {
  return vuelo.imagen_url || imagenDefault
}

// ===== FUNCIONES PARA RESERVA =====
const generarMensajeVuelo = (vuelo) => {
  const tipoVuelo = formatTipoVuelo(vuelo.tipo_vuelo);
  const precio = `$${vuelo.precio} ${vuelo.moneda || 'USD'}`;

  return `Quisiera hacer una reserva de vuelo en la aerolínea ${vuelo.aerolinea_nombre}, con origen en ${vuelo.origen_nombre} (${vuelo.origen_pais}) y destino a ${vuelo.destino_nombre} (${vuelo.destino_pais}). La duración del viaje es de ${vuelo.duracion} en un vuelo ${tipoVuelo}, con un precio de ${precio}. Estoy interesado/a en reservar este vuelo; por favor, contáctenme para más información`;
}

const obtenerMensajeReserva = (vuelo) => {
  if (vuelo.mensaje_reserva && vuelo.mensaje_reserva.trim() !== '') {
    return vuelo.mensaje_reserva
  }
  return generarMensajeVuelo(vuelo)
}

const handleReservar = (vuelo) => {
  vueloSeleccionado.value = vuelo
  mensajeReserva.value = obtenerMensajeReserva(vuelo)
  mensajeReadonly.value = true
  
  if (vuelo.pdf_url && vuelo.pdf_url.trim() !== '') {
    mostrarModalPdf.value = true
  } else {
    mostrarModalContacto.value = true
  }
}

const handleContactarDesdePdf = () => {
  mostrarModalContacto.value = true
}
</script>

<template>
  <div class="boletos-page">
    <!-- Hero Section -->
    <section class="hero-section">
      <div class="hero-overlay"></div>
      <div class="hero-content">
        <h1>Vuelos</h1>
        <p>Encuentra los mejores vuelos al mejor precio</p>
      </div>
    </section>

    <!-- VISTA DE REGIONES -->
    <section v-if="vistaActual === 'regiones'" class="regiones-section">
      <div class="section-header">
        <h2>Selecciona una Región</h2>
      </div>
      
      <div v-if="loading" class="loading-state">
        <div class="loading-spinner"></div>
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

      <div v-if="loading" class="loading-state">
        <div class="loading-spinner"></div>
        <p>Cargando países...</p>
      </div>

      <div v-else-if="paisesConVuelos.length === 0" class="empty-state">
        <div class="empty-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
          </svg>
        </div>
        <h3>No hay vuelos disponibles</h3>
        <p>Actualmente no tenemos vuelos para esta región. ¡Vuelve pronto!</p>
      </div>

      <div v-else class="paises-grid">
        <div 
          v-for="pais in paisesConVuelos" 
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

      <button class="btn-back-floating" @click="volverARegiones">
        <span class="arrow">←</span> Volver a Regiones
      </button>
    </section>

    <!-- VISTA DE CIUDADES -->
    <section v-if="vistaActual === 'ciudades'" class="ciudades-section">
      <div class="section-header">
        <h2>Ciudades en {{ paisSeleccionado?.nombre }}</h2>
      </div>

      <div v-if="loading" class="loading-state">
        <div class="loading-spinner"></div>
        <p>Cargando ciudades...</p>
      </div>

      <div v-else-if="ciudadesConVuelos.length === 0" class="empty-state">
        <div class="empty-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 2L2 7l10 5 10-5-10-5z"/>
            <path d="M2 17l10 5 10-5"/>
            <path d="M2 12l10 5 10-5"/>
          </svg>
        </div>
        <h3>No hay ciudades con vuelos</h3>
        <p>Actualmente no tenemos vuelos a ciudades en este país.</p>
      </div>

      <div v-else class="ciudades-grid">
        <div 
          v-for="ciudad in ciudadesConVuelos" 
          :key="ciudad.id" 
          class="ciudad-card"
          @click="seleccionarCiudad(ciudad)"
        >
          <div class="ciudad-info">
            <h3>{{ ciudad.nombre }}</h3>
          </div>
        </div>
      </div>

      <button class="btn-back-floating" @click="volverAPaises">
        <span class="arrow">←</span> {{ textoBotonVolver }}
      </button>
    </section>

    <!-- VISTA DE VUELOS -->
    <section v-if="vistaActual === 'vuelos'" class="flights-section">
      <div class="container">
        <h2 class="section-title">Vuelos a {{ ciudadSeleccionada?.nombre || paisSeleccionado?.nombre }}</h2>
        
        <!-- Estado de carga -->
        <div v-if="loading" class="loading-state">
          <div class="loading-spinner"></div>
          <p>Cargando vuelos...</p>
        </div>
        
        <!-- Estado de error -->
        <div v-else-if="error" class="error-state">
          <p>{{ error }}</p>
          <button @click="cargarRegiones" class="btn-retry">Reintentar</button>
        </div>
        
        <!-- CARRUSEL DE VUELOS -->
        <CarruselVuelos 
          v-else-if="vuelos.length > 0"
          :vuelos="vuelos"
          :items-per-slide="3"
          :imagen-default="imagenDefault"
          @reservar="handleReservar"
        />
        
        <!-- Sin vuelos disponibles -->
        <div v-else class="empty-state">
          <p>No hay vuelos disponibles en este momento.</p>
        </div>
      </div>

      <button class="btn-back-floating" @click="volverAPaises">
        <span class="arrow">←</span> {{ textoBotonVolver }}
      </button>
    </section>

    <!-- Información -->
    <section class="info-section">
      <div class="container">
        <h2 class="section-title">Información Importante</h2>
        <div class="info-content">
          <div class="info-box">
            <h3><span class="info-icon" v-html="iconos.documento"></span> Documentos Requeridos</h3>
            <ul>
              <li>Pasaporte vigente (para vuelos internacionales)</li>
              <li>Cédula de identidad (para vuelos nacionales)</li>
              <li>Visa (si aplica según destino)</li>
              <li>Certificado de vacunación (según requisitos del país)</li>
            </ul>
          </div>
          <div class="info-box">
            <h3><span class="info-icon" v-html="iconos.checkin"></span> Check-in</h3>
            <ul>
              <li>Vuelos nacionales: 2 horas antes</li>
              <li>Vuelos internacionales: 3 horas antes</li>
              <li>Check-in online disponible 24h antes</li>
              <li>Cierre de check-in: 45 min antes del vuelo</li>
            </ul>
          </div>
          <div class="info-box">
            <h3><span class="info-icon" v-html="iconos.equipaje"></span> Equipaje</h3>
            <ul>
              <li>Equipaje de mano: 8kg máximo</li>
              <li>Equipaje facturado: 23kg (clase económica)</li>
              <li>Artículos personales permitidos</li>
              <li>Restricciones de líquidos: 100ml max</li>
            </ul>
          </div>
        </div>
      </div>
    </section>

    <!-- MODAL VISOR DE PDF -->
    <ModalPdfViewer 
      v-model:visible="mostrarModalPdf"
      :pdfUrl="vueloSeleccionado?.pdf_url || ''"
      :titulo="`Vuelo: ${vueloSeleccionado?.origen_nombre || ''} → ${vueloSeleccionado?.destino_nombre || ''}`"
      :subtitulo="`${vueloSeleccionado?.aerolinea_nombre || ''} - ${formatTipoVuelo(vueloSeleccionado?.tipo_vuelo || '')}`"
      @contactar="handleContactarDesdePdf"
    />

    <!-- MODAL DE CONTACTO -->
    <ModalContacto 
      v-model:visible="mostrarModalContacto"
      :mensajePredefinido="mensajeReserva"
      :mensajeReadonly="mensajeReadonly"
    />
  </div>
</template>

<style scoped>
/* ===== VARIABLES DE COLORES Y FUENTES ===== */
.boletos-page {
  /* Colores principales */
  --color-primary: #b5931a;              /* Dorado principal (igual al navbar) */
  --color-primary-light: #d4af37;        /* Dorado claro */
  --color-primary-dark: #8a6f14;         /* Dorado oscuro */
  --color-primary-gradient: linear-gradient(135deg, #b5931a 0%, #d4af37 100%);
  
  /* Colores de fondo */
  --color-background: #f8f9fa;           /* Fondo general */
  --color-background-white: #ffffff;     /* Fondo blanco */
  --color-background-card: #f8f9fa;      /* Fondo de cards */
  
  /* Colores de texto */
  --color-text-dark: #333333;            /* Texto oscuro */
  --color-text-medium: #555555;          /* Texto medio */
  --color-text-light: #888888;           /* Texto claro */
  --color-text-white: #ffffff;           /* Texto blanco */
  
  /* Colores de borde */
  --color-border: #e0e0e0;               /* Borde normal */
  --color-border-light: #f0f0f0;         /* Borde claro */
  
  /* Colores de overlay */
  --color-overlay: rgba(0, 0, 0, 0.5);   /* Overlay oscuro */
  
  /* Fuentes */
  --font-heading: 'Arial', serif;      /* Títulos */
  --font-body: 'Arial', serif;      /* Texto normal */
  --font-button: 'Trebuchet MS', sans-serif; /* Botones */
  
  /* Sombras */
  --shadow-card: 0 4px 15px rgba(0,0,0,0.08);
  --shadow-card-hover: 0 12px 30px rgba(0,0,0,0.12);
  --shadow-button: 0 4px 12px rgba(181, 147, 26, 0.4);
  
  /* Border radius */
  --radius-card: 16px;
  --radius-button: 8px;
  --radius-badge: 25px;
}
/* ============================================ */

.boletos-page {
  min-height: 100vh;
  background: var(--color-background);
}

/* Hero Section */
.hero-section {
  position: relative;
  height: 85vh;
  background: var(--color-primary-gradient);
  background-image: url('https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=1600&h=900&fit=crop');
  background-size: cover;
  background-position: center;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-white);
  text-align: center;
  margin-top: 0;
}

.hero-overlay {
  position: absolute;
  inset: 0;
  background: var(--color-overlay);
}

.hero-content {
  position: relative;
  z-index: 1;
  padding: 0 2rem;
}

.hero-content h1 {
  font-size: 3.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
  font-family: var(--font-heading);
}

.hero-content p {
  font-size: 1.5rem;
  font-weight: 300;
  font-family: var(--font-body);
}

/* ===== SECCIONES DE NAVEGACIÓN ===== */
.section-header {
  text-align: center;
  padding: 3rem 2rem 2rem;
}

.section-header h2 {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--color-text-dark);
  font-family: var(--font-heading);
}

/* REGIONES */
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
  border-radius: var(--radius-card);
  overflow: hidden;
  transition: transform 0.3s, box-shadow 0.3s;
}

.region-card:hover {
  transform: translateY(-8px);
  box-shadow: var(--shadow-card-hover);
}

.region-img {
  position: relative;
  height: 200px;
  background-size: cover;
  background-position: center;
  display: flex;
  align-items: flex-end;
}

.region-img .region-overlay {
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
  color: var(--color-text-white);
  font-size: 1.5rem;
  font-weight: 700;
  font-family: var(--font-heading);
  text-shadow: 1px 1px 3px rgba(0,0,0,0.5);
}

/* PAÍSES */
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
  border-radius: var(--radius-card);
  padding: 25px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  cursor: pointer;
  box-shadow: var(--shadow-card);
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.pais-card:hover {
  transform: translateY(-5px);
  box-shadow: var(--shadow-card-hover);
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
  color: var(--color-text-dark);
  margin-bottom: 5px;
}

/* CIUDADES */
.ciudades-section {
  padding: 2rem;
  min-height: 50vh;
  position: relative;
  padding-bottom: 100px;
}

.ciudades-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1.5rem;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

.ciudad-card {
  background: var(--color-background-white);
  border-radius: var(--radius-card);
  padding: 2rem;
  text-align: center;
  cursor: pointer;
  box-shadow: var(--shadow-card);
  transition: transform 0.3s, box-shadow 0.3s;
  border-left: 4px solid var(--color-primary);
}

.ciudad-card:hover {
  transform: translateY(-5px);
  box-shadow: var(--shadow-card-hover);
}

.ciudad-info h3 {
  font-size: 1.3rem;
  color: var(--color-text-dark);
  font-weight: 600;
  font-family: var(--font-heading);
}

/* BOTÓN FLOTANTE DE VOLVER */
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

/* EMPTY STATE */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
}

.empty-icon {
  width: 80px;
  height: 80px;
  color: var(--color-primary);
  margin-bottom: 1.5rem;
}

.empty-icon svg {
  width: 100%;
  height: 100%;
}

.empty-state h3 {
  font-size: 1.5rem;
  color: var(--color-text-dark);
  margin-bottom: 0.5rem;
  font-family: var(--font-heading);
}

.empty-state p {
  color: var(--color-text-medium);
  font-family: var(--font-body);
}
/* ===================================== */

/* Search Section */
.search-section {
  padding: 3rem 2rem;
  background: var(--color-background-white);
  box-shadow: var(--shadow-card);
}

.search-container {
  max-width: 1200px;
  margin: 0 auto;
}

.search-container h2 {
  text-align: center;
  font-size: 2rem;
  margin-bottom: 1.5rem;
  color: var(--color-text-dark);
  font-style: italic;
  font-family: var(--font-heading);
}

.trip-type {
  display: flex;
  justify-content: center;
  gap: 2rem;
  margin-bottom: 2rem;
}

.radio-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  font-size: 1.1rem;
  color: var(--color-text-medium);
  font-family: var(--font-body);
}

.radio-label input[type="radio"] {
  width: 20px;
  height: 20px;
  cursor: pointer;
  accent-color: var(--color-primary);
}

.search-form {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  align-items: end;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: var(--color-text-medium);
  font-size: 0.95rem;
  font-family: var(--font-body);
}

.form-group input,
.form-group select {
  padding: 0.85rem;
  border: 2px solid var(--color-border);
  border-radius: var(--radius-button);
  font-size: 1rem;
  transition: border-color 0.3s;
  font-family: var(--font-body);
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: var(--color-primary);
}

.btn-search {
  padding: 0.85rem 2rem;
  background: var(--color-primary-gradient);
  color: var(--color-text-white);
  border: none;
  border-radius: var(--radius-button);
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.3s, box-shadow 0.3s;
  font-family: var(--font-button);
}

.btn-search:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-button);
}

/* Flights Section */
.flights-section {
  padding: 4rem 2rem;
  padding-bottom: 100px;
  background: var(--color-background);
  position: relative;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
}

.section-title {
  text-align: center;
  font-size: 2.5rem;
  margin-bottom: 3rem;
  color: var(--color-text-dark);
  font-weight: 700;
  font-family: var(--font-heading);
}

.flights-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 2rem;
}

.flight-card {
  background: var(--color-background-white);
  border-radius: var(--radius-card);
  overflow: hidden;
  box-shadow: var(--shadow-card);
  transition: transform 0.3s, box-shadow 0.3s;
}

.flight-card:hover {
  transform: translateY(-8px);
  box-shadow: var(--shadow-card-hover);
}

.flight-image {
  position: relative;
  height: 200px;
  overflow: hidden;
}

.flight-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

.flight-card:hover .flight-image img {
  transform: scale(1.1);
}

.flight-badge {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: var(--color-primary);
  color: var(--color-text-white);
  padding: 0.5rem 1.2rem;
  border-radius: var(--radius-badge);
  font-size: 0.9rem;
  font-weight: 600;
  font-family: var(--font-body);
}

.flight-info {
  padding: 1.5rem;
}

.flight-route {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.route-item h3 {
  font-size: 1.3rem;
  color: var(--color-text-dark);
  margin: 0.2rem 0;
  font-weight: 700;
  font-family: var(--font-heading);
}

.route-label {
  font-size: 0.85rem;
  color: var(--color-text-light);
  font-family: var(--font-body);
}

.route-arrow {
  width: 2.5rem;
  height: 2.5rem;
  color: var(--color-primary);
  display: flex;
  align-items: center;
  justify-content: center;
}

.route-arrow :deep(svg) {
  width: 100%;
  height: 100%;
}

.flight-details {
  display: flex;
  gap: 2rem;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--color-border-light);
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--color-text-medium);
  font-size: 0.95rem;
  font-family: var(--font-body);
}

.detail-icon {
  width: 1.3rem;
  height: 1.3rem;
  color: var(--color-primary);
  display: flex;
  align-items: center;
}

.detail-icon :deep(svg) {
  width: 100%;
  height: 100%;
}

.flight-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.flight-price {
  display: flex;
  flex-direction: column;
}

.price-label {
  font-size: 0.85rem;
  color: var(--color-text-light);
  font-family: var(--font-body);
}

.price {
  font-size: 2rem;
  font-weight: 700;
  color: var(--color-primary);
  font-family: var(--font-heading);
}

.price-period {
  font-size: 0.85rem;
  color: var(--color-text-light);
  font-family: var(--font-body);
}

.btn-book {
  padding: 0.8rem 1.8rem;
  background: var(--color-primary-gradient);
  color: var(--color-text-white);
  border: none;
  border-radius: var(--radius-button);
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.3s, box-shadow 0.3s;
  font-family: var(--font-button);
}

.btn-book:hover {
  transform: scale(1.05);
  box-shadow: var(--shadow-button);
}

/* Services Section */
.services-section {
  padding: 4rem 2rem;
  background: var(--color-background-white);
}

.services-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
}

.service-card {
  text-align: center;
  padding: 2.5rem 2rem;
  background: var(--color-background-card);
  border-radius: var(--radius-card);
  transition: transform 0.3s, box-shadow 0.3s;
}

.service-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0,0,0,0.1);
}

.service-icon {
  font-size: 3.5rem;
  margin-bottom: 1rem;
}

.service-card h3 {
  font-size: 1.3rem;
  margin-bottom: 0.8rem;
  color: var(--color-text-dark);
  font-weight: 700;
  font-family: var(--font-heading);
}

.service-card p {
  color: var(--color-text-medium);
  line-height: 1.6;
  font-family: var(--font-body);
}

/* Benefits Section */
.benefits-section {
  padding: 4rem 2rem;
  background: var(--color-background);
}

.benefits-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
}

.benefit-item {
  text-align: center;
  padding: 2.5rem 2rem;
  background: var(--color-background-white);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-card);
  transition: transform 0.3s, box-shadow 0.3s;
}

.benefit-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0,0,0,0.1);
}

.benefit-icon {
  font-size: 3.5rem;
  margin-bottom: 1rem;
}

.benefit-item h3 {
  font-size: 1.3rem;
  margin-bottom: 0.8rem;
  color: var(--color-text-dark);
  font-weight: 700;
  font-family: var(--font-heading);
}

.benefit-item p {
  color: var(--color-text-medium);
  line-height: 1.6;
  font-family: var(--font-body);
}

/* Info Section */
.info-section {
  padding: 4rem 2rem;
  background: var(--color-background-white);
}

.info-content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
}

.info-box {
  background: var(--color-background-card);
  padding: 2rem;
  border-radius: var(--radius-card);
  border-left: 4px solid var(--color-primary);
}

.info-box h3 {
  font-size: 1.3rem;
  margin-bottom: 1.5rem;
  color: var(--color-text-dark);
  font-weight: 700;
  font-family: var(--font-heading);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.info-icon {
  width: 1.5rem;
  height: 1.5rem;
  color: var(--color-primary);
  display: inline-flex;
  align-items: center;
}

.info-icon :deep(svg) {
  width: 100%;
  height: 100%;
}

.info-box ul {
  list-style: none;
  padding: 0;
}

.info-box ul li {
  padding: 0.7rem 0;
  color: var(--color-text-medium);
  padding-left: 1.5rem;
  position: relative;
  border-bottom: 1px solid var(--color-border);
  font-family: var(--font-body);
}

.info-box ul li:last-child {
  border-bottom: none;
}

.info-box ul li::before {
  content: "→";
  position: absolute;
  left: 0;
  color: var(--color-primary);
  font-weight: bold;
}

/* Responsive */
@media (max-width: 768px) {
  .hero-content h1 {
    font-size: 2rem;
  }

  .hero-content p {
    font-size: 1.1rem;
  }

  .search-form {
    grid-template-columns: 1fr;
  }

  .flights-grid {
    grid-template-columns: 1fr;
  }

  .section-title {
    font-size: 2rem;
  }

  .trip-type {
    flex-direction: column;
    gap: 1rem;
  }
}

/* ===== ESTADOS DE CARGA, ERROR Y VACÍO ===== */
.loading-state,
.error-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
}

.loading-state p,
.error-state p,
.empty-state p {
  font-size: 1.2rem;
  color: var(--color-text-medium);
  font-family: var(--font-body);
  margin-top: 1rem;
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 4px solid var(--color-border);
  border-top: 4px solid var(--color-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.btn-retry {
  margin-top: 1rem;
  padding: 0.75rem 2rem;
  background: var(--color-primary-gradient);
  color: var(--color-text-white);
  border: none;
  border-radius: var(--radius-button);
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.3s, box-shadow 0.3s;
  font-family: var(--font-button);
}

.btn-retry:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-button);
}

.error-state p {
  color: #dc3545;
}
</style>