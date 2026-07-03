import { test, expect } from '@playwright/test';

test.describe('E2E Walkthrough: Home, Predictive Search, and Multi-Game Cart Optimizer', () => {
  test('replicates live buyer navigation and multi-store cart optimization', async ({ page }) => {
    // 1. Visit homepage
    await page.goto('/');
    await expect(page).toHaveTitle(/MeeplePrecios/i);

    // Verify main header and search bar exist
    const heading = page.locator('h1', { hasText: /MeeplePrecios/i });
    await expect(heading).toBeVisible();

    // Verify Toolbar shipping country selector works
    const countrySelect = page.locator('#country-select');
    await expect(countrySelect).toBeVisible();
    await countrySelect.selectOption('PT');
    await expect(countrySelect).toHaveValue('PT');

    // Verify consolidated Regional Domestic Store toggle switch exists in Home search UI
    const domesticSwitch = page.locator('header input[role="switch"]');
    await expect(domesticSwitch).toBeAttached();

    // 2. Navigate to Multi-Game Cart Optimizer sheet
    const optimizerBtn = page.locator('a[href="/optimizer"]', { hasText: /Comparador Multi-Juego/i });
    await expect(optimizerBtn).toBeVisible();
    await optimizerBtn.click();

    // Verify arrived at optimizer page
    await expect(page).toHaveURL(/.*\/optimizer/);
    await expect(page.locator('h1')).toHaveText(/Optimizar Lista de Compra Multi-Juego/i);

    // 3. Select games and run optimization engine
    const optimizeTrigger = page.locator('button', { hasText: /Optimizar Carrito Ahora/i });
    await expect(optimizeTrigger).toBeVisible();

    // If initial games are present, click on one or more items
    const gameCheckboxes = page.locator('.grid input[type="checkbox"]');
    const count = await gameCheckboxes.count();
    if (count > 0) {
      await gameCheckboxes.first().check();
      await optimizeTrigger.click();

      const resultsSection = page.locator('h2', { hasText: /Top 3 Combinaciones Óptimas/i });
      await expect(resultsSection).toBeVisible();
    }
  });
});
