<template>
  <!-- Hero Section with Integrated Form -->
  <section class="renta-autos-hero">
    <div class="hero-overlay"></div>
    
    <!-- Hero Text -->
    <div class="hero-content">
      <h1>Renta de Autos</h1>
      <p>Encuentra el vehículo perfecto para tu viaje</p>
    </div>

    <!-- Floating Form Card -->
    <div class="floating-form-card" :class="{ expanded: isExpanded }">
      <div class="form-header" @click="toggleExpand">
        <div class="header-left">
          <div class="header-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M5 17h14v-5H5v5zm10-7.5h3.5L21 14h-6V9.5zM19 20H5v-1h14v1zM7 8l4-4 4 4"/>
            </svg>
          </div>
          <div class="header-text">
            <h2>Reserva tu Vehículo</h2>
            <p>Completa el formulario y encuentra las mejores opciones</p>
          </div>
        </div>
        <button class="expand-btn" :title="isExpanded ? 'Contraer' : 'Expandir'">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" :class="{ rotated: isExpanded }">
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </button>
      </div>
      
      <transition name="slide">
        <div class="form-content" v-show="isExpanded">
          <iframe 
            src="https://subsite.agentcars.com/es/site/form-iframe?agency=trip593-" 
            class="rental-iframe"
            frameborder="0"
            title="Formulario de Renta de Autos"
          >
            Your browser does not support iframes
          </iframe>
        </div>
      </transition>
    </div>
  </section>
</template>

<script>
export default {
  name: 'RentaAutos',
  data() {
    return {
      isExpanded: false
    }
  },
  methods: {
    toggleExpand() {
      this.isExpanded = !this.isExpanded;
    }
  },
  mounted() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
</script>

<style scoped>
/* Hero Section */
.renta-autos-hero {
  min-height: 100vh;
  background: url('https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=1600') center/cover;
  background-attachment: fixed;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  padding: 220px 20px 60px;
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
  padding-top: 40px;
  margin-bottom: 60px;
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
}

/* Floating Form Card */
.floating-form-card {
  position: relative;
  z-index: 2;
  width: 100%;
  max-width: 1100px;
  background: rgba(255, 255, 255, 0.98);
  border-radius: 20px;
  box-shadow: 
    0 25px 60px rgba(0, 0, 0, 0.3),
    0 0 0 1px rgba(255, 255, 255, 0.1);
  overflow: hidden;
  backdrop-filter: blur(10px);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  animation: fadeInUp 0.9s ease-out 0.3s both;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(40px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.floating-form-card:hover {
  box-shadow: 
    0 30px 70px rgba(0, 0, 0, 0.35),
    0 0 0 1px rgba(255, 255, 255, 0.15);
}

/* Form Header */
.form-header {
  background: linear-gradient(135deg, #b5931a 0%, #d4af37 50%, #b5931a 100%);
  padding: 25px 35px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.form-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.1),
    transparent
  );
  transition: left 0.5s ease;
}

.form-header:hover::before {
  left: 100%;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 20px;
}

.header-icon {
  width: 60px;
  height: 60px;
  background: rgba(255, 255, 255, 0.25);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border: 3px solid rgba(255, 255, 255, 0.4);
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

.form-header:hover .header-icon {
  transform: scale(1.08) rotate(5deg);
  background: rgba(255, 255, 255, 0.3);
  border-color: rgba(255, 255, 255, 0.5);
}

.header-icon svg {
  width: 30px;
  height: 30px;
  color: white;
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2));
}

.header-text h2 {
  color: white;
  font-size: 1.75rem;
  font-weight: 700;
  margin: 0 0 5px;
  text-shadow: 
    2px 2px 4px rgba(0,0,0,0.2),
    0 0 10px rgba(0,0,0,0.1);
  letter-spacing: -0.5px;
}

.header-text p {
  color: rgba(255, 255, 255, 0.92);
  font-size: 1rem;
  margin: 0;
  font-weight: 400;
  text-shadow: 1px 1px 2px rgba(0,0,0,0.15);
}

/* Expand Button */
.expand-btn {
  width: 50px;
  height: 50px;
  background: rgba(255, 255, 255, 0.2);
  border: 3px solid rgba(255, 255, 255, 0.4);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.expand-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(1.12) rotate(5deg);
  border-color: rgba(255, 255, 255, 0.5);
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.2);
}

.expand-btn svg {
  width: 24px;
  height: 24px;
  color: white;
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2));
}

.expand-btn svg.rotated {
  transform: rotate(180deg);
}

/* Form Content */
.form-content {
  padding: 30px;
  background: linear-gradient(135deg, #fafafa 0%, #ffffff 50%, #f8f9fa 100%);
}

/* Slide Transition */
.slide-enter-active,
.slide-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  max-height: 700px;
  overflow: hidden;
}

.slide-enter-from,
.slide-leave-to {
  max-height: 0;
  padding-top: 0;
  padding-bottom: 0;
  opacity: 0;
}

/* Iframe */
.rental-iframe {
  width: 100%;
  height: 470px;
  min-height: 420px;
  border: none;
  border-radius: 14px;
  display: block;
  margin: 0 auto;
  background: white;
  box-shadow: 
    0 8px 25px rgba(0, 0, 0, 0.1),
    inset 0 0 0 1px rgba(181, 147, 26, 0.1);
  transition: box-shadow 0.3s ease;
}

.rental-iframe:hover {
  box-shadow: 
    0 12px 35px rgba(0, 0, 0, 0.15),
    inset 0 0 0 1px rgba(181, 147, 26, 0.15);
}

/* Responsive Design */
@media (max-width: 992px) {
  .renta-autos-hero {
    padding: 120px 15px 50px;
  }

  .hero-content {
    padding-top: 30px;
    margin-bottom: 40px;
  }

  .hero-content h1 {
    font-size: 3rem;
  }

  .hero-content p {
    font-size: 1.3rem;
  }

  .form-header {
    padding: 22px 30px;
  }

  .header-text h2 {
    font-size: 1.5rem;
  }

  .form-content {
    padding: 20px;
  }

  .rental-iframe {
    height: 480px;
  }
}

@media (max-width: 768px) {
  .renta-autos-hero {
    background-attachment: scroll;
    padding: 110px 12px 40px;
  }

  .hero-content {
    padding-top: 20px;
    margin-bottom: 35px;
  }

  .hero-content h1 {
    font-size: 2.5rem;
  }

  .hero-content p {
    font-size: 1.15rem;
  }

  .floating-form-card {
    border-radius: 16px;
  }

  .form-header {
    padding: 20px 22px;
  }

  .header-left {
    gap: 15px;
  }

  .header-icon {
    width: 52px;
    height: 52px;
    border-width: 2px;
  }

  .header-icon svg {
    width: 26px;
    height: 26px;
  }

  .header-text h2 {
    font-size: 1.3rem;
  }

  .header-text p {
    font-size: 0.9rem;
  }

  .expand-btn {
    width: 44px;
    height: 44px;
    border-width: 2px;
  }

  .expand-btn svg {
    width: 21px;
    height: 20px;
  }

  .form-content {
    padding: 15px;
  }

  .rental-iframe {
    height: 520px;
    border-radius: 10px;
  }
}

@media (max-width: 480px) {
  .renta-autos-hero {
    padding: 100px 10px 30px;
  }

  .hero-content {
    padding-top: 15px;
    margin-bottom: 30px;
  }

  .hero-content h1 {
    font-size: 2.2rem;
  }

  .hero-content p {
    font-size: 1.05rem;
  }

  .floating-form-card {
    border-radius: 14px;
  }

  .form-header {
    padding: 18px;
    flex-direction: column;
    gap: 15px;
  }

  .header-left {
    flex-direction: column;
    text-align: center;
    gap: 12px;
  }

  .header-icon {
    width: 50px;
    height: 50px;
    border-width: 2px;
  }

  .header-icon svg {
    width: 24px;
    height: 24px;
  }

  .header-text h2 {
    font-size: 1.15rem;
  }

  .header-text p {
    font-size: 0.85rem;
  }

  .expand-btn {
    width: 42px;
    height: 42px;
    border-width: 2px;
  }

  .expand-btn svg {
    width: 20px;
    height: 20px;
  }

  .form-content {
    padding: 14px;
  }

  .rental-iframe {
    height: 600px;
    min-height: 550px;
    border-radius: 10px;
  }
}
</style>
