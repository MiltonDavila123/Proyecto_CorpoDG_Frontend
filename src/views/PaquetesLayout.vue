<template>
  <section class="paquetes-hero">
    <div class="hero-overlay"></div>
    <div class="hero-content">
      <h1>Paquetes Turísticos</h1>
      <p>Descubre los mejores destinos del mundo</p>

      <div class="hero-tabs">
        <span class="hero-tabs-label">BUSCA POR</span>
        <div class="hero-tabs-buttons">
          <button 
            :class="['tab-btn', { active: tabActual === 'region' }]" 
            @click="cambiarTab('region')"
          >
            Región
          </button>
          <button 
            :class="['tab-btn', { active: tabActual === 'tipo' }]" 
            @click="cambiarTab('tipo')"
          >
            Tipo
          </button>
          <button 
            :class="['tab-btn', { active: tabActual === 'temporada' }]" 
            @click="cambiarTab('temporada')"
          >
            Temporada
          </button>
        </div>
      </div>
    </div>

    <!-- Scroll indicator -->
    <div class="scroll-indicator" @click="$event.target.closest('.paquetes-hero')?.nextElementSibling?.scrollIntoView({ behavior: 'smooth' })">
      <span>Mirar Búsqueda</span>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
    </div>
  </section>

  <component :is="componenteActual" />
</template>

<script setup>
import { ref, computed, shallowRef } from 'vue'
import Paquetes from './Paquetes.vue'
import PaquetesTipo from './PaquetesTipo.vue'
import PaquetesTemporada from './PaquetesTemporada.vue'

const tabActual = ref('region')

const componentes = {
  region: Paquetes,
  tipo: PaquetesTipo,
  temporada: PaquetesTemporada
}

const componenteActual = computed(() => componentes[tabActual.value])

const cambiarTab = (tab) => {
  tabActual.value = tab
}
</script>

<style scoped>
.paquetes-hero {
  --color-primary: #b5931ae2;
  --color-primary-dark: #8a7015;
  --color-primary-light: #d4b82c;
  --color-dark: #23221e;

  min-height: 100vh;
  background: url('https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1400') center/cover;
  background-attachment: fixed;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100px 20px 80px;
}

.hero-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0.65) 0%,
    rgba(0, 0, 0, 0.45) 50%,
    rgba(0, 0, 0, 0.7) 100%
  );
}

.hero-content {
  position: relative;
  z-index: 1;
  text-align: center;
  color: white;
  padding: 0 2rem;
  animation: fadeInDown 0.8s ease-out;
}

@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.hero-content h1 {
  font-size: 3.8rem;
  margin-bottom: 1.2rem;
  font-weight: 800;
  letter-spacing: -1px;
  text-shadow: 
    2px 2px 10px rgba(0,0,0,0.6),
    0 0 30px rgba(181, 147, 26, 0.3);
}

.hero-content p {
  font-size: 1.5rem;
  opacity: 0.95;
  font-weight: 300;
  letter-spacing: 0.5px;
  text-shadow: 1px 1px 6px rgba(0,0,0,0.5);
  margin-bottom: 2.5rem;
}

/* ===== HERO TABS ===== */
.hero-tabs {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.hero-tabs-label {
  font-size: 0.85rem;
  font-weight: 600;
  letter-spacing: 2px;
  text-transform: uppercase;
  opacity: 0.8;
}

.hero-tabs-buttons {
  display: flex;
  gap: 0;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  border-radius: 50px;
  padding: 5px;
  border: 1px solid rgba(255, 255, 255, 0.25);
}

.tab-btn {
  padding: 12px 28px;
  border: none;
  background: transparent;
  color: rgba(255, 255, 255, 0.8);
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  border-radius: 50px;
  transition: all 0.3s ease;
  letter-spacing: 0.5px;
}

.tab-btn:hover {
  color: white;
  background: rgba(255, 255, 255, 0.1);
}

.tab-btn.active {
  background: var(--color-primary);
  color: white;
  box-shadow: 0 4px 15px rgba(181, 147, 26, 0.4);
}

/* Scroll Indicator */
.scroll-indicator {
  position: absolute;
  bottom: 30px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 2;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  animation: bounceDown 2s ease-in-out infinite;
}

.scroll-indicator span {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.7);
  letter-spacing: 1.5px;
  text-transform: uppercase;
  font-weight: 500;
}

.scroll-indicator svg {
  width: 28px;
  height: 28px;
  color: rgba(255, 255, 255, 0.7);
  transition: color 0.3s;
}

.scroll-indicator:hover svg,
.scroll-indicator:hover span {
  color: white;
}

@keyframes bounceDown {
  0%, 20%, 50%, 80%, 100% { transform: translateX(-50%) translateY(0); }
  40% { transform: translateX(-50%) translateY(10px); }
  60% { transform: translateX(-50%) translateY(5px); }
}

/* ===== RESPONSIVE ===== */
@media (max-width: 992px) {
  .paquetes-hero {
    min-height: 100vh;
    padding: 100px 20px 80px;
  }

  .hero-content h1 {
    font-size: 3rem;
  }

  .hero-content p {
    font-size: 1.3rem;
  }
}

@media (max-width: 768px) {
  .paquetes-hero {
    background-attachment: scroll;
    min-height: 100vh;
    padding: 90px 15px 70px;
  }

  .hero-content h1 {
    font-size: 2.5rem;
  }

  .hero-content p {
    font-size: 1.15rem;
  }

  .tab-btn {
    padding: 10px 20px;
    font-size: 0.9rem;
  }
}

@media (max-width: 480px) {
  .paquetes-hero {
    min-height: 100vh;
    padding: 80px 12px 60px;
  }

  .hero-content h1 {
    font-size: 2rem;
  }

  .hero-content p {
    font-size: 1rem;
    padding: 0 10px;
    margin-bottom: 2rem;
  }

  .hero-tabs-buttons {
    flex-direction: column;
    border-radius: 16px;
    width: 100%;
    max-width: 280px;
  }

  .tab-btn {
    padding: 12px 20px;
    font-size: 0.95rem;
    border-radius: 12px;
  }
}
</style>
