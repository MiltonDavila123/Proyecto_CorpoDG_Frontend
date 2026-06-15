<template>
  <div class="reserva-page">
    <Navbar />
    <main class="reserva-main">
      <div class="estado-card">
        <div class="icon-circle icon-warn">!</div>
        <h1>Pago cancelado</h1>
        <p>No se realizó ningún cargo a tu tarjeta. Puedes volver a intentarlo cuando quieras.</p>
        <div class="acciones">
          <router-link to="/boletos" class="btn-primary">Buscar vuelos nuevamente</router-link>
          <router-link to="/" class="btn-secondary">Ir al inicio</router-link>
        </div>
      </div>
    </main>
    <Footer_Info />
  </div>
</template>

<script setup>
import Navbar from '../components/Navbar.vue'
import Footer_Info from '../components/Footer_Info.vue'
</script>

<style scoped>
.reserva-page { min-height: 100vh; background: #f1f5f9; }
.reserva-main { max-width: 720px; margin: 0 auto; padding: 60px 24px; }
.estado-card {
  background: #fff;
  border-radius: 14px;
  padding: 48px 24px;
  text-align: center;
  box-shadow: 0 6px 24px rgba(0,0,0,0.06);
}
.estado-card h1 { margin: 14px 0 6px; color: #1a1a2e; }
.estado-card p { color: #475569; max-width: 460px; margin: 0 auto; }
.icon-circle {
  width: 64px; height: 64px;
  border-radius: 50%;
  margin: 0 auto;
  display: flex; align-items: center; justify-content: center;
  font-size: 32px; font-weight: 700; color: #fff;
  background: linear-gradient(135deg, #f59e0b, #b45309);
}
.acciones { display: flex; gap: 12px; justify-content: center; margin-top: 22px; flex-wrap: wrap; }
.btn-primary, .btn-secondary {
  padding: 12px 22px; border-radius: 8px; font-weight: 600;
  text-decoration: none; display: inline-block; font-size: 0.95rem;
}
.btn-primary {
  background: linear-gradient(135deg, #b5931a 0%, #8a6f14 100%); color: #fff;
}
.btn-primary:hover { background: linear-gradient(135deg, #d4af37 0%, #b5931a 100%); }
.btn-secondary {
  background: #fff; color: #334155; border: 1px solid #cbd5e1;
}
.btn-secondary:hover { background: #f1f5f9; }
</style>
