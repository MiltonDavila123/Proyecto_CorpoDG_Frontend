const API_BASE_URL = 'http://localhost:8000/api'

/**
 * Servicio para consumir la API del backend
 */

// =====================================================
// REGIONES
// =====================================================
export async function getRegiones() {
  const response = await fetch(`${API_BASE_URL}/regiones/`)
  if (!response.ok) throw new Error('Error al obtener regiones')
  return response.json()
}

export async function getRegion(id) {
  const response = await fetch(`${API_BASE_URL}/regiones/${id}/`)
  if (!response.ok) throw new Error('Error al obtener región')
  return response.json()
}

export async function getPaisesByRegion(regionId) {
  const response = await fetch(`${API_BASE_URL}/regiones/${regionId}/paises/`)
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
  const response = await fetch(url)
  if (!response.ok) throw new Error('Error al obtener países')
  return response.json()
}

export async function getPais(id) {
  const response = await fetch(`${API_BASE_URL}/paises-region/${id}/`)
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
  
  const response = await fetch(url)
  if (!response.ok) throw new Error('Error al obtener paquetes')
  return response.json()
}

export async function getPaquete(id) {
  const response = await fetch(`${API_BASE_URL}/paquetes/${id}/`)
  if (!response.ok) throw new Error('Error al obtener paquete')
  return response.json()
}

export async function getPaquetesDestacados() {
  const response = await fetch(`${API_BASE_URL}/paquetes/destacados/`)
  if (!response.ok) throw new Error('Error al obtener paquetes destacados')
  return response.json()
}

export async function getPaquetesPorRegion() {
  const response = await fetch(`${API_BASE_URL}/paquetes/por_region/`)
  if (!response.ok) throw new Error('Error al obtener paquetes por región')
  return response.json()
}

// =====================================================
// AEROLINEAS
// =====================================================
export async function getAerolineas() {
  const response = await fetch(`${API_BASE_URL}/aerolineas/`)
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
  
  const response = await fetch(url)
  if (!response.ok) throw new Error('Error al obtener ciudades')
  return response.json()
}
