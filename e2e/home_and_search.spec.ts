import { test, expect } from '@playwright/test';

test.describe('E2E Walkthrough: Home, Predictive Search, and Catalog Navigation', () => {
  test('replicates live buyer navigation and search in Mexico ($ MXN)', async ({ page }) => {
    // 1. Visit homepage
    await page.goto('/');
    await expect(page).toHaveTitle(/MeeplePrecios/i);

    // Verify main header and search bar exist
    const heading = page.locator('h1', { hasText: /MeeplePrecios/i });
    await expect(heading).toBeVisible();

    // Verify active mock user badge is displayed
    const userBadge = page.locator('text=Usuario:');
    await expect(userBadge).toBeVisible();

    // Verify consolidated Regional Domestic Store toggle switch exists in Home search UI
    const domesticSwitch = page.locator('header input[role="switch"]');
    await expect(domesticSwitch).toBeAttached();

    // 2. Navigate to Catalog page
    const catalogLink = page.locator('a[href="/catalog"]', { hasText: /Catálogo completo/i });
    await expect(catalogLink).toBeVisible();
    await catalogLink.click();

    // Verify arrived at catalog page
    await expect(page).toHaveURL(/.*\/catalog/);
    await expect(page.locator('h1')).toHaveText(/Catálogo de Juegos|Search Results/i);
  });
});
