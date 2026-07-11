import { test, expect } from '@playwright/test'

test.describe('RNF-04: Estados de carga, error y sin resultados', () => {

  test('flight results muestra estado de carga inicial', async ({ page }) => {
    await page.goto('/vuelos/resultados?origin=UIO&destination=GYE&date=2026-08-15')
    await expect(page.locator('.loading-section')).toBeVisible({ timeout: 8000 })
  })

  test('flight results muestra error cuando la API falla', async ({ page }) => {
    await page.route(/\/api\/buscar-vuelos-live/, async route => {
      await route.fulfill({ status: 500, contentType: 'application/json', body: '{"error":"Error interno"}' })
    })
    await page.goto('/vuelos/resultados?origin=UIO&destination=GYE&date=2026-08-15')
    await expect(page.locator('.error-section')).toBeVisible({ timeout: 15000 })
  })

  test('flight results muestra estado sin resultados', async ({ page }) => {
    await page.route(/\/api\/buscar-vuelos-live/, async route => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ groupedItineraryResponse: { itineraryGroups: [], statistics: { itineraryCount: 0 } } }) })
    })
    await page.goto('/vuelos/resultados?origin=UIO&destination=GYE&date=2026-08-15')
    await expect(page.locator('.empty-section')).toBeVisible({ timeout: 15000 })
  })

  test('detalle paquete muestra estado de carga inicial', async ({ page }) => {
    await page.goto('/paquetes/1')
    await expect(page.locator('.loading-container')).toBeVisible({ timeout: 8000 })
  })

  test('detalle paquete muestra error cuando falla API', async ({ page }) => {
    await page.route(/\/api\/paquetes\//, async route => {
      await route.fulfill({ status: 500, contentType: 'application/json', body: '{"error":"Error"}' })
    })
    await page.goto('/paquetes/999')
    await expect(page.locator('.error-container')).toBeVisible({ timeout: 10000 })
  })
})
