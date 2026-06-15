<template>
  <div class="reserva-page">
    <Navbar />

    <main class="reserva-main">
      <!-- LOADING -->
      <div v-if="estado === 'cargando'" class="estado-card">
        <div class="spinner-big"></div>
        <h2>Confirmando tu reserva...</h2>
        <p>Estamos verificando el pago de tu paquete. No cierres esta ventana.</p>
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
          <p class="subtitle">
            Te enviamos el voucher a tu correo en unos instantes.
            Nuestro equipo te contactará con los detalles finales del viaje.
          </p>
          <p v-if="emailContacto" class="email-enviado">
            Se ha enviado un comprobante a <strong>{{ emailContacto }}</strong>
          </p>
        </section>

        <section class="cards-grid">
          <!-- Resumen principal -->
          <div class="card destacada">
            <span class="card-label">Localizador de reserva</span>
            <h2 class="pnr">{{ reserva.localizador || '—' }}</h2>
            <p class="ruta">{{ paquete?.titulo || '—' }}</p>
            <p class="estado-chip">{{ reserva.estado || 'CONFIRMADA' }}</p>
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

          <!-- Detalle del paquete -->
          <div class="card span-2" v-if="paquete">
            <h3>Detalle del paquete</h3>
            <div class="paquete-detalle">
              <img v-if="paquete.imagen_url" :src="paquete.imagen_url" :alt="paquete.titulo" class="paquete-img" />
              <div class="paquete-info">
                <p class="paquete-titulo">{{ paquete.titulo }}</p>
                <p v-if="paquete.destino" class="paquete-destino">{{ paquete.destino }}</p>
                <div class="paquete-tags">
                  <span v-if="paquete.duracion_dias" class="tag">{{ paquete.duracion_dias }} días / {{ paquete.duracion_noches }} noches</span>
                  <span v-if="reserva.fecha_viaje" class="tag">Viaje: {{ reserva.fecha_viaje }}</span>
                  <span v-if="paquete.aerolinea?.nombre" class="tag">{{ paquete.aerolinea.nombre }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Viajeros -->
          <div class="card" v-if="(reserva.viajeros || []).length">
            <h3>Viajeros</h3>
            <ul class="lista">
              <li v-for="(v, i) in reserva.viajeros" :key="i">
                {{ v.nombre }}
                <span v-if="v.documento" class="pax-tag">{{ v.documento }}</span>
              </li>
            </ul>
          </div>

          <!-- Totales -->
          <div class="card" v-if="reserva.totales">
            <h3>Totales</h3>
            <div class="row">
              <span>Precio unitario</span>
              <strong>${{ formatear(reserva.totales.precio_unitario) }}</strong>
            </div>
            <div class="row">
              <span>Personas</span><strong>{{ reserva.totales.n_personas }}</strong>
            </div>
            <div class="row total">
              <span>Total</span>
              <strong>${{ formatear(reserva.totales.total) }} {{ reserva.totales.moneda || 'USD' }}</strong>
            </div>
          </div>
        </section>

        <section class="acciones-finales">
          <router-link to="/" class="btn-primary">Ir al inicio</router-link>
          <button class="btn-secondary" :disabled="descargando" @click="descargarVoucher">
            <span v-if="descargando" class="spinner-mini"></span>
            {{ descargando ? 'Generando PDF...' : 'Descargar voucher PDF' }}
          </button>
        </section>
        <p v-if="errorVoucher" class="voucher-error">{{ errorVoucher }}</p>
      </template>
    </main>

    <Footer_Info />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import Navbar from '../components/Navbar.vue'
import Footer_Info from '../components/Footer_Info.vue'
import { confirmarBookingPaquete, descargarVoucherPaquete } from '../services/api.js'

const route = useRoute()

const estado = ref('cargando') // 'cargando' | 'ok' | 'error'
const cargando = ref(false)
const reserva = ref(null)
const mensajeError = ref('')
const descargando = ref(false)
const errorVoucher = ref('')

const paquete = computed(() => reserva.value?.paquete || null)
const pago = computed(() => reserva.value?.pago || null)
const emailContacto = computed(() =>
  reserva.value?.pago?.email || reserva.value?.contacto?.email || null
)

const formatear = (n) => Number(n || 0).toFixed(2)

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
  const { ok, status, data } = await confirmarBookingPaquete(sid)
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
}

const intentarNuevamente = () => cargarReserva()

const descargarVoucher = async () => {
  errorVoucher.value = ''
  descargando.value = true
  const { ok, blob, error } = await descargarVoucherPaquete({
    sessionId: route.query.session_id,
    loc: reserva.value?.localizador,
    reserva: reserva.value,
    format: 'pdf'
  })
  descargando.value = false

  if (!ok || !blob) {
    errorVoucher.value = error || 'No se pudo descargar el voucher. Te lo enviamos por correo.'
    return
  }

  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `CorpoDG_Paquete_${reserva.value?.localizador || 'reserva'}.pdf`
  document.body.appendChild(a)
  a.click()
  a.remove()
  window.URL.revokeObjectURL(url)
}

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
  .reserva-main { padding-top: 140px; }
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
.subtitle { color: #475569; margin: 0 auto; max-width: 560px; }
.email-enviado {
  margin: 12px auto 0;
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

.paquete-detalle { display: flex; gap: 16px; align-items: flex-start; }
.paquete-img {
  width: 140px; height: 100px; object-fit: cover;
  border-radius: 10px; flex-shrink: 0;
}
.paquete-info { flex: 1; }
.paquete-titulo { margin: 0 0 4px; font-weight: 700; color: #1a1a2e; font-size: 1.05rem; }
.paquete-destino { margin: 0 0 8px; color: #475569; font-size: 0.9rem; }
.paquete-tags { display: flex; gap: 8px; flex-wrap: wrap; }
.tag {
  font-size: 0.76rem; background: #f1f5f9; color: #334155;
  padding: 3px 10px; border-radius: 999px;
}

.lista { list-style: none; padding: 0; margin: 0; }
.lista li {
  padding: 6px 0;
  border-bottom: 1px dashed #e2e8f0;
  display: flex; gap: 10px; align-items: center;
  font-size: 0.9rem;
}
.lista li:last-child { border-bottom: 0; }
.pax-tag {
  font-size: 0.7rem; background: #e0f2fe; color: #075985;
  padding: 2px 8px; border-radius: 999px; font-weight: 700; margin-left: auto;
}

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

.spinner-mini {
  width: 15px; height: 15px;
  border: 2px solid #cbd5e1; border-top-color: #475569;
  border-radius: 50%; animation: spin 0.7s linear infinite;
}
.voucher-error {
  text-align: center; color: #b45309; margin: 12px 0 0;
  font-size: 0.88rem;
}

@media (max-width: 720px) {
  .cards-grid { grid-template-columns: 1fr; }
  .span-2 { grid-column: auto; }
  .paquete-detalle { flex-direction: column; }
  .paquete-img { width: 100%; height: 160px; }
}
</style>
