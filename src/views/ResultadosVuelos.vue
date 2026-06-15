<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { buscarVuelosLive, buscarAerolineaIATA, revalidarVuelo } from '../services/api.js'
import Navbar from '../components/Navbar.vue'
import Footer_Info from '../components/Footer_Info.vue'
import ModalContacto from '../components/ModalContacto.vue'
import ModalCheckoutVuelo from '../components/ModalCheckoutVuelo.vue'

const route = useRoute()
const router = useRouter()

// Estado principal
const vuelos = ref([])
const cargando = ref(true)
const error = ref(null)
const logosAerolineas = ref({})

// Datos de búsqueda desde query params
const busqueda = computed(() => ({
  origin: route.query.origin || '',
  destination: route.query.destination || '',
  date: route.query.date || '',
  return_date: route.query.return_date || '',
  adults: parseInt(route.query.adults) || 1,
  children: parseInt(route.query.children) || 0,
  infants: parseInt(route.query.infants) || 0,
  cabin_class: route.query.cabin_class || 'Y',
  limit: parseInt(route.query.limit) || 50,
  origenLabel: route.query.origenLabel || route.query.origin,
  destinoLabel: route.query.destinoLabel || route.query.destination,
  tipoViaje: route.query.tipoViaje || 'idaVuelta'
}))

// Filtros y ordenamiento
const ordenarPor = ref('recomendado') // 'recomendado', 'precio', 'duracion', 'escalas'
const filtroParadas = ref('todos') // 'todos', 'directo', 'escalas'
const filtroAerolinea = ref('todas')

// Modal de contacto
const mostrarModalContacto = ref(false)
const mensajeReserva = ref('')
const mensajeReservaInterno = ref('')

// Checkout (pasajeros + asientos + resumen)
const mostrarCheckout = ref(false)
const vueloCheckout = ref(null)
const revalidacionCheckout = ref(null)

// Revalidación
const revalidandoId = ref(null) // id del vuelo que se está revalidando
const notificacion = ref(null)  // { tipo: 'error'|'success'|'warning', texto: string }
let notificacionTimeoutId = null
const mostrarNotificacion = (tipo, texto, duracionMs = 5000) => {
  notificacion.value = { tipo, texto }
  if (notificacionTimeoutId) clearTimeout(notificacionTimeoutId)
  if (duracionMs > 0) {
    notificacionTimeoutId = setTimeout(() => { notificacion.value = null }, duracionMs)
  }
}
const cerrarNotificacion = () => {
  notificacion.value = null
  if (notificacionTimeoutId) clearTimeout(notificacionTimeoutId)
}

// Clases
const clases = {
  'Y': 'Económica',
  'S': 'Económica Premium',
  'C': 'Ejecutiva',
  'J': 'Ejecutiva Premium',
  'F': 'Primera Clase',
  'P': 'Primera Clase Premium'
}

// Aerolineas únicas para filtro
const aerolineasDisponibles = computed(() => {
  const aerolineas = new Set()
  vuelos.value.forEach(v => {
    if (v.aerolinea_validadora) aerolineas.add(v.aerolinea_validadora)
  })
  return Array.from(aerolineas).sort()
})

// Vuelos filtrados y ordenados
const vuelosFiltrados = computed(() => {
  let resultado = [...vuelos.value]

  // Filtro por paradas
  if (filtroParadas.value === 'directo') {
    resultado = resultado.filter(v =>
      v.tramos.every(t => !t.tiene_escalas)
    )
  } else if (filtroParadas.value === 'escalas') {
    resultado = resultado.filter(v =>
      v.tramos.some(t => t.tiene_escalas)
    )
  }

  // Filtro por aerolínea
  if (filtroAerolinea.value !== 'todas') {
    resultado = resultado.filter(v => v.aerolinea_validadora === filtroAerolinea.value)
  }

  // Ordenamiento
  if (ordenarPor.value === 'recomendado') {
    // SIEMPRE: directo primero -> menor duración -> menor precio
    resultado.sort((a, b) => {
      const escA = a.tramos.reduce((sum, t) => sum + t.numero_escalas, 0)
      const escB = b.tramos.reduce((sum, t) => sum + t.numero_escalas, 0)
      if (escA !== escB) return escA - escB
      const durA = a.tramos.reduce((sum, t) => sum + t.duracion_minutos, 0)
      const durB = b.tramos.reduce((sum, t) => sum + t.duracion_minutos, 0)
      if (durA !== durB) return durA - durB
      return (a.precio_total || 0) - (b.precio_total || 0)
    })
  } else if (ordenarPor.value === 'precio') {
    // Dentro de directos primero, luego precio
    resultado.sort((a, b) => {
      const escA = a.tramos.reduce((sum, t) => sum + t.numero_escalas, 0)
      const escB = b.tramos.reduce((sum, t) => sum + t.numero_escalas, 0)
      if (escA !== escB) return escA - escB
      return (a.precio_total || 0) - (b.precio_total || 0)
    })
  } else if (ordenarPor.value === 'duracion') {
    // Dentro de directos primero, luego duración
    resultado.sort((a, b) => {
      const escA = a.tramos.reduce((sum, t) => sum + t.numero_escalas, 0)
      const escB = b.tramos.reduce((sum, t) => sum + t.numero_escalas, 0)
      if (escA !== escB) return escA - escB
      const durA = a.tramos.reduce((sum, t) => sum + t.duracion_minutos, 0)
      const durB = b.tramos.reduce((sum, t) => sum + t.duracion_minutos, 0)
      return durA - durB
    })
  } else if (ordenarPor.value === 'escalas') {
    resultado.sort((a, b) => {
      const escA = a.tramos.reduce((sum, t) => sum + t.numero_escalas, 0)
      const escB = b.tramos.reduce((sum, t) => sum + t.numero_escalas, 0)
      if (escA !== escB) return escA - escB
      const durA = a.tramos.reduce((sum, t) => sum + t.duracion_minutos, 0)
      const durB = b.tramos.reduce((sum, t) => sum + t.duracion_minutos, 0)
      if (durA !== durB) return durA - durB
      return (a.precio_total || 0) - (b.precio_total || 0)
    })
  }

  return resultado
})

// -- Formatear hora --
const formatearHora = (hora) => {
  if (!hora) return '--:--'
  // hora viene como "04:20:00-05:00" o "22:30:00-04:00"
  const match = hora.match(/^(\d{2}):(\d{2})/)
  if (match) return `${match[1]}:${match[2]}`
  return hora.substring(0, 5)
}

// -- Formatear fecha --
const formatearFecha = (fecha) => {
  if (!fecha) return ''
  const d = new Date(fecha + 'T00:00:00')
  const opciones = { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }
  return d.toLocaleDateString('es-ES', opciones)
}

// -- Obtener logo aerolínea --
const getLogoAerolinea = (codigo) => {
  return logosAerolineas.value[codigo]?.logo_url || null
}

const getNombreAerolinea = (codigo) => {
  return logosAerolineas.value[codigo]?.nombre || codigo
}

// -- Cargar logos de aerolíneas --
const cargarLogosAerolineas = async (codigosUnicos) => {
  const promesas = codigosUnicos.map(async (codigo) => {
    if (logosAerolineas.value[codigo]) return
    try {
      const data = await buscarAerolineaIATA(codigo)
      if (data) {
        logosAerolineas.value[codigo] = data
      }
    } catch (e) {
      console.warn(`No se pudo cargar logo para ${codigo}`)
    }
  })
  await Promise.all(promesas)
}

// -- Buscar vuelos --
const realizarBusqueda = async () => {
  cargando.value = true
  error.value = null
  vuelos.value = []

  try {
    const payload = {
      origin: busqueda.value.origin,
      destination: busqueda.value.destination,
      date: busqueda.value.date,
      return_date: busqueda.value.return_date || undefined,
      adults: busqueda.value.adults,
      children: busqueda.value.children,
      infants: busqueda.value.infants,
      cabin_class: busqueda.value.cabin_class,
      limit: busqueda.value.limit
    }

    // Limpiar return_date si es solo ida
    if (!payload.return_date) delete payload.return_date

    const resultado = await buscarVuelosLive(payload)

    if (resultado.error) {
      error.value = resultado.error
      return
    }

    vuelos.value = Array.isArray(resultado) ? resultado : []

    // Cargar logos de aerolíneas
    const codigos = new Set()
    vuelos.value.forEach(v => {
      if (v.aerolinea_validadora) codigos.add(v.aerolinea_validadora)
      v.tramos?.forEach(t => {
        t.segmentos?.forEach(s => {
          if (s.aerolinea?.codigo) codigos.add(s.aerolinea.codigo)
          if (s.aerolinea?.operada_por) codigos.add(s.aerolinea.operada_por)
        })
      })
    })
    await cargarLogosAerolineas(Array.from(codigos))
  } catch (e) {
    error.value = e.message || 'Error al buscar vuelos. Inténtalo de nuevo.'
  } finally {
    cargando.value = false
  }
}

// -- Expandir detalle --
const expandido = ref({})
const toggleDetalle = (id) => {
  expandido.value[id] = !expandido.value[id]
}

const formatearProveedor = (proveedor) => {
  if (!proveedor) return 'No especificado'
  const proveedorNormalizado = String(proveedor).trim().toLowerCase()

  if (proveedorNormalizado.includes('sabre')) return 'Sabre'
  if (proveedorNormalizado.includes('kiu')) return 'KIU System'

  return proveedor
}

const formatearProveedorBusqueda = (proveedor) => {
  const proveedorNormalizado = String(proveedor || '').trim().toLowerCase()

  if (proveedorNormalizado.includes('kiu')) return 'KIU SYSTEM'
  if (proveedorNormalizado.includes('sabre')) return 'SABRE'

  const proveedorLimpio = formatearProveedor(proveedor)
  return proveedorLimpio.toUpperCase()
}

const formatearPrecio = (valor) => {
  const numero = Number(valor)
  return Number.isFinite(numero) ? numero.toFixed(2) : '0.00'
}

const construirResumenTramosParaAgente = (tramos = []) => {
  if (!Array.isArray(tramos) || tramos.length === 0) {
    return 'Detalle de tramos no disponible.'
  }

  return tramos.map((tramo, idx) => {
    const etiquetaTramo = tramo.tipo === 'ida'
      ? 'Tramo ida'
      : tramo.tipo === 'vuelta'
        ? 'Tramo vuelta'
        : `Tramo ${idx + 1}`

    const salida = formatearHora(tramo.origen?.hora)
    const llegada = formatearHora(tramo.destino?.hora)
    const escalasTexto = tramo.tiene_escalas
      ? `${tramo.numero_escalas} escala${tramo.numero_escalas > 1 ? 's' : ''}`
      : 'Directo'

    const vuelosSegmentos = (tramo.segmentos || [])
      .map(s => s.vuelo)
      .filter(Boolean)
      .join(' / ')

    return `${etiquetaTramo}: ${tramo.origen?.aeropuerto || 'N/D'} ${salida} > ${tramo.destino?.aeropuerto || 'N/D'} ${llegada} | ${tramo.duracion_total || 'N/D'} | ${escalasTexto}${vuelosSegmentos ? ` | ${vuelosSegmentos}` : ''}`
  }).join('\n')
}

// -- Reservar vuelo (revalida primero contra el backend) --
const handleReservar = async (vuelo) => {
  if (revalidandoId.value) return // evitar dobles clicks
  revalidandoId.value = vuelo.id
  try {
    const { ok, status, data } = await revalidarVuelo(vuelo, {
      adults: busqueda.value.adults,
      children: busqueda.value.children,
      infants: busqueda.value.infants
    })

    if (!ok) {
      if (status === 409) {
        mostrarNotificacion('error', 'Este vuelo ya no está disponible. Actualizando resultados...', 6000)
        await realizarBusqueda()
      } else if (status === 400) {
        mostrarNotificacion('error', data?.error || 'Datos del itinerario incompletos.')
      } else {
        mostrarNotificacion('error', data?.error || 'No se pudo verificar la disponibilidad del vuelo. Inténtalo de nuevo.')
      }
      return
    }

    // Disponible: actualizar precio/condiciones con la respuesta confirmada
    const precioOriginal = Number(vuelo.precio_total)
    const precioConfirmado = Number(data.precio_total)
    if (Number.isFinite(precioConfirmado)) {
      if (Number.isFinite(precioOriginal) && Math.abs(precioConfirmado - precioOriginal) >= 0.01) {
        const continuar = window.confirm(
          `El precio del vuelo se actualizó.\n\n` +
          `Anterior: $${formatearPrecio(precioOriginal)} ${vuelo.moneda || ''}\n` +
          `Nuevo: $${formatearPrecio(precioConfirmado)} ${data.moneda || vuelo.moneda || ''}\n\n` +
          `¿Deseas continuar con el nuevo precio?`
        )
        if (!continuar) return
        mostrarNotificacion('warning', 'El precio fue actualizado al valor confirmado por la aerolínea.', 4000)
      }
      vuelo.precio_total = precioConfirmado
    }
    if (Number.isFinite(Number(data.precio_base))) vuelo.precio_base = Number(data.precio_base)
    if (Number.isFinite(Number(data.impuestos))) vuelo.impuestos = Number(data.impuestos)
    if (data.moneda) vuelo.moneda = data.moneda
    if (data.ultima_fecha_compra) vuelo.ultima_fecha_compra = data.ultima_fecha_compra
    if (data.aerolinea_validadora) vuelo.aerolinea_validadora = data.aerolinea_validadora

    abrirCheckout(vuelo, data)
  } finally {
    revalidandoId.value = null
  }
}

// Abre el modal de checkout (pasajeros + asientos + resumen).
const abrirCheckout = (vuelo, revalidacion = null) => {
  vueloCheckout.value = vuelo
  revalidacionCheckout.value = revalidacion
  mostrarCheckout.value = true
}

// Cuando el usuario confirma desde el checkout: el modal ya inició la
// redirección a Stripe (window.location.href). Aquí sólo limpiamos UI
// y guardamos contexto por si el usuario vuelve.
const handleConfirmarCheckout = (payload) => {
  mostrarCheckout.value = false
  mostrarNotificacion('success', 'Redirigiéndote al pago seguro...', 4000)
  // payload disponible por si se quiere registrar en analytics
  void payload
}

const abrirModalReserva = (vuelo, revalidacion = null, checkout = null) => {
  const proveedorItinerario = formatearProveedor(vuelo.proveedor)
  const proveedorBusqueda = formatearProveedorBusqueda(vuelo.proveedor)
  const pasajerosTexto = `${busqueda.value.adults} adulto(s)${busqueda.value.children ? ', ' + busqueda.value.children + ' niño(s)' : ''}${busqueda.value.infants ? ', ' + busqueda.value.infants + ' infante(s)' : ''}`
  const fechasTexto = busqueda.value.return_date
    ? `Ida: ${busqueda.value.date} | Vuelta: ${busqueda.value.return_date}`
    : `Ida: ${busqueda.value.date}`
  const resumenTramos = construirResumenTramosParaAgente(vuelo.tramos)

  const lineas = [
    'Solicitud de reserva de vuelo',
    `Aerolínea: ${getNombreAerolinea(vuelo.aerolinea_validadora)}`,
    `Ruta: ${busqueda.value.origenLabel} -> ${busqueda.value.destinoLabel}`,
    fechasTexto,
    `Pasajeros: ${pasajerosTexto} | Clase: ${clases[busqueda.value.cabin_class] || busqueda.value.cabin_class}`,
    `Total vuelo: $${formatearPrecio(vuelo.precio_total)} ${vuelo.moneda || ''} (Base $${formatearPrecio(vuelo.precio_base)}, Impuestos $${formatearPrecio(vuelo.impuestos)})`,
    `Emitir antes de: ${vuelo.ultima_fecha_compra || 'N/D'}${revalidacion?.ultima_hora_compra ? ' ' + revalidacion.ultima_hora_compra : ''}`,
    'Disponibilidad confirmada con la aerolínea.'
  ]

  if (checkout?.pasajeros?.length) {
    lineas.push('', 'Pasajeros:')
    checkout.pasajeros.forEach((p, i) => {
      lineas.push(
        `  ${i + 1}. [${p.tipo}] ${p.nombres} ${p.apellidos} | ${p.tipoDoc}: ${p.numeroDoc} | Nac: ${p.fechaNacimiento} | ${p.genero} | ${p.nacionalidad}`
      )
    })
    if (checkout.contacto?.email) {
      lineas.push('', `Contacto titular: ${checkout.contacto.email} | Tel: ${checkout.contacto.telefono}`)
    }
  }

  if (checkout?.asientos?.length) {
    lineas.push('', 'Asientos seleccionados:')
    checkout.asientos.forEach(a => {
      const pax = checkout.pasajeros?.[a.pasajero_indice - 1]
      const nombrePax = pax ? `${pax.nombres} ${pax.apellidos}` : `Pax ${a.pasajero_indice}`
      const costo = a.monto ? ` (+$${formatearPrecio(a.monto)} ${a.moneda})` : ''
      lineas.push(`  Segmento ${a.segmento_indice} - ${nombrePax}: ${a.asiento_id}${costo}`)
    })
  }

  if (checkout?.precio) {
    lineas.push('', `TOTAL FINAL: $${formatearPrecio(checkout.precio.total)} ${checkout.precio.moneda} ` +
      `(vuelo $${formatearPrecio(checkout.precio.vuelo)} + asientos $${formatearPrecio(checkout.precio.asientos)})`)
  }

  lineas.push('', 'Detalle operativo del itinerario:', resumenTramos, '', 'Favor confirmar y proceder con la emisión.')
  mensajeReserva.value = lineas.join('\n')

  const internas = [
    `Proveedor del servicio: ${proveedorItinerario} | Buscado en ${proveedorBusqueda}`
  ]
  if (checkout?.seatmap_offer_id) internas.push(`Seatmap offer_id: ${checkout.seatmap_offer_id}`)
  if (checkout?.asientos?.some(a => a.offer_item_id)) {
    internas.push('Offer items asientos:')
    checkout.asientos.filter(a => a.offer_item_id).forEach(a => {
      internas.push(`  seg ${a.segmento_indice} pax ${a.pasajero_indice} -> ${a.offer_item_id}`)
    })
  }
  mensajeReservaInterno.value = internas.join('\n')

  mostrarModalContacto.value = true
}

// -- Volver --
const volver = () => {
  router.push('/boletos')
}

onMounted(() => {
  window.scrollTo(0, 0)
  realizarBusqueda()
})
</script>

<template>
  <div class="resultados-page">
    <!-- Header resumen de búsqueda -->
    <section class="search-header">
      <div class="search-header-content">
        <button class="btn-volver" @click="volver">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>
          Volver
        </button>
        
        <div class="search-summary">
          <div class="route-info">
            <div class="route-airports">
              <span class="airport-code">{{ busqueda.origin }}</span>
              <div class="route-line">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24"><path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/></svg>
                <div class="line"></div>
                <template v-if="busqueda.tipoViaje === 'idaVuelta'">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24" style="transform: scaleX(-1)"><path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/></svg>
                </template>
              </div>
              <span class="airport-code">{{ busqueda.destination }}</span>
            </div>
            <div class="route-labels">
              <span>{{ busqueda.origenLabel }}</span>
              <span>{{ busqueda.destinoLabel }}</span>
            </div>
          </div>

          <div class="search-details">
            <div class="detail-chip">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11z"/></svg>
              <span>{{ formatearFecha(busqueda.date) }}</span>
              <template v-if="busqueda.return_date">
                <span class="detail-sep">→</span>
                <span>{{ formatearFecha(busqueda.return_date) }}</span>
              </template>
            </div>
            <div class="detail-chip">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
              <span>{{ busqueda.adults }} adulto{{ busqueda.adults > 1 ? 's' : '' }}</span>
              <span v-if="busqueda.children">, {{ busqueda.children }} niño{{ busqueda.children > 1 ? 's' : '' }}</span>
              <span v-if="busqueda.infants">, {{ busqueda.infants }} infante{{ busqueda.infants > 1 ? 's' : '' }}</span>
            </div>
            <div class="detail-chip">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M21 3H3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H3V5h18v14z"/></svg>
              <span>{{ clases[busqueda.cabin_class] || busqueda.cabin_class }}</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Estado de carga -->
    <section v-if="cargando" class="loading-section">
      <div class="loading-container">
        <div class="airplane-loader">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="48" height="48"><path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/></svg>
        </div>
        <h2>Buscando los mejores vuelos...</h2>
        <p>Estamos consultando las aerolíneas disponibles para tu ruta</p>
        <div class="loading-bar">
          <div class="loading-bar-fill"></div>
        </div>
      </div>
    </section>

    <!-- Error -->
    <section v-else-if="error" class="error-section">
      <div class="error-container">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="64" height="64"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
        <h2>No se pudieron encontrar vuelos</h2>
        <p>{{ error }}</p>
        <button class="btn-reintentar" @click="realizarBusqueda">Reintentar</button>
        <button class="btn-volver-secondary" @click="volver">Cambiar búsqueda</button>
      </div>
    </section>

    <!-- Sin resultados -->
    <section v-else-if="vuelos.length === 0" class="empty-section">
      <div class="empty-container">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="64" height="64"><path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/></svg>
        <h2>No se encontraron vuelos</h2>
        <p>No hay vuelos disponibles para esta ruta y fechas. Intenta con fechas diferentes.</p>
        <button class="btn-volver-secondary" @click="volver">Cambiar búsqueda</button>
      </div>
    </section>

    <!-- Resultados -->
    <section v-else class="results-section">
      <!-- Barra de filtros -->
      <div class="filters-bar">
        <div class="filters-left">
          <span class="results-count">{{ vuelosFiltrados.length }} vuelo{{ vuelosFiltrados.length !== 1 ? 's' : '' }} encontrado{{ vuelosFiltrados.length !== 1 ? 's' : '' }}</span>
        </div>
        <div class="filters-right">
          <div class="filter-group">
            <label>Ordenar:</label>
            <select v-model="ordenarPor">
              <option value="recomendado">Recomendado</option>
              <option value="precio">Menor precio</option>
              <option value="duracion">Menor duración</option>
              <option value="escalas">Menos escalas</option>
            </select>
          </div>
          <div class="filter-group">
            <label>Paradas:</label>
            <select v-model="filtroParadas">
              <option value="todos">Todas</option>
              <option value="directo">Solo directo</option>
              <option value="escalas">Con escalas</option>
            </select>
          </div>
          <div class="filter-group" v-if="aerolineasDisponibles.length > 1">
            <label>Aerolínea:</label>
            <select v-model="filtroAerolinea">
              <option value="todas">Todas</option>
              <option v-for="al in aerolineasDisponibles" :key="al" :value="al">
                {{ getNombreAerolinea(al) }}
              </option>
            </select>
          </div>
        </div>
      </div>

      <!-- Lista de vuelos -->
      <div class="flights-list">
        <div 
          v-for="vuelo in vuelosFiltrados" 
          :key="vuelo.id" 
          class="flight-card"
          :class="{ expanded: expandido[vuelo.id] }"
        >
          <!-- Contenido principal -->
          <div class="flight-main" @click="toggleDetalle(vuelo.id)">
            <!-- Info aerolínea -->
            <div class="airline-info">
              <img 
                v-if="getLogoAerolinea(vuelo.aerolinea_validadora)" 
                :src="getLogoAerolinea(vuelo.aerolinea_validadora)" 
                :alt="vuelo.aerolinea_validadora"
                class="airline-logo"
                @error="$event.target.style.display='none'"
              />
              <div v-else class="airline-logo-fallback">{{ vuelo.aerolinea_validadora }}</div>
              <span class="airline-name">{{ getNombreAerolinea(vuelo.aerolinea_validadora) }}</span>
            </div>

            <!-- Tramos resumen -->
            <div class="flight-segments-summary">
              <div v-for="(tramo, idx) in vuelo.tramos" :key="idx" class="segment-row">
                <div class="segment-label">{{ tramo.tipo === 'ida' ? 'IDA' : 'VUELTA' }}</div>
                <div class="segment-time">
                  <span class="time-big">{{ formatearHora(tramo.origen.hora) }}</span>
                  <span class="airport-small">{{ tramo.origen.aeropuerto }}</span>
                </div>
                <div class="segment-duration">
                  <span class="duration-text">{{ tramo.duracion_total }}</span>
                  <div class="duration-line">
                    <div class="line-track"></div>
                    <div v-for="n in tramo.numero_escalas" :key="n" class="stop-dot"></div>
                  </div>
                  <span class="stops-text" :class="{ direct: !tramo.tiene_escalas }">
                    {{ tramo.tiene_escalas ? tramo.numero_escalas + ' escala' + (tramo.numero_escalas > 1 ? 's' : '') : 'Directo' }}
                  </span>
                </div>
                <div class="segment-time">
                  <span class="time-big">{{ formatearHora(tramo.destino.hora) }}</span>
                  <span class="airport-small">{{ tramo.destino.aeropuerto }}</span>
                </div>
              </div>
            </div>

            <!-- Precio -->
            <div class="flight-price">
              <span class="price-amount">${{ vuelo.precio_total.toLocaleString('en-US', { minimumFractionDigits: 2 }) }}</span>
              <span class="price-currency">{{ vuelo.moneda }}</span>
              <span class="price-per">Total por {{ busqueda.adults + busqueda.children + busqueda.infants }} pasajero{{ (busqueda.adults + busqueda.children + busqueda.infants) > 1 ? 's' : '' }}</span>
              <button
                class="btn-reservar"
                :disabled="revalidandoId === vuelo.id"
                @click.stop="handleReservar(vuelo)"
              >
                <span v-if="revalidandoId === vuelo.id" class="spinner-inline"></span>
                {{ revalidandoId === vuelo.id ? 'Verificando...' : 'Reservar' }}
              </button>
            </div>

            <!-- Toggle detalle -->
            <div class="toggle-detail">
              <svg :class="{ rotated: expandido[vuelo.id] }" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24"><path d="M7 10l5 5 5-5z"/></svg>
            </div>
          </div>

          <!-- Detalle expandido -->
          <transition name="slide">
            <div v-if="expandido[vuelo.id]" class="flight-detail">
              <div v-for="(tramo, tIdx) in vuelo.tramos" :key="tIdx" class="detail-tramo">
                <div class="tramo-header">
                  <h3>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/></svg>
                    {{ tramo.tipo === 'ida' ? 'Vuelo de Ida' : 'Vuelo de Vuelta' }}
                  </h3>
                  <span class="tramo-duration">Duración total: {{ tramo.duracion_total }}</span>
                </div>

                <!-- Timeline de segmentos -->
                <div class="segments-timeline">
                  <div v-for="(seg, sIdx) in tramo.segmentos" :key="sIdx" class="timeline-segment">
                    <!-- Info aerolínea del segmento -->
                    <div class="seg-airline">
                      <img 
                        v-if="getLogoAerolinea(seg.aerolinea.codigo)" 
                        :src="getLogoAerolinea(seg.aerolinea.codigo)" 
                        class="seg-airline-logo"
                        @error="$event.target.style.display='none'"
                      />
                      <div class="seg-airline-info">
                        <span class="seg-flight-number">{{ seg.vuelo }}</span>
                        <span class="seg-airline-name">{{ getNombreAerolinea(seg.aerolinea.codigo) }}</span>
                        <span v-if="seg.aerolinea.operada_por && seg.aerolinea.operada_por !== seg.aerolinea.codigo" class="seg-operated-by">
                          Operado por {{ getNombreAerolinea(seg.aerolinea.operada_por) }}
                        </span>
                      </div>
                    </div>

                    <!-- Salida -->
                    <div class="seg-point departure">
                      <div class="point-time">{{ formatearHora(seg.salida.hora) }}</div>
                      <div class="point-dot"></div>
                      <div class="point-info">
                        <span class="point-airport">{{ seg.salida.aeropuerto }}</span>
                        <span class="point-city">{{ seg.salida.ciudad }}, {{ seg.salida.pais }}</span>
                        <span v-if="seg.salida.terminal" class="point-terminal">Terminal {{ seg.salida.terminal }}</span>
                      </div>
                    </div>

                    <!-- Duración vuelo -->
                    <div class="seg-duration-bar">
                      <div class="seg-line"></div>
                      <div class="seg-details">
                        <span>{{ seg.duracion }}</span>
                        <span class="seg-plane">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="14" height="14"><path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/></svg>
                          {{ seg.avion }}
                        </span>
                        <span v-if="seg.millas">{{ seg.millas }} mi</span>
                      </div>
                    </div>

                    <!-- Llegada -->
                    <div class="seg-point arrival">
                      <div class="point-time">
                        {{ formatearHora(seg.llegada.hora) }}
                        <span v-if="seg.llegada.dia_siguiente" class="next-day">+1</span>
                      </div>
                      <div class="point-dot"></div>
                      <div class="point-info">
                        <span class="point-airport">{{ seg.llegada.aeropuerto }}</span>
                        <span class="point-city">{{ seg.llegada.ciudad }}, {{ seg.llegada.pais }}</span>
                        <span v-if="seg.llegada.terminal" class="point-terminal">Terminal {{ seg.llegada.terminal }}</span>
                      </div>
                    </div>

                    <!-- Escala (si hay siguiente segmento) -->
                    <div v-if="sIdx < tramo.segmentos.length - 1 && tramo.escalas && tramo.escalas[sIdx]" class="layover-info">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/></svg>
                      <span>Escala en {{ tramo.escalas[sIdx].aeropuerto }} ({{ tramo.escalas[sIdx].ciudad }})</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Info adicional -->
              <div class="detail-footer">
                <div class="detail-tags">
                  <span class="tag">Precio base: ${{ vuelo.precio_base }}</span>
                  <span class="tag">Impuestos: ${{ vuelo.impuestos }}</span>
                  <span v-if="vuelo.ultima_fecha_compra" class="tag tag-warning">
                    Comprar antes de: {{ vuelo.ultima_fecha_compra }}
                  </span>
                </div>
                <button
                  class="btn-reservar-detail"
                  :disabled="revalidandoId === vuelo.id"
                  @click.stop="handleReservar(vuelo)"
                >
                  <span v-if="revalidandoId === vuelo.id" class="spinner-inline"></span>
                  <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z"/></svg>
                  {{ revalidandoId === vuelo.id ? 'Verificando disponibilidad...' : 'Reservar este vuelo' }}
                </button>
              </div>
            </div>
          </transition>
        </div>
      </div>
    </section>

    <!-- Modal Checkout (pasajeros + asientos + resumen) -->
    <ModalCheckoutVuelo
      v-if="vueloCheckout"
      v-model:visible="mostrarCheckout"
      :vuelo="vueloCheckout"
      :revalidacion="revalidacionCheckout"
      :pasajeros="{ adults: busqueda.adults, children: busqueda.children, infants: busqueda.infants }"
      :origenLabel="busqueda.origenLabel"
      :destinoLabel="busqueda.destinoLabel"
      @confirmar="handleConfirmarCheckout"
    />

    <!-- Modal Contacto -->
    <ModalContacto
      v-model:visible="mostrarModalContacto"
      :mensajePredefinido="mensajeReserva"
      :mensajeInterno="mensajeReservaInterno"
      :mensajeReadonly="true"
    />

    <!-- Notificación de revalidación -->
    <transition name="toast-fade">
      <div v-if="notificacion" class="revalidacion-toast" :class="'toast-' + notificacion.tipo">
        <span class="toast-text">{{ notificacion.texto }}</span>
        <button class="toast-close" @click="cerrarNotificacion" aria-label="Cerrar">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
        </button>
      </div>
    </transition>
  </div>
</template>

<style scoped>
.resultados-page {
  --primary: #b5931a;
  --primary-dark: #8a6f14;
  --primary-light: #d4af37;
  --text: #1a1a2e;
  --text-light: #64748b;
  --text-muted: #94a3b8;
  --bg: #f1f5f9;
  --bg-card: #ffffff;
  --border: #e2e8f0;
  --success: #10b981;
  --warning: #f59e0b;
  --danger: #ef4444;

  min-height: 100vh;
  background: var(--bg);
}

/* ========== SEARCH HEADER ========== */
.search-header {
  background: linear-gradient(135deg, var(--text) 0%, #16213e 100%);
  padding: 1.25rem 2rem;
  color: #fff;
  position: sticky;
  top: 0;
  z-index: 40;
  box-shadow: 0 4px 20px rgba(0,0,0,0.15);
}

.search-header-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  gap: 2rem;
}

.btn-volver {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: rgba(255,255,255,0.1);
  border: 1px solid rgba(255,255,255,0.2);
  border-radius: 8px;
  color: #fff;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}
.btn-volver:hover { background: rgba(255,255,255,0.2); }
.btn-volver svg { flex-shrink: 0; }

.search-summary {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.route-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.route-airports {
  display: flex;
  align-items: center;
  gap: 12px;
}

.airport-code {
  font-size: 1.5rem;
  font-weight: 700;
  letter-spacing: 1px;
}

.route-line {
  display: flex;
  align-items: center;
  gap: 4px;
  flex: 1;
  max-width: 200px;
  color: var(--primary-light);
}
.route-line .line {
  flex: 1;
  height: 2px;
  background: rgba(255,255,255,0.3);
  border-radius: 1px;
}

.route-labels {
  display: flex;
  justify-content: space-between;
  max-width: 420px;
  font-size: 0.8rem;
  color: rgba(255,255,255,0.7);
}

.search-details {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.detail-chip {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 5px 12px;
  background: rgba(255,255,255,0.08);
  border-radius: 20px;
  font-size: 0.8rem;
  color: rgba(255,255,255,0.85);
}
.detail-chip svg { color: var(--primary-light); flex-shrink: 0; }
.detail-sep { margin: 0 2px; color: var(--primary-light); }

/* ========== LOADING ========== */
.loading-section {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  padding: 2rem;
}

.loading-container {
  text-align: center;
  max-width: 400px;
}

.airplane-loader {
  color: var(--primary);
  animation: fly 2s ease-in-out infinite;
  margin-bottom: 1.5rem;
}
.airplane-loader svg { width: 64px; height: 64px; }

@keyframes fly {
  0%, 100% { transform: translateX(-20px) rotate(-5deg); }
  50% { transform: translateX(20px) rotate(5deg); }
}

.loading-container h2 {
  font-size: 1.3rem;
  color: var(--text);
  margin-bottom: 0.5rem;
}

.loading-container p {
  color: var(--text-light);
  font-size: 0.9rem;
  margin-bottom: 1.5rem;
}

.loading-bar {
  width: 100%;
  height: 4px;
  background: var(--border);
  border-radius: 2px;
  overflow: hidden;
}

.loading-bar-fill {
  height: 100%;
  background: var(--primary);
  border-radius: 2px;
  animation: loading-progress 2s ease-in-out infinite;
}

@keyframes loading-progress {
  0% { width: 0%; margin-left: 0; }
  50% { width: 60%; margin-left: 20%; }
  100% { width: 0%; margin-left: 100%; }
}

/* ========== ERROR / EMPTY ========== */
.error-section, .empty-section {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  padding: 2rem;
}

.error-container, .empty-container {
  text-align: center;
  max-width: 420px;
}

.error-container svg { color: var(--danger); margin-bottom: 1rem; }
.empty-container svg { color: var(--text-muted); margin-bottom: 1rem; }

.error-container h2, .empty-container h2 {
  font-size: 1.3rem;
  color: var(--text);
  margin-bottom: 0.5rem;
}

.error-container p, .empty-container p {
  color: var(--text-light);
  font-size: 0.9rem;
  margin-bottom: 1.5rem;
}

.btn-reintentar {
  padding: 10px 24px;
  background: var(--primary);
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  margin-right: 10px;
  transition: background 0.2s;
}
.btn-reintentar:hover { background: var(--primary-dark); }

.btn-volver-secondary {
  padding: 10px 24px;
  background: transparent;
  color: var(--text-light);
  border: 1px solid var(--border);
  border-radius: 8px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s;
}
.btn-volver-secondary:hover { border-color: var(--text-light); }

/* ========== FILTERS ========== */
.filters-bar {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
  position: sticky;
  top: 85px;
  z-index: 35;
  background: var(--bg);
  border-bottom: 1px solid var(--border);
}

.results-count {
  font-weight: 600;
  color: var(--text);
  font-size: 1rem;
}

.filters-right {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 6px;
}

.filter-group label {
  font-size: 0.8rem;
  color: var(--text-light);
  font-weight: 500;
}

.filter-group select {
  padding: 6px 10px;
  border: 1px solid var(--border);
  border-radius: 6px;
  font-size: 0.85rem;
  color: var(--text);
  background: #fff;
  cursor: pointer;
}
.filter-group select:focus {
  outline: none;
  border-color: var(--primary);
}

/* ========== FLIGHTS LIST ========== */
.flights-list {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem 1.5rem 3rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.flight-card {
  background: var(--bg-card);
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.06);
  border: 1px solid var(--border);
  overflow: hidden;
  transition: box-shadow 0.2s, transform 0.2s;
}
.flight-card:hover {
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
  transform: translateY(-1px);
}

.flight-main {
  display: grid;
  grid-template-columns: 180px 1fr 160px 40px;
  align-items: center;
  gap: 1.25rem;
  padding: 1.25rem 1.5rem;
  cursor: pointer;
}

/* Airline */
.airline-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  text-align: center;
}

.airline-logo {
  width: 90px;
  height: 40px;
  object-fit: contain;
}

.airline-logo-fallback {
  width: 60px;
  height: 40px;
  background: var(--primary);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  font-weight: 700;
  font-size: 1.1rem;
  letter-spacing: 1px;
}

.airline-name {
  font-size: 0.75rem;
  color: var(--text-light);
  text-transform: capitalize;
  max-width: 150px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Segments summary */
.flight-segments-summary {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.segment-row {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.segment-label {
  font-size: 0.65rem;
  font-weight: 700;
  color: var(--primary);
  background: rgba(181, 147, 26, 0.1);
  padding: 2px 8px;
  border-radius: 4px;
  letter-spacing: 1px;
  min-width: 55px;
  text-align: center;
}

.segment-time {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 60px;
}

.time-big {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text);
}

.airport-small {
  font-size: 0.7rem;
  color: var(--text-light);
  font-weight: 500;
}

.segment-duration {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  min-width: 100px;
}

.duration-text {
  font-size: 0.75rem;
  color: var(--text-light);
}

.duration-line {
  width: 100%;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0;
  height: 12px;
}

.line-track {
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 2px;
  background: var(--border);
  transform: translateY(-50%);
}

.stop-dot {
  width: 8px;
  height: 8px;
  background: var(--warning);
  border: 2px solid #fff;
  border-radius: 50%;
  position: relative;
  z-index: 1;
}

.stops-text {
  font-size: 0.7rem;
  color: var(--warning);
  font-weight: 600;
}
.stops-text.direct { color: var(--success); }

/* Price */
.flight-price {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  padding-left: 1rem;
  border-left: 1px solid var(--border);
}

.price-amount {
  font-size: 1.4rem;
  font-weight: 800;
  color: var(--primary-dark);
}

.price-currency {
  font-size: 0.7rem;
  color: var(--text-light);
  font-weight: 500;
}

.price-per {
  font-size: 0.65rem;
  color: var(--text-muted);
}

.btn-reservar {
  margin-top: 6px;
  padding: 8px 20px;
  background: var(--primary);
  color: #fff;
  border: none;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}
.btn-reservar:hover {
  background: var(--primary-dark);
  transform: scale(1.02);
}

.toggle-detail {
  display: flex;
  align-items: center;
  justify-content: center;
}
.toggle-detail svg {
  color: var(--text-muted);
  transition: transform 0.3s;
}
.toggle-detail svg.rotated { transform: rotate(180deg); }

/* ========== DETAIL PANEL ========== */
.flight-detail {
  border-top: 1px solid var(--border);
  background: #fafbfc;
  padding: 1.5rem;
}

.detail-tramo {
  margin-bottom: 1.5rem;
}
.detail-tramo:last-of-type { margin-bottom: 1rem; }

.tramo-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid var(--primary);
}

.tramo-header h3 {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 1rem;
  color: var(--text);
}
.tramo-header h3 svg { color: var(--primary); }

.tramo-duration {
  font-size: 0.8rem;
  color: var(--text-light);
  font-weight: 500;
}

/* Timeline */
.segments-timeline {
  padding-left: 0.5rem;
}

.timeline-segment {
  position: relative;
  margin-bottom: 0.5rem;
}

.seg-airline {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 0.75rem;
  padding: 8px 12px;
  background: rgba(181, 147, 26, 0.05);
  border-radius: 8px;
  border-left: 3px solid var(--primary);
}

.seg-airline-logo {
  width: 60px;
  height: 28px;
  object-fit: contain;
}

.seg-airline-info {
  display: flex;
  flex-direction: column;
}

.seg-flight-number {
  font-weight: 700;
  font-size: 0.85rem;
  color: var(--text);
}

.seg-airline-name {
  font-size: 0.75rem;
  color: var(--text-light);
  text-transform: capitalize;
}

.seg-operated-by {
  font-size: 0.7rem;
  color: var(--text-muted);
  font-style: italic;
}

.seg-point {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 4px 0;
}

.point-time {
  min-width: 55px;
  font-size: 1rem;
  font-weight: 700;
  color: var(--text);
  text-align: right;
}

.next-day {
  font-size: 0.6rem;
  color: var(--danger);
  font-weight: 700;
  vertical-align: super;
}

.point-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 3px solid var(--primary);
  background: #fff;
  flex-shrink: 0;
  margin-top: 5px;
}

.point-info {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.point-airport {
  font-weight: 700;
  font-size: 0.9rem;
  color: var(--text);
}

.point-city {
  font-size: 0.75rem;
  color: var(--text-light);
}

.point-terminal {
  font-size: 0.7rem;
  color: var(--text-muted);
}

.seg-duration-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 6px 0 6px 22px;
  margin-left: 55px;
}

.seg-line {
  width: 2px;
  height: 30px;
  background: linear-gradient(to bottom, var(--primary), var(--primary-light));
  border-radius: 1px;
  margin-left: 5px;
}

.seg-details {
  display: flex;
  gap: 12px;
  font-size: 0.75rem;
  color: var(--text-light);
}

.seg-plane { color: var(--text-muted); }

/* Escala */
.layover-info {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  margin: 8px 0 8px 55px;
  background: rgba(245, 158, 11, 0.08);
  border: 1px dashed var(--warning);
  border-radius: 8px;
  font-size: 0.8rem;
  color: var(--warning);
  font-weight: 500;
}

/* Detail footer */
.detail-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 1rem;
  border-top: 1px solid var(--border);
  flex-wrap: wrap;
  gap: 1rem;
}

.detail-tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.tag {
  padding: 4px 12px;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 20px;
  font-size: 0.75rem;
  color: var(--text-light);
}

.tag-warning {
  background: rgba(245, 158, 11, 0.08);
  border-color: var(--warning);
  color: var(--warning);
}

.btn-reservar-detail {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 24px;
  background: var(--primary);
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}
.btn-reservar-detail:hover {
  background: var(--primary-dark);
  transform: translateY(-1px);
}

/* Transitions */
.slide-enter-active { transition: all 0.3s ease; }
.slide-leave-active { transition: all 0.2s ease; }
.slide-enter-from {
  opacity: 0;
  max-height: 0;
  transform: translateY(-10px);
}
.slide-leave-to {
  opacity: 0;
  max-height: 0;
}

/* ========== RESPONSIVE ========== */
@media (max-width: 900px) {
  .flight-main {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .airline-info {
    flex-direction: row;
    justify-content: flex-start;
  }

  .flight-price {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    border-left: none;
    border-top: 1px solid var(--border);
    padding-left: 0;
    padding-top: 1rem;
    flex-wrap: wrap;
    gap: 8px;
  }

  .search-header-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .route-labels {
    max-width: 100%;
  }

  .filters-bar {
    flex-direction: column;
    align-items: flex-start;
  }

  .filters-right {
    width: 100%;
    flex-wrap: wrap;
  }

  .seg-duration-bar {
    margin-left: 0;
    padding-left: 12px;
  }

  .layover-info {
    margin-left: 0;
  }
}

@media (max-width: 600px) {
  .search-header { padding: 0.75rem 1rem; }

  .airport-code { font-size: 1.2rem; }

  .search-details { flex-direction: column; gap: 0.5rem; }

  .segment-row {
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .flights-list { padding: 0 0.75rem; }

  .flight-main { padding: 1rem; }

  .flight-detail { padding: 1rem; }

  .detail-footer {
    flex-direction: column;
    align-items: stretch;
  }

  .btn-reservar-detail {
    justify-content: center;
  }

  .filter-group {
    flex: 1;
    min-width: 120px;
  }

  .filter-group select {
    width: 100%;
  }
}

/* ========== REVALIDACIÓN: spinner + toast ========== */
.btn-reservar:disabled,
.btn-reservar-detail:disabled {
  opacity: 0.75;
  cursor: progress;
}

.spinner-inline {
  display: inline-block;
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255, 255, 255, 0.4);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spinner-rotate 0.7s linear infinite;
  vertical-align: middle;
  margin-right: 6px;
}

@keyframes spinner-rotate {
  to { transform: rotate(360deg); }
}

.revalidacion-toast {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 9999;
  display: flex;
  align-items: center;
  gap: 12px;
  max-width: 420px;
  padding: 14px 18px;
  border-radius: 10px;
  background: #1a1a2e;
  color: #fff;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.25);
  font-size: 0.95rem;
  line-height: 1.35;
}

.revalidacion-toast.toast-error {
  background: #b91c1c;
}

.revalidacion-toast.toast-warning {
  background: #b5931a;
}

.revalidacion-toast.toast-success {
  background: #047857;
}

.revalidacion-toast .toast-text {
  flex: 1;
}

.revalidacion-toast .toast-close {
  background: transparent;
  border: 0;
  color: inherit;
  cursor: pointer;
  padding: 4px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  opacity: 0.85;
}

.revalidacion-toast .toast-close:hover {
  opacity: 1;
  background: rgba(255, 255, 255, 0.15);
}

.toast-fade-enter-active,
.toast-fade-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}

.toast-fade-enter-from,
.toast-fade-leave-to {
  opacity: 0;
  transform: translateY(10px);
}
</style>
