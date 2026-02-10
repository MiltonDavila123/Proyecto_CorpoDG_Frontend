<template>
  <!-- MODAL VISOR DE PDF -->
  <div class="modal-overlay" v-if="visible" @click.self="cerrar">
    <div class="modal-pdf-contenido">
      <button class="modal-cerrar" @click="cerrar">&times;</button>
      
      <div class="pdf-header">
        <h2 class="pdf-titulo">{{ titulo || 'Información del paquete' }}</h2>
        <p class="pdf-subtitulo">{{ subtitulo || 'Revisa los detalles antes de reservar' }}</p>
      </div>

      <div class="pdf-viewer-container">
        <!-- Visor de PDF embebido -->
        <iframe 
          v-if="pdfUrl"
          :src="pdfUrl"
          class="pdf-iframe"
          title="Visor de PDF"
        ></iframe>
        
        <!-- Estado de carga -->
        <div v-else class="pdf-loading">
          <div class="spinner"></div>
          <p>Cargando documento...</p>
        </div>
      </div>

      <div class="pdf-footer">
        <a 
          :href="pdfUrl" 
          target="_blank" 
          download 
          class="btn-descargar"
        >
          <span class="btn-icon"></span>
          Descargar PDF
        </a>
        <button class="btn-contactar" @click="abrirContacto">
          <span class="btn-icon"></span>
          Contactar para Reserva
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  pdfUrl: {
    type: String,
    default: ''
  },
  titulo: {
    type: String,
    default: ''
  },
  subtitulo: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:visible', 'contactar'])

const cerrar = () => {
  emit('update:visible', false)
  document.body.style.overflow = ''
}

const abrirContacto = () => {
  cerrar()
  emit('contactar')
}

// Controlar el scroll del body cuando el modal está abierto
watch(() => props.visible, (newVal) => {
  if (newVal) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
})

defineExpose({
  cerrar
})
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
  animation: fadeIn 0.3s ease;
  padding: 1rem;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.modal-pdf-contenido {
  background: #fff;
  border-radius: 15px;
  width: 95%;
  max-width: 900px;
  height: 90vh;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  position: relative;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
  animation: slideUp 0.3s ease;
  overflow: hidden;
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
  z-index: 10;
}

.modal-cerrar:hover {
  color: #b5931a;
}

.pdf-header {
  padding: 25px 30px 15px;
  border-bottom: 1px solid #eee;
  text-align: center;
}

.pdf-titulo {
  font-size: 1.5rem;
  color: #23221e;
  margin-bottom: 5px;
  font-family: 'Arial', serif;
}

.pdf-subtitulo {
  font-size: 0.95rem;
  color: #666;
  font-family: 'Arial', sans-serif;
}

.pdf-viewer-container {
  flex: 1;
  overflow: hidden;
  background: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
}

.pdf-iframe {
  width: 100%;
  height: 100%;
  border: none;
}

.pdf-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.pdf-loading p {
  color: #666;
  font-family: 'Arial', sans-serif;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 5px solid #f3f3f3;
  border-top: 5px solid #b5931a;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.pdf-footer {
  padding: 20px 30px;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: center;
  gap: 1rem;
  flex-wrap: wrap;
  background: #fafafa;
}

.btn-descargar,
.btn-contactar {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 12px 25px;
  border-radius: 25px;
  font-weight: bold;
  font-size: 0.95rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  transition: all 0.3s ease;
  font-family: 'Trebuchet MS', sans-serif;
  cursor: pointer;
  text-decoration: none;
}

.btn-descargar {
  background: #fff;
  border: 2px solid #b5931a;
  color: #b5931a;
}

.btn-descargar:hover {
  background: #b5931a;
  color: #fff;
}

.btn-contactar {
  background: linear-gradient(135deg, #b5931a, #d4af37);
  border: none;
  color: #fff;
}

.btn-contactar:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(181, 147, 26, 0.4);
}

.btn-icon {
  font-size: 1.1rem;
}

/* Responsive */
@media (max-width: 768px) {
  .modal-pdf-contenido {
    width: 100%;
    height: 95vh;
    border-radius: 10px;
  }

  .pdf-header {
    padding: 20px 20px 10px;
  }

  .pdf-titulo {
    font-size: 1.2rem;
  }

  .pdf-footer {
    padding: 15px 20px;
    flex-direction: column;
  }

  .btn-descargar,
  .btn-contactar {
    width: 100%;
    justify-content: center;
  }
}
</style>
