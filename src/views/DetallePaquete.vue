<template>
  <div class="detalle-paquete-page">
    <!-- Loading State -->
    <div v-if="loading" class="loading-container">
      <div class="spinner"></div>
      <p>Cargando información del paquete...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-container">
      <div class="error-icon"></div>
      <h2>Error al cargar el paquete</h2>
      <p>{{ error }}</p>
      <button class="btn-volver" @click="$router.back()">
        Volver
      </button>
    </div>

    <!-- Content -->
    <div v-else-if="paquete" class="detalle-content">
      <!-- Header con título y compartir -->
      <div class="header-paquete">
        <div class="header-left">
          <span class="badge-destino">{{ paquete.region_nombre }} • {{ paquete.pais_nombre }}</span>
          <h1 class="titulo-principal">{{ paquete.titulo }}</h1>
          <p class="subtitulo">{{ paquete.duracion_dias }} días / {{ paquete.duracion_noches }} noches • {{ paquete.tipo_paquete_display }} • {{ paquete.aerolinea_nombre }}</p>
        </div>
        <div class="header-right">
          <button class="btn-compartir" @click="compartir">
            <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
              <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z"/>
            </svg>
            Compartir
          </button>
        </div>
      </div>

      <!-- Contenido Principal -->
      <div class="main-grid">
        <!-- Columna Izquierda: Imagen y Detalles -->
        <div class="columna-izquierda">
          <!-- Imagen Principal -->
          <div class="imagen-principal">
            <img :src="paquete.imagen_url" :alt="paquete.titulo" />
          </div>

          <!-- Descripción del Destino -->
          <div class="seccion-descripcion">
            <h2 class="titulo-destino">{{ paquete.ciudad_nombre?.toUpperCase() || paquete.pais_nombre?.toUpperCase() }}</h2>
            <p class="descripcion-extensa">{{ paquete.descripcion_extensa || paquete.descripcion_corta }}</p>
          </div>

          <!-- Título del Tour -->
          <div class="tour-titulo">
            <span class="dias-destino">{{ paquete.duracion_dias }} DÍAS EN <strong>{{ paquete.ciudad_nombre?.toUpperCase() }}</strong></span>
            <h3>TOUR A <span class="destacado">{{ paquete.pais_nombre?.toUpperCase() }}</span></h3>
          </div>

          <!-- Salidas -->
          <div class="salidas-info">
            <h4>SALIDAS <span class="anio">{{ obtenerAnioSalida() }}</span></h4>
            <p class="fechas-salida">{{ obtenerMesSalida() }}</p>
            <p class="reserva-inmediata">¡Reserva inmediata <span class="stock">hasta agotar stock!</span></p>
            <p class="oferta-aplica">
              Oferta aplica para <span class="viajar">VIAJAR</span> del {{ formatearFecha(paquete.precio_aplica_desde) }} al {{ formatearFecha(paquete.precio_aplica_hasta) }}
            </p>
          </div>

          <!-- Programa Incluye -->
          <div class="seccion-informacion">
            <h3 class="seccion-titulo azul">PROGRAMA INCLUYE</h3>
            <div class="seccion-contenido" v-html="formatearContenido(paquete.programa_incluye)"></div>
          </div>

          <!-- No Incluye -->
          <div class="seccion-informacion">
            <h3 class="seccion-titulo azul-oscuro">NO INCLUYE</h3>
            <div class="seccion-contenido" v-html="formatearContenido(paquete.no_incluye)"></div>
          </div>

          <!-- Como Reservar -->
          <div class="seccion-informacion">
            <h3 class="seccion-titulo azul-oscuro">¿CÓMO RESERVAR?</h3>
            <div class="seccion-contenido" v-html="formatearContenido(paquete.como_reservar)"></div>
          </div>

          <!-- Importante -->
          <div class="seccion-informacion">
            <h3 class="seccion-titulo azul-oscuro">IMPORTANTE</h3>
            <div class="seccion-contenido" v-html="formatearContenido(paquete.importante)"></div>
          </div>

          <!-- Requisitos de Viaje -->
          <div class="seccion-informacion">
            <h3 class="seccion-titulo azul-oscuro">REQUISITOS DE VIAJE</h3>
            <div class="seccion-contenido" v-html="formatearContenido(paquete.requisitos_viaje)"></div>
          </div>

          <!-- Formas de Pago -->
          <div class="seccion-informacion">
            <h3 class="seccion-titulo azul-oscuro">FORMAS DE PAGO</h3>
            <div class="seccion-contenido" v-html="formatearContenido(paquete.formas_pago)"></div>
          </div>

          <!-- Política de Cancelación -->
          <div class="seccion-informacion">
            <h3 class="seccion-titulo azul-oscuro">POLÍTICA DE CANCELACIÓN DE VIAJE</h3>
            <div class="seccion-contenido" v-html="formatearContenido(paquete.politica_cancelacion)"></div>
          </div>
        </div>

        <!-- Columna Derecha: Panel de Detalles -->
        <aside class="columna-derecha">
          <!-- Detalles del Paquete -->
          <div class="panel-detalles">
            <h3 class="panel-titulo">Detalles:</h3>
            
            <div class="detalle-item">
              <span class="label">Salidas:</span>
              <span class="valor">{{ paquete.fecha_salidas_texto }}</span>
            </div>

            <div class="detalle-item">
              <span class="label">Temporada:</span>
              <span class="valor link">{{ paquete.temporada_display }}</span>
            </div>

            <div class="detalle-item">
              <span class="label">Tipo de Viaje:</span>
              <span class="valor link">{{ paquete.tipo_viaje_display }}</span>
            </div>

            <div class="detalle-item">
              <span class="label">Tipo de paquete:</span>
              <span class="valor link">{{ paquete.tipo_paquete_display }}</span>
            </div>

            <div class="detalle-item">
              <span class="label">Aplica precios:</span>
              <div class="valor-multilinea">
                <span>Desde: {{ formatearFecha(paquete.precio_aplica_desde) }}</span>
                <span>Hasta: {{ formatearFecha(paquete.precio_aplica_hasta) }}</span>
              </div>
            </div>

            <div class="detalle-item">
              <span class="label">Aerolínea:</span>
              <div class="aerolinea-info">
                <img v-if="paquete.aerolinea_logo" :src="paquete.aerolinea_logo" :alt="paquete.aerolinea_nombre" class="aerolinea-logo" />
                <span v-else class="valor link">{{ paquete.aerolinea_nombre }}</span>
              </div>
            </div>
          </div>

          <!-- Destino -->
          <div class="panel-destino">
            <h3 class="panel-titulo verde">Destino</h3>
            <p class="destino-completo">{{ paquete.pais_nombre }} - {{ paquete.ciudad_nombre }}</p>
            
            <div class="ubicacion">
              <span class="label">Ubicación:</span>
              <div class="mapa-container">
                <!-- Mapa embebido -->
                <iframe 
                  v-if="mapaEmbedUrl"
                  :src="mapaEmbedUrl"
                  class="mapa-iframe"
                  allowfullscreen=""
                  loading="lazy"
                  referrerpolicy="no-referrer-when-downgrade">
                </iframe>
                <a v-if="paquete.ubicacion_mapa_url" :href="paquete.ubicacion_mapa_url" target="_blank" class="ver-mapa">
                  <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                  </svg>
                  Ver en mapa
                </a>
              </div>
            </div>

            <!-- Bandera del País -->
            <div class="bandera-pais" v-if="paquete.pais_bandera">
              <img :src="paquete.pais_bandera" :alt="paquete.pais_nombre" />
              <span>{{ paquete.pais_nombre }}</span>
            </div>
          </div>

          <!-- Información Adicional -->
          <div class="panel-info-adicional">
            <div class="info-item" v-if="paquete.idioma">
              <span class="label">Idioma:</span>
              <span class="valor">{{ paquete.idioma }}</span>
            </div>

            <div class="info-item" v-if="paquete.moneda_local">
              <span class="label">Moneda:</span>
              <span class="valor">{{ paquete.moneda_local }}</span>
            </div>

            <div class="info-item" v-if="paquete.lugares_destacados">
              <span class="label">Destacados:</span>
              <ul class="lista-destacados">
                <li v-for="(lugar, index) in paquete.lugares_destacados_lista" :key="index">
                  {{ lugar }}
                </li>
              </ul>
            </div>

            <div class="info-item" v-if="paquete.documentos_requeridos">
              <span class="label">Documentos:</span>
              <div class="valor" v-html="formatearContenido(paquete.documentos_requeridos)"></div>
            </div>

            <div class="info-item" v-if="paquete.temperatura">
              <span class="label">Temperatura:</span>
              <span class="valor">{{ paquete.temperatura }} ºC</span>
            </div>
          </div>

          <!-- Precio -->
          <div class="panel-precio">
            <span class="desde-badge">DESDE</span>
            <span class="precio-valor">${{ formatearPrecio(paquete.precio) }}</span>
            <span class="moneda">{{ paquete.moneda }}</span>
          </div>

          <!-- Paquete Incluye Icons -->
          <div class="panel-incluye">
            <h4>PAQUETE INCLUYE:</h4>
            <div class="incluye-icons">
              <div v-if="paquete.incluye_vuelo" class="icon-item" title="Vuelo">
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/></svg>
                <span>Vuelo</span>
              </div>
              <div v-if="paquete.incluye_hotel" class="icon-item" title="Hotel">
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 13c1.66 0 3-1.34 3-3S8.66 7 7 7s-3 1.34-3 3 1.34 3 3 3zm12-6h-8v7H3V5H1v15h2v-3h18v3h2v-9c0-2.21-1.79-4-4-4z"/></svg>
                <span>Hotel</span>
              </div>
              <div v-if="paquete.incluye_alimentacion" class="icon-item" title="Alimentación">
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M11 9H9V2H7v7H5V2H3v7c0 2.12 1.66 3.84 3.75 3.97V22h2.5v-9.03C11.34 12.84 13 11.12 13 9V2h-2v7zm5-3v8h2.5v8H21V2c-2.76 0-5 2.24-5 4z"/></svg>
                <span>Alimentación</span>
              </div>
              <div v-if="paquete.incluye_traslados" class="icon-item" title="Traslados">
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/></svg>
                <span>Traslados</span>
              </div>
              <div v-if="paquete.incluye_tours" class="icon-item" title="Tours">
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 10.9c-.61 0-1.1.49-1.1 1.1s.49 1.1 1.1 1.1c.61 0 1.1-.49 1.1-1.1s-.49-1.1-1.1-1.1zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm2.19 12.19L6 18l3.81-8.19L18 6l-3.81 8.19z"/></svg>
                <span>Tours</span>
              </div>
              <div v-if="paquete.incluye_seguro" class="icon-item" title="Seguro">
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/></svg>
                <span>Seguro</span>
              </div>
            </div>
          </div>

          <!-- Botón Contacto / Reserva -->
          <button class="btn-reservar" @click="contactar">
            <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
              <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
            </svg>
            CONTACTAR PARA RESERVAR
          </button>

          <!-- Ver PDF si existe -->
          <button v-if="paquete.pdf_url" class="btn-ver-pdf" @click="verPdf">
            <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
              <path d="M20 2H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-8.5 7.5c0 .83-.67 1.5-1.5 1.5H9v2H7.5V7H10c.83 0 1.5.67 1.5 1.5v1zm5 2c0 .83-.67 1.5-1.5 1.5h-2.5V7H15c.83 0 1.5.67 1.5 1.5v3zm4-3H19v1h1.5V11H19v2h-1.5V7h3v1.5zM9 9.5h1v-1H9v1zM4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm10 5.5h1v-3h-1v3z"/>
            </svg>
            VER PDF DETALLADO
          </button>
        </aside>
      </div>
    </div>

    <!-- Botón Volver -->
    <button class="btn-back-floating" @click="volver">
      <span class="arrow">←</span> Volver
    </button>

    <!-- MODAL VISOR DE PDF -->
    <ModalPdfViewer 
      v-model:visible="mostrarModalPdf"
      :pdfUrl="paquete?.pdf_url || ''"
      :titulo="paquete?.titulo || 'Información del paquete'"
      :subtitulo="`${paquete?.duracion_dias || ''} días / ${paquete?.duracion_noches || ''} noches - ${paquete?.pais_nombre || ''}`"
      @contactar="handleContactarDesdePdf"
    />

    <!-- MODAL DE CONTACTO -->
    <ModalContacto 
      v-model:visible="mostrarModalContacto"
      :mensajePredefinido="mensajeReserva"
      :mensajeReadonly="true"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getPaquete } from '../services/api.js'
import ModalPdfViewer from '../components/ModalPdfViewer.vue'
import ModalContacto from '../components/ModalContacto.vue'

const route = useRoute()
const router = useRouter()

const paquete = ref(null)
const loading = ref(true)
const error = ref(null)

// Estados para los modales
const mostrarModalPdf = ref(false)
const mostrarModalContacto = ref(false)
const mensajeReserva = ref('')

onMounted(async () => {
  const id = route.params.id
  if (!id) {
    error.value = 'ID de paquete no válido'
    loading.value = false
    return
  }

  try {
    paquete.value = await getPaquete(id)
  } catch (err) {
    console.error('Error cargando paquete:', err)
    error.value = 'No se pudo cargar la información del paquete'
  } finally {
    loading.value = false
  }
})

// Utilidades de formato
const obtenerAnioSalida = () => {
  if (paquete.value?.fecha_salidas_texto) {
    const match = paquete.value.fecha_salidas_texto.match(/\d{4}/)
    return match ? match[0] : new Date().getFullYear()
  }
  return new Date().getFullYear()
}

const obtenerMesSalida = () => {
  if (paquete.value?.fecha_salidas_texto) {
    const texto = paquete.value.fecha_salidas_texto
    const index = texto.search(/[a-zA-Z]/)
    return index > 0 ? texto.substring(index) : texto
  }
  return ''
}

const formatearPrecio = (precio) => {
  if (!precio) return '0.00'
  const num = parseFloat(precio)
  return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const formatearFecha = (fecha) => {
  if (!fecha) return ''
  const date = new Date(fecha)
  return date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

const formatearContenido = (texto) => {
  if (!texto) return ''
  // Convertir saltos de línea a <br> y mantener el formato
  return texto
    .replace(/\n/g, '<br>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
}

// Computed para convertir URL de OpenStreetMap a formato embed
const mapaEmbedUrl = computed(() => {
  if (!paquete.value?.ubicacion_mapa_url) return null
  
  const url = paquete.value.ubicacion_mapa_url
  
  try {
    // Si ya es una URL de embed, usarla directamente
    if (url.includes('/export/embed.html')) {
      return url
    }
    
    // Si es una URL de OpenStreetMap normal: https://www.openstreetmap.org/?#map=12/-2.1703/-79.9506
    // Extraer zoom, lat, lng del formato #map=zoom/lat/lng
    const osmMatch = url.match(/#map=([\d]+)\/([\-\d.]+)\/([\-\d.]+)/)
    if (osmMatch) {
      const zoom = parseInt(osmMatch[1])
      const lat = parseFloat(osmMatch[2])
      const lng = parseFloat(osmMatch[3])
      
      // Calcular bounding box basado en el zoom
      const offset = 0.05 / (zoom / 12) // Ajustar según el zoom
      const minLng = lng - offset
      const minLat = lat - offset
      const maxLng = lng + offset
      const maxLat = lat + offset
      
      return `https://www.openstreetmap.org/export/embed.html?bbox=${minLng},${minLat},${maxLng},${maxLat}&layer=mapnik&marker=${lat},${lng}`
    }
    
    // Si es URL de Google Maps, extraer coordenadas
    const coordMatch = url.match(/@([\-\d.]+),([\-\d.]+)/)
    if (coordMatch) {
      const lat = parseFloat(coordMatch[1])
      const lng = parseFloat(coordMatch[2])
      const offset = 0.05
      return `https://www.openstreetmap.org/export/embed.html?bbox=${lng-offset},${lat-offset},${lng+offset},${lat+offset}&layer=mapnik&marker=${lat},${lng}`
    }
    
    return null
  } catch (e) {
    console.error('Error procesando URL del mapa:', e)
    return null
  }
})

// Acciones
const compartir = async () => {
  if (navigator.share) {
    try {
      await navigator.share({
        title: paquete.value.titulo,
        text: paquete.value.descripcion_corta,
        url: window.location.href
      })
    } catch (err) {
      console.log('Error sharing:', err)
    }
  } else {
    // Fallback: copiar URL al portapapeles
    navigator.clipboard.writeText(window.location.href)
    alert('¡Enlace copiado al portapapeles!')
  }
}

// Generar mensaje predeterminado del paquete
const generarMensajePaquete = () => {
  if (!paquete.value) return ''
  const p = paquete.value
  return `Hola, estoy interesado en el paquete: ${p.titulo}\n\nDestino: ${p.pais_nombre} - ${p.ciudad_nombre || ''}\nDuración: ${p.duracion_dias} días / ${p.duracion_noches} noches\nTipo: ${p.tipo_paquete_display || p.tipo_viaje_display || ''}\nPrecio desde: $${p.precio} ${p.moneda || 'USD'}\n\nPor favor, contáctenme para más información sobre este paquete.`
}

const contactar = () => {
  mensajeReserva.value = generarMensajePaquete()
  mostrarModalContacto.value = true
}

const verPdf = () => {
  if (paquete.value?.pdf_url) {
    mensajeReserva.value = generarMensajePaquete()
    mostrarModalPdf.value = true
  }
}

const handleContactarDesdePdf = () => {
  mostrarModalContacto.value = true
}

// Volver a la pantalla de paquetes con el contexto correcto
const volver = () => {
  if (paquete.value) {
    router.push({
      path: '/paquetes',
      query: {
        region: paquete.value.region,
        pais: paquete.value.pais_destino
      }
    })
  } else {
    router.push('/paquetes')
  }
}
</script>

<style scoped>
/* Variables */
.detalle-paquete-page {
  --color-primary: #c9a227;
  --color-primary-dark: #a68419;
  --color-primary-light: #e6c14a;
  --color-verde: #27ae60;
  --color-verde-oscuro: #1e8449;
  --color-verde-light: #2ecc71;
  --color-azul: #3498db;
  --color-azul-oscuro: #2980b9;
  --color-rojo: #e74c3c;
  --color-rojo-oscuro: #c0392b;
  --color-naranja: #f39c12;
  --color-naranja-oscuro: #d68910;
  --color-gris: #7f8c8d;
  --color-gris-claro: #f8f9fa;
  --color-texto: #2c3e50;
  --color-texto-light: #34495e;
  --gradient-gold: linear-gradient(135deg, #c9a227 0%, #e6c14a 50%, #c9a227 100%);
  --gradient-verde: linear-gradient(135deg, #27ae60 0%, #2ecc71 100%);
  --gradient-rojo: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
  --shadow-card: 0 4px 15px rgba(0,0,0,0.1);
  --shadow-hover: 0 8px 25px rgba(0,0,0,0.15);
}

.detalle-paquete-page {
  padding: 30px 40px;
  max-width: 1400px;
  margin: 0 auto;
  background-color: #fff;
  margin-top: 160px;
}

/* Loading & Error */
.loading-container,
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 50vh;
  gap: 20px;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid var(--color-gris-claro);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.error-icon {
  font-size: 48px;
}

/* Header Paquete */
.header-paquete {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 30px;
  padding-bottom: 25px;
  border-bottom: 3px solid var(--color-primary);
}

.header-left {
  flex: 1;
}

.badge-destino {
  display: inline-block;
  background: var(--gradient-gold);
  color: #fff;
  padding: 8px 16px;
  border-radius: 25px;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  margin-bottom: 12px;
  box-shadow: 0 3px 10px rgba(201, 162, 39, 0.3);
}

.titulo-principal {
  font-size: 32px;
  font-weight: 800;
  color: var(--color-texto);
  margin: 0 0 10px 0;
  line-height: 1.2;
}

.subtitulo {
  font-size: 15px;
  color: var(--color-gris);
  margin: 0;
  font-weight: 400;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 10px;
}

.btn-compartir {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  border: 2px solid var(--color-verde);
  background: transparent;
  color: var(--color-verde);
  border-radius: 25px;
  font-weight: 700;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(39, 174, 96, 0.2);
}

.btn-compartir:hover {
  background: var(--gradient-verde);
  border-color: transparent;
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 6px 15px rgba(39, 174, 96, 0.4);
}

.btn-compartir svg {
  width: 18px;
  height: 18px;
}

/* Grid Principal */
.main-grid {
  display: grid;
  grid-template-columns: 1fr 350px;
  gap: 30px;
}

/* Columna Izquierda */
.columna-izquierda {
  display: flex;
  flex-direction: column;
  gap: 25px;
}

.imagen-principal {
  width: 100%;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: var(--shadow-card);
  transition: all 0.3s ease;
}

.imagen-principal:hover {
  box-shadow: var(--shadow-hover);
  transform: translateY(-3px);
}

.imagen-principal img {
  width: 100%;
  height: auto;
  display: block;
}

/* Descripción */
.seccion-descripcion {
  padding: 30px;
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
  border-radius: 16px;
  border-left: 5px solid var(--color-primary);
  box-shadow: var(--shadow-card);
  position: relative;
  overflow: hidden;
}

.seccion-descripcion::before {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  width: 150px;
  height: 150px;
  background: linear-gradient(135deg, rgba(201, 162, 39, 0.1) 0%, transparent 70%);
  border-radius: 0 16px 0 100%;
}

.titulo-destino {
  font-size: 26px;
  font-weight: 800;
  color: var(--color-primary);
  margin: 0 0 15px 0;
  letter-spacing: 1px;
  position: relative;
}

.descripcion-extensa {
  color: var(--color-texto-light);
  line-height: 1.8;
  margin: 0;
  font-size: 1rem;
}

/* Tour Título */
.tour-titulo {
  text-align: center;
  padding: 35px 25px;
  background: linear-gradient(135deg, #fff 0%, #fdf9e8 100%);
  border-radius: 16px;
  border: 2px solid rgba(201, 162, 39, 0.2);
  box-shadow: 0 4px 20px rgba(201, 162, 39, 0.1);
}

.dias-destino {
  display: inline-block;
  font-size: 18px;
  color: var(--color-primary);
  margin-bottom: 12px;
  font-weight: 600;
  background: linear-gradient(135deg, rgba(201, 162, 39, 0.15) 0%, rgba(201, 162, 39, 0.05) 100%);
  padding: 8px 20px;
  border-radius: 25px;
}

.dias-destino strong {
  color: var(--color-primary-dark);
  font-weight: 800;
}

.tour-titulo h3 {
  font-size: 28px;
  color: var(--color-texto);
  margin: 0;
  font-weight: 800;
  letter-spacing: 0.5px;
}

.tour-titulo .destacado {
  color: var(--color-primary);
  background: var(--gradient-gold);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* Salidas Info */
.salidas-info {
  text-align: center;
  padding: 30px 25px;
  background: linear-gradient(180deg, #ffffff 0%, #f8f9fa 50%, #ecf0f1 100%);
  border-radius: 16px;
  border: 1px solid rgba(0,0,0,0.05);
  box-shadow: var(--shadow-card);
}

.salidas-info h4 {
  font-size: 20px;
  font-weight: 700;
  color: var(--color-texto);
  margin: 0 0 12px 0;
  letter-spacing: 1px;
}

.salidas-info .anio {
  color: var(--color-verde);
  font-weight: 800;
  font-size: 24px;
}

.fechas-salida {
  color: var(--color-texto-light);
  margin: 12px 0;
  font-size: 1.1rem;
  font-weight: 500;
}

.reserva-inmediata {
  display: block;
  color: #e74c3c;
  font-weight: 700;
  margin: 15px 0;
  font-size: 1rem;
  text-align: center;
}

.reserva-inmediata .stock {
  color: #c0392b;
  font-weight: 800;
}

.oferta-aplica {
  color: var(--color-texto-light);
  font-weight: 500;
  font-size: 0.95rem;
  margin-top: 10px;
  padding: 10px 15px;
  background: rgba(52, 152, 219, 0.08);
  border-radius: 8px;
  display: inline-block;
}

.oferta-aplica .viajar {
  color: var(--color-naranja);
  font-weight: 700;
  text-transform: uppercase;
}

/* Secciones de Información */
.seccion-informacion {
  padding: 25px;
  background: #fff;
  border-radius: 12px;
  margin-bottom: 15px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.04);
  border: 1px solid rgba(0,0,0,0.04);
  transition: all 0.3s ease;
}

.seccion-informacion:hover {
  box-shadow: 0 4px 15px rgba(0,0,0,0.08);
  transform: translateY(-2px);
}

.seccion-titulo {
  font-size: 17px;
  font-weight: 700;
  margin: 0 0 18px 0;
  padding-bottom: 12px;
  border-bottom: 2px solid;
  display: flex;
  align-items: center;
  gap: 10px;
}

.seccion-titulo::before {
  content: '';
  width: 4px;
  height: 20px;
  border-radius: 2px;
}

.seccion-titulo.azul {
  color: var(--color-azul);
  border-bottom-color: rgba(52, 152, 219, 0.2);
}

.seccion-titulo.azul::before {
  background: var(--color-azul);
}

.seccion-titulo.azul-oscuro {
  color: var(--color-azul-oscuro);
  border-bottom-color: rgba(41, 128, 185, 0.2);
}

.seccion-titulo.azul-oscuro::before {
  background: var(--color-azul-oscuro);
}

.seccion-contenido {
  color: var(--color-texto-light);
  line-height: 1.9;
  font-size: 0.95rem;
}

.seccion-contenido :deep(strong) {
  color: var(--color-azul-oscuro);
}

/* Columna Derecha */
.columna-derecha {
  display: flex;
  flex-direction: column;
  gap: 20px;
  position: sticky;
  top: 180px;
  height: fit-content;
}

/* Panel de Detalles */
.panel-detalles,
.panel-destino,
.panel-info-adicional {
  padding: 22px;
  background-color: #fff;
  border: none;
  border-radius: 12px;
  box-shadow: var(--shadow-card);
  transition: all 0.3s ease;
}

.panel-detalles:hover,
.panel-destino:hover,
.panel-info-adicional:hover {
  box-shadow: var(--shadow-hover);
}

.panel-titulo {
  font-size: 18px;
  font-weight: 700;
  margin: 0 0 15px 0;
  padding-bottom: 12px;
  border-bottom: 3px solid var(--color-primary);
  color: var(--color-texto);
}

.panel-titulo.verde {
  border-bottom-color: var(--color-verde);
  color: var(--color-verde-oscuro);
}

.detalle-item,
.info-item {
  margin-bottom: 14px;
  padding-bottom: 10px;
  border-bottom: 1px solid rgba(0,0,0,0.05);
}

.detalle-item:last-child,
.info-item:last-child {
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
}

.detalle-item .label,
.info-item .label {
  display: block;
  font-weight: 700;
  color: var(--color-texto);
  margin-bottom: 5px;
  font-size: 0.9rem;
}

.detalle-item .valor,
.info-item .valor {
  color: var(--color-texto-light);
  font-size: 0.95rem;
}

.detalle-item .valor.link {
  color: var(--color-azul);
  cursor: pointer;
  font-weight: 500;
  transition: color 0.2s ease;
}

.detalle-item .valor.link:hover {
  color: var(--color-azul-oscuro);
}

.valor-multilinea {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 14px;
  font-weight: 600;
}

.valor-multilinea span {
  color: var(--color-naranja);
}

.aerolinea-info {
  margin-top: 5px;
}

.aerolinea-logo {
  max-height: 30px;
  width: auto;
}

/* Destino */
.destino-completo {
  color: var(--color-gris);
  margin: 0 0 15px 0;
}

.ubicacion {
  margin-bottom: 20px;
}

.mapa-container {
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-top: 10px;
}

.mapa-iframe {
  width: 100%;
  height: 300px;
  border: none;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  overflow: hidden;
}

.mapa-iframe:hover {
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}

.ver-mapa {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: var(--color-verde);
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  align-self: flex-start;
  padding: 8px 12px;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.ver-mapa:hover {
  background-color: rgba(76, 175, 80, 0.1);
  color: var(--color-verde-oscuro);
  text-decoration: none;
}

.bandera-pais {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  background-color: var(--color-gris-claro);
  border-radius: 8px;
}

.bandera-pais img {
  width: 50px;
  height: auto;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.bandera-pais span {
  font-weight: 600;
  color: var(--color-texto);
}

/* Lista Destacados */
.lista-destacados {
  list-style: none;
  padding: 0;
  margin: 5px 0 0 0;
}

.lista-destacados li {
  color: var(--color-azul);
  font-size: 14px;
  margin-bottom: 4px;
}

/* Panel Precio */
.panel-precio {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 25px;
  background: var(--gradient-gold);
  border-radius: 12px;
  color: white;
  box-shadow: 0 6px 20px rgba(201, 162, 39, 0.4);
  transition: all 0.3s ease;
}

.panel-precio:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(201, 162, 39, 0.5);
}

.desde-badge {
  background-color: rgba(255,255,255,0.25);
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.precio-valor {
  font-size: 32px;
  font-weight: 700;
}

.moneda {
  font-size: 14px;
  opacity: 0.9;
}

/* Panel Incluye */
.panel-incluye {
  padding: 22px;
  background: linear-gradient(135deg, #f8f9fa 0%, #ecf0f1 100%);
  border-radius: 12px;
  box-shadow: var(--shadow-card);
}

.panel-incluye h4 {
  font-size: 15px;
  font-weight: 700;
  color: var(--color-texto);
  margin: 0 0 18px 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.incluye-icons {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.incluye-icons .icon-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 12px 8px;
  background: white;
  border-radius: 10px;
  color: var(--color-primary-dark);
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.incluye-icons .icon-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(201, 162, 39, 0.2);
  color: var(--color-primary);
}

.incluye-icons .icon-item svg {
  width: 28px;
  height: 28px;
}

.incluye-icons .icon-item span {
  font-size: 11px;
  text-align: center;
}

/* Botones de Acción */
.btn-reservar,
.btn-ver-pdf {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  width: 100%;
  padding: 16px 24px;
  border: none;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.btn-reservar {
  background: var(--gradient-verde);
  color: white;
  box-shadow: 0 4px 15px rgba(39, 174, 96, 0.4);
}

.btn-reservar:hover {
  background: linear-gradient(135deg, var(--color-verde-oscuro) 0%, var(--color-verde) 100%);
  transform: translateY(-3px);
  box-shadow: 0 6px 20px rgba(39, 174, 96, 0.5);
}

.btn-ver-pdf {
  background: var(--gradient-rojo);
  color: white;
  box-shadow: 0 4px 15px rgba(231, 76, 60, 0.4);
}

.btn-ver-pdf:hover {
  background: linear-gradient(135deg, var(--color-rojo-oscuro) 0%, var(--color-rojo) 100%);
  transform: translateY(-3px);
  box-shadow: 0 6px 20px rgba(231, 76, 60, 0.5);
}

/* Botón Volver Flotante */
.btn-back-floating {
  position: fixed;
  bottom: 30px;
  left: 50%;
  transform: translateX(-50%);
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: var(--gradient-gold);
  border: none;
  color: white;
  padding: 14px 28px;
  border-radius: 50px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 700;
  box-shadow: 0 4px 15px rgba(201, 162, 39, 0.25);
  transition: all 0.3s ease;
  z-index: 100;
}

.btn-back-floating:hover {
  background: linear-gradient(135deg, var(--color-primary-dark) 0%, var(--color-primary) 100%);
  transform: translateX(-50%) translateY(-4px);
  box-shadow: 0 6px 20px rgba(201, 162, 39, 0.35);
}

.btn-back-floating .arrow {
  font-size: 1.3rem;
  transition: transform 0.3s ease;
}

.btn-back-floating:hover .arrow {
  transform: translateX(-4px);
}

/* Responsive */
@media (max-width: 1200px) {
  .detalle-paquete-page {
    padding: 25px 30px;
  }
  
  .main-grid {
    grid-template-columns: 1fr 320px;
    gap: 25px;
  }
}

@media (max-width: 1024px) {
  .main-grid {
    grid-template-columns: 1fr;
    gap: 30px;
  }

  /* En tablet/móvil, mantener el orden natural: imagen primero */
  .columna-izquierda {
    order: 1;
  }
  
  .columna-derecha {
    order: 2;
    display: flex;
    flex-direction: column;
    gap: 15px;
    position: static;
  }
  
  /* Mover imagen al principio de todo */
  .imagen-principal {
    order: -1;
  }
}

@media (max-width: 768px) {
  .detalle-paquete-page {
    padding: 20px 15px;
    margin-top: 140px;
  }

  .header-paquete {
    flex-direction: column;
    gap: 15px;
  }

  .header-right {
    width: 100%;
  }

  .btn-compartir {
    width: 100%;
    justify-content: center;
  }

  .titulo-principal {
    font-size: 24px;
  }

  .subtitulo {
    font-size: 13px;
  }

  .incluye-icons {
    grid-template-columns: repeat(3, 1fr);
  }
  
  .seccion-descripcion,
  .seccion-informacion {
    padding: 18px;
  }
  
  .titulo-destino {
    font-size: 18px;
  }
  
  .tour-titulo h3 {
    font-size: 20px;
  }
  
  .dias-destino {
    font-size: 16px;
  }
  
  .mapa-iframe {
    height: 220px;
  }
  
  .btn-back-floating {
    padding: 12px 20px;
    font-size: 0.9rem;
  }
  
  .precio-valor {
    font-size: 28px;
  }
}

@media (max-width: 576px) {
  .detalle-paquete-page {
    padding: 15px 12px;
    margin-top: 120px;
  }
  
  .header-paquete {
    padding-bottom: 15px;
    margin-bottom: 20px;
  }
  
  .badge-destino {
    font-size: 11px;
    padding: 6px 12px;
  }
  
  .titulo-principal {
    font-size: 20px;
  }
  
  .subtitulo {
    font-size: 12px;
  }
  
  .panel-detalles,
  .panel-destino,
  .panel-info-adicional,
  .panel-incluye {
    padding: 15px;
  }
  
  .panel-titulo {
    font-size: 16px;
  }
  
  .detalle-item .label,
  .info-item .label {
    font-size: 0.85rem;
  }
  
  .precio-valor {
    font-size: 26px;
  }
  
  .incluye-icons {
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
  }
  
  .incluye-icons .icon-item svg {
    width: 24px;
    height: 24px;
  }
  
  .incluye-icons .icon-item span {
    font-size: 10px;
  }
  
  .btn-reservar,
  .btn-ver-pdf {
    padding: 14px 18px;
    font-size: 13px;
  }
  
  .mapa-iframe {
    height: 180px;
  }
  
  .btn-back-floating {
    padding: 10px 16px;
    font-size: 0.85rem;
    bottom: 20px;
  }
  
  .seccion-titulo {
    font-size: 16px;
  }
  
  .seccion-contenido {
    font-size: 14px;
    line-height: 1.6;
  }
}

@media (max-width: 400px) {
  .detalle-paquete-page {
    padding: 12px 10px;
    margin-top: 110px;
  }
  
  .titulo-principal {
    font-size: 18px;
  }
  
  .precio-valor {
    font-size: 24px;
  }
  
  .btn-back-floating {
    left: 50%;
    transform: translateX(-50%);
    width: calc(100% - 24px);
    max-width: 260px;
    justify-content: center;
  }
  
  .btn-back-floating:hover {
    transform: translateX(-50%) translateY(-3px);
  }
}
</style>
