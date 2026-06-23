<template>
  <!-- Burbuja flotante del chatbot -->
  <div class="chatbot-container">

    <!-- Ventana del chat (visible cuando abierto) -->
    <Transition name="chat-slide">
      <div v-if="abierto" class="chatbot-ventana">

        <!-- Header -->
        <div class="chatbot-header">
          <div class="chatbot-header-info">
            <div class="chatbot-avatar">
              <span>C</span>
            </div>
            <div>
              <p class="chatbot-nombre">Cory</p>
              <p class="chatbot-subtitulo">Asistente de CorpoDG</p>
            </div>
          </div>
          <button class="chatbot-cerrar" @click="cerrarChat" aria-label="Cerrar chat">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <!-- Mensajes -->
        <div class="chatbot-mensajes" ref="contenedorMensajes">
          <!-- Mensaje de bienvenida -->
          <div class="mensaje mensaje-asistente">
            <div class="mensaje-burbuja">
              ¡Hola! Soy <strong>Cory</strong>, el asistente virtual de CorpoDG. 
              Puedo ayudarte con información sobre nuestros paquetes turísticos, vuelos, destinos y más. ✈️
            </div>
          </div>

          <!-- Historial de mensajes -->
          <div
            v-for="(msg, index) in historial"
            :key="index"
            class="mensaje"
            :class="msg.role === 'user' ? 'mensaje-usuario' : 'mensaje-asistente'"
          >
            <div class="mensaje-wrapper">
              <div class="mensaje-burbuja" v-html="formatearMensaje(msg.content)"></div>
              <button
                v-if="msg.accion"
                class="chatbot-btn-accion"
                @click="irAResultados(msg.accion)"
              >
                ✈ {{ msg.accion.label }}
              </button>
            </div>
          </div>

          <!-- Indicador de carga (typing) -->
          <div v-if="cargando" class="mensaje mensaje-asistente">
            <div class="mensaje-burbuja typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        </div>

        <!-- Input de mensaje -->
        <div class="chatbot-input-area">
          <input
            ref="inputRef"
            v-model="mensajeActual"
            @keydown.enter.prevent="enviarMensaje"
            :disabled="cargando"
            type="text"
            placeholder="Escribe tu consulta..."
            class="chatbot-input"
            maxlength="500"
          />
          <button
            @click="enviarMensaje"
            :disabled="cargando || !mensajeActual.trim()"
            class="chatbot-btn-enviar"
            aria-label="Enviar mensaje"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <line x1="22" y1="2" x2="11" y2="13"/>
              <polygon points="22 2 15 22 11 13 2 9 22 2"/>
            </svg>
          </button>
        </div>

      </div>
    </Transition>

    <!-- Botón burbuja flotante -->
    <button
      class="chatbot-burbuja"
      @click="toggleChat"
      :aria-label="abierto ? 'Cerrar asistente' : 'Abrir asistente'"
    >
      <!-- Icono chat (cuando cerrado) -->
      <Transition name="icon-fade" mode="out-in">
        <svg v-if="!abierto" key="chat" width="26" height="26" viewBox="0 0 24 24" fill="white">
          <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
        </svg>
        <svg v-else key="close" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5">
          <line x1="18" y1="6" x2="6" y2="18"/>
          <line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </Transition>

      <!-- Punto de notificación (solo cuando cerrado y sin mensajes) -->
      <span v-if="!abierto && historial.length === 0" class="chatbot-notificacion"></span>
    </button>

  </div>
</template>

<script setup>
import { ref, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { enviarMensajeChatbot } from '../services/api.js'

const router = useRouter()

// =====================================================
// ESTADO
// =====================================================
const abierto = ref(false)
const mensajeActual = ref('')
const historial = ref([])  // [{ role: 'user'|'assistant', content: str }]
const cargando = ref(false)
const contenedorMensajes = ref(null)
const inputRef = ref(null)

// =====================================================
// ACCIONES
// =====================================================

function irAResultados(accion) {
  router.push({ path: accion.path, query: accion.params })
}

function toggleChat() {
  abierto.value = !abierto.value
  if (abierto.value) {
    nextTick(() => {
      scrollAlFinal()
      inputRef.value?.focus()
    })
  }
}

function cerrarChat() {
  abierto.value = false
}

async function enviarMensaje() {
  const texto = mensajeActual.value.trim()
  if (!texto || cargando.value) return

  // Agregar mensaje del usuario al historial local
  historial.value.push({ role: 'user', content: texto })
  mensajeActual.value = ''
  cargando.value = true

  await nextTick()
  scrollAlFinal()

  try {
    const resultado = await enviarMensajeChatbot(texto, historial.value.slice(0, -1))
    // El backend retorna el historial completo actualizado, pero nosotros
    // solo agregamos la respuesta del asistente al historial local
    historial.value.push({
      role: 'assistant',
      content: resultado.respuesta,
      accion: resultado.accion || null,
    })
  } catch (error) {
    historial.value.push({
      role: 'assistant',
      content: 'Lo siento, no pude procesar tu consulta en este momento. Por favor intenta de nuevo o contáctanos directamente.'
    })
  } finally {
    cargando.value = false
    await nextTick()
    scrollAlFinal()
    inputRef.value?.focus()
  }
}

function scrollAlFinal() {
  if (contenedorMensajes.value) {
    contenedorMensajes.value.scrollTop = contenedorMensajes.value.scrollHeight
  }
}

/**
 * Formatea el mensaje del asistente para renderizar saltos de línea y negritas básicas.
 * Evita XSS permitiendo solo etiquetas seguras.
 */
function formatearMensaje(texto) {
  if (!texto) return ''
  // Escapar HTML primero para evitar XSS
  const escaped = texto
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
  // Luego convertir formato markdown básico a HTML seguro
  return escaped
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/\n/g, '<br>')
}
</script>

<style scoped>
/* =====================================================
   VARIABLES — Colores coherentes con el proyecto
   ===================================================== */
.chatbot-container {
  --chat-primary: #b5931a;
  --chat-primary-dark: #8a6d12;
  --chat-bg: #1e1d1a;
  --chat-bg-header: #23221e;
  --chat-bg-mensajes: #f5f3ee;
  --chat-bg-burbuja-asistente: #ffffff;
  --chat-bg-burbuja-usuario: #b5931a;
  --chat-text-usuario: #ffffff;
  --chat-text-asistente: #2c2a24;
  --chat-text-header: #ebeae7;
  --chat-border: #3a3830;
  --chat-shadow: 0 8px 32px rgba(0, 0, 0, 0.35);
  --chat-radius: 16px;
}

/* =====================================================
   CONTENEDOR FIJO (posicionamiento)
   ===================================================== */
.chatbot-container {
  position: fixed;
  bottom: 28px;
  right: 28px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 12px;
}

/* =====================================================
   BURBUJA FLOTANTE
   ===================================================== */
.chatbot-burbuja {
  width: 58px;
  height: 58px;
  border-radius: 50%;
  background: var(--chat-primary);
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--chat-shadow);
  position: relative;
  transition: background 0.2s, transform 0.2s;
  flex-shrink: 0;
}

.chatbot-burbuja:hover {
  background: var(--chat-primary-dark);
  transform: scale(1.08);
}

.chatbot-notificacion {
  position: absolute;
  top: 6px;
  right: 6px;
  width: 11px;
  height: 11px;
  background: #e74c3c;
  border-radius: 50%;
  border: 2px solid white;
  animation: pulso 2s infinite;
}

@keyframes pulso {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.3); opacity: 0.7; }
}

/* =====================================================
   VENTANA DEL CHAT
   ===================================================== */
.chatbot-ventana {
  width: 360px;
  max-width: calc(100vw - 56px);
  height: 500px;
  max-height: calc(100vh - 120px);
  background: var(--chat-bg-mensajes);
  border-radius: var(--chat-radius);
  box-shadow: var(--chat-shadow);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid var(--chat-border);
}

/* =====================================================
   HEADER
   ===================================================== */
.chatbot-header {
  background: var(--chat-bg-header);
  padding: 14px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--chat-border);
  flex-shrink: 0;
}

.chatbot-header-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.chatbot-avatar {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: var(--chat-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 16px;
  color: white;
  flex-shrink: 0;
}

.chatbot-nombre {
  margin: 0;
  font-size: 14px;
  font-weight: 700;
  color: var(--chat-text-header);
  font-family: 'Verdana', sans-serif;
}

.chatbot-subtitulo {
  margin: 0;
  font-size: 11px;
  color: #a09d93;
}

.chatbot-cerrar {
  background: transparent;
  border: none;
  cursor: pointer;
  color: #a09d93;
  padding: 4px;
  display: flex;
  align-items: center;
  border-radius: 50%;
  transition: color 0.2s, background 0.2s;
}

.chatbot-cerrar:hover {
  color: var(--chat-text-header);
  background: rgba(255,255,255,0.08);
}

/* =====================================================
   ÁREA DE MENSAJES
   ===================================================== */
.chatbot-mensajes {
  flex: 1;
  overflow-y: auto;
  padding: 16px 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  scroll-behavior: smooth;
}

.chatbot-mensajes::-webkit-scrollbar {
  width: 4px;
}
.chatbot-mensajes::-webkit-scrollbar-track {
  background: transparent;
}
.chatbot-mensajes::-webkit-scrollbar-thumb {
  background: #c8c4b8;
  border-radius: 2px;
}

/* =====================================================
   BURBUJAS DE MENSAJES
   ===================================================== */
.mensaje {
  display: flex;
  max-width: 88%;
}

.mensaje-usuario {
  align-self: flex-end;
  justify-content: flex-end;
}

.mensaje-asistente {
  align-self: flex-start;
  justify-content: flex-start;
}

.mensaje-burbuja {
  padding: 10px 14px;
  border-radius: 16px;
  font-size: 13.5px;
  line-height: 1.5;
  word-break: break-word;
}

.mensaje-usuario .mensaje-burbuja {
  background: var(--chat-bg-burbuja-usuario);
  color: var(--chat-text-usuario);
  border-bottom-right-radius: 4px;
  font-family: 'Arial', sans-serif;
}

.mensaje-asistente .mensaje-burbuja {
  background: var(--chat-bg-burbuja-asistente);
  color: var(--chat-text-asistente);
  border-bottom-left-radius: 4px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.08);
  font-family: 'Arial', sans-serif;
}

/* =====================================================
   TYPING INDICATOR (puntos animados)
   ===================================================== */
.typing-indicator {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 12px 16px;
}

.typing-indicator span {
  width: 7px;
  height: 7px;
  background: #b5931a;
  border-radius: 50%;
  animation: typing 1.2s infinite ease-in-out;
}

.typing-indicator span:nth-child(1) { animation-delay: 0s; }
.typing-indicator span:nth-child(2) { animation-delay: 0.2s; }
.typing-indicator span:nth-child(3) { animation-delay: 0.4s; }

@keyframes typing {
  0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
  30% { transform: translateY(-6px); opacity: 1; }
}

/* =====================================================
   INPUT AREA
   ===================================================== */
.chatbot-input-area {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 12px;
  background: #ffffff;
  border-top: 1px solid #e0ddd6;
  flex-shrink: 0;
}

.chatbot-input {
  flex: 1;
  border: 1.5px solid #d4d0c8;
  border-radius: 22px;
  padding: 9px 14px;
  font-size: 13.5px;
  font-family: 'Arial', sans-serif;
  background: #faf9f6;
  color: #2c2a24;
  outline: none;
  transition: border-color 0.2s;
}

.chatbot-input:focus {
  border-color: #b5931a;
}

.chatbot-input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.chatbot-btn-enviar {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: var(--chat-primary);
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: background 0.2s, transform 0.15s;
  padding: 0;
}

.chatbot-btn-enviar:hover:not(:disabled) {
  background: var(--chat-primary-dark);
  transform: scale(1.05);
}

.chatbot-btn-enviar:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

/* =====================================================
   BOTÓN DE ACCIÓN (redirect)
   ===================================================== */
.mensaje-wrapper {
  display: flex;
  flex-direction: column;
  gap: 6px;
  max-width: 100%;
}

.chatbot-btn-accion {
  align-self: flex-start;
  background: var(--chat-primary);
  color: white;
  border: none;
  border-radius: 20px;
  padding: 7px 14px;
  font-size: 12.5px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s, transform 0.15s;
  font-family: 'Arial', sans-serif;
  white-space: nowrap;
}

.chatbot-btn-accion:hover {
  background: var(--chat-primary-dark);
  transform: scale(1.03);
}

/* =====================================================
   TRANSICIONES
   ===================================================== */
.chat-slide-enter-active,
.chat-slide-leave-active {
  transition: opacity 0.2s ease, transform 0.25s ease;
}

.chat-slide-enter-from,
.chat-slide-leave-to {
  opacity: 0;
  transform: translateY(16px) scale(0.97);
}

.icon-fade-enter-active,
.icon-fade-leave-active {
  transition: opacity 0.15s ease;
}
.icon-fade-enter-from,
.icon-fade-leave-to {
  opacity: 0;
}

/* =====================================================
   RESPONSIVE — Móvil
   ===================================================== */
@media (max-width: 480px) {
  .chatbot-container {
    bottom: 16px;
    right: 16px;
  }

  .chatbot-ventana {
    width: calc(100vw - 32px);
    height: 460px;
  }
}
</style>
