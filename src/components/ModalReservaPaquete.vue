<template>
  <Teleport to="body">
    <transition name="modal-fade">
      <div v-if="visible" class="pkg-overlay">
        <div class="pkg-container">
          <!-- HEADER -->
          <header class="pkg-header">
            <div class="header-info">
              <div class="header-icon">
                <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22"><path d="M20 6h-4V4c0-1.1-.9-2-2-2h-4c-1.1 0-2 .9-2 2v2H4c-1.1 0-2 .9-2 2v11c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-6 0h-4V4h4v2z"/></svg>
              </div>
              <div>
                <h2>Reservar en línea</h2>
                <p class="subtitle">{{ paquete?.titulo }}</p>
              </div>
            </div>
            <button class="btn-close" @click="cerrar" aria-label="Cerrar">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="22" height="22"><path d="M18 6L6 18M6 6l12 12"/></svg>
            </button>
          </header>

          <!-- BODY -->
          <div class="pkg-body">
            <!-- Nº de personas -->
            <section class="pkg-section">
              <h3 class="section-title">Número de personas</h3>
              <div class="stepper-num">
                <button type="button" class="step-btn" :disabled="nPersonas <= 1" @click="ajustarPersonas(-1)">−</button>
                <span class="step-value">{{ nPersonas }}</span>
                <button type="button" class="step-btn" @click="ajustarPersonas(1)">+</button>
              </div>
              <p class="precio-line">
                ${{ formatear(precioUnitario) }} × {{ nPersonas }} =
                <strong>${{ formatear(precioUnitario * nPersonas) }} {{ moneda }}</strong>
              </p>
            </section>

            <!-- Fecha tentativa -->
            <section class="pkg-section">
              <h3 class="section-title">Fecha tentativa de viaje</h3>
              <InputFecha v-model="fechaViaje" :min="fechaMinViaje" :max="fechaMaxViaje" />
              <span class="field-hint">
                <template v-if="rangoPreciosTexto">Selecciona una fecha dentro del periodo en que aplican los precios: {{ rangoPreciosTexto }}.</template>
                <template v-else>Opcional. Confirmaremos disponibilidad contigo.</template>
              </span>
            </section>

            <!-- Datos de contacto -->
            <section class="pkg-section">
              <h3 class="section-title">Datos de contacto</h3>
              <div class="grid-2">
                <div class="field">
                  <label>Correo electrónico *</label>
                  <input v-model.trim="contacto.email" type="email" maxlength="80" placeholder="tucorreo@ejemplo.com" />
                </div>
                <div class="field">
                  <label>Teléfono *</label>
                  <input v-model.trim="contacto.phone" type="tel" maxlength="20" placeholder="+593 99 999 9999" />
                </div>
              </div>
            </section>

            <!-- Viajeros -->
            <section class="pkg-section">
              <h3 class="section-title">Viajeros</h3>
              <p class="section-help">Ingresa los nombres tal como aparecen en el documento de viaje.</p>
              <div class="viajero-list">
                <div v-for="(v, i) in viajeros" :key="i" class="viajero-card">
                  <span class="viajero-num">{{ i + 1 }}</span>
                  <div class="grid-viajero">
                    <div class="field">
                      <label>Nombre *</label>
                      <input v-model.trim="v.nombre" type="text" maxlength="40" />
                    </div>
                    <div class="field">
                      <label>Apellido *</label>
                      <input v-model.trim="v.apellido" type="text" maxlength="40" />
                    </div>
                    <div class="field">
                      <label>Tipo de documento *</label>
                      <select v-model="v.tipoDoc">
                        <option value="CEDULA">Cédula</option>
                        <option value="PASAPORTE">Pasaporte</option>
                      </select>
                    </div>
                    <div class="field">
                      <label>{{ v.tipoDoc === 'PASAPORTE' ? 'N.º de pasaporte *' : 'N.º de cédula *' }}</label>
                      <input
                        v-model.trim="v.documento"
                        type="text"
                        maxlength="30"
                        :inputmode="v.tipoDoc === 'CEDULA' ? 'numeric' : 'text'"
                        :placeholder="v.tipoDoc === 'CEDULA' ? '10 dígitos' : 'Número de pasaporte'"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <p v-if="error" class="error-msg">{{ error }}</p>
          </div>

          <!-- FOOTER -->
          <footer class="pkg-footer">
            <div class="footer-precio">
              <span class="footer-precio-label">Total a pagar</span>
              <span class="footer-precio-monto">${{ formatear(precioUnitario * nPersonas) }} {{ moneda }}</span>
            </div>
            <div class="footer-actions">
              <button class="btn-secondary" @click="cerrar">Cancelar</button>
              <button class="btn-primary" :disabled="procesando" @click="confirmar">
                <span v-if="procesando" class="spinner-mini"></span>
                {{ procesando ? 'Redirigiendo al pago...' : 'Continuar al pago' }}
              </button>
            </div>
          </footer>
        </div>
      </div>
    </transition>
  </Teleport>
</template>

<script setup>
import { ref, computed, reactive, watch } from 'vue'
import { crearCheckoutPaquete } from '../services/api.js'
import InputFecha from './InputFecha.vue'
import { validarCedulaEcuatoriana } from '../utils/validacion.js'

const props = defineProps({
  visible: { type: Boolean, default: false },
  paquete: { type: Object, default: () => ({}) }
})

const emit = defineEmits(['update:visible'])

const hoyISO = new Date().toISOString().slice(0, 10)

const nPersonas = ref(1)
const fechaViaje = ref('')
const contacto = reactive({ email: '', phone: '' })
const viajeros = ref([{ nombre: '', apellido: '', tipoDoc: 'CEDULA', documento: '' }])
const procesando = ref(false)
const error = ref('')

const precioUnitario = computed(() => Number(props.paquete?.precio) || 0)
const moneda = computed(() => props.paquete?.moneda || 'USD')

// La fecha tentativa solo puede elegirse dentro del periodo en que aplican los precios
const normalizarFecha = (f) => {
  if (!f) return ''
  const s = String(f)
  return s.length >= 10 ? s.slice(0, 10) : s
}
const fechaMinViaje = computed(() => {
  const desde = normalizarFecha(props.paquete?.precio_aplica_desde)
  // No permitir fechas pasadas aunque el rango empiece antes de hoy
  if (desde) return desde > hoyISO ? desde : hoyISO
  return hoyISO
})
const fechaMaxViaje = computed(() => normalizarFecha(props.paquete?.precio_aplica_hasta) || '')
const rangoPreciosTexto = computed(() => {
  const desde = normalizarFecha(props.paquete?.precio_aplica_desde)
  const hasta = normalizarFecha(props.paquete?.precio_aplica_hasta)
  if (!desde && !hasta) return ''
  const fmt = (f) => f ? f.split('-').reverse().join('/') : ''
  return `${fmt(desde)} al ${fmt(hasta)}`
})

const formatear = (n) => Number(n || 0).toFixed(2)

const ajustarPersonas = (delta) => {
  const nuevo = nPersonas.value + delta
  if (nuevo < 1) return
  nPersonas.value = nuevo
  // Ajustar lista de viajeros
  const actual = viajeros.value.length
  if (nuevo > actual) {
    for (let i = actual; i < nuevo; i++) viajeros.value.push({ nombre: '', apellido: '', tipoDoc: 'CEDULA', documento: '' })
  } else {
    viajeros.value.splice(nuevo)
  }
}

const validar = () => {
  if (fechaViaje.value) {
    if (fechaMinViaje.value && fechaViaje.value < fechaMinViaje.value) {
      error.value = `La fecha de viaje debe ser a partir del ${fechaMinViaje.value.split('-').reverse().join('/')}.`
      return false
    }
    if (fechaMaxViaje.value && fechaViaje.value > fechaMaxViaje.value) {
      error.value = `La fecha de viaje debe ser hasta el ${fechaMaxViaje.value.split('-').reverse().join('/')}.`
      return false
    }
  }
  if (!contacto.email) {
    error.value = 'Ingresa un correo electrónico de contacto.'
    return false
  }
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(contacto.email)) {
    error.value = 'El correo electrónico no es válido.'
    return false
  }
  if (!contacto.phone) {
    error.value = 'Ingresa un número de teléfono de contacto.'
    return false
  }
  if (contacto.phone.replace(/\D/g, '').length < 7) {
    error.value = 'El número de teléfono no es válido.'
    return false
  }
  for (let i = 0; i < viajeros.value.length; i++) {
    const v = viajeros.value[i]
    if (!v.nombre || !v.apellido) {
      error.value = `Completa nombre y apellido del viajero ${i + 1}.`
      return false
    }
    if (!v.documento) {
      error.value = `Ingresa el documento del viajero ${i + 1}.`
      return false
    }
    if (v.tipoDoc === 'CEDULA' && !validarCedulaEcuatoriana(v.documento)) {
      error.value = `La cédula del viajero ${i + 1} no es una cédula ecuatoriana válida.`
      return false
    }
  }
  error.value = ''
  return true
}

const confirmar = async () => {
  if (!validar()) return
  procesando.value = true

  const payload = {
    paquete_id: props.paquete?.id,
    n_personas: nPersonas.value,
    contacto: { email: contacto.email, phone: contacto.phone },
    viajeros: viajeros.value.map(v => ({
      nombre: (v.nombre || '').toUpperCase(),
      apellido: (v.apellido || '').toUpperCase(),
      tipo_documento: v.tipoDoc,
      documento: v.documento || ''
    })),
    moneda: moneda.value,
    success_url: window.location.origin + '/paquetes/reserva/confirmada',
    cancel_url: window.location.origin + '/paquetes/reserva/cancelada'
  }
  if (fechaViaje.value) payload.fecha_viaje = fechaViaje.value

  const { ok, data } = await crearCheckoutPaquete(payload)

  if (!ok || !data?.checkout_url) {
    procesando.value = false
    error.value = data?.error || 'No se pudo iniciar el pago. Inténtalo de nuevo.'
    return
  }

  window.location.href = data.checkout_url
}

const cerrar = () => emit('update:visible', false)

// Reset al abrir
watch(() => props.visible, (v) => {
  if (v) {
    nPersonas.value = 1
    fechaViaje.value = ''
    Object.assign(contacto, { email: '', phone: '' })
    viajeros.value = [{ nombre: '', apellido: '', tipoDoc: 'CEDULA', documento: '' }]
    procesando.value = false
    error.value = ''
  }
})
</script>

<style scoped>
.pkg-overlay {
  position: fixed; inset: 0; z-index: 2000;
  background: rgba(15, 23, 42, 0.55);
  display: flex; align-items: center; justify-content: center;
  padding: 20px;
}
.pkg-container {
  background: #f8fafc;
  width: 100%; max-width: 720px;
  max-height: 92vh;
  border-radius: 16px;
  display: flex; flex-direction: column;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0,0,0,0.3);
}

.pkg-header {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  color: #fff;
  padding: 18px 22px;
  display: flex; align-items: center; justify-content: space-between;
}
.header-info { display: flex; align-items: center; gap: 14px; }
.header-icon {
  width: 42px; height: 42px; border-radius: 10px;
  background: rgba(255,255,255,0.12);
  display: flex; align-items: center; justify-content: center;
}
.pkg-header h2 { margin: 0; font-size: 1.2rem; }
.subtitle { margin: 2px 0 0; font-size: 0.85rem; color: #cbd5e1; }
.btn-close {
  background: rgba(255,255,255,0.1); border: 0; color: #fff;
  width: 36px; height: 36px; border-radius: 8px; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
}
.btn-close:hover { background: rgba(255,255,255,0.2); }

.pkg-body { padding: 22px; overflow-y: auto; }
.pkg-section { margin-bottom: 22px; }
.section-title { margin: 0 0 10px; color: #1a1a2e; font-size: 1rem; }
.section-help { color: #64748b; font-size: 0.85rem; margin: 0 0 12px; }

.stepper-num { display: flex; align-items: center; gap: 16px; }
.step-btn {
  width: 38px; height: 38px; border-radius: 8px;
  border: 1px solid #cbd5e1; background: #fff; color: #1a1a2e;
  font-size: 1.3rem; cursor: pointer; line-height: 1;
}
.step-btn:hover:not(:disabled) { background: #f1f5f9; }
.step-btn:disabled { opacity: 0.4; cursor: not-allowed; }
.step-value { font-size: 1.3rem; font-weight: 700; min-width: 28px; text-align: center; }
.precio-line { margin: 12px 0 0; color: #475569; font-size: 0.95rem; }

.input {
  width: 100%; padding: 10px 12px;
  border: 1px solid #cbd5e1; border-radius: 8px;
  font-size: 0.95rem; background: #fff;
}
.field-hint { font-size: 0.75rem; color: #64748b; margin-top: 4px; display: block; }

.grid-2 { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; }
.grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; flex: 1; }
.grid-viajero {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px; flex: 1; min-width: 0;
}
.field { display: flex; flex-direction: column; gap: 4px; min-width: 0; }
.field label { font-size: 0.78rem; color: #475569; font-weight: 600; }
.field input, .field select {
  width: 100%; min-width: 0; box-sizing: border-box;
  padding: 9px 11px; border: 1px solid #cbd5e1; border-radius: 8px;
  font-size: 0.92rem; background: #fff;
}
.field input:focus, .field select:focus, .input:focus { outline: none; border-color: #b5931a; }

.viajero-list { display: flex; flex-direction: column; gap: 12px; }
.viajero-card {
  display: flex; gap: 12px; align-items: flex-start;
  background: #fff; border: 1px solid #e2e8f0; border-radius: 10px; padding: 12px;
}
.viajero-num {
  width: 26px; height: 26px; border-radius: 50%; flex-shrink: 0;
  background: #1a1a2e; color: #fff; font-size: 0.82rem; font-weight: 700;
  display: flex; align-items: center; justify-content: center; margin-top: 22px;
}

.error-msg {
  background: #fef2f2; color: #b91c1c; border: 1px solid #fecaca;
  border-radius: 8px; padding: 10px 14px; font-size: 0.88rem; margin: 0;
}

.pkg-footer {
  background: #fff; border-top: 1px solid #e2e8f0;
  padding: 16px 22px;
  display: flex; align-items: center; justify-content: space-between; gap: 16px;
  flex-wrap: wrap;
}
.footer-precio { display: flex; flex-direction: column; }
.footer-precio-label { font-size: 0.75rem; color: #64748b; }
.footer-precio-monto { font-size: 1.2rem; font-weight: 800; color: #1a1a2e; }
.footer-actions { display: flex; gap: 10px; }

.btn-primary, .btn-secondary {
  padding: 11px 20px; border-radius: 8px; font-weight: 600;
  cursor: pointer; border: 0; font-size: 0.95rem;
  display: inline-flex; align-items: center; gap: 8px;
}
.btn-primary { background: linear-gradient(135deg, #b5931a 0%, #8a6f14 100%); color: #fff; }
.btn-primary:hover:not(:disabled) { background: linear-gradient(135deg, #d4af37 0%, #b5931a 100%); }
.btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
.btn-secondary { background: #fff; color: #334155; border: 1px solid #cbd5e1; }
.btn-secondary:hover { background: #f1f5f9; }

.spinner-mini {
  width: 16px; height: 16px;
  border: 2px solid rgba(255,255,255,0.4); border-top-color: #fff;
  border-radius: 50%; animation: spin 0.7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

.modal-fade-enter-active, .modal-fade-leave-active { transition: opacity 0.2s; }
.modal-fade-enter-from, .modal-fade-leave-to { opacity: 0; }

@media (max-width: 600px) {
  .grid-2, .grid-3, .grid-viajero { grid-template-columns: 1fr; }
  .viajero-num { margin-top: 0; }
  .viajero-card { flex-direction: column; }
}
</style>
