<template>
  <Teleport to="body">
    <transition name="modal-fade">
      <div v-if="visible" class="checkout-overlay">
        <div class="checkout-container">
          <!-- HEADER -->
          <header class="checkout-header">
            <div class="header-info">
              <div class="header-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="22" height="22"><path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/></svg>
              </div>
              <div>
                <h2>Completar reserva</h2>
                <p class="subtitle">{{ origenLabel }} → {{ destinoLabel }}</p>
              </div>
            </div>
            <button class="btn-close" @click="cerrar" aria-label="Cerrar">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="22" height="22"><path d="M18 6L6 18M6 6l12 12"/></svg>
            </button>
          </header>

          <!-- STEPPER -->
          <nav class="stepper">
            <div
              v-for="(p, idx) in pasos"
              :key="p.id"
              class="step"
              :class="{
                active: paso === p.id,
                done: pasoIndice > idx,
                disabled: pasoIndice < idx
              }"
              @click="irAPaso(p.id, idx)"
            >
              <span class="step-num">{{ pasoIndice > idx ? '✓' : (idx + 1) }}</span>
              <span class="step-label">{{ p.titulo }}</span>
            </div>
          </nav>

          <!-- BODY -->
          <div class="checkout-body">

            <!-- ============ STEP 1: PASAJEROS ============ -->
            <section v-if="paso === 'pasajeros'" class="step-section">
              <h3 class="section-title">Información de pasajeros</h3>
              <p class="section-help">
                Ingresa los datos tal como aparecen en el documento de viaje.
                <strong>{{ totalPasajeros }}</strong> pasajero{{ totalPasajeros > 1 ? 's' : '' }} en total.
              </p>

              <div class="pax-list">
                <div v-for="(pax, i) in formPasajeros" :key="i" class="pax-card">
                  <div class="pax-card-header">
                    <span class="pax-badge" :class="'badge-' + pax.tipo.toLowerCase()">{{ etiquetaTipo(pax.tipo) }}</span>
                    <span class="pax-num">Pasajero {{ i + 1 }}</span>
                  </div>

                  <div class="grid-2">
                    <div class="field">
                      <label>Nombres *</label>
                      <input v-model.trim="pax.nombres" type="text" maxlength="50" required />
                    </div>
                    <div class="field">
                      <label>Apellidos *</label>
                      <input v-model.trim="pax.apellidos" type="text" maxlength="50" required />
                    </div>
                    <div class="field">
                      <label>Género *</label>
                      <select v-model="pax.genero" required>
                        <option value="">Selecciona</option>
                        <option value="M">Masculino</option>
                        <option value="F">Femenino</option>
                      </select>
                    </div>
                    <div class="field">
                      <label>Fecha de nacimiento *</label>
                      <InputFecha v-model="pax.fechaNacimiento" :max="fechaMaxNac(pax.tipo)" :min="fechaMinNac(pax.tipo)" required />
                      <span v-if="pax.tipo === 'ADT'" class="field-hint">Debe ser mayor de 18 años</span>
                      <span v-else-if="pax.tipo === 'CNN'" class="field-hint">Entre 2 y 17 años</span>
                      <span v-else-if="pax.tipo === 'INF'" class="field-hint">Menos de 2 años</span>
                    </div>
                    <div class="field">
                      <label>Tipo de documento *</label>
                      <select v-model="pax.tipoDoc" required>
                        <option value="PASAPORTE">Pasaporte</option>
                        <option value="CEDULA">Cédula</option>
                        <option value="DNI">DNI</option>
                      </select>
                    </div>
                    <div class="field">
                      <label>Número de documento *</label>
                      <input v-model.trim="pax.numeroDoc" type="text" maxlength="30" required />
                    </div>
                    <div class="field">
                      <label>Nacionalidad *</label>
                      <input v-model.trim="pax.nacionalidad" type="text" maxlength="40" placeholder="Ej. Ecuatoriana" required />
                    </div>
                    <div v-if="pax.tipoDoc === 'PASAPORTE'" class="field">
                      <label>Vencimiento del pasaporte</label>
                      <InputFecha v-model="pax.vencimientoDoc" :min="hoyISO" />
                    </div>
                  </div>

                  <!-- Contacto solo en el primer adulto -->
                  <div v-if="i === 0" class="contact-section">
                    <h4>Datos de contacto (titular)</h4>
                    <div class="grid-2">
                      <div class="field">
                        <label>Correo electrónico *</label>
                        <input v-model.trim="contacto.email" type="email" maxlength="80" required />
                      </div>
                      <div class="field">
                        <label>Teléfono *</label>
                        <input v-model.trim="contacto.telefono" type="tel" maxlength="20" required />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <p v-if="errorPaso" class="error-msg">{{ errorPaso }}</p>
            </section>

            <!-- ============ STEP 2: ASIENTOS ============ -->
            <section v-if="paso === 'asientos'" class="step-section">
              <h3 class="section-title">Selección de asientos</h3>

              <div v-if="cargandoSeatmap" class="loading-block">
                <div class="spinner"></div>
                <p>Cargando mapa de asientos...</p>
              </div>

              <div v-else-if="errorSeatmap" class="warn-block">
                <p><strong>No se pudo cargar el mapa de asientos.</strong></p>
                <p class="warn-detail">{{ errorSeatmap }}</p>
                <p class="warn-small">Puedes continuar sin elegir asiento; la aerolínea te asignará uno al hacer el check-in.</p>
                <button class="btn-secondary" @click="cargarSeatmap">Reintentar</button>
              </div>

              <template v-else-if="seatmap">

                <!-- Tabs de segmentos -->
                <div class="seg-tabs">
                  <button
                    v-for="(mapa, idx) in seatmap.mapas"
                    :key="mapa.segmento_id_sabre || idx"
                    class="seg-tab"
                    :class="{ active: segmentoActivo === idx, 'seg-tab-error': segmentosConErrorAsientos.includes(idx) }"
                    @click="segmentoActivo = idx; segmentosConErrorAsientos = segmentosConErrorAsientos.filter(i => i !== idx)"
                  >
                    <span class="seg-tab-flight">{{ mapa.vuelo }}</span>
                    <span class="seg-tab-route">{{ mapa.origen }} → {{ mapa.destino }}</span>
                    <span class="seg-tab-status">
                      {{ asientosElegidosSegmento(idx) }}/{{ totalPasajeros }}
                    </span>
                  </button>
                </div>

                <!-- Selector de pasajero -->
                <div class="pax-selector">
                  <span class="pax-selector-label">Asignar asiento para:</span>
                  <div class="pax-pills">
                    <button
                      v-for="(pax, i) in formPasajeros"
                      :key="i"
                      class="pax-pill"
                      :class="{
                        active: paxActivo === i,
                        seleccionado: !!seleccionAsientos[segmentoActivo]?.[i]
                      }"
                      :disabled="pax.tipo === 'INF'"
                      :title="pax.tipo === 'INF' ? 'Los infantes viajan en brazos' : ''"
                      @click="paxActivo = i"
                    >
                      <span class="pill-name">{{ pax.nombres || ('Pasajero ' + (i+1)) }}</span>
                      <span class="pill-seat" v-if="seleccionAsientos[segmentoActivo]?.[i]">
                        {{ seleccionAsientos[segmentoActivo][i].id }}
                      </span>
                    </button>
                  </div>
                </div>

                <!-- Mapa de la cabina -->
                <div class="cabin-wrapper">
                  <div
                    v-for="cabina in mapaActivo?.cabinas || []"
                    :key="cabina.codigo"
                    class="cabina"
                  >
                    <h4 class="cabina-title">{{ cabina.nombre }} ({{ cabina.codigo }})</h4>

                    <!-- Header columnas -->
                    <div class="seat-row header-row">
                      <span class="row-num"></span>
                      <template v-for="(col, ci) in cabina.columnas" :key="col.letra">
                        <span class="seat-letter">{{ col.letra }}</span>
                        <span v-if="esLimitePasillo(cabina.columnas, ci)" class="aisle-gap" aria-hidden="true"></span>
                      </template>
                    </div>

                    <div
                      v-for="fila in cabina.filas"
                      :key="fila.numero"
                      class="seat-row"
                    >
                      <span class="row-num">{{ fila.numero }}</span>
                      <template v-for="(col, ci) in cabina.columnas" :key="col.letra">
                        <button
                          class="seat"
                          :class="claseAsiento(fila, col.letra)"
                          :disabled="!asientoClickeable(fila, col.letra)"
                          :title="tooltipAsiento(fila, col.letra)"
                          @click="toggleAsiento(fila, col.letra)"
                        >
                          <span class="seat-label">{{ etiquetaAsiento(fila, col.letra) }}</span>
                        </button>
                        <span v-if="esLimitePasillo(cabina.columnas, ci)" class="aisle-gap" aria-hidden="true"></span>
                      </template>
                    </div>
                  </div>
                </div>

                <!-- Leyenda -->
                <div class="legend">
                  <span><span class="seat libre legend-box"></span> Libre</span>
                  <span><span class="seat premium legend-box"></span> Con costo</span>
                  <span><span class="seat seleccionado legend-box"></span> Seleccionado</span>
                  <span><span class="seat ocupado legend-box"></span> Ocupado</span>
                </div>
              </template>
            </section>

            <!-- ============ STEP 3: RESUMEN ============ -->
            <section v-if="paso === 'resumen'" class="step-section">
              <h3 class="section-title">Resumen de la reserva</h3>

              <div class="resumen-grid">
                <!-- Vuelo -->
                <div class="resumen-card">
                  <h4>Vuelo</h4>
                  <p><strong>Ruta:</strong> {{ origenLabel }} → {{ destinoLabel }}</p>
                  <p><strong>Aerolínea:</strong> {{ vuelo.aerolinea_validadora }}</p>
                  <p v-for="(t, i) in vuelo.tramos" :key="i">
                    <strong>{{ t.tipo === 'ida' ? 'Ida' : 'Vuelta' }}:</strong>
                    {{ t.fecha_salida }} — {{ t.origen?.aeropuerto }} → {{ t.destino?.aeropuerto }}
                    ({{ t.duracion_total }})
                  </p>
                </div>

                <!-- Pasajeros -->
                <div class="resumen-card">
                  <h4>Pasajeros</h4>
                  <ul class="resumen-pax">
                    <li v-for="(pax, i) in formPasajeros" :key="i">
                      <span class="resumen-pax-tipo">{{ etiquetaTipo(pax.tipo) }}</span>
                      {{ pax.nombres }} {{ pax.apellidos }}
                      <span class="resumen-pax-doc">({{ pax.tipoDoc }}: {{ pax.numeroDoc }})</span>
                    </li>
                  </ul>
                  <p class="resumen-contact">
                    <strong>Contacto:</strong> {{ contacto.email }} · {{ contacto.telefono }}
                  </p>
                </div>

                <!-- Asientos -->
                <div class="resumen-card">
                  <h4>Asientos seleccionados</h4>
                  <div v-if="!hayAsientosSeleccionados" class="resumen-empty">
                    No se seleccionaron asientos. La aerolínea asignará uno al hacer el check-in.
                  </div>
                  <ul v-else class="resumen-seats">
                    <li v-for="(mapa, idx) in seatmap?.mapas || []" :key="idx">
                      <strong>{{ mapa.vuelo }} ({{ mapa.origen }} → {{ mapa.destino }}):</strong>
                      <span v-if="!seleccionAsientos[idx] || !Object.keys(seleccionAsientos[idx]).length" class="muted">
                        sin asignar
                      </span>
                      <template v-else>
                        <span
                          v-for="(asiento, paxIdx) in seleccionAsientos[idx]"
                          :key="paxIdx"
                          class="resumen-seat-pill"
                        >
                          {{ formPasajeros[paxIdx]?.nombres || ('Pax ' + (Number(paxIdx)+1)) }}: {{ asiento.id }}
                          <em v-if="asiento.precio">+${{ formatear(asiento.precio.monto) }}</em>
                        </span>
                      </template>
                    </li>
                  </ul>
                </div>

                <!-- Precio -->
                <div class="resumen-card resumen-precio">
                  <h4>Total a pagar</h4>
                  <div class="precio-row">
                    <span>Vuelo ({{ totalPasajeros }} pax)</span>
                    <span>${{ formatear(precioVuelo) }}</span>
                  </div>
                  <div v-if="costoAsientos > 0" class="precio-row">
                    <span>Impuesto por asiento</span>
                    <span>${{ formatear(costoAsientos) }}</span>
                  </div>
                  <div class="precio-row total">
                    <span>Total</span>
                    <span>${{ formatear(precioVuelo + costoAsientos) }} {{ vuelo.moneda || 'USD' }}</span>
                  </div>
                  <p v-if="vuelo.ultima_fecha_compra" class="resumen-warning">
                    Esta tarifa debe emitirse antes de {{ vuelo.ultima_fecha_compra }}.
                  </p>
                </div>
              </div>
            </section>
          </div>

          <!-- FOOTER / NAV -->
          <footer class="checkout-footer">
            <div class="footer-precio">
              <span class="footer-precio-label">Total estimado</span>
              <span class="footer-precio-monto">
                ${{ formatear(precioVuelo + costoAsientos) }} {{ vuelo.moneda || 'USD' }}
              </span>
            </div>
            <div class="footer-actions">
              <button v-if="pasoIndice > 0" class="btn-secondary" @click="atras">Atrás</button>
              <button v-if="pasoIndice < pasos.length - 1" class="btn-primary" @click="siguiente">
                {{ paso === 'pasajeros' ? 'Continuar a asientos' : 'Continuar al resumen' }}
              </button>
              <button v-else class="btn-primary" :disabled="procesandoPago" @click="confirmar">
                <span v-if="procesandoPago" class="spinner-mini"></span>
                {{ procesandoPago ? 'Redirigiendo al pago...' : 'Confirmar y pagar' }}
              </button>
            </div>
          </footer>
          <div v-if="errorPago" class="pago-error">{{ errorPago }}</div>
        </div>
      </div>
    </transition>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch, reactive } from 'vue'
import { obtenerSeatmap, crearCheckoutBooking } from '../services/api.js'
import InputFecha from './InputFecha.vue'
import { validarCedulaEcuatoriana } from '../utils/validacion.js'

const props = defineProps({
  visible: { type: Boolean, default: false },
  vuelo: { type: Object, required: true },
  pasajeros: { type: Object, default: () => ({ adults: 1, children: 0, infants: 0 }) },
  revalidacion: { type: Object, default: null },
  origenLabel: { type: String, default: '' },
  destinoLabel: { type: String, default: '' }
})

const emit = defineEmits(['update:visible', 'confirmar'])

// ---- Estado checkout (Stripe) ----
const procesandoPago = ref(false)
const errorPago = ref('')

const MAPA_TIPO_DOC_BACKEND = {
  PASAPORTE: 'PASSPORT',
  CEDULA: 'NATIONAL_ID',
  DNI: 'DNI'
}

// ---- Pasos ----
const pasos = [
  { id: 'pasajeros', titulo: 'Pasajeros' },
  { id: 'asientos', titulo: 'Asientos' },
  { id: 'resumen', titulo: 'Resumen' }
]
const paso = ref('pasajeros')
const pasoIndice = computed(() => pasos.findIndex(p => p.id === paso.value))
const errorPaso = ref('')

// ---- Pasajeros ----
const totalPasajeros = computed(
  () => (props.pasajeros.adults || 0) + (props.pasajeros.children || 0) + (props.pasajeros.infants || 0)
)
const hoyISO = new Date().toISOString().slice(0, 10)

const fechaMaxNac = (tipo) => {
  const d = new Date()
  if (tipo === 'ADT') d.setFullYear(d.getFullYear() - 18)
  else if (tipo === 'CNN') d.setFullYear(d.getFullYear() - 2)
  return d.toISOString().slice(0, 10)
}
const fechaMinNac = (tipo) => {
  const d = new Date()
  if (tipo === 'CNN') { d.setFullYear(d.getFullYear() - 18); d.setDate(d.getDate() + 1) }
  else if (tipo === 'INF') { d.setFullYear(d.getFullYear() - 2); d.setDate(d.getDate() + 1) }
  else return ''
  return d.toISOString().slice(0, 10)
}

const crearPax = (tipo) => ({
  tipo,
  nombres: '',
  apellidos: '',
  genero: '',
  fechaNacimiento: '',
  tipoDoc: 'PASAPORTE',
  numeroDoc: '',
  nacionalidad: '',
  vencimientoDoc: ''
})

const formPasajeros = ref([])
const contacto = reactive({ email: '', telefono: '' })

const construirPasajeros = () => {
  const arr = []
  for (let i = 0; i < (props.pasajeros.adults || 0); i++) arr.push(crearPax('ADT'))
  for (let i = 0; i < (props.pasajeros.children || 0); i++) arr.push(crearPax('CNN'))
  for (let i = 0; i < (props.pasajeros.infants || 0); i++) arr.push(crearPax('INF'))
  formPasajeros.value = arr.length ? arr : [crearPax('ADT')]
}

const etiquetaTipo = (t) => ({ ADT: 'Adulto', CNN: 'Niño', INF: 'Infante' }[t] || t)

// ---- Seatmap ----
const seatmap = ref(null)
const cargandoSeatmap = ref(false)
const errorSeatmap = ref('')
const segmentoActivo = ref(0)
const paxActivo = ref(0)
// seleccionAsientos[segmentoIdx][paxIdx] = { id, precio, ... }
const seleccionAsientos = ref({})
const segmentosConErrorAsientos = ref([])

const mapaActivo = computed(() => seatmap.value?.mapas?.[segmentoActivo.value] || null)

const cargarSeatmap = async () => {
  errorSeatmap.value = ''
  cargandoSeatmap.value = true
  try {
    const { ok, data } = await obtenerSeatmap(
      props.vuelo,
      formPasajeros.value.map(p => ({
        passengerType: p.tipo,
        givenName: p.nombres || 'TEST',
        surname: p.apellidos || 'TEST'
      })),
      props.vuelo.moneda || 'USD'
    )
    if (!ok) {
      errorSeatmap.value = data?.error || 'No se pudo obtener el mapa de asientos.'
      seatmap.value = null
      return
    }
    seatmap.value = data
    segmentoActivo.value = 0
    // Buscar primer pax no INF
    paxActivo.value = formPasajeros.value.findIndex(p => p.tipo !== 'INF')
    if (paxActivo.value < 0) paxActivo.value = 0
  } catch (e) {
    errorSeatmap.value = e.message || 'Error inesperado.'
  } finally {
    cargandoSeatmap.value = false
  }
}

// ---- Asientos: helpers UI ----
const buscarAsiento = (fila, letra) =>
  fila?.asientos?.find(a => a.columna === letra) || null

const esLimitePasillo = (columnas, idx) => {
  // Inserta el pasillo entre dos columnas si la actual es AISLE y la siguiente también
  const col = columnas[idx]
  const next = columnas[idx + 1]
  if (!col || !next) return false
  const colIsAisle = (col.posiciones || []).includes('AISLE')
  const nextIsAisle = (next.posiciones || []).includes('AISLE')
  return colIsAisle && nextIsAisle
}

const esAsientoSeleccionado = (asiento) => {
  if (!asiento) return false
  const sel = seleccionAsientos.value[segmentoActivo.value]
  if (!sel) return false
  return Object.values(sel).some(a => a.id === asiento.id)
}

const claseAsiento = (fila, letra) => {
  const a = buscarAsiento(fila, letra)
  if (!a) return 'empty'
  if (esAsientoSeleccionado(a)) return 'seleccionado'
  if (!a.disponible) return 'ocupado'
  return a.precio ? 'libre premium' : 'libre'
}

const etiquetaAsiento = (fila, letra) => {
  const a = buscarAsiento(fila, letra)
  if (!a) return ''
  if (!a.disponible) return '×'
  if (a.precio) return '$' + Math.round(a.precio.monto)
  return ''
}

const tooltipAsiento = (fila, letra) => {
  const a = buscarAsiento(fila, letra)
  if (!a) return ''
  const car = (a.caracteristicas || []).join(', ')
  const precio = a.precio ? ` — $${a.precio.monto} ${a.precio.moneda}` : ''
  return `${a.id}${car ? ' · ' + car : ''}${precio}`
}

const asientoClickeable = (fila, letra) => {
  const a = buscarAsiento(fila, letra)
  if (!a || !a.disponible) return false
  const paxActual = formPasajeros.value[paxActivo.value]
  if (!paxActual || paxActual.tipo === 'INF') return false
  return true
}

const toggleAsiento = (fila, letra) => {
  const a = buscarAsiento(fila, letra)
  if (!a || !a.disponible) return
  const segIdx = segmentoActivo.value
  const paxIdx = paxActivo.value
  if (!seleccionAsientos.value[segIdx]) seleccionAsientos.value[segIdx] = {}

  // Si el asiento ya está tomado por otro pax, no hacer nada
  const tomadoPorOtro = Object.entries(seleccionAsientos.value[segIdx])
    .some(([px, asiento]) => Number(px) !== paxIdx && asiento.id === a.id)
  if (tomadoPorOtro) return

  // Si el pax ya tenía este asiento -> deseleccionar
  if (seleccionAsientos.value[segIdx][paxIdx]?.id === a.id) {
    delete seleccionAsientos.value[segIdx][paxIdx]
  } else {
    seleccionAsientos.value[segIdx][paxIdx] = { ...a }
    // Avanzar al siguiente pax no INF si existe sin asiento aún
    const total = formPasajeros.value.length
    for (let i = 1; i <= total; i++) {
      const nx = (paxIdx + i) % total
      if (formPasajeros.value[nx].tipo !== 'INF' && !seleccionAsientos.value[segIdx][nx]) {
        paxActivo.value = nx
        break
      }
    }
  }
}

const asientosElegidosSegmento = (segIdx) => {
  const sel = seleccionAsientos.value[segIdx] || {}
  return Object.keys(sel).length
}

const hayAsientosSeleccionados = computed(() =>
  Object.values(seleccionAsientos.value).some(s => Object.keys(s).length > 0)
)

// ---- Precios ----
const precioVuelo = computed(() => Number(props.vuelo?.precio_total) || 0)
const costoAsientos = computed(() => {
  let total = 0
  Object.values(seleccionAsientos.value).forEach(seg => {
    Object.values(seg).forEach(a => {
      if (a?.precio?.monto) total += Number(a.precio.monto)
    })
  })
  return total
})
const formatear = (n) => Number(n || 0).toFixed(2)

// ---- Navegación ----
const validarPasajeros = () => {
  for (let i = 0; i < formPasajeros.value.length; i++) {
    const p = formPasajeros.value[i]
    if (!p.nombres || !p.apellidos || !p.genero || !p.fechaNacimiento || !p.numeroDoc || !p.nacionalidad) {
      errorPaso.value = `Completa todos los datos del pasajero ${i + 1}.`
      return false
    }
    // Validar cédula ecuatoriana cuando el documento es Cédula
    if (p.tipoDoc === 'CEDULA' && !validarCedulaEcuatoriana(p.numeroDoc)) {
      errorPaso.value = `La cédula del pasajero ${i + 1} no es una cédula ecuatoriana válida.`
      return false
    }
    // Validar edad según tipo de pasajero
    if (p.fechaNacimiento) {
      const hoy = new Date()
      const nac = new Date(p.fechaNacimiento)
      const edad = (hoy - nac) / (1000 * 60 * 60 * 24 * 365.25)
      if (p.tipo === 'ADT' && edad < 18) {
        errorPaso.value = `El pasajero ${i + 1} (adulto) debe tener 18 años o más.`
        return false
      }
      if (p.tipo === 'CNN' && (edad < 2 || edad >= 18)) {
        errorPaso.value = `El pasajero ${i + 1} (niño) debe tener entre 2 y 17 años.`
        return false
      }
      if (p.tipo === 'INF' && edad >= 2) {
        errorPaso.value = `El pasajero ${i + 1} (infante) debe tener menos de 2 años.`
        return false
      }
    }
  }
  if (!contacto.email || !contacto.telefono) {
    errorPaso.value = 'Ingresa email y teléfono del titular.'
    return false
  }
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(contacto.email)) {
    errorPaso.value = 'El correo electrónico no es válido.'
    return false
  }
  errorPaso.value = ''
  return true
}

const siguiente = async () => {
  if (paso.value === 'pasajeros') {
    if (!validarPasajeros()) return
    paso.value = 'asientos'
    if (!seatmap.value && !errorSeatmap.value) {
      await cargarSeatmap()
    }
  } else if (paso.value === 'asientos') {
    // Validar que todos los pax no-INF tengan asiento en cada segmento
    if (seatmap.value?.mapas?.length) {
      const paxNoInf = formPasajeros.value.map((p, i) => i).filter(i => formPasajeros.value[i].tipo !== 'INF')
      const conError = []
      seatmap.value.mapas.forEach((_, segIdx) => {
        const sel = seleccionAsientos.value[segIdx] || {}
        if (paxNoInf.some(pIdx => !sel[pIdx])) conError.push(segIdx)
      })
      if (conError.length) {
        segmentosConErrorAsientos.value = conError
        segmentoActivo.value = conError[0]
        errorPaso.value = 'Selecciona un asiento para todos los pasajeros antes de continuar.'
        return
      }
    }
    segmentosConErrorAsientos.value = []
    errorPaso.value = ''
    paso.value = 'resumen'
  }
}

const atras = () => {
  if (pasoIndice.value > 0) paso.value = pasos[pasoIndice.value - 1].id
}

const irAPaso = (id, idx) => {
  if (idx <= pasoIndice.value) paso.value = id
}

const cerrar = () => emit('update:visible', false)

const confirmar = async () => {
  errorPago.value = ''
  procesandoPago.value = true

  const pasajerosPayload = formPasajeros.value.map((p, idx) => {
    const base = {
      passengerType: p.tipo,
      givenName: (p.nombres || '').toUpperCase(),
      surname: (p.apellidos || '').toUpperCase(),
      birthDate: p.fechaNacimiento || null,
      gender: p.genero || null,
      documentType: MAPA_TIPO_DOC_BACKEND[p.tipoDoc] || p.tipoDoc,
      documentNumber: p.numeroDoc || null,
      nationality: p.nacionalidad || null
    }
    if (p.tipoDoc === 'PASAPORTE' && p.vencimientoDoc) {
      base.passportExpiry = p.vencimientoDoc
    }
    // El titular (primer adulto) lleva los datos de contacto
    if (idx === 0) {
      base.email = contacto.email
      base.phone = contacto.telefono
    }
    return base
  })

  const asientosPayload = []
  Object.entries(seleccionAsientos.value).forEach(([segIdx, mapa]) => {
    Object.entries(mapa).forEach(([paxIdx, asiento]) => {
      asientosPayload.push({
        segmento_indice: Number(segIdx) + 1,
        pasajero_id: Number(paxIdx), // 0-based segun BOOKING_FRONTEND.md
        asiento_id: asiento.id,
        offer_item_id: asiento.precio?.offer_item_id || null,
        monto: Number(asiento.precio?.monto || 0)
      })
    })
  })

  const payload = {
    opcion: props.vuelo,
    pasajeros: pasajerosPayload,
    contacto: { email: contacto.email, phone: contacto.telefono },
    asientos_seleccionados: asientosPayload,
    moneda: props.vuelo?.moneda || 'USD'
  }

  // Guardar en sessionStorage para que la pantalla de confirmación
  // pueda mostrar info adicional si quiere (opcional, no requerido).
  try {
    sessionStorage.setItem('booking_pending', JSON.stringify({
      ruta: `${props.origenLabel} -> ${props.destinoLabel}`,
      pasajeros: pasajerosPayload,
      asientos: asientosPayload,
      precio: {
        vuelo: precioVuelo.value,
        asientos: costoAsientos.value,
        total: precioVuelo.value + costoAsientos.value,
        moneda: props.vuelo?.moneda || 'USD'
      }
    }))
  } catch (e) { /* sessionStorage podria estar deshabilitado */ }

  const { ok, status, data } = await crearCheckoutBooking(payload)

  if (!ok || !data?.checkout_url) {
    procesandoPago.value = false
    errorPago.value = data?.error
      || (status === 500 ? 'Error en la pasarela de pago. Contacta a soporte.' : 'No se pudo iniciar el pago. Inténtalo de nuevo.')
    return
  }

  // Notificar al padre (opcional, p/ analytics) y redirigir a Stripe.
  emit('confirmar', {
    vuelo: props.vuelo,
    revalidacion: props.revalidacion,
    pasajeros: formPasajeros.value.map(p => ({ ...p })),
    contacto: { ...contacto },
    asientos: asientosPayload,
    precio: {
      vuelo: precioVuelo.value,
      asientos: costoAsientos.value,
      total: precioVuelo.value + costoAsientos.value,
      moneda: props.vuelo?.moneda || 'USD'
    },
    seatmap_offer_id: seatmap.value?.offer_id || null,
    checkout: { session_id: data.session_id, booking_ref: data.booking_ref }
  })

  window.location.href = data.checkout_url
}

// ---- Reset al abrir ----
watch(() => props.visible, (v) => {
  if (v) {
    paso.value = 'pasajeros'
    errorPaso.value = ''
    errorSeatmap.value = ''
    errorPago.value = ''
    procesandoPago.value = false
    seatmap.value = null
    seleccionAsientos.value = {}
    segmentoActivo.value = 0
    paxActivo.value = 0
    construirPasajeros()
    Object.assign(contacto, { email: '', telefono: '' })
  }
}, { immediate: true })
</script>

<style scoped>
.checkout-overlay {
  position: fixed; inset: 0;
  background: rgba(15, 23, 42, 0.65);
  display: flex; align-items: center; justify-content: center;
  z-index: 9000;
  padding: 16px;
}

.checkout-container {
  width: 100%;
  max-width: 1100px;
  max-height: 92vh;
  background: #fff;
  border-radius: 14px;
  display: flex; flex-direction: column;
  overflow: hidden;
  box-shadow: 0 25px 60px rgba(0,0,0,0.35);
}

/* Header */
.checkout-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 18px 24px;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  color: #fff;
}
.header-info { display: flex; align-items: center; gap: 14px; }
.header-icon {
  width: 42px; height: 42px;
  background: rgba(255,255,255,0.12);
  border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
}
.checkout-header h2 { margin: 0; font-size: 1.2rem; }
.subtitle { margin: 0; font-size: 0.85rem; opacity: 0.8; }
.btn-close {
  background: transparent; border: 0; color: #fff;
  padding: 6px; border-radius: 6px; cursor: pointer;
}
.btn-close:hover { background: rgba(255,255,255,0.1); }

/* Stepper */
.stepper {
  display: flex;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
  padding: 8px 24px;
  gap: 4px;
}
.step {
  flex: 1;
  display: flex; align-items: center; gap: 10px;
  padding: 12px 14px;
  border-radius: 8px;
  cursor: pointer;
  color: #64748b;
  font-size: 0.9rem;
  transition: background 0.2s;
}
.step.disabled { cursor: not-allowed; opacity: 0.5; }
.step.active { background: #fff; color: #1a1a2e; box-shadow: 0 2px 8px rgba(0,0,0,0.06); font-weight: 600; }
.step.done { color: #047857; }
.step-num {
  width: 28px; height: 28px;
  border-radius: 50%;
  background: #e2e8f0; color: #64748b;
  display: flex; align-items: center; justify-content: center;
  font-weight: 700; font-size: 0.85rem;
}
.step.active .step-num { background: #b5931a; color: #fff; }
.step.done .step-num { background: #047857; color: #fff; }

/* Body */
.checkout-body { flex: 1; overflow-y: auto; padding: 24px; background: #f9fafb; }
.step-section { max-width: 980px; margin: 0 auto; }
.section-title { margin: 0 0 6px; color: #1a1a2e; }
.section-help { margin: 0 0 18px; color: #475569; font-size: 0.92rem; }

/* Pasajeros */
.pax-list { display: flex; flex-direction: column; gap: 16px; }
.pax-card {
  background: #fff; border: 1px solid #e2e8f0; border-radius: 10px;
  padding: 18px;
}
.pax-card-header {
  display: flex; align-items: center; gap: 10px; margin-bottom: 14px;
}
.pax-badge {
  font-size: 0.72rem; font-weight: 700; text-transform: uppercase;
  padding: 4px 10px; border-radius: 999px;
}
.badge-adt { background: #e0f2fe; color: #075985; }
.badge-cnn { background: #fef3c7; color: #92400e; }
.badge-inf { background: #fce7f3; color: #9d174d; }
.pax-num { color: #64748b; font-size: 0.85rem; }

.grid-2 {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px 16px;
}
.field { display: flex; flex-direction: column; gap: 4px; }
.field label { font-size: 0.78rem; color: #475569; font-weight: 600; }
.field-hint { font-size: 0.72rem; color: #64748b; margin-top: 2px; display: block; }
.field input, .field select {
  border: 1px solid #cbd5e1; border-radius: 6px;
  padding: 8px 10px; font-size: 0.92rem;
  background: #fff;
}
.field input:focus, .field select:focus {
  outline: none; border-color: #b5931a; box-shadow: 0 0 0 3px rgba(181,147,26,0.15);
}
.contact-section { margin-top: 16px; padding-top: 14px; border-top: 1px dashed #e2e8f0; }
.contact-section h4 { margin: 0 0 10px; font-size: 0.95rem; color: #1a1a2e; }

.error-msg { color: #b91c1c; margin-top: 12px; font-weight: 600; }

/* Asientos */
.loading-block, .warn-block {
  background: #fff; border: 1px solid #e2e8f0; border-radius: 10px;
  padding: 28px; text-align: center;
}
.warn-block { border-color: #fde68a; background: #fffbeb; }
.warn-detail { color: #475569; font-size: 0.88rem; }
.warn-small { color: #64748b; font-size: 0.82rem; margin-top: 6px; }
.spinner {
  width: 36px; height: 36px;
  border: 3px solid #e2e8f0; border-top-color: #b5931a;
  border-radius: 50%;
  margin: 0 auto 12px;
  animation: spin 0.8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

.sandbox-banner {
  background: #fff7ed; color: #9a3412;
  border: 1px solid #fed7aa;
  padding: 10px 14px; border-radius: 8px;
  margin-bottom: 14px; font-size: 0.88rem; font-weight: 600;
}

.seg-tabs { display: flex; gap: 8px; margin-bottom: 14px; flex-wrap: wrap; }
.seg-tab {
  display: flex; flex-direction: column; align-items: flex-start;
  background: #fff; border: 1px solid #e2e8f0; border-radius: 8px;
  padding: 10px 14px; cursor: pointer; font-size: 0.85rem;
  transition: all 0.15s;
}
.seg-tab.active { border-color: #b5931a; background: #fffbeb; box-shadow: 0 2px 8px rgba(181,147,26,0.15); }
.seg-tab.seg-tab-error { border-color: #dc2626; background: #fef2f2; animation: shake 0.35s ease; }
.seg-tab.seg-tab-error .seg-tab-status { color: #dc2626; }
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-4px); }
  75% { transform: translateX(4px); }
}
.seg-tab-flight { font-weight: 700; color: #1a1a2e; }
.seg-tab-route { color: #475569; font-size: 0.78rem; }
.seg-tab-status { color: #b5931a; font-size: 0.75rem; font-weight: 600; margin-top: 2px; }

.pax-selector {
  background: #fff; border: 1px solid #e2e8f0; border-radius: 8px;
  padding: 10px 14px; margin-bottom: 14px;
  display: flex; align-items: center; gap: 12px; flex-wrap: wrap;
}
.pax-selector-label { font-size: 0.85rem; color: #475569; font-weight: 600; }
.pax-pills { display: flex; gap: 6px; flex-wrap: wrap; }
.pax-pill {
  display: inline-flex; align-items: center; gap: 6px;
  background: #f1f5f9; border: 1px solid #e2e8f0;
  padding: 5px 11px; border-radius: 999px; cursor: pointer;
  font-size: 0.82rem; color: #334155;
}
.pax-pill.active { background: #1a1a2e; color: #fff; border-color: #1a1a2e; }
.pax-pill.seleccionado:not(.active) { background: #ecfdf5; color: #065f46; border-color: #a7f3d0; }
.pax-pill:disabled { opacity: 0.5; cursor: not-allowed; }
.pill-seat { font-weight: 700; }

/* Cabina / asientos */
.cabin-wrapper {
  background: #fff; border: 1px solid #e2e8f0; border-radius: 10px;
  padding: 18px; overflow-x: auto;
}
.cabina + .cabina { margin-top: 18px; padding-top: 18px; border-top: 1px dashed #e2e8f0; }
.cabina-title { margin: 0 0 12px; color: #1a1a2e; font-size: 0.95rem; }
.seat-row {
  display: flex; align-items: center; gap: 4px;
  margin-bottom: 4px;
  justify-content: center;
}
.seat-row.header-row { font-weight: 700; color: #64748b; margin-bottom: 8px; }
.row-num {
  width: 26px; text-align: right; color: #64748b;
  font-size: 0.78rem; font-weight: 600;
  margin-right: 6px;
}
.seat-letter {
  width: 34px; text-align: center; font-size: 0.78rem; color: #64748b;
}
.aisle-gap { display: inline-block; width: 18px; }
.seat {
  width: 34px; height: 34px;
  border-radius: 5px;
  background: #e2e8f0;
  border: 1px solid transparent;
  font-size: 0.65rem; font-weight: 700;
  display: inline-flex; align-items: center; justify-content: center;
  cursor: pointer;
  color: #1e293b;
  padding: 0;
  transition: transform 0.1s, box-shadow 0.15s;
}
.seat.empty { background: transparent; cursor: default; }
.seat.libre { background: #dcfce7; color: #166534; }
.seat.libre:hover { background: #bbf7d0; transform: scale(1.05); }
.seat.premium { background: #fef3c7; color: #92400e; border-color: #fcd34d; }
.seat.premium:hover { background: #fde68a; }
.seat.ocupado { background: #e5e7eb; color: #9ca3af; cursor: not-allowed; }
.seat.seleccionado {
  background: #1a1a2e; color: #fff;
  box-shadow: 0 0 0 2px #b5931a;
}
.seat.legend-box { width: 22px; height: 22px; cursor: default; }

.legend {
  display: flex; gap: 18px; flex-wrap: wrap;
  margin-top: 14px; font-size: 0.82rem; color: #475569;
  background: #fff; border: 1px solid #e2e8f0; border-radius: 8px;
  padding: 10px 14px;
}
.legend > span { display: inline-flex; align-items: center; gap: 6px; }

/* Resumen */
.resumen-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}
.resumen-card {
  background: #fff; border: 1px solid #e2e8f0; border-radius: 10px;
  padding: 16px;
}
.resumen-card h4 { margin: 0 0 10px; color: #1a1a2e; font-size: 0.95rem; }
.resumen-card p { margin: 4px 0; font-size: 0.88rem; color: #334155; }
.resumen-pax { list-style: none; padding: 0; margin: 0; }
.resumen-pax li { padding: 6px 0; border-bottom: 1px dashed #e2e8f0; font-size: 0.88rem; }
.resumen-pax li:last-child { border-bottom: 0; }
.resumen-pax-tipo {
  display: inline-block; background: #e0f2fe; color: #075985;
  padding: 2px 8px; border-radius: 999px; font-size: 0.72rem; font-weight: 700;
  margin-right: 6px;
}
.resumen-pax-doc { color: #64748b; font-size: 0.78rem; margin-left: 4px; }
.resumen-contact { margin-top: 10px !important; color: #475569; }
.resumen-seats { list-style: none; padding: 0; margin: 0; }
.resumen-seats li { padding: 6px 0; font-size: 0.88rem; }
.resumen-seat-pill {
  display: inline-block; background: #f1f5f9; color: #1e293b;
  padding: 2px 8px; border-radius: 6px; font-size: 0.78rem;
  margin: 2px 4px 2px 0;
}
.resumen-seat-pill em { font-style: normal; color: #b5931a; font-weight: 700; margin-left: 4px; }
.resumen-empty { color: #64748b; font-size: 0.88rem; font-style: italic; }
.muted { color: #94a3b8; font-style: italic; }

.resumen-precio { grid-column: span 2; }
.precio-row {
  display: flex; justify-content: space-between; padding: 6px 0;
  font-size: 0.92rem; color: #334155;
}
.precio-row.total {
  border-top: 2px solid #1a1a2e; margin-top: 8px; padding-top: 12px;
  font-weight: 700; font-size: 1.1rem; color: #1a1a2e;
}
.resumen-warning {
  margin-top: 10px; color: #b45309; font-size: 0.82rem; font-weight: 600;
}

/* Footer */
.checkout-footer {
  display: flex; align-items: center; justify-content: space-between;
  padding: 14px 24px;
  background: #fff;
  border-top: 1px solid #e2e8f0;
  gap: 12px;
}
.footer-precio { display: flex; flex-direction: column; }
.footer-precio-label { font-size: 0.78rem; color: #64748b; }
.footer-precio-monto { font-weight: 700; color: #1a1a2e; font-size: 1.1rem; }
.footer-actions { display: flex; gap: 10px; }
.btn-primary, .btn-secondary {
  padding: 10px 20px; border-radius: 8px; font-weight: 600;
  cursor: pointer; border: 0; font-size: 0.92rem;
}
.btn-primary {
  background: linear-gradient(135deg, #b5931a 0%, #8a6f14 100%); color: #fff;
}
.btn-primary:hover { background: linear-gradient(135deg, #d4af37 0%, #b5931a 100%); }
.btn-secondary {
  background: #f1f5f9; color: #334155; border: 1px solid #e2e8f0;
}
.btn-secondary:hover { background: #e2e8f0; }
.btn-primary:disabled { opacity: 0.7; cursor: progress; }

.spinner-mini {
  display: inline-block;
  width: 14px; height: 14px;
  border: 2px solid rgba(255,255,255,0.4);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
  vertical-align: middle;
  margin-right: 6px;
}

.pago-error {
  background: #fee2e2; color: #991b1b;
  padding: 10px 16px; font-size: 0.88rem; font-weight: 600;
  border-top: 1px solid #fecaca;
  text-align: center;
}

/* Transitions */
.modal-fade-enter-active, .modal-fade-leave-active { transition: opacity 0.2s ease; }
.modal-fade-enter-from, .modal-fade-leave-to { opacity: 0; }

@media (max-width: 720px) {
  .grid-2 { grid-template-columns: 1fr; }
  .resumen-grid { grid-template-columns: 1fr; }
  .resumen-precio { grid-column: auto; }
  .step-label { display: none; }
  .checkout-header h2 { font-size: 1rem; }
  .stepper { padding: 8px 12px; }
  .checkout-body { padding: 14px; }
}
</style>
