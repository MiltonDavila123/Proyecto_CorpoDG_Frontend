<script setup>
import { ref, watch, computed } from 'vue'
import { buscarAeropuertos } from '../services/api.js'

const emit = defineEmits(['buscar'])

// SVG Icons
const iconos = {
  avion: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/></svg>`,
  despegue: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M2.5 19h19v2h-19v-2zm19.57-9.36c-.21-.8-1.04-1.28-1.84-1.06L14.92 10l-6.9-6.43-1.93.51 4.14 7.17-4.97 1.33-1.97-1.54-1.45.39 2.59 4.49L21 11.49c.81-.23 1.28-1.05 1.07-1.85z"/></svg>`,
  aterrizaje: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M2.5 19h19v2h-19v-2zm17.34-13.47c-.23-.79-1.07-1.24-1.87-1.01l-4.93 1.34-7.27-3.07-1.93.51 5.01 5.02-4.97 1.33-.94-1.95-1.44.39 1.82 3.61.77 1.54L21.08 7.4c.79-.23 1.24-1.06 1.01-1.87l-.25-1z"/></svg>`,
  intercambiar: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M6.99 11L3 15l3.99 4v-3H14v-2H6.99v-3zM21 9l-3.99-4v3H10v2h7.01v3L21 9z"/></svg>`,
  buscar: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>`,
  calendario: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM9 10H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2zm-8 4H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2z"/></svg>`,
  persona: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>`,
  adulto: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/></svg>`,
  nino: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm9 7h-6v13h-2v-6h-2v6H9V9H3V7h18v2z"/></svg>`,
  bebe: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8 0-1.12.23-2.18.65-3.15C5.56 9.69 6.72 10.5 8 10.5c1.63 0 3.04-1.04 3.58-2.5h.84c.54 1.46 1.95 2.5 3.58 2.5 1.28 0 2.44-.81 3.35-1.65.42.97.65 2.03.65 3.15 0 4.41-3.59 8-8 8z"/></svg>`,
  clase: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M21 3H3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H3V5h18v14zM9 7H5v2h4V7zm10 0h-8v2h8V7zM5 11h4v2H5v-2zm8 0h6v2h-6v-2z"/></svg>`,
  idaVuelta: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M6.99 11L3 15l3.99 4v-3H14v-2H6.99v-3zM21 9l-3.99-4v3H10v2h7.01v3L21 9z"/></svg>`,
  soloIda: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"/></svg>`,
  menos: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M19 13H5v-2h14v2z"/></svg>`,
  mas: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>`,
  flecha: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M7 10l5 5 5-5z"/></svg>`
}

// Estado de los campos de aeropuertos
const origen = ref('')
const destino = ref('')
const origenCodigo = ref('')
const destinoCodigo = ref('')

// Estado tipo de viaje
const tipoViaje = ref('idaVuelta') // 'idaVuelta' o 'soloIda'

// Estado fechas
const fechaIda = ref('')
const fechaVuelta = ref('')

// Estado pasajeros
const adultos = ref(1)
const ninos = ref(0)
const infantes = ref(0)
const mostrarPasajeros = ref(false)

// Estado límite de resultados
const limiteResultados = ref(50)
const opcionesLimite = [20, 50, 100, 200]

// Estado clase
const claseSeleccionada = ref('Y')
const mostrarClases = ref(false)
const clases = [
  { codigo: 'Y', nombre: 'Economica' },
  { codigo: 'S', nombre: 'Economica Premium' },
  { codigo: 'C', nombre: 'Ejecutiva' },
  { codigo: 'J', nombre: 'Ejecutiva Premium' },
  { codigo: 'F', nombre: 'Primera Clase' },
  { codigo: 'P', nombre: 'Primera Clase Premium' }
]

const claseActual = computed(() => clases.find(c => c.codigo === claseSeleccionada.value))

// Total pasajeros
const totalPasajeros = computed(() => adultos.value + ninos.value + infantes.value)
const textoPasajeros = computed(() => {
  const partes = []
  if (adultos.value > 0) partes.push(`${adultos.value} Adulto${adultos.value > 1 ? 's' : ''}`)
  if (ninos.value > 0) partes.push(`${ninos.value} Nino${ninos.value > 1 ? 's' : ''}`)
  if (infantes.value > 0) partes.push(`${infantes.value} Infante${infantes.value > 1 ? 's' : ''}`)
  return partes.join(', ') || '1 Adulto'
})

// Estado de los dropdowns aeropuertos
const opcionesOrigen = ref([])
const opcionesDestino = ref([])
const mostrarDropdownOrigen = ref(false)
const mostrarDropdownDestino = ref(false)
const cargandoOrigen = ref(false)
const cargandoDestino = ref(false)

// Timeouts para debounce
let timeoutOrigen = null
let timeoutDestino = null
const DEBOUNCE_DELAY = 300

// Computed para ordenar resultados
const opcionesOrigenOrdenadas = computed(() => [...opcionesOrigen.value].reverse())
const opcionesDestinoOrdenadas = computed(() => [...opcionesDestino.value].reverse())

// Computed para validar si el formulario está completo
const formularioValido = computed(() => {
  const tieneOrigen = origenCodigo.value !== ''
  const tieneDestino = destinoCodigo.value !== ''
  const tieneFechaIda = fechaIda.value !== ''
  const tieneFechaVuelta = fechaVuelta.value !== ''
  
  if (tipoViaje.value === 'soloIda') {
    return tieneOrigen && tieneDestino && tieneFechaIda
  } else {
    return tieneOrigen && tieneDestino && tieneFechaIda && tieneFechaVuelta
  }
})

// Fecha minima (hoy)
const fechaMinima = computed(() => {
  const hoy = new Date()
  return hoy.toISOString().split('T')[0]
})

// ===== FUNCIONES DE BÚSQUEDA CON DEBOUNCE =====
const buscarOrigen = (query) => {
  if (timeoutOrigen) clearTimeout(timeoutOrigen)
  if (query.length < 2) {
    opcionesOrigen.value = []
    mostrarDropdownOrigen.value = false
    return
  }
  cargandoOrigen.value = true
  timeoutOrigen = setTimeout(async () => {
    try {
      const resultado = await buscarAeropuertos(query)
      opcionesOrigen.value = resultado.results || []
      mostrarDropdownOrigen.value = opcionesOrigen.value.length > 0
    } catch (error) {
      console.error('Error buscando aeropuertos:', error)
      opcionesOrigen.value = []
    } finally {
      cargandoOrigen.value = false
    }
  }, DEBOUNCE_DELAY)
}

const buscarDestino = (query) => {
  if (timeoutDestino) clearTimeout(timeoutDestino)
  if (query.length < 2) {
    opcionesDestino.value = []
    mostrarDropdownDestino.value = false
    return
  }
  cargandoDestino.value = true
  timeoutDestino = setTimeout(async () => {
    try {
      const resultado = await buscarAeropuertos(query)
      opcionesDestino.value = resultado.results || []
      mostrarDropdownDestino.value = opcionesDestino.value.length > 0
    } catch (error) {
      console.error('Error buscando aeropuertos:', error)
      opcionesDestino.value = []
    } finally {
      cargandoDestino.value = false
    }
  }, DEBOUNCE_DELAY)
}

// ===== SELECCIONAR OPCIÓN =====
let seleccionandoOrigen = false
let seleccionandoDestino = false

const seleccionarOrigen = (aeropuerto) => {
  seleccionandoOrigen = true
  origen.value = `${aeropuerto.codigo_iata} - ${aeropuerto.ciudad}`
  origenCodigo.value = aeropuerto.codigo_iata
  mostrarDropdownOrigen.value = false
  opcionesOrigen.value = []
}

const seleccionarDestino = (aeropuerto) => {
  seleccionandoDestino = true
  destino.value = `${aeropuerto.codigo_iata} - ${aeropuerto.ciudad}`
  destinoCodigo.value = aeropuerto.codigo_iata
  mostrarDropdownDestino.value = false
  opcionesDestino.value = []
}

// ===== WATCHERS =====
watch(origen, (nuevoValor) => {
  if (seleccionandoOrigen) {
    seleccionandoOrigen = false
    return
  }
  origenCodigo.value = ''
  buscarOrigen(nuevoValor)
})

watch(destino, (nuevoValor) => {
  if (seleccionandoDestino) {
    seleccionandoDestino = false
    return
  }
  destinoCodigo.value = ''
  buscarDestino(nuevoValor)
})

// Limpiar fecha vuelta si cambia a solo ida
watch(tipoViaje, (nuevo) => {
  if (nuevo === 'soloIda') fechaVuelta.value = ''
})

// ===== CERRAR DROPDOWNS =====
const cerrarDropdowns = () => {
  setTimeout(() => {
    mostrarDropdownOrigen.value = false
    mostrarDropdownDestino.value = false
  }, 200)
}

const cerrarPasajeros = () => {
  setTimeout(() => { mostrarPasajeros.value = false }, 200)
}

const cerrarClases = () => {
  setTimeout(() => { mostrarClases.value = false }, 200)
}

// ===== PASAJEROS =====
const incrementar = (tipo) => {
  if (tipo === 'adultos' && adultos.value < 9) adultos.value++
  if (tipo === 'ninos' && ninos.value < 9) ninos.value++
  if (tipo === 'infantes' && infantes.value < adultos.value) infantes.value++
}

const decrementar = (tipo) => {
  if (tipo === 'adultos' && adultos.value > 1) {
    adultos.value--
    if (infantes.value > adultos.value) infantes.value = adultos.value
  }
  if (tipo === 'ninos' && ninos.value > 0) ninos.value--
  if (tipo === 'infantes' && infantes.value > 0) infantes.value--
}

// ===== VALIDACIÓN Y BUSCAR VUELOS =====
const mensajeError = ref('')
let timeoutError = null

const mostrarError = (msg) => {
  mensajeError.value = msg
  if (timeoutError) clearTimeout(timeoutError)
  timeoutError = setTimeout(() => { mensajeError.value = '' }, 4000)
}

const handleBuscar = () => {
  // Validaciones
  if (!origenCodigo.value) {
    mostrarError('Debe seleccionar un aeropuerto de origen.')
    return
  }
  if (!destinoCodigo.value) {
    mostrarError('Debe seleccionar un aeropuerto de destino.')
    return
  }
  if (!fechaIda.value) {
    mostrarError('Debe seleccionar la fecha de ida.')
    return
  }
  if (tipoViaje.value === 'idaVuelta' && !fechaVuelta.value) {
    mostrarError('Debe seleccionar la fecha de vuelta.')
    return
  }

  mensajeError.value = ''

  emit('buscar', {
    origen: origenCodigo.value,
    destino: destinoCodigo.value,
    origenLabel: origen.value,
    destinoLabel: destino.value,
    tipoViaje: tipoViaje.value,
    fechaIda: fechaIda.value,
    fechaVuelta: tipoViaje.value === 'idaVuelta' ? fechaVuelta.value : '',
    adultos: adultos.value,
    ninos: ninos.value,
    infantes: infantes.value,
    clase: claseSeleccionada.value,
    limite: limiteResultados.value
  })
}

// ===== REFS PARA INPUTS DE FECHA =====
const inputFechaIda = ref(null)
const inputFechaVuelta = ref(null)

const abrirCalendario = (tipo) => {
  const input = tipo === 'ida' ? inputFechaIda.value : inputFechaVuelta.value
  if (input) {
    try {
      input.showPicker()
    } catch {
      input.focus()
      input.click()
    }
  }
}

// Formatear fecha para mostrar en formato YYYY-MM-DD
const formatearFecha = (fecha) => {
  if (!fecha) return 'Seleccionar'
  // El v-model de input[type="date"] ya devuelve YYYY-MM-DD
  return fecha
}

// ===== INTERCAMBIAR =====
const intercambiar = () => {
  const tempValor = origen.value
  const tempCodigo = origenCodigo.value
  origen.value = destino.value
  origenCodigo.value = destinoCodigo.value
  destino.value = tempValor
  destinoCodigo.value = tempCodigo
}
</script>

<template>
  <section class="buscador-section">
    <div class="buscador-card">
      <div class="buscador-header">
        <span class="header-icon" v-html="iconos.avion"></span>
        <h2>Buscar Vuelos</h2>
      </div>

      <!-- Tipo de viaje -->
      <div class="tipo-viaje">
        <button 
          :class="['tipo-btn', { active: tipoViaje === 'idaVuelta' }]"
          @click="tipoViaje = 'idaVuelta'"
          type="button"
        >
          <span class="tipo-icon" v-html="iconos.idaVuelta"></span>
          Ida y Vuelta
        </button>
        <button 
          :class="['tipo-btn', { active: tipoViaje === 'soloIda' }]"
          @click="tipoViaje = 'soloIda'"
          type="button"
        >
          <span class="tipo-icon" v-html="iconos.soloIda"></span>
          Solo Ida
        </button>
      </div>
      
      <div class="buscador-form">
        <!-- Fila 1: Origen, Swap, Destino -->
        <div class="fila-aeropuertos">
          <!-- Origen -->
          <div class="campo">
            <label>
              <span class="label-icon" v-html="iconos.despegue"></span>
              Origen
            </label>
            <div class="input-wrapper">
              <input
                v-model="origen"
                type="text"
                placeholder="Ciudad o aeropuerto"
                @focus="mostrarDropdownOrigen = opcionesOrigen.length > 0"
                @blur="cerrarDropdowns"
                autocomplete="off"
              />
              <div v-if="cargandoOrigen" class="spinner"></div>
              <span v-else-if="origenCodigo" class="codigo">{{ origenCodigo }}</span>
              
              <ul v-if="mostrarDropdownOrigen && opcionesOrigenOrdenadas.length" class="dropdown">
                <li v-for="a in opcionesOrigenOrdenadas" :key="a.id" @mousedown="seleccionarOrigen(a)">
                  <span class="iata">{{ a.codigo_iata }}</span>
                  <div class="info">
                    <strong>{{ a.ciudad }}</strong>
                    <small>{{ a.nombre }}</small>
                    <small>{{ a.pais }}</small>
                  </div>
                </li>
              </ul>
            </div>
          </div>

          <!-- Swap -->
          <button class="btn-swap" @click="intercambiar" type="button" title="Intercambiar">
            <span class="swap-icon" v-html="iconos.intercambiar"></span>
          </button>

          <!-- Destino -->
          <div class="campo">
            <label>
              <span class="label-icon" v-html="iconos.aterrizaje"></span>
              Destino
            </label>
            <div class="input-wrapper">
              <input
                v-model="destino"
                type="text"
                placeholder="Ciudad o aeropuerto"
                @focus="mostrarDropdownDestino = opcionesDestino.length > 0"
                @blur="cerrarDropdowns"
                autocomplete="off"
              />
              <div v-if="cargandoDestino" class="spinner"></div>
              <span v-else-if="destinoCodigo" class="codigo">{{ destinoCodigo }}</span>
              
              <ul v-if="mostrarDropdownDestino && opcionesDestinoOrdenadas.length" class="dropdown">
                <li v-for="a in opcionesDestinoOrdenadas" :key="a.id" @mousedown="seleccionarDestino(a)">
                  <span class="iata">{{ a.codigo_iata }}</span>
                  <div class="info">
                    <strong>{{ a.ciudad }}</strong>
                    <small>{{ a.nombre }}</small>
                    <small>{{ a.pais }}</small>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <!-- Fila 2: Fechas, Pasajeros, Clase -->
        <div class="fila-opciones">
          <!-- Fecha Ida -->
          <div class="campo campo-fecha">
            <label>
              <span class="label-icon" v-html="iconos.calendario"></span>
              Fecha Ida
            </label>
            <div class="input-wrapper fecha-wrapper" @click="abrirCalendario('ida')">
              <span class="fecha-display" :class="{ 'fecha-seleccionada': fechaIda }">{{ formatearFecha(fechaIda) }}</span>
              <input
                ref="inputFechaIda"
                v-model="fechaIda"
                type="date"
                :min="fechaMinima"
                class="fecha-input-hidden"
              />
            </div>
          </div>

          <!-- Fecha Vuelta -->
          <div class="campo campo-fecha" v-if="tipoViaje === 'idaVuelta'">
            <label>
              <span class="label-icon" v-html="iconos.calendario"></span>
              Fecha Vuelta
            </label>
            <div class="input-wrapper fecha-wrapper" @click="abrirCalendario('vuelta')">
              <span class="fecha-display" :class="{ 'fecha-seleccionada': fechaVuelta }">{{ formatearFecha(fechaVuelta) }}</span>
              <input
                ref="inputFechaVuelta"
                v-model="fechaVuelta"
                type="date"
                :min="fechaIda || fechaMinima"
                class="fecha-input-hidden"
              />
            </div>
          </div>

          <!-- Pasajeros -->
          <div class="campo campo-pasajeros">
            <label>
              <span class="label-icon" v-html="iconos.persona"></span>
              Pasajeros
            </label>
            <div class="input-wrapper">
              <button 
                type="button" 
                class="selector-btn"
                @click="mostrarPasajeros = !mostrarPasajeros"
                @blur="cerrarPasajeros"
              >
                <span>{{ textoPasajeros }}</span>
                <span class="flecha" v-html="iconos.flecha"></span>
              </button>
              
              <div v-if="mostrarPasajeros" class="dropdown-pasajeros">
                <!-- Adultos -->
                <div class="pasajero-row">
                  <div class="pasajero-info">
                    <span class="pasajero-icon" v-html="iconos.adulto"></span>
                    <div>
                      <strong>Adultos</strong>
                      <small>(+12 anos)</small>
                    </div>
                  </div>
                  <div class="pasajero-controles">
                    <button type="button" class="ctrl-btn" @mousedown.prevent="decrementar('adultos')" :disabled="adultos <= 1">
                      <span v-html="iconos.menos"></span>
                    </button>
                    <span class="cantidad">{{ adultos }}</span>
                    <button type="button" class="ctrl-btn" @mousedown.prevent="incrementar('adultos')" :disabled="adultos >= 9">
                      <span v-html="iconos.mas"></span>
                    </button>
                  </div>
                </div>
                <!-- Ninos -->
                <div class="pasajero-row">
                  <div class="pasajero-info">
                    <span class="pasajero-icon" v-html="iconos.nino"></span>
                    <div>
                      <strong>Niños</strong>
                      <small>(2-11 anos)</small>
                    </div>
                  </div>
                  <div class="pasajero-controles">
                    <button type="button" class="ctrl-btn" @mousedown.prevent="decrementar('ninos')" :disabled="ninos <= 0">
                      <span v-html="iconos.menos"></span>
                    </button>
                    <span class="cantidad">{{ ninos }}</span>
                    <button type="button" class="ctrl-btn" @mousedown.prevent="incrementar('ninos')" :disabled="ninos >= 9">
                      <span v-html="iconos.mas"></span>
                    </button>
                  </div>
                </div>
                <!-- Infantes -->
                <div class="pasajero-row">
                  <div class="pasajero-info">
                    <span class="pasajero-icon" v-html="iconos.bebe"></span>
                    <div>
                      <strong>Infantes</strong>
                      <small>(-2 anos)</small>
                    </div>
                  </div>
                  <div class="pasajero-controles">
                    <button type="button" class="ctrl-btn" @mousedown.prevent="decrementar('infantes')" :disabled="infantes <= 0">
                      <span v-html="iconos.menos"></span>
                    </button>
                    <span class="cantidad">{{ infantes }}</span>
                    <button type="button" class="ctrl-btn" @mousedown.prevent="incrementar('infantes')" :disabled="infantes >= adultos">
                      <span v-html="iconos.mas"></span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Clase -->
          <div class="campo campo-clase">
            <label>
              <span class="label-icon" v-html="iconos.clase"></span>
              Clase
            </label>
            <div class="input-wrapper">
              <button 
                type="button" 
                class="selector-btn"
                @click="mostrarClases = !mostrarClases"
                @blur="cerrarClases"
              >
                <span>{{ claseActual?.nombre }}</span>
                <span class="flecha" v-html="iconos.flecha"></span>
              </button>
              
              <ul v-if="mostrarClases" class="dropdown dropdown-clases">
                <li 
                  v-for="c in clases" 
                  :key="c.codigo" 
                  @mousedown="claseSeleccionada = c.codigo; mostrarClases = false"
                  :class="{ selected: c.codigo === claseSeleccionada }"
                >
                  <span class="clase-codigo">{{ c.codigo }}</span>
                  <span>{{ c.nombre }}</span>
                </li>
              </ul>
            </div>
          </div>

          <!-- Límite de resultados -->
          <div class="campo campo-limite">
            <label>
              <span class="label-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z"/></svg>
              </span>
              Resultados
            </label>
            <div class="input-wrapper">
              <select v-model="limiteResultados" class="select-limite">
                <option v-for="op in opcionesLimite" :key="op" :value="op">{{ op }} vuelos</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Mensaje de error -->
        <transition name="fade">
          <div v-if="mensajeError" class="mensaje-error">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
            <span>{{ mensajeError }}</span>
          </div>
        </transition>

        <!-- Buscar -->
        <button 
          class="btn-buscar" 
          @click="handleBuscar" 
          type="button"
        >
          <span v-html="iconos.buscar"></span>
          Buscar Vuelos
        </button>
      </div>
    </div>
  </section>
</template>

<style scoped>
.buscador-section {
  --primary: #b5931a;
  --primary-dark: #8a6f14;
  --primary-light: #d4af37;
  --text: #333;
  --text-light: #666;
  --border: #ddd;
  --bg: #f8f9fa;
  
  padding: 2.5rem 1rem;
  margin-top: -50px;
  position: relative;
  z-index: 10;
}

.buscador-card {
  max-width: 1100px;
  margin: 0 auto;
  background: #fff;
  border-radius: 12px;
  padding: 2rem 2.5rem;
  box-shadow: 0 4px 24px rgba(0,0,0,0.12);
}

.buscador-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-bottom: 1.25rem;
}

.buscador-header h2 {
  margin: 0;
  font-size: 1.5rem;
  color: var(--text);
  font-weight: 600;
}

.header-icon {
  width: 28px;
  height: 28px;
  color: var(--primary);
}
.header-icon svg { width: 100%; height: 100%; }

/* Tipo de viaje */
.tipo-viaje {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.tipo-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border: 2px solid var(--border);
  border-radius: 25px;
  background: #fff;
  color: var(--text-light);
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.tipo-btn:hover {
  border-color: var(--primary);
  color: var(--primary);
}

.tipo-btn.active {
  background: var(--primary);
  border-color: var(--primary);
  color: #fff;
}

.tipo-icon {
  width: 18px;
  height: 18px;
}
.tipo-icon svg { width: 100%; height: 100%; }

/* Form */
.buscador-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.fila-aeropuertos {
  display: flex;
  align-items: flex-end;
  gap: 1rem;
}

.fila-opciones {
  display: flex;
  align-items: flex-end;
  gap: 1rem;
  flex-wrap: wrap;
}

.campo {
  flex: 1;
  min-width: 0;
}

.campo-fecha { flex: 0.8; min-width: 150px; }
.campo-pasajeros { flex: 1.2; min-width: 180px; }
.campo-clase { flex: 1; min-width: 160px; }
.campo-limite { flex: 0.7; min-width: 130px; }

.select-limite {
  width: 100%;
  padding: 12px 14px;
  border: 1px solid var(--border);
  border-radius: 8px;
  font-size: 0.95rem;
  color: var(--text);
  background: #fff;
  cursor: pointer;
  outline: none;
  transition: border-color 0.2s;
  appearance: auto;
}
.select-limite:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 2px rgba(181,147,26,0.15);
}

/* Wrapper de fecha personalizado */
.fecha-wrapper {
  position: relative;
  cursor: pointer;
}

.fecha-display {
  display: block;
  width: 100%;
  padding: 12px 14px;
  border: 1px solid var(--border);
  border-radius: 8px;
  font-size: 0.95rem;
  color: #aaa;
  background: #fff;
  pointer-events: none;
  user-select: none;
}

.fecha-display.fecha-seleccionada {
  color: var(--text);
  font-weight: 500;
}

.fecha-input-hidden {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
}

.fecha-wrapper:hover .fecha-display {
  border-color: var(--primary);
}

.campo label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-light);
  margin-bottom: 6px;
}

.label-icon {
  width: 16px;
  height: 16px;
  color: var(--primary);
}
.label-icon svg { width: 100%; height: 100%; }

.input-wrapper {
  position: relative;
}

.campo input[type="text"],
.campo input[type="date"] {
  width: 100%;
  padding: 12px 14px;
  padding-right: 55px;
  border: 1px solid var(--border);
  border-radius: 8px;
  font-size: 0.95rem;
  color: var(--text);
  transition: border-color 0.2s, box-shadow 0.2s;
}

.campo input[type="date"] {
  padding-right: 14px;
}

.campo input:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(181,147,26,0.12);
}

.campo input::placeholder { color: #aaa; }

.codigo {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  background: var(--primary);
  color: #fff;
  padding: 3px 8px;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 700;
}

.spinner {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  width: 18px;
  height: 18px;
  border: 2px solid var(--border);
  border-top-color: var(--primary);
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}
@keyframes spin { to { transform: translateY(-50%) rotate(360deg); } }

/* Selector button */
.selector-btn {
  width: 100%;
  padding: 12px 14px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: #fff;
  font-size: 0.95rem;
  color: var(--text);
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: border-color 0.2s, box-shadow 0.2s;
  text-align: left;
}

.selector-btn:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(181,147,26,0.12);
}

.flecha {
  width: 20px;
  height: 20px;
  color: var(--text-light);
}
.flecha svg { width: 100%; height: 100%; }

/* Dropdown */
.dropdown {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  margin: 0;
  padding: 0;
  list-style: none;
  background: #fff;
  border: 1px solid var(--border);
  border-radius: 8px;
  box-shadow: 0 6px 20px rgba(0,0,0,0.12);
  max-height: 250px;
  overflow-y: auto;
  z-index: 100;
}

.dropdown li {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  cursor: pointer;
  border-bottom: 1px solid #f0f0f0;
  transition: background 0.15s;
  color: #333;
}
.dropdown li:last-child { border-bottom: none; }
.dropdown li:hover { background: var(--bg); }

.iata {
  background: var(--primary);
  color: #fff;
  padding: 6px 8px;
  border-radius: 4px;
  font-weight: 700;
  font-size: 0.8rem;
  min-width: 42px;
  text-align: center;
}

.info {
  display: flex;
  flex-direction: column;
  gap: 1px;
  overflow: hidden;
}
.info strong { color: var(--text); font-size: 0.9rem; }
.info small { color: var(--text-light); font-size: 0.75rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

/* Dropdown clases */
.dropdown-clases li {
  gap: 10px;
  color: var(--text);
}
.dropdown-clases li.selected {
  background: rgba(181,147,26,0.1);
}
.clase-codigo {
  background: var(--bg);
  color: var(--text);
  padding: 4px 8px;
  border-radius: 4px;
  font-weight: 700;
  font-size: 0.8rem;
  min-width: 28px;
  text-align: center;
}
.dropdown-clases li.selected .clase-codigo {
  background: var(--primary);
  color: #fff;
}

/* Dropdown pasajeros */
.dropdown-pasajeros {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  background: #fff;
  border: 1px solid var(--border);
  border-radius: 8px;
  box-shadow: 0 6px 20px rgba(0,0,0,0.12);
  z-index: 100;
  padding: 12px;
  color: #333;
}

.pasajero-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid #f0f0f0;
}
.pasajero-row:last-child { border-bottom: none; }

.pasajero-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.pasajero-icon {
  width: 24px;
  height: 24px;
  color: var(--text);
}
.pasajero-icon svg { width: 100%; height: 100%; }

.pasajero-info div {
  display: flex;
  flex-direction: column;
}
.pasajero-info strong { font-size: 0.9rem; color: var(--text); }
.pasajero-info small { font-size: 0.75rem; color: var(--text-light); }

.pasajero-controles {
  display: flex;
  align-items: center;
  gap: 8px;
}

.ctrl-btn {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 6px;
  background: var(--text);
  color: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s, opacity 0.2s;
}
.ctrl-btn:hover:not(:disabled) { background: var(--primary); }
.ctrl-btn:disabled { opacity: 0.4; cursor: not-allowed; }
.ctrl-btn svg { width: 18px; height: 18px; }

.cantidad {
  min-width: 24px;
  text-align: center;
  font-weight: 600;
  font-size: 1rem;
  color: var(--text);
}

/* Swap button */
.btn-swap {
  width: 40px;
  height: 40px;
  border: 1px solid var(--border);
  border-radius: 50%;
  background: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  flex-shrink: 0;
  margin-bottom: 2px;
}
.btn-swap:hover {
  border-color: var(--primary);
  background: var(--primary);
  transform: rotate(180deg);
}
.btn-swap:hover .swap-icon { color: #fff; }

.swap-icon {
  width: 20px;
  height: 20px;
  color: var(--text-light);
  transition: color 0.2s;
}
.swap-icon svg { width: 100%; height: 100%; }

/* Mensaje de error */
.mensaje-error {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: #fff3f3;
  border: 1px solid #e74c3c;
  border-radius: 8px;
  color: #c0392b;
  font-size: 0.9rem;
  font-weight: 500;
  animation: shake 0.4s ease;
}

.mensaje-error svg {
  flex-shrink: 0;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  20% { transform: translateX(-6px); }
  40% { transform: translateX(6px); }
  60% { transform: translateX(-4px); }
  80% { transform: translateX(4px); }
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

/* Buscar button */
.btn-buscar {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 14px 32px;
  background: var(--primary);
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s, transform 0.2s;
  align-self: center;
  margin-top: 0.5rem;
}
.btn-buscar:hover:not(:disabled) {
  background: var(--primary-dark);
  transform: translateY(-1px);
}
.btn-buscar:disabled {
  background: #ccc;
  cursor: not-allowed;
}
.btn-buscar svg { width: 20px; height: 20px; }

/* Responsive */
@media (max-width: 900px) {
  .fila-aeropuertos { flex-wrap: wrap; }
  .fila-aeropuertos .campo { flex: 1 1 calc(50% - 2rem); min-width: 200px; }
  .btn-swap { order: 2; }
}

@media (max-width: 700px) {
  .fila-opciones { flex-direction: column; }
  .fila-opciones .campo { width: 100%; flex: none; }
  .tipo-viaje { flex-direction: column; align-items: center; }
  .tipo-btn { width: 100%; max-width: 220px; justify-content: center; }
}

@media (max-width: 500px) {
  .buscador-section { padding: 1.5rem 0.75rem; margin-top: -30px; }
  .buscador-card { padding: 1.5rem 1rem; }
  .buscador-header h2 { font-size: 1.25rem; }
  .fila-aeropuertos { flex-direction: column; }
  .fila-aeropuertos .campo { width: 100%; flex: none; }
  .btn-swap { align-self: center; transform: rotate(90deg); order: 1; }
  .btn-swap:hover { transform: rotate(270deg); }
  .btn-buscar { width: 100%; }
}
</style>
