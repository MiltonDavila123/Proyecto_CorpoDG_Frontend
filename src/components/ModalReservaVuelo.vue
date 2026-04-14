<template>
  <Teleport to="body">
    <transition name="modal-fade">
      <div v-if="visible" class="modal-overlay" @click.self="cerrar">
        <div class="modal-container">
          <!-- Header -->
          <div class="modal-header">
            <div class="header-info">
              <div class="header-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
                </svg>
              </div>
              <div>
                <h2>Reservar Vuelo</h2>
                <p class="subtitle">Completa los datos para buscar disponibilidad</p>
              </div>
            </div>
            <button class="btn-close" @click="cerrar">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 6L6 18M6 6l12 12"/>
              </svg>
            </button>
          </div>

          <!-- Ruta del vuelo (solo lectura) -->
          <div class="modal-route">
            <div class="route-endpoint">
              <span class="route-city-name">{{ vuelo.origen_ciudad || vuelo.origen_pais }}</span>
              <span class="route-code">{{ vuelo.origen_codigo_iata }}</span>
            </div>
            <div class="route-arrow">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
              </svg>
            </div>
            <div class="route-endpoint">
              <span class="route-city-name">{{ vuelo.destino_ciudad || vuelo.destino_pais }}</span>
              <span class="route-code">{{ vuelo.destino_codigo_iata }}</span>
            </div>
          </div>

          <!-- Info aerolínea y precio -->
          <div class="modal-flight-info">
            <div class="info-airline">
              <img v-if="vuelo.aerolinea_logo" :src="vuelo.aerolinea_logo" :alt="vuelo.aerolinea_nombre" class="airline-logo" />
              <span v-else>{{ vuelo.aerolinea_nombre }}</span>
              <span class="flight-duration">{{ vuelo.duracion }}</span>
            </div>
            <div class="info-price">
              <span class="price-label">Desde</span>
              <span class="price">${{ vuelo.precio }}</span>
              <span class="price-currency">{{ vuelo.moneda || 'USD' }} / persona</span>
            </div>
          </div>

          <!-- Formulario -->
          <div class="modal-body">
            <!-- Tipo de viaje -->
            <div class="form-row">
              <label class="form-label">Tipo de viaje</label>
              <div class="tipo-viaje-options">
                <button 
                  class="tipo-btn" 
                  :class="{ active: tipoViaje === 'idaVuelta' }" 
                  @click="tipoViaje = 'idaVuelta'"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M6.99 11L3 15l3.99 4v-3H14v-2H6.99v-3zM21 9l-3.99-4v3H10v2h7.01v3L21 9z"/></svg>
                  Ida y vuelta
                </button>
                <button 
                  class="tipo-btn" 
                  :class="{ active: tipoViaje === 'soloIda' }" 
                  @click="tipoViaje = 'soloIda'; fechaVuelta = ''"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"/></svg>
                  Solo ida
                </button>
              </div>
            </div>

            <!-- Fechas -->
            <div class="form-row form-row-dates">
              <div class="form-group">
                <label class="form-label">Fecha de ida</label>
                <div class="fecha-wrapper" @click="abrirCalendario('ida')">
                  <span class="fecha-display" :class="{ 'fecha-seleccionada': fechaIda }">{{ formatearFecha(fechaIda) }}</span>
                  <input 
                    ref="inputFechaIda"
                    type="date" 
                    v-model="fechaIda" 
                    :min="fechaMinima"
                    class="fecha-input-hidden"
                  />
                </div>
              </div>
              <div class="form-group" v-if="tipoViaje === 'idaVuelta'">
                <label class="form-label">Fecha de vuelta</label>
                <div class="fecha-wrapper" @click="abrirCalendario('vuelta')">
                  <span class="fecha-display" :class="{ 'fecha-seleccionada': fechaVuelta }">{{ formatearFecha(fechaVuelta) }}</span>
                  <input 
                    ref="inputFechaVuelta"
                    type="date" 
                    v-model="fechaVuelta" 
                    :min="fechaIda || fechaMinima"
                    class="fecha-input-hidden"
                  />
                </div>
              </div>
            </div>

            <!-- Pasajeros -->
            <div class="form-row">
              <label class="form-label">Pasajeros</label>
              <div class="pasajeros-grid">
                <!-- Adultos -->
                <div class="pasajero-item">
                  <div class="pasajero-info">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
                    <div>
                      <span class="pasajero-tipo">Adultos</span>
                      <span class="pasajero-desc">+12 años</span>
                    </div>
                  </div>
                  <div class="pasajero-counter">
                    <button class="counter-btn counter-btn-minus" @click="decrementar('adultos')" :disabled="adultos <= 1">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M19 13H5v-2h14v2z"/></svg>
                    </button>
                    <span class="counter-value">{{ adultos }}</span>
                    <button class="counter-btn counter-btn-plus" @click="incrementar('adultos')" :disabled="adultos >= 9">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
                    </button>
                  </div>
                </div>
                <!-- Niños -->
                <div class="pasajero-item">
                  <div class="pasajero-info">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm9 7h-6v13h-2v-6h-2v6H9V9H3V7h18v2z"/></svg>
                    <div>
                      <span class="pasajero-tipo">Niños</span>
                      <span class="pasajero-desc">2–12 años</span>
                    </div>
                  </div>
                  <div class="pasajero-counter">
                    <button class="counter-btn counter-btn-minus" @click="decrementar('ninos')" :disabled="ninos <= 0">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M19 13H5v-2h14v2z"/></svg>
                    </button>
                    <span class="counter-value">{{ ninos }}</span>
                    <button class="counter-btn counter-btn-plus" @click="incrementar('ninos')" :disabled="ninos >= 9">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
                    </button>
                  </div>
                </div>
                <!-- Infantes -->
                <div class="pasajero-item">
                  <div class="pasajero-info">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8 0-1.12.23-2.18.65-3.15C5.56 9.69 6.72 10.5 8 10.5c1.63 0 3.04-1.04 3.58-2.5h.84c.54 1.46 1.95 2.5 3.58 2.5 1.28 0 2.44-.81 3.35-1.65.42.97.65 2.03.65 3.15 0 4.41-3.59 8-8 8z"/></svg>
                    <div>
                      <span class="pasajero-tipo">Infantes</span>
                      <span class="pasajero-desc">0–2 años</span>
                    </div>
                  </div>
                  <div class="pasajero-counter">
                    <button class="counter-btn counter-btn-minus" @click="decrementar('infantes')" :disabled="infantes <= 0">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M19 13H5v-2h14v2z"/></svg>
                    </button>
                    <span class="counter-value">{{ infantes }}</span>
                    <button class="counter-btn counter-btn-plus" @click="incrementar('infantes')" :disabled="infantes >= 4">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
                    </button>
                  </div>
                </div>
              </div>
              <!-- Mensaje advertencia pasajeros -->
              <transition name="modal-fade">
                <div v-if="mensajePasajeros" class="mensaje-pasajeros">
                  {{ mensajePasajeros }}
                </div>
              </transition>
            </div>

            <!-- Clase -->
            <div class="form-row">
              <label class="form-label">Clase</label>
              <div class="clase-select">
                <select v-model="claseSeleccionada" class="select-input">
                  <option v-for="clase in clases" :key="clase.codigo" :value="clase.codigo">
                    {{ clase.nombre }}
                  </option>
                </select>
              </div>
            </div>

            <!-- Error -->
            <div v-if="mensajeError" class="error-msg">
              {{ mensajeError }}
            </div>
          </div>

          <!-- Footer -->
          <div class="modal-footer">
            <button class="btn-cancelar" @click="cerrar">Cancelar</button>
            <button class="btn-buscar" @click="handleBuscar">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>
              Buscar Vuelos
            </button>
          </div>
        </div>
      </div>
    </transition>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  vuelo: {
    type: Object,
    required: true,
    default: () => ({})
  }
})

const emit = defineEmits(['cerrar', 'buscar'])

// Estado del formulario
const tipoViaje = ref('idaVuelta')
const fechaIda = ref('')
const fechaVuelta = ref('')
const adultos = ref(1)
const ninos = ref(0)
const infantes = ref(0)
const claseSeleccionada = ref('Y')
const mensajeError = ref('')

const clases = [
  { codigo: 'Y', nombre: 'Económica' },
  { codigo: 'S', nombre: 'Económica Premium' },
  { codigo: 'C', nombre: 'Ejecutiva' },
  { codigo: 'J', nombre: 'Ejecutiva Premium' },
  { codigo: 'F', nombre: 'Primera Clase' },
  { codigo: 'P', nombre: 'Primera Clase Premium' }
]

// Formatear fecha para mostrar en formato YYYY-MM-DD
const formatearFecha = (fecha) => {
  if (!fecha) return 'Seleccionar'
  return fecha
}

const fechaMinima = computed(() => {
  return new Date().toISOString().split('T')[0]
})

// Reset al abrir
watch(() => props.visible, (val) => {
  if (val) {
    fechaIda.value = ''
    fechaVuelta.value = ''
    adultos.value = 1
    ninos.value = 0
    infantes.value = 0
    claseSeleccionada.value = 'Y'
    tipoViaje.value = 'idaVuelta'
    mensajeError.value = ''
  }
})

// Mensaje de advertencia para pasajeros
const mensajePasajeros = ref('')
let timeoutPasajeros = null

const mostrarMensajePasajeros = (msg) => {
  mensajePasajeros.value = msg
  if (timeoutPasajeros) clearTimeout(timeoutPasajeros)
  timeoutPasajeros = setTimeout(() => { mensajePasajeros.value = '' }, 3500)
}

// Pasajeros
const incrementar = (tipo) => {
  if (tipo === 'adultos') {
    if (adultos.value < 9) adultos.value++
    else mostrarMensajePasajeros('Máximo 9 adultos por reserva.')
  }
  if (tipo === 'ninos') {
    if (ninos.value < 9) ninos.value++
    else mostrarMensajePasajeros('Máximo 9 niños por reserva.')
  }
  if (tipo === 'infantes') {
    if (infantes.value < 4) {
      infantes.value++
      if (infantes.value > adultos.value) {
      mostrarMensajePasajeros('Se recomienda al menos 1 adulto por cada infante.')
      }
    } else {
      mostrarMensajePasajeros('Máximo 4 infantes por reserva.')
    }
  }
}

const decrementar = (tipo) => {
  if (tipo === 'adultos' && adultos.value > 1) {
    adultos.value--
    if (infantes.value > adultos.value && infantes.value > 0) {
      mostrarMensajePasajeros('Se recomienda al menos 1 adulto por cada infante.')
    }
  }
  if (tipo === 'ninos' && ninos.value > 0) ninos.value--
  if (tipo === 'infantes' && infantes.value > 0) infantes.value--
}

// Refs para calendarios
const inputFechaIda = ref(null)
const inputFechaVuelta = ref(null)

const abrirCalendario = (tipo) => {
  const input = tipo === 'ida' ? inputFechaIda.value : inputFechaVuelta.value
  if (input) {
    try { input.showPicker() } catch { input.focus(); input.click() }
  }
}

const cerrar = () => {
  emit('cerrar')
}

let timeoutError = null
const mostrarError = (msg) => {
  mensajeError.value = msg
  if (timeoutError) clearTimeout(timeoutError)
  timeoutError = setTimeout(() => { mensajeError.value = '' }, 4000)
}

const handleBuscar = () => {
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
    origen: props.vuelo.origen_codigo_iata,
    destino: props.vuelo.destino_codigo_iata,
    origenLabel: `${props.vuelo.origen_codigo_iata} - ${props.vuelo.origen_ciudad || props.vuelo.origen_nombre}`,
    destinoLabel: `${props.vuelo.destino_codigo_iata} - ${props.vuelo.destino_ciudad || props.vuelo.destino_nombre}`,
    tipoViaje: tipoViaje.value,
    fechaIda: fechaIda.value,
    fechaVuelta: tipoViaje.value === 'idaVuelta' ? fechaVuelta.value : '',
    adultos: adultos.value,
    ninos: ninos.value,
    infantes: infantes.value,
    clase: claseSeleccionada.value,
    limite: 50
  })
}
</script>

<style scoped>
/* ===== OVERLAY ===== */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 20px;
  backdrop-filter: blur(4px);
}

/* ===== CONTAINER ===== */
.modal-container {
  background: #ffffff;
  border-radius: 20px;
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 25px 60px rgba(0, 0, 0, 0.3);
  animation: modal-slide-up 0.3s ease;
}

@keyframes modal-slide-up {
  from { transform: translateY(30px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

/* ===== HEADER ===== */
.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem 2rem;
  background: linear-gradient(135deg, #b5931a 0%, #d4af37 100%);
  color: white;
  border-radius: 20px 20px 0 0;
}

.header-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.header-icon {
  width: 40px;
  height: 40px;
  background: rgba(255,255,255,0.2);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.header-icon svg {
  width: 24px;
  height: 24px;
}

.modal-header h2 {
  font-size: 1.3rem;
  margin: 0;
  font-weight: 700;
}

.modal-header .subtitle {
  font-size: 0.85rem;
  opacity: 0.9;
  margin: 0;
}

.btn-close {
  background: rgba(255,255,255,0.2);
  border: none;
  border-radius: 10px;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: white;
  transition: background 0.2s;
}

.btn-close:hover {
  background: rgba(255,255,255,0.35);
}

.btn-close svg {
  width: 20px;
  height: 20px;
}

/* ===== RUTA ===== */
.modal-route {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1.5rem;
  padding: 1.5rem 2rem;
  background: #faf8f0;
  border-bottom: 1px solid #eee;
}

.route-endpoint {
  text-align: center;
  flex: 1;
}

.route-code {
  display: block;
  font-size: 1.1rem;
  font-weight: 800;
  color: #b5931a;
  letter-spacing: 2px;
  margin-top: 0.3rem;
}

.route-name {
  display: block;
  font-size: 0.8rem;
  color: #555;
  margin-top: 0.2rem;
  line-height: 1.3;
}

.route-city-name {
  display: block;
  font-size: 1.3rem;
  font-weight: 700;
  color: #333;
}

.route-arrow {
  width: 40px;
  height: 40px;
  color: #b5931a;
  flex-shrink: 0;
}

.route-arrow svg {
  width: 100%;
  height: 100%;
}

/* ===== FLIGHT INFO ===== */
.modal-flight-info {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 2rem;
  border-bottom: 1px solid #eee;
}

.info-airline {
  display: flex;
  align-items: center;
  gap: 0.8rem;
}

.airline-logo {
  height: 25px;
  width: auto;
  max-width: 100px;
  object-fit: contain;
}

.flight-duration {
  font-size: 0.9rem;
  color: #888;
  padding: 0.3rem 0.7rem;
  background: #f0f0f0;
  border-radius: 20px;
}

.info-price {
  text-align: right;
}

.price-label {
  display: block;
  font-size: 0.75rem;
  color: #999;
  text-transform: uppercase;
}

.price {
  font-size: 1.5rem;
  font-weight: 800;
  color: #b5931a;
}

.price-currency {
  display: block;
  font-size: 0.75rem;
  color: #888;
}

/* ===== BODY ===== */
.modal-body {
  padding: 1.5rem 2rem;
}

.form-row {
  margin-bottom: 1.2rem;
}

.form-label {
  display: block;
  font-size: 0.85rem;
  font-weight: 700;
  color: #333;
  margin-bottom: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Tipo viaje */
.tipo-viaje-options {
  display: flex;
  gap: 0.8rem;
}

.tipo-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.7rem 1rem;
  border: 2px solid #e0e0e0;
  border-radius: 10px;
  background: white;
  color: #555;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 600;
  transition: all 0.2s;
}

.tipo-btn svg {
  width: 18px;
  height: 18px;
}

.tipo-btn.active {
  border-color: #b5931a;
  background: rgba(181, 147, 26, 0.08);
  color: #b5931a;
}

.tipo-btn:hover:not(.active) {
  border-color: #ccc;
  background: #fafafa;
}

/* Fechas */
.form-row-dates {
  display: flex;
  gap: 1rem;
}

.form-group {
  flex: 1;
}

.fecha-wrapper {
  position: relative;
  cursor: pointer;
}

.fecha-display {
  display: block;
  width: 100%;
  padding: 0.7rem 0.8rem;
  border: 2px solid #e0e0e0;
  border-radius: 10px;
  font-size: 0.95rem;
  color: #aaa;
  background: #fff;
  pointer-events: none;
  user-select: none;
  box-sizing: border-box;
}

.fecha-display.fecha-seleccionada {
  color: #333;
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
  border-color: #b5931a;
}

/* Pasajeros */
.pasajeros-grid {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.pasajero-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.6rem 0.8rem;
  border: 1px solid #eee;
  border-radius: 10px;
  background: #fafafa;
}

.pasajero-info {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.pasajero-info svg {
  width: 22px;
  height: 22px;
  color: #b5931a;
}

.pasajero-tipo {
  display: block;
  font-size: 0.9rem;
  font-weight: 600;
  color: #333;
}

.pasajero-desc {
  display: block;
  font-size: 0.75rem;
  color: #999;
}

.pasajero-counter {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.counter-btn {
  width: 34px;
  height: 34px;
  border-radius: 10px;
  border: 2px solid #e0e0e0;
  background: white;
  color: #555;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.25s ease;
}

.counter-btn svg {
  width: 18px;
  height: 18px;
}

.counter-btn-minus:hover:not(:disabled),
.counter-btn-minus:active:not(:disabled) {
  background: #fee2e2;
  border-color: #ef4444;
  color: #dc2626;
}
.counter-btn-minus:active:not(:disabled) {
  transform: scale(0.9);
  background: #fca5a5;
}

.counter-btn-plus:hover:not(:disabled),
.counter-btn-plus:active:not(:disabled) {
  background: #dcfce7;
  border-color: #22c55e;
  color: #16a34a;
}
.counter-btn-plus:active:not(:disabled) {
  transform: scale(0.9);
  background: #86efac;
}

.counter-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.counter-value {
  font-size: 1.1rem;
  font-weight: 700;
  color: #333;
  min-width: 24px;
  text-align: center;
}

.mensaje-pasajeros {
  padding: 8px 12px;
  background: #fef3c7;
  border: 1px solid #f59e0b;
  border-radius: 8px;
  font-size: 0.8rem;
  color: #92400e;
  text-align: center;
  margin-top: 6px;
  animation: pasajerosFadeIn 0.3s ease;
}

@keyframes pasajerosFadeIn {
  from { opacity: 0; transform: translateY(-4px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Clase select */
.select-input {
  width: 100%;
  padding: 0.7rem 0.8rem;
  border: 2px solid #e0e0e0;
  border-radius: 10px;
  font-size: 0.95rem;
  color: #333;
  background: white;
  cursor: pointer;
  outline: none;
  transition: border-color 0.2s;
}

.select-input:focus {
  border-color: #b5931a;
}

/* Error */
.error-msg {
  background: #fff3f3;
  color: #d32f2f;
  padding: 0.7rem 1rem;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 500;
  border: 1px solid #ffcdd2;
  margin-top: 0.5rem;
}

/* ===== FOOTER ===== */
.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding: 1rem 2rem 1.5rem;
  border-top: 1px solid #eee;
}

.btn-cancelar {
  padding: 0.7rem 1.5rem;
  border: 2px solid #e0e0e0;
  border-radius: 10px;
  background: white;
  color: #555;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-cancelar:hover {
  border-color: #ccc;
  background: #f5f5f5;
}

.btn-buscar {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.7rem 1.8rem;
  background: linear-gradient(135deg, #b5931a 0%, #d4af37 100%);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 0.95rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 4px 12px rgba(181, 147, 26, 0.3);
}

.btn-buscar svg {
  width: 20px;
  height: 20px;
}

.btn-buscar:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(181, 147, 26, 0.5);
}

/* ===== TRANSITION ===== */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

/* ===== RESPONSIVE ===== */
@media (max-width: 600px) {
  .modal-container {
    max-width: 100%;
    border-radius: 16px;
  }

  .modal-header,
  .modal-route,
  .modal-flight-info,
  .modal-body,
  .modal-footer {
    padding-left: 1.2rem;
    padding-right: 1.2rem;
  }

  .modal-route {
    flex-direction: column;
    gap: 0.8rem;
  }

  .route-arrow {
    transform: rotate(90deg);
    width: 30px;
    height: 30px;
  }

  .form-row-dates {
    flex-direction: column;
  }

  .tipo-viaje-options {
    flex-direction: column;
  }

  .modal-flight-info {
    flex-direction: column;
    gap: 0.8rem;
    align-items: flex-start;
  }

  .info-price {
    text-align: left;
  }

  .modal-footer {
    flex-direction: column;
  }

  .btn-cancelar,
  .btn-buscar {
    width: 100%;
    justify-content: center;
  }
}
</style>
