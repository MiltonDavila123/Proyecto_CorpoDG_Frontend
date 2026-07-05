import { test, expect } from '@playwright/test'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const SCREENSHOTS_DIR = path.join(__dirname, '..', '..', 'test-results', 'responsive')

const VIEWPORTS = [
  { name: 'mobile-320', width: 320, height: 700 },
  { name: 'tablet-768', width: 768, height: 900 },
  { name: 'desktop-1280', width: 1280, height: 800 },
]

test.describe('Prueba Responsive', () => {

  for (const vp of VIEWPORTS) {
    test(`homepage en ${vp.name}`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height })
      await page.goto('/')
      await page.waitForLoadState('networkidle')

      await expect(page.locator('#app')).toBeAttached({ timeout: 10000 })
      await page.screenshot({
        path: path.join(SCREENSHOTS_DIR, `homepage-${vp.name}.png`),
        fullPage: true,
      })
    })

    test(`destinos en ${vp.name}`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height })
      await page.goto('/destinos')
      await page.waitForLoadState('networkidle')
      await page.screenshot({
        path: path.join(SCREENSHOTS_DIR, `destinos-${vp.name}.png`),
        fullPage: true,
      })
    })

    test(`paquetes en ${vp.name}`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height })
      await page.goto('/paquetes')
      await page.waitForLoadState('networkidle')
      await page.screenshot({
        path: path.join(SCREENSHOTS_DIR, `paquetes-${vp.name}.png`),
        fullPage: true,
      })
    })
  }
})
