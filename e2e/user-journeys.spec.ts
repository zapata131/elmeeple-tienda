import { test, expect } from '@playwright/test';

test.describe('MeeplePrecios User Journeys (US-01 through US-14)', () => {
  test('US-01: Homepage rendering and search interaction', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/MeeplePrecios 🇲🇽/);
    await expect(page.locator('h1')).toContainText('Encuentra el mejor precio entregado');

    // Search bar interaction
    const searchInput = page.locator('input[placeholder*="Buscar por título"]');
    await expect(searchInput).toBeVisible();
    await searchInput.fill('Catan');

    // Click submit search button
    await page.click('button:has-text("Buscar")');
    await expect(page).toHaveURL(/\/search\?q=Catan/);
    await expect(page.locator('h1')).toContainText('Catálogo de juegos de mesa');
  });

  test('US-02 & US-03: Game detail page price comparison table & language badges', async ({ page }) => {
    await page.goto('/game/13');
    await expect(page.locator('h1')).toContainText('Catan');

    // Verify 3-part price table header
    await expect(page.locator('h3')).toContainText('Comparativa de ofertas por tienda');

    // Verify language badge
    await expect(page.getByText('Español (ES)').first()).toBeVisible();

    // Verify tactile switch
    await page.click('text=Solo tiendas nacionales');
  });

  test('US-06 & US-09: Merchant onboarding and dashboard', async ({ page }) => {
    await page.goto('/merchant/onboard');
    await expect(page.locator('h1')).toContainText('Registro de nueva tienda socia');

    await page.goto('/merchant/dashboard');
    await expect(page.locator('h1')).toContainText('Portal de autoservicio para tiendas');
    await expect(page.getByText('Estado del feed')).toBeVisible();
  });

  test('US-14: Admin staging queue moderation UI', async ({ page }) => {
    await page.goto('/admin/queue');
    await expect(page.locator('h1')).toContainText('Cola de moderación y staging admin');
  });
});
