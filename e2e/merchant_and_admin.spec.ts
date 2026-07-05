import { test, expect } from '@playwright/test';

test.describe('E2E Walkthrough: Merchant Services and Global Administration Portals', () => {
  test('replicates navigation across merchant onboarding, diagnostics, and admin portals', async ({ page }) => {
    // 1. Visit Merchant Onboarding wizard
    await page.goto('/merchant/onboard');
    const authRestrictedOnboard = page.locator('h2', { hasText: /Acceso Restringido/i });
    const onboardHeader = page.locator('h2', { hasText: /Onboarding de Socio/i });
    await expect(authRestrictedOnboard.or(onboardHeader)).toBeVisible();

    // 2. Visit Merchant Shipping Matrix portal
    await page.goto('/merchant/shipping');
    // Expect auth lock or shipping matrix title
    const authRestricted = page.locator('h2', { hasText: /Acceso Restringido/i });
    const shippingHeader = page.locator('h1', { hasText: /Configuración de Tarifas/i });
    await expect(authRestricted.or(shippingHeader)).toBeVisible();

    // 3. Visit Merchant Diagnostics Hub
    await page.goto('/merchant/diagnostics');
    const diagHeader = page.locator('h2', { hasText: /Acceso Restringido|Diagnóstico de Feed/i });
    await expect(diagHeader).toBeVisible();

    // 4. Visit Global Admin Feed Queue Monitor
    await page.goto('/admin/queue');
    const queueHeader = page.locator('h2', { hasText: /Acceso Restringido|Monitor de Cola de Metadatos/i });
    await expect(queueHeader).toBeVisible();
  });
});
