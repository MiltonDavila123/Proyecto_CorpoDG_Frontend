<template>
  <!-- MODAL DE CONTACTO -->
  <div class="modal-overlay" v-if="mostrarModal" @click.self="cerrarModal">
    <div class="modal-contenido">
      <button class="modal-cerrar" @click="cerrarModal">&times;</button>
      <h2 class="modal-titulo">Contáctanos</h2>
      <p class="modal-subtitulo">Déjanos tus datos y nos pondremos en contacto contigo</p>
      
      <form @submit.prevent="enviarFormulario" class="modal-form">
        <div class="form-grupo">
          <label for="nombre">Nombre completo</label>
          <input type="text" id="nombre" v-model="formulario.nombre" placeholder="Tu nombre completo" required maxlength="50" />
          <span class="contador">{{ formulario.nombre.length }}/50</span>
        </div>
        
        <div class="form-grupo">
          <label for="email">Correo electrónico</label>
          <input type="email" id="email" v-model="formulario.email" placeholder="tu_email@gmail.com" required maxlength="80" />
          <span class="contador">{{ formulario.email.length }}/80</span>
        </div>
        
        <div class="form-grupo">
          <label for="telefono">Teléfono</label>
          <input type="tel" id="telefono" v-model="formulario.telefono" @input="soloNumeros" placeholder="0999999999" required maxlength="15" />
          <span class="contador">{{ formulario.telefono.length }}/15</span>
        </div>
        
        <div class="form-grupo">
          <label for="mensaje">Mensaje</label>
          <textarea 
            id="mensaje" 
            v-model="formulario.mensaje" 
            :placeholder="mensajePredefinido ? '' : '¿En qué podemos ayudarte?'" 
            rows="4" 
            required 
            maxlength="500"
            :readonly="mensajeReadonly"
            :class="{ 'mensaje-readonly': mensajeReadonly }"
          ></textarea>
          <span class="contador" v-if="!mensajeReadonly">{{ formulario.mensaje.length }}/500</span>
          <span class="mensaje-info" v-if="mensajeReadonly">
            <span class="info-icon"></span> Mensaje de reserva predefinido
          </span>
        </div>
        
        <button type="submit" class="btn-enviar">Enviar</button>
      </form>
    </div>
  </div>

  <!-- MODAL DE CONFIRMACIÓN -->
  <div class="modal-overlay" v-if="mostrarConfirmacion" @click.self="cerrarConfirmacion">
    <div class="modal-contenido modal-confirmacion">
      <button class="modal-cerrar" @click="cerrarConfirmacion">&times;</button>
      <div class="confirmacion-contenido">
        <div class="confirmacion-icono">✓</div>
        <h2 class="confirmacion-titulo">¡Gracias por contactarnos!</h2>
        <p class="confirmacion-texto">Pronto nos comunicaremos contigo.</p>
        <button class="btn-enviar" @click="cerrarConfirmacion">Aceptar</button>
      </div>
    </div>
  </div>

  <!-- MODAL DE ERROR -->
  <div class="modal-overlay" v-if="mostrarError" @click.self="cerrarError">
    <div class="modal-contenido modal-error">
      <button class="modal-cerrar" @click="cerrarError">&times;</button>
      <div class="confirmacion-contenido">
        <div class="confirmacion-icono error-icono">✕</div>
        <h2 class="confirmacion-titulo">Ha habido un error</h2>
        <p class="confirmacion-texto">Por favor, intenta nuevamente más tarde.</p>
        <button class="btn-enviar" @click="cerrarError">Aceptar</button>
      </div>
    </div>
  </div>

  <!-- MODAL DE CARGANDO -->
  <div class="modal-overlay" v-if="enviando">
    <div class="modal-contenido modal-loading">
      <div class="confirmacion-contenido">
        <div class="spinner"></div>
        <h2 class="confirmacion-titulo">Enviando...</h2>
        <p class="confirmacion-texto">Por favor espera un momento.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
  import { enviarContacto } from '../services/api.js'

// Props para controlar el modal desde el componente padre
const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  mensajePredefinido: {
    type: String,
    default: ''
  },
  mensajeReadonly: {
    type: Boolean,
    default: false
  }
})

// Emits para comunicar eventos al componente padre
const emit = defineEmits(['update:visible', 'enviado', 'error'])

// Estados del modal
const mostrarModal = ref(false)
const mostrarConfirmacion = ref(false)
const mostrarError = ref(false)
const enviando = ref(false)

const formulario = ref({
  nombre: '',
  email: '',
  telefono: '',
  mensaje: ''
})

// Sincronizar con el prop visible
watch(() => props.visible, (newVal) => {
  mostrarModal.value = newVal
  if (newVal) {
    document.body.style.overflow = 'hidden'
    // Si hay mensaje predefinido, usarlo
    if (props.mensajePredefinido) {
      formulario.value.mensaje = props.mensajePredefinido
    }
  }
})

// Actualizar mensaje cuando cambie el prop mensajePredefinido
watch(() => props.mensajePredefinido, (newVal) => {
  if (newVal && mostrarModal.value) {
    formulario.value.mensaje = newVal
  }
})

// Funciones para abrir/cerrar modales
const abrirModal = (mensajeInicial = '') => {
  mostrarModal.value = true
  document.body.style.overflow = 'hidden'
  if (mensajeInicial) {
    formulario.value.mensaje = mensajeInicial
  } else if (props.mensajePredefinido) {
    formulario.value.mensaje = props.mensajePredefinido
  }
  emit('update:visible', true)
}

const cerrarModal = () => {
  mostrarModal.value = false
  document.body.style.overflow = ''
  emit('update:visible', false)
}

// Limpiar formulario después de enviar exitosamente
const limpiarFormulario = () => {
  formulario.value = {
    nombre: '',
    email: '',
    telefono: '',
    mensaje: ''
  }
}

const cerrarConfirmacion = () => {
  mostrarConfirmacion.value = false
  document.body.style.overflow = ''
}

const cerrarError = () => {
  mostrarError.value = false
  document.body.style.overflow = ''
}

// Función para permitir solo números en el teléfono
const soloNumeros = () => {
  formulario.value.telefono = formulario.value.telefono.replace(/[^0-9]/g, '')
}

const enviarFormulario = async () => {
  try {
    // Guardar los datos antes de cerrar el modal
    const datosEnvio = {
      nombre_completo: formulario.value.nombre,
      email: formulario.value.email,
      telefono: formulario.value.telefono,
      mensaje: formulario.value.mensaje
    }
    
    // Mostrar modal de cargando
    cerrarModal()
    enviando.value = true
    document.body.style.overflow = 'hidden'
    
    // Enviar datos a la API
    const data = await enviarContacto(datosEnvio)
    
    // Ocultar modal de cargando
    enviando.value = false
    
    if (data.success) {
      // Mostrar modal de éxito
      mostrarConfirmacion.value = true
      
      // Limpiamos el formulario
      limpiarFormulario()
      
      // Emitir evento de éxito
      emit('enviado', data)
    } else {
      // Mostrar modal de error
      mostrarError.value = true
      console.error('Error del servidor:', data.errors || data)
      emit('error', data)
    }
    
  } catch (error) {
    // Error de conexión
    enviando.value = false
    mostrarError.value = true
    document.body.style.overflow = 'hidden'
    console.error('Error al enviar formulario:', error)
    emit('error', error)
  }
}

// Exponer función para abrir desde el componente padre
defineExpose({
  abrirModal,
  cerrarModal
})
</script>

<style scoped>
/* ===== VARIABLES DE COLORES ===== */
:root {
  --modal-color-primary: #b5931ae2;
  --modal-color-primary-hover: #544a28;
  --modal-color-dark: #23221e;
  --modal-font-heading: 'Arial', serif;
  --modal-font-body: 'Arial', sans-serif;
  --modal-font-button: 'Trebuchet MS', sans-serif;
}

/* ===== ESTILOS DEL MODAL ===== */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.modal-contenido {
  background: #fff;
  padding: 40px;
  border-radius: 15px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from { 
    opacity: 0;
    transform: translateY(30px);
  }
  to { 
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-cerrar {
  position: absolute;
  top: 15px;
  right: 20px;
  background: none;
  border: none;
  font-size: 2rem;
  cursor: pointer;
  color: #666;
  transition: color 0.3s;
}

.modal-cerrar:hover {
  color: #b5931a;
}

.modal-titulo {
  font-size: 1.8rem;
  color: #23221e;
  margin-bottom: 8px;
  font-family: 'Arial', serif;
  text-align: center;
}

.modal-subtitulo {
  font-size: 0.95rem;
  color: #666;
  margin-bottom: 25px;
  font-family: 'Arial', sans-serif;
  text-align: center;
}

.modal-form {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.form-grupo {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-grupo label {
  font-size: 0.9rem;
  font-weight: 600;
  color: #333;
  font-family: 'Arial', sans-serif;
}

.form-grupo input,
.form-grupo textarea {
  padding: 12px 15px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  font-family: 'Arial', sans-serif;
  transition: border-color 0.3s, box-shadow 0.3s;
}

.form-grupo input:focus,
.form-grupo textarea:focus {
  outline: none;
  border-color: #b5931a;
  box-shadow: 0 0 0 3px rgba(181, 147, 26, 0.15);
}

.form-grupo textarea {
  resize: vertical;
  min-height: 100px;
}

/* Estilo para mensaje readonly */
.form-grupo textarea.mensaje-readonly {
  background-color: #f8f9fa;
  border-color: #b5931a;
  color: #333;
  cursor: default;
}

.mensaje-info {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 0.8rem;
  color: #b5931a;
  margin-top: 5px;
}

.mensaje-info .info-icon {
  font-size: 0.9rem;
}

.btn-enviar {
  background: #b5931a;
  border: none;
  padding: 14px 30px;
  border-radius: 25px;
  cursor: pointer;
  font-weight: bold;
  font-size: 1rem;
  color: #fff;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  transition: all 0.3s ease;
  font-family: 'Trebuchet MS', sans-serif;
  margin-top: 10px;
}

.btn-enviar:hover {
  background: #544a28;
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(181, 147, 26, 0.3);
}

/* Contador de caracteres */
.contador {
  font-size: 0.75rem;
  color: #999;
  text-align: right;
  margin-top: 2px;
}

/* ===== MODAL DE CONFIRMACIÓN ===== */
.modal-confirmacion {
  text-align: center;
  max-width: 400px;
}

.confirmacion-contenido {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px 0;
}

.confirmacion-icono {
  width: 70px;
  height: 70px;
  background: linear-gradient(135deg, #b5931a, #d4af37);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
  color: white;
  margin-bottom: 20px;
  box-shadow: 0 5px 20px rgba(181, 147, 26, 0.4);
}

.confirmacion-titulo {
  font-size: 1.5rem;
  color: #23221e;
  margin-bottom: 10px;
  font-family: 'Arial', serif;
}

.confirmacion-texto {
  font-size: 1rem;
  color: #666;
  margin-bottom: 25px;
  font-family: 'Arial', sans-serif;
}

/* ===== MODAL DE ERROR ===== */
.modal-error .confirmacion-icono {
  background: linear-gradient(135deg, #e74c3c, #c0392b);
}

.error-icono {
  font-size: 3rem !important;
  font-weight: bold;
}

/* ===== MODAL DE CARGANDO ===== */
.modal-loading {
  text-align: center;
  max-width: 350px;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 5px solid #f3f3f3;
  border-top: 5px solid #b5931a;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
/* ============================= */
</style>
