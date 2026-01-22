<template>
  <div class="navbar-wrapper" :class="{ 'navbar-scrolled': isScrolled }">
    <!-- Barra superior con teléfono -->
    <div class="top-bar">
      <div class="phone-info">
        <img src="https://raw.githubusercontent.com/MiltonDavila123/SVGs/refs/heads/main/Whatsapp%20Logo%20_%20parte%20_%20superior.svg"
          alt="Whatsapp Logo" width="30" height="30" />
        <a class="phone-number" href="https://wa.me/593984235152" target="_blank" rel="noopener">098-423-5152</a>
        <span class="phone-text">Llámanos o escribenos</span>
      </div>
    </div>

    <!-- Navbar principal -->
    <header class="navbar">
      <div class="logo">
        <img :src="logoUrl" class="logo-img" />
      </div>

      <div class="nav-wrapper-right">
        <div class="top-section">
          <div class="top-links">
            <a href="#">Noticias</a>
            <a href="#">Galápagos</a>
            <a href="#">Descuentos</a>
            
          </div>
        </div>
        <div class="line-top"></div>
        <div class="nav-content">
          <nav>
            <router-link to="/">Inicio</router-link>
            <router-link to="/">Boletos aéreos</router-link>
            <router-link to="/">Hoteles</router-link>
            <router-link to="/">Renta de autos</router-link>
            <router-link to="/destinos">Destinos</router-link>
          </nav>
          <button class="btn" @click="abrirModal">Contáctanos</button>
        </div>
      </div>
    </header>
    <div class="navbar-bottom-line"></div>

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
            <textarea id="mensaje" v-model="formulario.mensaje" placeholder="¿En qué podemos ayudarte?" rows="4" required maxlength="500"></textarea>
            <span class="contador">{{ formulario.mensaje.length }}/500</span>
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
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import logoUrl from '../assets/images/Logo_letras_blancas.png'

const isScrolled = ref(false)

// ===== MODAL =====
const mostrarModal = ref(false)
const mostrarConfirmacion = ref(false)
const formulario = ref({
  nombre: '',
  email: '',
  telefono: '',
  mensaje: ''
})

const abrirModal = () => {
  mostrarModal.value = true
  document.body.style.overflow = 'hidden' // Evita scroll del fondo
}

const cerrarModal = () => {
  mostrarModal.value = false
  document.body.style.overflow = '' // Restaura scroll
}

const cerrarConfirmacion = () => {
  mostrarConfirmacion.value = false
  document.body.style.overflow = '' // Restaura scroll
}

// Función para permitir solo números en el teléfono
const soloNumeros = (event) => {
  formulario.value.telefono = formulario.value.telefono.replace(/[^0-9]/g, '')
}

const enviarFormulario = () => {
  // Aquí irá la lógica para enviar a la base de datos, correo y WhatsApp
  console.log('Datos del formulario:', formulario.value)
  
  // Cerramos el modal de contacto y abrimos el de confirmación
  cerrarModal()
  mostrarConfirmacion.value = true
  document.body.style.overflow = 'hidden'
  
  // Limpiamos el formulario
  formulario.value = {
    nombre: '',
    email: '',
    telefono: '',
    mensaje: ''
  }
}
// ==================

const handleScroll = () => {
  isScrolled.value = window.scrollY > 0
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
  handleScroll()
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style scoped>
/* ===== VARIABLES DE COLORES ===== */
.navbar-wrapper {
  --color-primary: #b5931ae2;        /* Amarillo/Dorado principal */
  --color-primary-hover-button: #544a28;  /* Amarillo/Dorado hover */
  --color-dark: #ebeae7e0;           /* Azul oscuro/Negro para textos */
  --color-background: #23221ee8;     /* Fondo navbar scroll */
  --color-hover-nav: #ac9749;
  
  /* ===== VARIABLES DE FUENTES ===== */
  --font-heading: 'Arial', serif;              /* Para títulos y números grandes */
  --font-body: 'Arial', sans-serif;              /* Para textos normales */
  --font-menu: 'Verdana', sans-serif;            /* Para menú principal */
  --font-button: 'Trebuchet MS', sans-serif;     /* Para botones */
  --font-secondary: 'Arial', serif;    /* Para links secundarios */
}
/* ===================================== */

.navbar-wrapper {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 1000;
  transition: background-color 0.3s ease;
}

.navbar-wrapper.navbar-scrolled {
  background: var(--color-background);
}

.top-bar {
  display: flex;
  background: var(--color-primary);
  padding: 10px 60px;
  justify-content: center;
  align-items: center;
}

.phone-info {
  display: flex;
  align-items: center;
  gap: 10px;
  color: var(--color-dark);
}

.phone-info svg {
  color: var(--color-dark);
}

.phone-number {
  font-size: 1.8rem;
  font-weight: bold;
  color: var(--color-dark);
  font-family: var(--font-heading);
}

.phone-text {
  font-size: 1.0rem;
  font-weight: bold;
  color: var(--color-dark);
  margin-left: 10px;
  font-family: var(--font-body);
}

.navbar {
  width: 100%;
  padding: 15px 60px;
  display: flex;
  align-items: center;
  gap: 20px;
  color: white;
  background: transparent;
}

.navbar-bottom-line {
  width: calc(100% - 120px);
  height: 1.8px;
  background: rgba(255, 255, 255, 0.708);
  margin-left: 60px;
}

.logo {
  flex-shrink: 0;
  display: flex;
  align-items: center;
}

.logo-img {
  width: 180px;
  height: auto;
}

.nav-wrapper-right {
  flex: 1;
  display: flex;
  flex-direction: column;
  margin-top: 5px;
}
.top-section {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 8px;
}

.top-links {
  display: flex;
  align-items: center;
  gap: 25px;
}

.top-links a {
  color: white;
  text-decoration: none;
  font-size: 0.8rem;
  transition: color 0.3s;
  font-family: var(--font-secondary);
}

.top-links a:hover {
  color: #facc15;
}

.btn-advisor {
  background: transparent;
  border: 1px solid white;
  padding: 6px 16px;
  border-radius: 3px;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.7rem;
  color: white;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  transition: all 0.3s;
  font-family: var(--font-button);
}

.btn-advisor:hover {
  background: rgba(255, 255, 255, 0.1);
}
.line-top {
  width: 100%;
  height: 2px;
  background:  rgba(255, 255, 255, 0.708);
}

.nav-content {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding: 8px 0 0 0;
  gap: 20px;
}

nav {
  display: flex;
  align-items: center;
  gap: 10px;
}

nav a,
nav .router-link-active,
nav :deep(a) {
  margin: 0;
  padding: 0 15px;
  color: white;
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  transition: color 0.3s ease;
  font-family: var(--font-menu);
}

nav a:hover {
  color: var(--color-hover-nav);
}

nav .router-link-exact-active {
  color: white;
  font-weight: bold;
}

.btn {
  background: var(--color-primary);
  border: none;
  padding: 12px 28px;
  border-radius: 25px;
  cursor: pointer;
  font-weight: bold;
  font-size: 0.85rem;
  color: var(--color-dark);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  transition: all 0.3s ease;
  font-family: var(--font-button);
}

.btn:hover {
  background: var(--color-primary-hover-button);
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
  font-family: var(--font-heading);
  text-align: center;
}

.modal-subtitulo {
  font-size: 0.95rem;
  color: #666;
  margin-bottom: 25px;
  font-family: var(--font-body);
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
  font-family: var(--font-body);
}

.form-grupo input,
.form-grupo textarea {
  padding: 12px 15px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  font-family: var(--font-body);
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
  font-family: var(--font-button);
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
  font-family: var(--font-heading);
}

.confirmacion-texto {
  font-size: 1rem;
  color: #666;
  margin-bottom: 25px;
  font-family: var(--font-body);
}
/* ============================= */
</style>
