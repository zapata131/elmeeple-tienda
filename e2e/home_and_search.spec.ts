import { test, expect } from '@playwright/test';

test.describe('E2E Walkthrough: Home, Predictive Search, and Merchant Navigation', () => {
  test('replicates live buyer navigation and search in Mexico ($ MXN)', async ({ page }) => {
    // 1. Navigate to Home Page
    await page.goto('/');

    // Verify main header title and Mexico indicator
    const heading = page.locator('h1', { hasText: /MeeplePrecios/i });
    await expect(heading).toBeVisible();

    // Verify clean functional header navigation links exist
    const navOnboard = page.locator('header a[href="/merchant/onboard"]');
    await expect(navOnboard).toBeVisible();

    // 2. Interact with Predictive Search Bar on Home
    const searchInput = page.locator('input[placeholder*="Buscar"]');
    await searchInput.fill('Catan');

    // Wait for dropdown autocomplete results
    const dropdownResult = page.locator('a[href^="/game/"]').first();
    await expect(dropdownResult).toBeVisible();

    // 3. Click search autocomplete result to navigate to Game Detail page
    await dropdownResult.click();

    // Verify Game Detail page loads comparison table
    await expect(page).toHaveURL(/\/game\/\d+/);
    const tableHeader = page.locator('h2', { hasText: /Comparativa de ofertas por tienda/i });
    await expect(tableHeader).toBeVisible();

    // Verify price breakdown 3-part formula notice ($ MXN)
    await expect(page.locator('text=Coste total ($ MXN)')).toBeVisible();
  });
});
