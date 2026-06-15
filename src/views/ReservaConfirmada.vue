<template>
  <div class="reserva-page">
    <Navbar />

    <main class="reserva-main">
      <!-- LOADING -->
      <div v-if="estado === 'cargando'" class="estado-card">
        <div class="spinner-big"></div>
        <h2>Confirmando tu reserva...</h2>
        <p>Estamos verificando el pago y emitiendo tus boletos. No cierres esta ventana.</p>
      </div>

      <!-- ERROR -->
      <div v-else-if="estado === 'error'" class="estado-card estado-error">
        <div class="icon-circle icon-error">!</div>
        <h2>No se pudo confirmar la reserva</h2>
        <p class="error-text">{{ mensajeError }}</p>
        <div class="acciones">
          <button class="btn-secondary" @click="intentarNuevamente" :disabled="cargando">
            Reintentar
          </button>
          <router-link to="/" class="btn-primary">Volver al inicio</router-link>
        </div>
      </div>

      <!-- ÉXITO -->
      <template v-else-if="estado === 'ok' && reserva">
        <section class="header-success">
          <div class="icon-circle icon-success">✓</div>
          <h1>¡Reserva confirmada!</h1>
          <p class="subtitle">Tus boletos fueron emitidos correctamente.</p>
          <p v-if="emailContacto" class="email-enviado">
            Se ha enviado un comprobante a <strong>{{ emailContacto }}</strong>
          </p>
        </section>

        <section class="cards-grid">
          <!-- Resumen principal -->
          <div class="card destacada">
            <span class="card-label">Código de reserva (PNR)</span>
            <h2 class="pnr">{{ resumen?.pnr || reserva?.confirmationId || '—' }}</h2>
            <p class="ruta">{{ resumen?.ruta || '—' }}</p>
            <p class="estado-chip">{{ resumen?.estado || 'CONFIRMADA' }}</p>
          </div>

          <!-- Pago -->
          <div class="card">
            <h3>Pago</h3>
            <div class="row"><span>Estado</span><strong>{{ traducirEstadoPago(pago?.estado) }}</strong></div>
            <div class="row"><span>Monto</span><strong>${{ formatear(pago?.monto) }} {{ pago?.moneda || 'USD' }}</strong></div>
            <div class="row"><span>Proveedor</span><strong>{{ (pago?.proveedor || 'stripe').toUpperCase() }}</strong></div>
            <a v-if="pago?.recibo_url" :href="pago.recibo_url" target="_blank" rel="noopener" class="btn-link">
              Ver recibo
            </a>
          </div>

          <!-- Tickets -->
          <div class="card" v-if="(resumen?.tickets || []).length">
            <h3>Boletos emitidos</h3>
            <ul class="lista">
              <li v-for="t in resumen.tickets" :key="t.number">
                <span class="ticket-num">{{ t.number }}</span>
                <span class="ticket-state">{{ t.ticketStatusName || 'Issued' }}</span>
                <span v-if="t.travelerName" class="ticket-name">{{ t.travelerName }}</span>
                <span v-else-if="t.travelerIndex" class="ticket-name">Pasajero {{ t.travelerIndex }}</span>
              </li>
            </ul>
          </div>

          <!-- Vuelos -->
          <div class="card span-2" v-if="(resumen?.vuelos || []).length">
            <h3>Itinerario</h3>
            <div class="vuelo-row" v-for="(v, i) in resumen.vuelos" :key="i">
              <div class="vuelo-codigo">{{ v.vuelo || ('Vuelo ' + (i + 1)) }}</div>
              <div class="vuelo-ruta">
                <strong>{{ origenVuelo(v) }}</strong>
                <span class="arrow">→</span>
                <strong>{{ destinoVuelo(v) }}</strong>
              </div>
              <div class="vuelo-fecha">
                <span v-if="v.fecha">{{ v.fecha }}</span>
                <span v-if="v.hora_salida"> · {{ v.hora_salida }}</span>
                <span v-if="v.hora_llegada" class="vuelo-llegada">→ {{ v.hora_llegada }}</span>
              </div>
              <div class="vuelo-extra">
                <span v-if="v.clase" class="vuelo-clase">Clase {{ v.clase }}</span>
                <span v-if="v.asiento" class="vuelo-asiento">Asiento {{ v.asiento }}</span>
              </div>
            </div>
          </div>

          <!-- Totales -->
          <div class="card" v-if="resumen?.totales">
            <h3>Totales</h3>
            <div class="row"><span>Vuelo</span><strong>${{ formatear(resumen.totales.vuelo) }}</strong></div>
            <div v-if="resumen.totales.asientos_extras" class="row">
              <span>Asientos extras</span><strong>${{ formatear(resumen.totales.asientos_extras) }}</strong>
            </div>
            <div class="row total">
              <span>Total</span>
              <strong>${{ formatear(resumen.totales.total) }} {{ resumen.totales.moneda || 'USD' }}</strong>
            </div>
          </div>

          <!-- Pasajeros -->
          <div class="card" v-if="(reserva?.booking?.travelers || []).length">
            <h3>Pasajeros</h3>
            <ul class="lista">
              <li v-for="(p, i) in reserva.booking.travelers" :key="i">
                {{ (p.givenName || '') }} {{ (p.surname || '') }}
                <span v-if="p.passengerType" class="pax-tag">{{ p.passengerType }}</span>
              </li>
            </ul>
          </div>
        </section>

        <section class="acciones-finales">
          <router-link to="/" class="btn-primary">Ir al inicio</router-link>
        </section>
      </template>
    </main>

    <Footer_Info />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Navbar from '../components/Navbar.vue'
import Footer_Info from '../components/Footer_Info.vue'
import { confirmarBooking } from '../services/api.js'

const route = useRoute()
const router = useRouter()

const estado = ref('cargando') // 'cargando' | 'ok' | 'error'
const cargando = ref(false)
const reserva = ref(null)
const mensajeError = ref('')

const resumen = computed(() => reserva.value?.resumen || null)
const pago = computed(() => reserva.value?.pago || null)
const emailContacto = computed(() =>
  reserva.value?.pago?.email ||
  reserva.value?.booking?.contactInfo?.emails?.[0] ||
  reserva.value?.booking?.travelers?.[0]?.emails?.[0] ||
  null
)

const formatear = (n) => Number(n || 0).toFixed(2)

const partesRuta = (v) => {
  if (v?.ruta && typeof v.ruta === 'string') {
    const partes = v.ruta.split('->').map((s) => s.trim()).filter(Boolean)
    if (partes.length >= 2) return partes
  }
  return null
}
const origenVuelo = (v) => partesRuta(v)?.[0] || v?.origen || v?.fromAirportCode || v?.departureAirportCode || '—'
const destinoVuelo = (v) => {
  const partes = partesRuta(v)
  if (partes) return partes[partes.length - 1]
  return v?.destino || v?.toAirportCode || v?.arrivalAirportCode || '—'
}

const traducirEstadoPago = (s) => {
  const m = { paid: 'Pagado', pending: 'Pendiente', failed: 'Fallido', requires_payment_method: 'Requiere pago' }
  return m[s] || (s || '—')
}

const cargarReserva = async () => {
  const sid = route.query.session_id
  if (!sid) {
    estado.value = 'error'
    mensajeError.value = 'No se recibió la referencia del pago (session_id).'
    return
  }

  cargando.value = true
  estado.value = 'cargando'
  const { ok, status, data } = await confirmarBooking(sid)
  cargando.value = false

  if (!ok) {
    estado.value = 'error'
    if (status === 402) {
      mensajeError.value = 'El pago aún no se completó. Vuelve a intentar en unos segundos.'
    } else if (status === 404) {
      mensajeError.value = 'La sesión de pago expiró o no se encontró. Inicia una nueva reserva.'
    } else {
      mensajeError.value = data?.error || 'No se pudo confirmar la reserva.'
    }
    return
  }

  reserva.value = data
  estado.value = 'ok'
  // Limpiar contexto pendiente
  try { sessionStorage.removeItem('booking_pending') } catch (e) { /* ignore */ }
}

const intentarNuevamente = () => cargarReserva()

onMounted(() => {
  window.scrollTo(0, 0)
  cargarReserva()
})
</script>

<style scoped>
.reserva-page {
  min-height: 100vh;
  background: #f1f5f9;
}
.reserva-main {
  max-width: 1100px;
  margin: 0 auto;
  padding: 180px 24px 60px;
}
@media (max-width: 768px) {
  .reserva-main {
    padding-top: 140px;
  }
}

.estado-card {
  background: #fff;
  border-radius: 14px;
  padding: 48px 24px;
  text-align: center;
  box-shadow: 0 6px 24px rgba(0,0,0,0.06);
}
.estado-card h2 { margin: 12px 0 6px; color: #1a1a2e; }
.estado-card p { color: #475569; max-width: 460px; margin: 0 auto; }
.estado-error .error-text { color: #b91c1c; margin: 12px 0 18px; font-weight: 600; }
.acciones { display: flex; gap: 12px; justify-content: center; margin-top: 18px; }

.spinner-big {
  width: 54px; height: 54px;
  border: 4px solid #e2e8f0; border-top-color: #b5931a;
  border-radius: 50%;
  margin: 0 auto 14px;
  animation: spin 0.8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

.header-success {
  background: #fff;
  border-radius: 14px;
  padding: 32px 24px;
  text-align: center;
  margin-bottom: 18px;
  box-shadow: 0 6px 24px rgba(0,0,0,0.06);
}
.header-success h1 { margin: 8px 0 4px; color: #1a1a2e; }
.subtitle { color: #475569; margin: 0; }
.email-enviado {
  margin: 10px 0 0;
  color: #0f5132;
  background: #d1e7dd;
  border: 1px solid #badbcc;
  border-radius: 8px;
  padding: 8px 16px;
  font-size: 0.88rem;
  display: inline-block;
}

.icon-circle {
  width: 64px; height: 64px;
  border-radius: 50%;
  margin: 0 auto;
  display: flex; align-items: center; justify-content: center;
  font-size: 32px; font-weight: 700; color: #fff;
}
.icon-success { background: linear-gradient(135deg, #10b981, #047857); }
.icon-error { background: linear-gradient(135deg, #ef4444, #b91c1c); }

.sandbox-tag {
  display: inline-block;
  margin-top: 14px;
  padding: 6px 12px;
  background: #fff7ed;
  color: #9a3412;
  border: 1px solid #fed7aa;
  border-radius: 999px;
  font-size: 0.78rem;
  font-weight: 700;
}

.cards-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
  margin-bottom: 24px;
}
.card {
  background: #fff;
  border-radius: 12px;
  padding: 18px;
  box-shadow: 0 4px 14px rgba(0,0,0,0.05);
}
.card h3 { margin: 0 0 12px; color: #1a1a2e; font-size: 1rem; }
.card .row {
  display: flex; justify-content: space-between;
  padding: 6px 0;
  border-bottom: 1px dashed #e2e8f0;
  font-size: 0.92rem;
}
.card .row:last-child { border-bottom: 0; }
.card .row.total { border-top: 2px solid #1a1a2e; margin-top: 8px; padding-top: 12px; font-size: 1.05rem; }

.span-2 { grid-column: span 2; }

.card.destacada {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  color: #fff;
  text-align: center;
}
.card-label { font-size: 0.78rem; opacity: 0.75; }
.pnr { font-size: 2.2rem; letter-spacing: 4px; margin: 6px 0; font-weight: 800; }
.ruta { margin: 4px 0; color: #cbd5e1; }
.estado-chip {
  display: inline-block;
  margin-top: 8px;
  background: #047857;
  padding: 4px 12px;
  border-radius: 999px;
  font-size: 0.78rem;
  font-weight: 700;
}

.lista { list-style: none; padding: 0; margin: 0; }
.lista li {
  padding: 6px 0;
  border-bottom: 1px dashed #e2e8f0;
  display: flex; gap: 10px; align-items: center;
  font-size: 0.9rem;
}
.lista li:last-child { border-bottom: 0; }

.ticket-num { font-family: monospace; font-weight: 700; color: #1a1a2e; }
.ticket-state {
  font-size: 0.72rem; background: #ecfdf5; color: #065f46;
  padding: 2px 8px; border-radius: 999px; font-weight: 700;
}
.ticket-name { color: #475569; font-size: 0.85rem; margin-left: auto; }
.pax-tag {
  font-size: 0.7rem; background: #e0f2fe; color: #075985;
  padding: 2px 8px; border-radius: 999px; font-weight: 700;
}

.vuelo-row {
  display: grid;
  grid-template-columns: auto 1fr auto auto;
  gap: 12px; align-items: center;
  padding: 10px 0;
  border-bottom: 1px dashed #e2e8f0;
  font-size: 0.92rem;
}
.vuelo-row:last-child { border-bottom: 0; }
.vuelo-codigo { font-weight: 700; color: #b5931a; font-family: monospace; }
.vuelo-ruta { display: flex; gap: 8px; align-items: center; }
.vuelo-ruta .arrow { color: #94a3b8; }
.vuelo-fecha { color: #475569; }
.vuelo-llegada { color: #94a3b8; margin-left: 4px; }
.vuelo-extra { display: flex; gap: 6px; align-items: center; justify-content: flex-end; flex-wrap: wrap; }
.vuelo-clase { font-size: 0.78rem; background: #f1f5f9; padding: 2px 8px; border-radius: 6px; color: #334155; }
.vuelo-asiento { font-size: 0.78rem; background: #eef2ff; padding: 2px 8px; border-radius: 6px; color: #3730a3; font-weight: 600; }

.btn-link {
  display: inline-block; margin-top: 10px;
  color: #b5931a; font-weight: 600; text-decoration: none;
}
.btn-link:hover { text-decoration: underline; }

.acciones-finales {
  display: flex; gap: 12px; justify-content: center; margin-top: 24px;
}
.btn-primary, .btn-secondary {
  padding: 12px 22px; border-radius: 8px; font-weight: 600;
  text-decoration: none; cursor: pointer; border: 0; font-size: 0.95rem;
  display: inline-flex; align-items: center; gap: 6px;
}
.btn-primary {
  background: linear-gradient(135deg, #b5931a 0%, #8a6f14 100%); color: #fff;
}
.btn-primary:hover { background: linear-gradient(135deg, #d4af37 0%, #b5931a 100%); }
.btn-secondary {
  background: #fff; color: #334155; border: 1px solid #cbd5e1;
}
.btn-secondary:hover { background: #f1f5f9; }
.btn-secondary:disabled { opacity: 0.5; cursor: not-allowed; }

@media (max-width: 720px) {
  .cards-grid { grid-template-columns: 1fr; }
  .span-2 { grid-column: auto; }
  .vuelo-row { grid-template-columns: 1fr; gap: 4px; }
}

@media print {
  .acciones-finales, nav, footer { display: none !important; }
}
</style>
