import { test, expect } from '@playwright/test';

// Basic Playwright E2E test for homepage

test('homepage loads and displays main elements', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/Trip Wise Nepal/i);
  // Check for navbar or any main element
  await expect(page.locator('nav')).toBeVisible();
  await expect(page.locator('footer')).toBeVisible();
});
