import { test, expect } from '@playwright/test';

test.describe('US-36: Consolidated Regional Domestic Store Toggles E2E', () => {
  test('verifies consolidated tactile toggle in Home UI on desktop and mobile viewports', async ({ page }) => {
    // Desktop Viewport
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/');

    // Verify Toolbar no longer has domestic store switch
    const toolbarSwitch = page.locator('.border-b.border-gray-800').first().locator('input[role="switch"]');
    await expect(toolbarSwitch).toHaveCount(0);

    // Verify Home hero search UI renders the tactile switch
    const homeSwitch = page.locator('header input[role="switch"]');
    await expect(homeSwitch).toBeAttached();

    // Mobile Viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(homeSwitch).toBeAttached();
  });
});
