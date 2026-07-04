import { test, expect } from '@playwright/test';

const BANNED_EMOJIS = ['🎲', '⚡', '🎉', '🔥', '✨', '✔', '❌', '⚠️', '⭐'];

test.describe('E2E Walkthrough: BGG Wishlist Sync & Discount Alerts Deprecation', () => {
  test('verifies wishlist dashboard renders without discount comparison grids or raw emojis on Desktop viewport', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/dashboard/alerts');

    // 1. Verify header and dashboard structure
    const header = page.locator('h1', { hasText: /Lista de Deseos \/ BGG Wishlist/i });
    await expect(header).toBeVisible();

    const importerHeading = page.locator('h3', { hasText: /Sincronizar Wishlist desde BoardGameGeek/i });
    await expect(importerHeading).toBeVisible();

    // 2. Verify deprecation/removal of discount alert comparison grids and target price editing
    await expect(page.locator('body')).not.toContainText('Tu Objetivo');
    await expect(page.locator('body')).not.toContainText('Editar Objetivo');
    await expect(page.locator('body')).not.toContainText('¡Precio Alcanzado!');

    // 3. Verify zero raw emojis across the entire rendered document
    const textContent = await page.locator('body').textContent();
    for (const emoji of BANNED_EMOJIS) {
      expect(textContent).not.toContain(emoji);
    }

    // 4. Verify BGG Username sync input and submission flow
    const bggInput = page.locator('input[placeholder*="Tu usuario de BGG"]');
    const syncButton = page.locator('button', { hasText: /Importar Wishlist BGG/i });
    await expect(bggInput).toBeVisible();
    await expect(syncButton).toBeDisabled(); // Disabled when empty

    await bggInput.fill('meeplefan');
    await expect(syncButton).toBeEnabled();
  });

  test('verifies game detail page renders without discount alert form or raw emojis', async ({ page }) => {
    await page.goto('/game/13');
    await expect(page.locator('h1')).toBeVisible();

    // Verify discount alert forms/target inputs are removed from game details
    await expect(page.locator('body')).not.toContainText('Alerta de Descuento');
    await expect(page.locator('body')).not.toContainText('Tu Objetivo');

    // Verify zero raw emojis on game detail page
    const textContent = await page.locator('body').textContent();
    for (const emoji of BANNED_EMOJIS) {
      expect(textContent).not.toContain(emoji);
    }
  });

  test('verifies wishlist dashboard responsive layout and clean rendering on Mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/dashboard/alerts');

    // 1. Verify header is visible and responsive on mobile
    const header = page.locator('h1', { hasText: /Lista de Deseos \/ BGG Wishlist/i });
    await expect(header).toBeVisible();

    // 2. Verify discount alert comparison grids are absent on mobile
    await expect(page.locator('body')).not.toContainText('Tu Objetivo');
    await expect(page.locator('body')).not.toContainText('Editar Objetivo');

    // 3. Verify zero raw emojis across mobile viewport
    const textContent = await page.locator('body').textContent();
    for (const emoji of BANNED_EMOJIS) {
      expect(textContent).not.toContain(emoji);
    }

    // 4. Verify restock monitor card is visible on mobile
    const restockHeading = page.locator('h3', { hasText: /Suscripciones de Reabastecimiento/i });
    await expect(restockHeading).toBeVisible();
  });
});
