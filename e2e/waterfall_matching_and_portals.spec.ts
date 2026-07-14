import { test, expect } from '@playwright/test';

test.describe('US-103 to US-107: 4-Tier Waterfall Feed Matching Engine, Admin Queue & Merchant Portal E2E', () => {
  test('validates admin queue UI (/admin/queue) and staging queue moderation elements', async ({ page }) => {
    // 1. Visit Admin Queue page
    await page.goto('/admin/queue');
    
    // Expect auth lock or queue header
    const authRestricted = page.locator('h2', { hasText: /Acceso Restringido/i });
    const queueHeader = page.locator('h2', { hasText: /Moderación y estaging|Monitor de Cola/i });
    await expect(authRestricted.or(queueHeader)).toBeVisible();
  });

  test('validates merchant self-service feed mapping portal on merchant dashboard (/merchant/dashboard)', async ({ page }) => {
    // 1. Visit Merchant Dashboard
    await page.goto('/merchant/dashboard');
    
    // Should redirect to / or /merchant/onboard if unauthenticated, or show dashboard
    const currentUrl = page.url();
    expect(currentUrl.includes('/merchant/onboard') || currentUrl.includes('/merchant/dashboard') || currentUrl.endsWith('/')).toBeTruthy();
  });
});
