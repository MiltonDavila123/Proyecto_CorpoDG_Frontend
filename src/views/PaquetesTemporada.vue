<template>
  <!-- VISTA DE TEMPORADAS -->
  <section v-if="vistaActual === 'temporadas'" class="temporadas-section">
    <div class="section-header">
      <h2>Selecciona una Temporada</h2>
    </div>

    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      <p>Cargando...</p>
    </div>

    <div v-else class="temporadas-grid">
      <div 
        v-for="temporada in temporadas" 
        :key="temporada.id" 
        class="temporada-card"
        @click="seleccionarTemporada(temporada)"
      >
        <div 
          class="temporada-img" 
          :style="{ backgroundImage: `url(${getImagenTemporada(temporada.nombre)})` }"
        >
          <div class="temporada-overlay"></div>
          <div class="temporada-info">
            <h3>{{ temporada.nombre }}</h3>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- VISTA DE PAQUETES FILTRADOS POR TEMPORADA -->
  <section v-if="vistaActual === 'paquetes'" class="paquetes-section">
    <div class="section-header">
      <h2>Paquetes: {{ temporadaSeleccionada?.nombre }}</h2>
    </div>

    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      <p>Cargando paquetes...</p>
    </div>

    <div v-else-if="paquetes.length === 0" class="no-paquetes">
      <div class="no-paquetes-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
          <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
          <line x1="12" y1="22.08" x2="12" y2="12"/>
        </svg>
      </div>
      <h3>No hay paquetes disponibles</h3>
      <p>Actualmente no tenemos paquetes para esta temporada. ¡Vuelve pronto!</p>
    </div>

    <CarruselPaquetes 
      v-else
      :paquetes="paquetes"
      :items-per-slide="3"
      @ver-oferta="verOferta"
    />

    <button class="btn-back-floating" @click="volverATemporadas">
      <span class="arrow">←</span> Volver a Temporadas
    </button>
  </section>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getTemporadas, getPaquetes } from '../services/api.js'
import CarruselPaquetes from '../components/CarruselPaquetes.vue'

const router = useRouter()

const vistaActual = ref('temporadas')
const loading = ref(false)
const temporadas = ref([])
const paquetes = ref([])
const temporadaSeleccionada = ref(null)

const imagenesTemporadas = {
  'temporada alta': 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800',
  'temporada baja': 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800',
  'alta': 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800',
  'baja': 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800',
  'navidad': 'https://images.unsplash.com/photo-1482517967863-00e15c9b44be?w=800',
  'verano': 'https://images.unsplash.com/photo-1473116763249-2faaef81ccda?w=800',
  'invierno': 'https://images.unsplash.com/photo-1491002052546-bf38f186af56?w=800',
  'semana santa': 'https://images.unsplash.com/photo-1548013146-72479768bada?w=800'
}

const getImagenTemporada = (nombre) => {
  const key = nombre.toLowerCase()
  return imagenesTemporadas[key] || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800'
}

onMounted(async () => {
  loading.value = true
  try {
    temporadas.value = await getTemporadas()
  } catch (error) {
    console.error('Error cargando temporadas:', error)
  } finally {
    loading.value = false
  }
})

const seleccionarTemporada = async (temporada) => {
  temporadaSeleccionada.value = temporada
  loading.value = true
  vistaActual.value = 'paquetes'

  try {
    paquetes.value = await getPaquetes({ temporada: temporada.nombre })
  } catch (error) {
    console.error('Error cargando paquetes por temporada:', error)
  } finally {
    loading.value = false
  }
}

const volverATemporadas = () => {
  vistaActual.value = 'temporadas'
  temporadaSeleccionada.value = null
  paquetes.value = []
}

const verOferta = (paquete) => {
  router.push({ name: 'PaqueteDetalle', params: { id: paquete.id } })
}
</script>

<style scoped>
.temporadas-section,
.paquetes-section {
  --color-primary: #b5931ae2;
  --color-primary-dark: #8a7015;
  --color-primary-light: #d4b82c;
  --color-dark: #23221e;
  --color-text: #333;
  --color-text-light: #666;
  --color-background: #f5f5f5;
  --color-white: #fff;
  --color-border: #e0e0e0;
  --shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.1);
  --shadow-md: 0 4px 15px rgba(0, 0, 0, 0.15);
  --shadow-lg: 0 8px 30px rgba(0, 0, 0, 0.2);
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
}

.section-header {
  text-align: center;
  padding: 3rem 2rem 2rem;
}

.section-header h2 {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--color-dark);
  margin-bottom: 10px;
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px;
  color: var(--color-text-light);
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid var(--color-border);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 15px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.temporadas-section {
  padding: 2rem;
  min-height: 50vh;
}

.temporadas-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

.temporada-card {
  cursor: pointer;
  border-radius: var(--radius-md);
  overflow: hidden;
  transition: transform 0.3s, box-shadow 0.3s;
}

.temporada-card:hover {
  transform: translateY(-8px);
  box-shadow: var(--shadow-lg);
}

.temporada-img {
  position: relative;
  height: 200px;
  background-size: cover;
  background-position: center;
  display: flex;
  align-items: flex-end;
}

.temporada-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.2) 50%, transparent 100%);
}

.temporada-info {
  position: relative;
  z-index: 1;
  padding: 1.5rem;
  width: 100%;
}

.temporada-info h3 {
  color: white;
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 5px;
  text-shadow: 1px 1px 3px rgba(0,0,0,0.5);
}

.paquetes-section {
  padding: 60px;
  background: var(--color-background);
}

.no-paquetes {
  text-align: center;
  padding: 80px 20px;
  background: white;
  border-radius: var(--radius-lg);
  max-width: 500px;
  margin: 0 auto;
}

.no-paquetes-icon {
  width: 80px;
  height: 80px;
  margin: 0 auto 20px;
  color: var(--color-primary);
  opacity: 0.7;
}

.no-paquetes-icon svg {
  width: 100%;
  height: 100%;
}

.no-paquetes h3 {
  color: var(--color-dark);
  margin-bottom: 10px;
}

.no-paquetes p {
  color: var(--color-text-light);
}

.btn-back-floating {
  position: fixed;
  bottom: 30px;
  left: 30px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: var(--color-primary);
  border: none;
  color: white;
  padding: 14px 24px;
  border-radius: 50px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 600;
  box-shadow: 0 4px 20px rgba(181, 147, 26, 0.4);
  transition: all 0.3s ease;
  z-index: 100;
}

.btn-back-floating:hover {
  background: var(--color-primary-dark);
  transform: translateY(-3px);
  box-shadow: 0 6px 25px rgba(181, 147, 26, 0.5);
}

.btn-back-floating .arrow {
  font-size: 1.3rem;
  transition: transform 0.3s ease;
}

.btn-back-floating:hover .arrow {
  transform: translateX(-4px);
}

@media (max-width: 992px) {
  .temporadas-section {
    padding: 40px 30px;
  }

  .paquetes-section {
    padding: 40px 30px;
  }

  .section-header h2 {
    font-size: 2rem;
  }

  .temporadas-grid {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  }
}

@media (max-width: 768px) {
  .temporadas-section,
  .paquetes-section {
    padding: 40px 20px;
  }

  .section-header h2 {
    font-size: 1.8rem;
  }

  .temporadas-grid {
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 15px;
  }

  .temporada-img {
    height: 170px;
  }

  .temporada-info h3 {
    font-size: 1.3rem;
  }

  .btn-back-floating {
    bottom: 20px;
    left: 20px;
    padding: 12px 20px;
    font-size: 0.95rem;
  }
}

@media (max-width: 480px) {
  .temporadas-section,
  .paquetes-section {
    padding: 30px 15px;
    padding-bottom: 100px;
  }

  .section-header {
    padding: 2rem 1rem 1.5rem;
  }

  .section-header h2 {
    font-size: 1.5rem;
  }

  .temporadas-grid {
    grid-template-columns: 1fr;
    padding: 0 0.5rem;
  }

  .temporada-img {
    height: 150px;
  }

  .temporada-info {
    padding: 1rem;
  }

  .temporada-info h3 {
    font-size: 1.2rem;
  }

  .btn-back-floating {
    bottom: 15px;
    left: 15px;
    padding: 10px 18px;
    font-size: 0.9rem;
  }

  .btn-back-floating .arrow {
    font-size: 1.1rem;
  }

  .no-paquetes {
    padding: 50px 15px;
  }

  .no-paquetes-icon {
    width: 60px;
    height: 60px;
  }

  .no-paquetes h3 {
    font-size: 1.1rem;
  }

  .no-paquetes p {
    font-size: 0.9rem;
  }
}
</style>
