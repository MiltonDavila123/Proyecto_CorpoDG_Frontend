// Utilidades de validación de documentos

/**
 * Valida una cédula ecuatoriana usando el algoritmo del dígito verificador
 * (módulo 10). Comprueba longitud, código de provincia y tercer dígito.
 * @param {string|number} cedula
 * @returns {boolean}
 */
export function validarCedulaEcuatoriana(cedula) {
  const c = String(cedula || '').trim()
  if (!/^\d{10}$/.test(c)) return false

  const provincia = parseInt(c.slice(0, 2), 10)
  if (provincia < 1 || (provincia > 24 && provincia !== 30)) return false

  const tercerDigito = parseInt(c[2], 10)
  if (tercerDigito > 5) return false

  const coeficientes = [2, 1, 2, 1, 2, 1, 2, 1, 2]
  let suma = 0
  for (let i = 0; i < 9; i++) {
    let valor = parseInt(c[i], 10) * coeficientes[i]
    if (valor > 9) valor -= 9
    suma += valor
  }
  const verificador = (10 - (suma % 10)) % 10
  return verificador === parseInt(c[9], 10)
}
