import { test, expect } from '@playwright/test'

test.describe('RNF-04: Estados de carga, error y sin resultados', () => {

  test('flight results muestra estado de carga inicial', async ({ page }) => {
    await page.goto('/vuelos/resultados?origin=UIO&destination=GYE&date=2026-08-15')
    const loading = page.locator('.loading-section, .loading-container')
    await expect(loading).toBeVisible({ timeout: 3000 })
  })

  test('flight results muestra error cuando la API falla', async ({ page }) => {
    await page.route('**/api/buscar-vuelos-live/**', async route => {
      await route.fulfill({ status: 500, contentType: 'application/json', body: '{"error":"Error interno"}' })
    })
    await page.route('**/api/buscar-vuelos-live', async route => {
      await route.fulfill({ status: 500, contentType: 'application/json', body: '{"error":"Error interno"}' })
    })

    await page.goto('/vuelos/resultados?origin=UIO&destination=GYE&date=2026-08-15')
    const errorSection = page.locator('.error-section, .error-container')
    await expect(errorSection).toBeVisible({ timeout: 15000 })
  })

  test('flight results muestra estado sin resultados', async ({ page }) => {
    await page.route('**/api/buscar-vuelos-live/**', async route => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: '{"groupedItineraryResponse":{"itineraryGroups":[],"statistics":{"itineraryCount":0}}}' })
    })
    await page.route('**/api/buscar-vuelos-live', async route => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: '{"groupedItineraryResponse":{"itineraryGroups":[],"statistics":{"itineraryCount":0}}}' })
    })

    await page.goto('/vuelos/resultados?origin=UIO&destination=GYE&date=2026-08-15')
    const emptySection = page.locator('.empty-section, .empty-container')
    await expect(emptySection).toBeVisible({ timeout: 15000 })
  })

  test('detalle paquete muestra estado de carga inicial', async ({ page }) => {
    await page.goto('/paquetes/1')
    const loading = page.locator('.loading-container')
    await expect(loading).toBeVisible({ timeout: 3000 })
  })

  test('detalle paquete muestra error cuando falla API', async ({ page }) => {
    await page.route('**/api/paquetes/**', async route => {
      await route.fulfill({ status: 500, contentType: 'application/json', body: '{"error":"Error"}' })
    })

    await page.goto('/paquetes/999')
    const errorSection = page.locator('.error-container')
    await expect(errorSection).toBeVisible({ timeout: 10000 })
  })
})
