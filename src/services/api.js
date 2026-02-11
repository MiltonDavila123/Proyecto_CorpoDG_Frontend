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
