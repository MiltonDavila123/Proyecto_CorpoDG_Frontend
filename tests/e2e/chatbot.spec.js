import { test, expect } from '@playwright/test'

test.describe('Chatbot Cory', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('burbuja del chat es visible en la página', async ({ page }) => {
    const burbuja = page.locator('.chatbot-burbuja')
    await expect(burbuja).toBeVisible()
  })

  test('abre y cierra el chat al hacer clic en la burbuja', async ({ page }) => {
    const burbuja = page.locator('.chatbot-burbuja')
    const ventana = page.locator('.chatbot-ventana')

    await expect(ventana).not.toBeVisible()
    await burbuja.click()
    await expect(ventana).toBeVisible()
    await burbuja.click()
    await expect(ventana).not.toBeVisible()
  })

  test('muestra mensaje de bienvenida de Cory al abrir', async ({ page }) => {
    await page.locator('.chatbot-burbuja').click()
    const bienvenida = page.locator('.mensaje-asistente').first()
    await expect(bienvenida).toContainText('Cory')
  })

  test('botón de redirect aparece cuando el chatbot devuelve accion', async ({ page }) => {
    await page.route('**/api/chatbot/', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          respuesta: 'Encontré vuelos de Quito a Miami desde $420.',
          historial: [],
          accion: {
            tipo: 'redirect_vuelos',
            label: 'Ver vuelos disponibles',
            path: '/vuelos/resultados',
            params: { origin: 'UIO', destination: 'MIA', date: '2025-08-15', adults: 1, tipoViaje: 'soloIda' },
          },
        }),
      })
    })

    await page.locator('.chatbot-burbuja').click()
    await page.locator('.chatbot-input').fill('Vuelos de UIO a MIA el 2025-08-15')
    await page.locator('.chatbot-btn-enviar').click()

    const btnAccion = page.locator('.chatbot-btn-accion')
    await expect(btnAccion).toBeVisible({ timeout: 10000 })
    await expect(btnAccion).toContainText('Ver vuelos disponibles')
  })

  test('botón de redirect navega a /vuelos/resultados con query params', async ({ page }) => {
    await page.route('**/api/chatbot/', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          respuesta: 'Encontré vuelos.',
          historial: [],
          accion: {
            tipo: 'redirect_vuelos',
            label: 'Ver vuelos disponibles',
            path: '/vuelos/resultados',
            params: { origin: 'UIO', destination: 'MIA', date: '2025-08-15', adults: 1, tipoViaje: 'soloIda' },
          },
        }),
      })
    })

    await page.locator('.chatbot-burbuja').click()
    await page.locator('.chatbot-input').fill('test')
    await page.locator('.chatbot-btn-enviar').click()

    await page.locator('.chatbot-btn-accion').click()

    await expect(page).toHaveURL(/\/vuelos\/resultados/, { timeout: 5000 })
    const url = new URL(page.url())
    expect(url.searchParams.get('origin')).toBe('UIO')
    expect(url.searchParams.get('destination')).toBe('MIA')
  })

})
