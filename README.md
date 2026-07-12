# CorpoDG Frontend — Portal de Viajes

Frontend Vue 3 para **CorpoDG Trip593**. Portal turístico con catálogo de destinos y paquetes, buscador de vuelos en vivo, reservas, y chatbot Cory.

**Stack:** Vue 3 · Vite 7 · Vue Router 4 · Axios · Playwright · ESLint

## Inicio rápido

```bash
git clone https://github.com/Gabriel2146/Proyecto_CorpoDG_Frontend.git
cd Proyecto_CorpoDG_Frontend
npm install
npm run dev
```

La app se conecta a `http://localhost:8000` por defecto (backend Django).

## Vistas / Páginas

| Ruta | Vista | Descripción |
|------|-------|-------------|
| `/` | `Home.vue` | Landing page con carruseles de paquetes y vuelos |
| `/paquetes` | `PaquetesLayout.vue` | Catálogo de paquetes filtrado por región |
| `/paquetes/:id` | `DetallePaquete.vue` | Detalle completo de paquete turístico |
| `/destinos` | `Destinos.vue` | Mapa de regiones y destinos |
| `/boletos` | `Boletos.vue` | Búsqueda y resultados de vuelos Sabre |
| `/vuelos/resultados` | `ResultadosVuelos.vue` | Resultados de búsqueda de vuelos |
| `/renta_auto` | `Renta_Autos.vue` | Renta de autos |
| `/reserva/confirmada` | `ReservaConfirmada.vue` | Confirmación de reserva de vuelo |
| `/reserva/cancelada` | `ReservaCancelada.vue` | Cancelación de reserva de vuelo |
| `/paquetes/reserva/confirmada` | `ReservaPaqueteConfirmada.vue` | Confirmación de paquete |
| `/paquetes/reserva/cancelada` | `ReservaPaqueteCancelada.vue` | Cancelación de paquete |

## Componentes

| Componente | Descripción |
|------------|-------------|
| `Navbar.vue` | Navegación principal responsive |
| `Footer_Info.vue` | Footer con información de contacto |
| `ChatBot.vue` | Asistente Cory (Groq IA) flotante |
| `BuscadorVuelos.vue` | Formulario de búsqueda de vuelos |
| `CarruselPaquetes.vue` | Carrusel de paquetes destacados |
| `CarruselVuelos.vue` | Carrusel de vuelos destacados |
| `ModalCheckoutVuelo.vue` | Modal de checkout Stripe para vuelo |
| `ModalReservaVuelo.vue` | Modal de reserva de vuelo |
| `ModalReservaPaquete.vue` | Modal de reserva de paquete |
| `ModalContacto.vue` | Formulario de contacto |
| `ModalPdfViewer.vue` | Visor de vouchers PDF |

## Dependencias principales

- `vue@^3.5` — Framework
- `vue-router@^4.6` — Enrutamiento
- `axios@^1.13` — Cliente HTTP
- `@playwright/test@^1.61` — E2E tests
- `@vitejs/plugin-vue` — Vite plugin
- `eslint` + `eslint-plugin-vue` — Linting

## Scripts

```bash
npm run dev      # Servidor de desarrollo
npm run build    # Build producción
npm run preview  # Preview del build
```

## Tests E2E (Playwright)

Los tests se ejecutan en CI con GitHub Actions. Cubren:
- Navegación y carga de páginas principales
- Búsqueda de vuelos
- Responsive design (Chromium + Firefox)
- Estados de carga (v-if loading)

```bash
npx playwright test      # Todos los tests
npx playwright test --headed  # Con navegador visible
```

## CI/CD

- **GitHub Actions CI** — Node 20, build, lint + Playwright E2E (Chromium + Firefox)
- **Render** — despliegue automático desde `staging`, servidor Nginx

## Estructura del proyecto

```
src/
├── views/          # Páginas (Home, Paquetes, Destinos, Boletos...)
├── components/     # Componentes reutilizables
├── router/         # Configuración de rutas
├── App.vue         # Componente raíz
└── main.js         # Entrada de la app
```
