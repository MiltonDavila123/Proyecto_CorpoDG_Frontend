const API_BASE_URL = `${import.meta.env.VITE_API_URL}/api`
const API_TOKEN = import.meta.env.VITE_TOKEN_APIS

/**
 * Servicio para consumir la API del backend
 */

// Helper para obtener headers con autenticación
const getHeaders = (includeContentType = false) => {
  const headers = {
    'Authorization': `Token ${API_TOKEN}`
  }
  if (includeContentType) {
    headers['Content-Type'] = 'application/json'
  }
  return headers
}

// =====================================================
// REGIONES
// =====================================================
export async function getRegiones() {
  const response = await fetch(`${API_BASE_URL}/regiones/`, {
    headers: getHeaders()
  })
  if (!response.ok) throw new Error('Error al obtener regiones')
  return response.json()
}

export async function getRegion(id) {
  const response = await fetch(`${API_BASE_URL}/regiones/${id}/`, {
    headers: getHeaders()
  })
  if (!response.ok) throw new Error('Error al obtener región')
  return response.json()
}

export async function getPaisesByRegion(regionId) {
  const response = await fetch(`${API_BASE_URL}/regiones/${regionId}/paises/`, {
    headers: getHeaders()
  })
  if (!response.ok) throw new Error('Error al obtener países de la región')
  return response.json()
}

// =====================================================
// PAISES
// =====================================================
export async function getPaises(regionId = null) {
  let url = `${API_BASE_URL}/paises-region/`
  if (regionId) {
    url += `?region=${regionId}`
  }
  const response = await fetch(url, {
    headers: getHeaders()
  })
  if (!response.ok) throw new Error('Error al obtener países')
  return response.json()
}

export async function getPais(id) {
  const response = await fetch(`${API_BASE_URL}/paises-region/${id}/`, {
    headers: getHeaders()
  })
  if (!response.ok) throw new Error('Error al obtener país')
  return response.json()
}

// =====================================================
// PAQUETES TURISTICOS
// =====================================================
export async function getPaquetes(filtros = {}) {
  let url = `${API_BASE_URL}/paquetes/`
  const params = new URLSearchParams()
  
  if (filtros.region) params.append('region', filtros.region)
  if (filtros.pais) params.append('pais', filtros.pais)
  if (filtros.tipo) params.append('tipo', filtros.tipo)
  if (filtros.temporada) params.append('temporada', filtros.temporada)
  if (filtros.destacados) params.append('destacados', 'true')
  
  const queryString = params.toString()
  if (queryString) url += `?${queryString}`
  
  const response = await fetch(url, {
    headers: getHeaders()
  })
  if (!response.ok) throw new Error('Error al obtener paquetes')
  return response.json()
}

export async function getPaquete(id) {
  const response = await fetch(`${API_BASE_URL}/paquetes/${id}/`, {
    headers: getHeaders()
  })
  if (!response.ok) throw new Error('Error al obtener paquete')
  return response.json()
}

export async function getPaquetesDestacados() {
  const response = await fetch(`${API_BASE_URL}/paquetes/destacados/`, {
    headers: getHeaders()
  })
  if (!response.ok) throw new Error('Error al obtener paquetes destacados')
  return response.json()
}

export async function getPaquetesPorRegion() {
  const response = await fetch(`${API_BASE_URL}/paquetes/por_region/`, {
    headers: getHeaders()
  })
  if (!response.ok) throw new Error('Error al obtener paquetes por región')
  return response.json()
}

// =====================================================
// TIPOS DE PAQUETE
// =====================================================
export async function getTiposPaquete() {
  const response = await fetch(`${API_BASE_URL}/tipos-paquete/`, {
    headers: getHeaders()
  })
  if (!response.ok) throw new Error('Error al obtener tipos de paquete')
  return response.json()
}

// =====================================================
// TEMPORADAS
// =====================================================
export async function getTemporadas() {
  const response = await fetch(`${API_BASE_URL}/temporadas/`, {
    headers: getHeaders()
  })
  if (!response.ok) throw new Error('Error al obtener temporadas')
  return response.json()
}

// =====================================================
// DESTINOS
// =====================================================
export async function getDestinos(filtros = {}) {
  let url = `${API_BASE_URL}/destinos/`
  const params = new URLSearchParams()
  
  if (filtros.pais) params.append('pais', filtros.pais)
  if (filtros.ciudad) params.append('ciudad', filtros.ciudad)
  if (filtros.destacado) params.append('destacado', 'true')
  
  const queryString = params.toString()
  if (queryString) url += `?${queryString}`
  
  const response = await fetch(url, {
    headers: getHeaders()
  })
  if (!response.ok) throw new Error('Error al obtener destinos')
  return response.json()
}

export async function getDestino(id) {
  const response = await fetch(`${API_BASE_URL}/destinos/${id}/`, {
    headers: getHeaders()
  })
  if (!response.ok) throw new Error('Error al obtener destino')
  return response.json()
}

export async function getDestinosDestacados() {
  const response = await fetch(`${API_BASE_URL}/destinos/destacados/`, {
    headers: getHeaders()
  })
  if (!response.ok) throw new Error('Error al obtener destinos destacados')
  return response.json()
}

// =====================================================
// AEROLINEAS
// =====================================================
export async function getAerolineas() {
  const response = await fetch(`${API_BASE_URL}/aerolineas/`, {
    headers: getHeaders()
  })
  if (!response.ok) throw new Error('Error al obtener aerolíneas')
  return response.json()
}

// =====================================================
// CIUDADES
// =====================================================
export async function getCiudades(filtros = {}) {
  let url = `${API_BASE_URL}/ciudades/`
  const params = new URLSearchParams()
  
  if (filtros.pais) params.append('pais', filtros.pais)
  if (filtros.region) params.append('region', filtros.region)
  
  const queryString = params.toString()
  if (queryString) url += `?${queryString}`
  
  const response = await fetch(url, {
    headers: getHeaders()
  })
  if (!response.ok) throw new Error('Error al obtener ciudades')
  return response.json()
}

// =====================================================
// VUELOS
// =====================================================
export async function getVuelos(filtros = {}) {
  let url = `${API_BASE_URL}/vuelos/`
  const params = new URLSearchParams()
  
  if (filtros.origen) params.append('origen', filtros.origen)
  if (filtros.destino) params.append('destino', filtros.destino)
  if (filtros.fecha_ida) params.append('fecha_ida', filtros.fecha_ida)
  if (filtros.fecha_vuelta) params.append('fecha_vuelta', filtros.fecha_vuelta)
  if (filtros.aerolinea) params.append('aerolinea', filtros.aerolinea)
  
  const queryString = params.toString()
  if (queryString) url += `?${queryString}`
  
  const response = await fetch(url, {
    headers: getHeaders()
  })
  if (!response.ok) throw new Error('Error al obtener vuelos')
  return response.json()
}

export async function getVuelo(id) {
  const response = await fetch(`${API_BASE_URL}/vuelos/${id}/`, {
    headers: getHeaders()
  })
  if (!response.ok) throw new Error('Error al obtener vuelo')
  return response.json()
}

export async function getVuelosDestacados() {
  const response = await fetch(`${API_BASE_URL}/vuelos/destacados/`, {
    headers: getHeaders()
  })
  if (!response.ok) throw new Error('Error al obtener vuelos destacados')
  return response.json()
}

// =====================================================
// AEROPUERTOS - AUTOCOMPLETE
// =====================================================
export async function buscarAeropuertos(query) {
  if (!query || query.length < 2) return { results: [], count: 0 }
  
  const response = await fetch(`${API_BASE_URL}/aeropuertos/autocomplete/?q=${encodeURIComponent(query)}`, {
    headers: getHeaders()
  })
  if (!response.ok) throw new Error('Error al buscar aeropuertos')
  return response.json()
}

// =====================================================
// BUSQUEDA DE VUELOS EN VIVO (SABRE)
// =====================================================
export async function buscarVuelosLive(datos) {
  // Incluir limit si viene en los datos (default 20, max 200)
  const payload = { ...datos }
  if (payload.limit) {
    payload.limit = Math.min(parseInt(payload.limit), 200)
  }
  const response = await fetch(`${API_BASE_URL}/buscar-vuelos-live/`, {
    method: 'POST',
    headers: getHeaders(true),
    body: JSON.stringify(payload)
  })
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.error || 'Error al buscar vuelos')
  }
  return response.json()
}

// =====================================================
// REVALIDAR VUELO (SABRE)
// =====================================================
/**
 * Revalida un itinerario antes de iniciar la reserva.
 * Devuelve { ok, status, data } sin lanzar excepciones para que el
 * caller pueda manejar 200 / 409 / 4xx / 5xx de forma uniforme.
 *
 * @param {Object} opcion - Opción seleccionada (tal cual viene de buscarVuelosLive).
 * @param {Object} pasajeros - { adults, children, infants }
 */
export async function revalidarVuelo(opcion, pasajeros = {}) {
  const payload = {
    adults: pasajeros.adults ?? 1,
    children: pasajeros.children ?? 0,
    infants: pasajeros.infants ?? 0,
    tramos: opcion?.tramos || []
  }

  let response
  try {
    response = await fetch(`${API_BASE_URL}/revalidar-vuelo/`, {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify(payload)
    })
  } catch (e) {
    return { ok: false, status: 0, data: { disponible: false, error: 'No se pudo conectar con el servidor' } }
  }

  const data = await response.json().catch(() => ({ disponible: false, error: 'Respuesta inválida del servidor' }))
  return { ok: response.ok && data.disponible === true, status: response.status, data }
}

// =====================================================
// SEATMAP — MAPA DE ASIENTOS (SABRE Get Seats)
// =====================================================
/**
 * Obtiene el mapa de asientos para un itinerario revalidado.
 * Devuelve { ok, status, data } sin lanzar excepciones.
 *
 * @param {Object} opcion - Opción seleccionada (tal cual viene de buscarVuelosLive).
 * @param {Array}  pasajeros - [{ passengerType, givenName, surname }, ...]
 * @param {String} moneda - código de moneda (default USD)
 */
export async function obtenerSeatmap(opcion, pasajeros = [], moneda = 'USD') {
  const payload = {
    opcion,
    pasajeros: Array.isArray(pasajeros) && pasajeros.length
      ? pasajeros.map(p => ({
          passengerType: p.passengerType || 'ADT',
          givenName: (p.givenName || 'TEST').toUpperCase(),
          surname: (p.surname || 'TEST').toUpperCase()
        }))
      : [{ passengerType: 'ADT', givenName: 'TEST', surname: 'TEST' }],
    moneda: moneda || opcion?.moneda || 'USD'
  }

  let response
  try {
    response = await fetch(`${API_BASE_URL}/seatmap/`, {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify(payload)
    })
  } catch (e) {
    return { ok: false, status: 0, data: { error: 'No se pudo conectar con el servidor' } }
  }

  const data = await response.json().catch(() => ({ error: 'Respuesta inválida del servidor' }))
  return { ok: response.ok, status: response.status, data }
}

// =====================================================
// BOOKING — CHECKOUT / CONFIRM (Stripe + Sabre)
// =====================================================
/**
 * Crea la sesión de pago de Stripe.
 * @param {Object} payload - { opcion, pasajeros, contacto, asientos_seleccionados, moneda }
 * @returns { ok, status, data } - data.checkout_url para redireccionar
 */
export async function crearCheckoutBooking(payload) {
  let response
  try {
    response = await fetch(`${API_BASE_URL}/booking/checkout/`, {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify(payload)
    })
  } catch (e) {
    return { ok: false, status: 0, data: { error: 'No se pudo conectar con el servidor' } }
  }
  const data = await response.json().catch(() => ({ error: 'Respuesta inválida del servidor' }))
  return { ok: response.ok, status: response.status, data }
}

/**
 * Confirma una reserva contra Stripe + Sabre usando el session_id.
 * Llamar desde la página de éxito (FRONTEND_BOOKING_SUCCESS_URL).
 */
export async function confirmarBooking(sessionId) {
  let response
  try {
    response = await fetch(`${API_BASE_URL}/booking/confirm/`, {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify({ session_id: sessionId })
    })
  } catch (e) {
    return { ok: false, status: 0, data: { error: 'No se pudo conectar con el servidor' } }
  }
  const data = await response.json().catch(() => ({ error: 'Respuesta inválida del servidor' }))
  return { ok: response.ok, status: response.status, data }
}

// =====================================================
// BOOKING DE PAQUETES (Stripe)
// =====================================================
/**
 * Crea la sesión de pago de Stripe para un paquete turístico.
 * @param {Object} payload - { paquete_id, n_personas, contacto, viajeros, fecha_viaje, moneda, success_url, cancel_url }
 * @returns { ok, status, data } - data.checkout_url para redireccionar
 */
export async function crearCheckoutPaquete(payload) {
  let response
  try {
    response = await fetch(`${API_BASE_URL}/paquetes/booking/checkout/`, {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify(payload)
    })
  } catch (e) {
    return { ok: false, status: 0, data: { error: 'No se pudo conectar con el servidor' } }
  }
  const data = await response.json().catch(() => ({ error: 'Respuesta inválida del servidor' }))
  return { ok: response.ok, status: response.status, data }
}

/**
 * Confirma una reserva de paquete contra Stripe usando el session_id.
 * Llamar desde la página de éxito de paquetes.
 */
export async function confirmarBookingPaquete(sessionId) {
  let response
  try {
    response = await fetch(`${API_BASE_URL}/paquetes/booking/confirm/`, {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify({ session_id: sessionId })
    })
  } catch (e) {
    return { ok: false, status: 0, data: { error: 'No se pudo conectar con el servidor' } }
  }
  const data = await response.json().catch(() => ({ error: 'Respuesta inválida del servidor' }))
  return { ok: response.ok, status: response.status, data }
}

/**
 * Construye la URL del voucher del paquete para imprimir o descargar.
 * @param {Object} opts - { sessionId, loc, format }
 */
export function urlVoucherPaquete({ sessionId = null, loc = null, format = 'pdf' } = {}) {
  const params = new URLSearchParams()
  if (sessionId) params.set('session_id', sessionId)
  else if (loc) params.set('loc', loc)
  params.set('format', format)
  return `${API_BASE_URL}/paquetes/booking/voucher/?${params.toString()}`
}

/**
 * Descarga el voucher del paquete. Primero intenta el GET (caché backend);
 * si falla (p. ej. la caché expiró -> 404), reenvía la reserva completa por POST.
 * @param {Object} opts - { sessionId, loc, reserva, format }
 * @returns { ok, blob, error }
 */
export async function descargarVoucherPaquete({ sessionId = null, loc = null, reserva = null, format = 'pdf' } = {}) {
  // 1) Intento por GET (no requiere Content-Type)
  try {
    const url = urlVoucherPaquete({ sessionId, loc, format })
    const res = await fetch(url, { headers: getHeaders() })
    if (res.ok) {
      return { ok: true, blob: await res.blob() }
    }
  } catch (e) { /* continúa al fallback */ }

  // 2) Fallback por POST reenviando la reserva
  if (reserva) {
    try {
      const res = await fetch(`${API_BASE_URL}/paquetes/booking/voucher/`, {
        method: 'POST',
        headers: getHeaders(true),
        body: JSON.stringify({ reserva, format })
      })
      if (res.ok) {
        return { ok: true, blob: await res.blob() }
      }
      const data = await res.json().catch(() => ({}))
      return { ok: false, error: data?.error || 'No se pudo generar el voucher.' }
    } catch (e) {
      return { ok: false, error: 'No se pudo conectar con el servidor.' }
    }
  }

  return { ok: false, error: 'No se pudo generar el voucher.' }
}


// =====================================================
export async function buscarAerolineaIATA(codigo) {
  const response = await fetch(`${API_BASE_URL}/aerolineas/buscar_iata/?codigo=${encodeURIComponent(codigo)}`, {
    headers: getHeaders()
  })
  if (!response.ok) return null
  return response.json()
}

// =====================================================
// CONTACTO
// =====================================================
export async function enviarContacto(datos) {
  const response = await fetch(`${API_BASE_URL}/contacto/`, {
    method: 'POST',
    headers: getHeaders(true),
    body: JSON.stringify(datos)
  })
  
  const data = await response.json()
  
  if (!response.ok) {
    throw new Error(data.errors || 'Error al enviar contacto')
  }
  
  return data
}

// =====================================================
// CHATBOT
// =====================================================

/**
 * Envía un mensaje al chatbot y retorna la respuesta del asistente.
 * @param {string} mensaje - Texto del usuario
 * @param {Array} historial - Historial previo [{ role, content }, ...]
 * @returns {{ respuesta: string, historial: Array }}
 */
export async function enviarMensajeChatbot(mensaje, historial = []) {
  const response = await fetch(`${API_BASE_URL}/chatbot/`, {
    method: 'POST',
    headers: getHeaders(true),
    body: JSON.stringify({ mensaje, historial })
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || 'Error al comunicarse con el chatbot')
  }

  return data
}
